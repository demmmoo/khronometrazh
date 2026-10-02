import type { TaskPriority, TaskStatus } from "./types";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "К выполнению",
  in_progress: "В работе",
  review: "На проверке",
  done: "Готово",
};

export const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "review", "done"];

export const STATUS_TONE: Record<TaskStatus, "neutral" | "info" | "warning" | "success"> = {
  todo: "neutral",
  in_progress: "info",
  review: "warning",
  done: "success",
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

export const PRIORITY_TONE: Record<TaskPriority, "neutral" | "warning" | "danger"> = {
  low: "neutral",
  medium: "warning",
  high: "danger",
};
