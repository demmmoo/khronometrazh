import { PLATFORM_INFO, STAGE_TEMPLATES } from "./reference";
import type { Project, ProjectBrief, Stage, Task } from "./types";
import { addDays, daysBetween, genId, todayIso } from "./utils";

export function buildStages(brief: ProjectBrief, createdAt: string): Stage[] {
  const totalDays = Math.max(7, daysBetween(createdAt, brief.deadline));
  let cursor = createdAt;
  const stages: Stage[] = [];
  STAGE_TEMPLATES.forEach((tpl, idx) => {
    const isLast = idx === STAGE_TEMPLATES.length - 1;
    const durationDays = tpl.weight * totalDays;
    const startDate = cursor;
    const endDate = isLast ? brief.deadline : addDays(cursor, durationDays);
    stages.push({ key: tpl.key, label: tpl.label, startDate, endDate, weight: tpl.weight });
    cursor = endDate;
  });
  return stages;
}

export function buildTasksForProject(project: Project, ownerId: string): Task[] {
  const tasks: Task[] = [];
  const now = todayIso();

  STAGE_TEMPLATES.forEach((tpl) => {
    const stage = project.stages.find((s) => s.key === tpl.key);
    if (!stage) return;
    tpl.taskTemplates.forEach((title) => {
      tasks.push({
        id: genId(),
        projectId: project.id,
        ownerId,
        stageKey: stage.key,
        title,
        status: "todo",
        priority: "medium",
        dueDate: stage.endDate,
        createdAt: now,
      });
    });
  });

  const releaseStage = project.stages.find((s) => s.key === "release");
  project.brief.platforms.forEach((platform) => {
    tasks.push({
      id: genId(),
      projectId: project.id,
      ownerId,
      stageKey: "release",
      title: `Опубликовать на площадке «${PLATFORM_INFO[platform].label}»`,
      status: "todo",
      priority: "high",
      dueDate: releaseStage?.endDate,
      createdAt: now,
    });
  });

  return tasks;
}
