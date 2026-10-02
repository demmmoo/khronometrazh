// Базовые типы данных приложения «Хронометраж»

export type Visibility = "private" | "pending" | "public";

export type ProjectFormat =
  | "series" // серия для YouTube и онлайн-каналов
  | "podcast" // видеоподкаст
  | "corporate" // корпоративное видео
  | "ad" // рекламный ролик
  | "documentary" // документальный фильм или мини-сериал
  | "webshow" // веб-шоу или сериал
  | "clip"; // клип

export type Platform =
  | "youtube"
  | "vk_video"
  | "rutube"
  | "telegram"
  | "tiktok"
  | "reels"
  | "vimeo";

export type ResourceCategory =
  | "stock_music" // стоки и музыка
  | "editing_color" // монтаж и цвет
  | "review" // согласование правок
  | "analytics"; // аналитика и идеи

export type TeamRole =
  | "director"
  | "camera"
  | "editor"
  | "sound"
  | "colorist"
  | "motion"
  | "light"
  | "smm"
  | "translator";

export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  city?: string;
  createdAt: string;
}

export interface Speaker {
  id: string;
  ownerId: string;
  visibility: Visibility;
  name: string;
  role: string; // амплуа/роль спикера
  city: string;
  remote: boolean;
  topics: string[];
  fee: number; // ориентировочный гонорар за выход
  note?: string;
  rating: number; // 0-5
  agentContact?: string;
  pastLinks?: string[];
}

export interface Location {
  id: string;
  ownerId: string;
  visibility: Visibility;
  name: string;
  type: "pavilion" | "studio" | "loft" | "outdoor";
  city: string;
  pricePerHour: number;
  capacity: number;
  features: string[];
  rating: number;
}

export interface TeamMember {
  id: string;
  ownerId: string;
  visibility: Visibility;
  name: string;
  role: TeamRole;
  city: string;
  remote: boolean;
  dayRate: number;
  specializations: string[];
  contact: string;
  rating: number;
}

export interface Resource {
  id: string;
  ownerId: string;
  visibility: Visibility;
  name: string;
  category: ResourceCategory;
  url: string;
  note?: string;
}

export interface ProjectBrief {
  title: string;
  format: ProjectFormat;
  topic: string;
  audience: string;
  city: string;
  platforms: Platform[];
  episodeDurationMin: number;
  episodeCount: number;
  budget: number;
  deadline: string; // ISO date
  requirements?: string;
}

export type ScenarioTier = "economy" | "optimal" | "premium";

export interface Scenario {
  tier: ScenarioTier;
  label: string;
  cost: number;
  composition: string[];
  recommended: boolean;
}

export interface Analysis {
  budgetStatus: "enough" | "tight" | "insufficient";
  budgetMessage: string;
  timelineStatus: "enough" | "tight" | "insufficient";
  timelineMessage: string;
  scenarios: Scenario[];
  risks: string[];
  tips: string[];
  maxEpisodes: number;
}

export interface Stage {
  key: string;
  label: string;
  startDate: string;
  endDate: string;
  weight: number;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface JournalEntry {
  id: string;
  taskId: string;
  createdAt: string;
  text: string;
  system: boolean;
}

export interface Task {
  id: string;
  projectId?: string; // отсутствует для личных задач вне проекта
  ownerId: string;
  stageKey?: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  doneAt?: string;
}

export type CandidateKind = "speaker" | "location" | "team";

export interface TeamSelection {
  id: string;
  kind: CandidateKind;
  refId: string;
  cost: number;
  addedAt: string;
}

export interface BudgetLine {
  key: string;
  label: string;
  share: number;
  amount: number;
}

export interface Project {
  id: string;
  ownerId: string;
  brief: ProjectBrief;
  createdAt: string;
  stages: Stage[];
  analysis: Analysis;
  selections: TeamSelection[];
  budgetLines: BudgetLine[];
}

export interface Review {
  id: string;
  authorId: string;
  projectId: string;
  targetKind: CandidateKind;
  targetId: string;
  rating: number;
  text: string;
  createdAt: string;
}
