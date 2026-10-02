"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { buildAnalysis } from "./analysis";
import { buildBudgetLines } from "./budget";
import { MIN_DEADLINE_DAYS } from "./reference";
import { buildStages, buildTasksForProject } from "./roadmap";
import { SEED_LOCATIONS, SEED_RESOURCES, SEED_SPEAKERS, SEED_TEAM } from "./seed";
import type {
  CandidateKind,
  JournalEntry,
  Location,
  Project,
  ProjectBrief,
  Resource,
  Speaker,
  Task,
  TaskPriority,
  TaskStatus,
  TeamMember,
  TeamSelection,
  User,
  Visibility,
} from "./types";
import { daysBetween, genId, todayIso } from "./utils";

interface StoreState {
  users: User[];
  currentUserId: string | null;
  speakers: Speaker[];
  locations: Location[];
  teamMembers: TeamMember[];
  resources: Resource[];
  projects: Project[];
  tasks: Task[];
  journal: JournalEntry[];

  loginOrRegister: (input: { name: string; email: string; company?: string; city?: string }) => User;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "company" | "city">>) => void;

  ensureSeedData: () => void;

  addSpeaker: (input: Omit<Speaker, "id" | "ownerId" | "visibility">, visibility?: Visibility) => void;
  addLocation: (input: Omit<Location, "id" | "ownerId" | "visibility">, visibility?: Visibility) => void;
  addTeamMember: (input: Omit<TeamMember, "id" | "ownerId" | "visibility">, visibility?: Visibility) => void;
  addResource: (input: Omit<Resource, "id" | "ownerId" | "visibility">, visibility?: Visibility) => void;
  proposeToPublic: (kind: CandidateKind | "resource", id: string) => void;

  createProject: (brief: ProjectBrief) => { project?: Project; error?: string };
  addSelection: (projectId: string, kind: CandidateKind, refId: string, cost: number) => void;
  removeSelection: (projectId: string, selectionId: string) => void;

  addTask: (input: { title: string; projectId?: string; dueDate?: string; priority?: TaskPriority; notes?: string }) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (taskId: string, patch: Partial<Pick<Task, "title" | "dueDate" | "priority" | "notes">>) => void;
  addJournalEntry: (taskId: string, text: string) => void;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      speakers: [],
      locations: [],
      teamMembers: [],
      resources: [],
      projects: [],
      tasks: [],
      journal: [],

      loginOrRegister: ({ name, email, company, city }) => {
        const existing = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          set({ currentUserId: existing.id });
          return existing;
        }
        const user: User = {
          id: genId(),
          name,
          email,
          company,
          city,
          createdAt: todayIso(),
        };
        set({ users: [...get().users, user], currentUserId: user.id });
        return user;
      },

      logout: () => set({ currentUserId: null }),

      updateProfile: (patch) => {
        const userId = get().currentUserId;
        if (!userId) return;
        set({
          users: get().users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
        });
      },

      ensureSeedData: () => {
        const state = get();
        if (state.speakers.length === 0 && state.locations.length === 0 && state.teamMembers.length === 0) {
          set({
            speakers: SEED_SPEAKERS,
            locations: SEED_LOCATIONS,
            teamMembers: SEED_TEAM,
            resources: SEED_RESOURCES,
          });
        }
      },

      addSpeaker: (input, visibility = "private") => {
        const userId = get().currentUserId;
        if (!userId) return;
        const speaker: Speaker = { ...input, id: genId(), ownerId: userId, visibility };
        set({ speakers: [...get().speakers, speaker] });
      },
      addLocation: (input, visibility = "private") => {
        const userId = get().currentUserId;
        if (!userId) return;
        const location: Location = { ...input, id: genId(), ownerId: userId, visibility };
        set({ locations: [...get().locations, location] });
      },
      addTeamMember: (input, visibility = "private") => {
        const userId = get().currentUserId;
        if (!userId) return;
        const member: TeamMember = { ...input, id: genId(), ownerId: userId, visibility };
        set({ teamMembers: [...get().teamMembers, member] });
      },
      addResource: (input, visibility = "private") => {
        const userId = get().currentUserId;
        if (!userId) return;
        const resource: Resource = { ...input, id: genId(), ownerId: userId, visibility };
        set({ resources: [...get().resources, resource] });
      },
      proposeToPublic: (kind, id) => {
        if (kind === "speaker") {
          set({ speakers: get().speakers.map((s) => (s.id === id ? { ...s, visibility: "pending" } : s)) });
        } else if (kind === "location") {
          set({ locations: get().locations.map((l) => (l.id === id ? { ...l, visibility: "pending" } : l)) });
        } else if (kind === "team") {
          set({ teamMembers: get().teamMembers.map((m) => (m.id === id ? { ...m, visibility: "pending" } : m)) });
        } else {
          set({ resources: get().resources.map((r) => (r.id === id ? { ...r, visibility: "pending" } : r)) });
        }
      },

      createProject: (brief) => {
        const userId = get().currentUserId;
        if (!userId) return { error: "Нужно войти в систему" };
        if (brief.budget <= 0) return { error: "Бюджет должен быть больше нуля" };
        const days = daysBetween(todayIso(), brief.deadline);
        if (days < MIN_DEADLINE_DAYS) {
          return { error: `Дедлайн должен быть не раньше чем через ${MIN_DEADLINE_DAYS} дней` };
        }

        const createdAt = todayIso();
        const stages = buildStages(brief, createdAt);
        const analysis = buildAnalysis(brief);
        const budgetLines = buildBudgetLines(brief.budget);

        const project: Project = {
          id: genId(),
          ownerId: userId,
          brief,
          createdAt,
          stages,
          analysis,
          selections: [],
          budgetLines,
        };

        const tasks = buildTasksForProject(project, userId);
        set({ projects: [...get().projects, project], tasks: [...get().tasks, ...tasks] });
        return { project };
      },

      addSelection: (projectId, kind, refId, cost) => {
        const selection: TeamSelection = { id: genId(), kind, refId, cost, addedAt: todayIso() };
        set({
          projects: get().projects.map((p) =>
            p.id === projectId ? { ...p, selections: [...p.selections, selection] } : p,
          ),
        });
      },
      removeSelection: (projectId, selectionId) => {
        set({
          projects: get().projects.map((p) =>
            p.id === projectId
              ? { ...p, selections: p.selections.filter((s) => s.id !== selectionId) }
              : p,
          ),
        });
      },

      addTask: ({ title, projectId, dueDate, priority = "medium", notes }) => {
        const userId = get().currentUserId;
        if (!userId) return;
        const task: Task = {
          id: genId(),
          projectId,
          ownerId: userId,
          title,
          status: "todo",
          priority,
          dueDate,
          notes,
          createdAt: todayIso(),
        };
        set({ tasks: [...get().tasks, task] });
      },

      updateTaskStatus: (taskId, status) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;
        const STATUS_LABEL: Record<TaskStatus, string> = {
          todo: "К выполнению",
          in_progress: "В работе",
          review: "На проверке",
          done: "Готово",
        };
        const entry: JournalEntry = {
          id: genId(),
          taskId,
          createdAt: todayIso(),
          text: `Статус изменён: «${STATUS_LABEL[task.status]}» → «${STATUS_LABEL[status]}»`,
          system: true,
        };
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? { ...t, status, doneAt: status === "done" ? todayIso() : t.doneAt }
              : t,
          ),
          journal: [...get().journal, entry],
        });
      },

      updateTask: (taskId, patch) => {
        set({ tasks: get().tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) });
      },

      addJournalEntry: (taskId, text) => {
        const entry: JournalEntry = { id: genId(), taskId, createdAt: todayIso(), text, system: false };
        set({ journal: [...get().journal, entry] });
      },
    }),
    {
      name: "khronometrazh-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : noopStorage)),
    },
  ),
);
