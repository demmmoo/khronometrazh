import type {
  Platform,
  ProjectFormat,
  ResourceCategory,
  TeamRole,
} from "./types";

export const CURRENCY = "₸";

export const CITIES = [
  "Алматы",
  "Астана",
  "Шымкент",
  "Караганда",
  "Москва",
  "Санкт-Петербург",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Удалённо",
];

export const TOPICS = [
  "Бизнес и стартапы",
  "Технологии и IT",
  "Образование",
  "Здоровье и медицина",
  "Кино и шоубизнес",
  "Спорт",
  "Кулинария",
  "Путешествия",
  "Мода и красота",
  "Финансы",
  "Наука",
  "Общество",
];

export interface FormatInfo {
  label: string;
  description: string;
  budgetPerEpisode: { min: number; max: number };
  durationDaysPerEpisode: { min: number; max: number };
  typicalEpisodeCount: { min: number; max: number };
}

export const FORMAT_INFO: Record<ProjectFormat, FormatInfo> = {
  series: {
    label: "Серия для YouTube и онлайн-каналов",
    description: "Регулярный выпуск эпизодов на видеоплатформах",
    budgetPerEpisode: { min: 300_000, max: 1_200_000 },
    durationDaysPerEpisode: { min: 5, max: 10 },
    typicalEpisodeCount: { min: 4, max: 12 },
  },
  podcast: {
    label: "Видеоподкаст",
    description: "Разговорный формат со студийной съёмкой",
    budgetPerEpisode: { min: 150_000, max: 600_000 },
    durationDaysPerEpisode: { min: 3, max: 6 },
    typicalEpisodeCount: { min: 4, max: 20 },
  },
  corporate: {
    label: "Корпоративное видео",
    description: "Имиджевый или внутренний корпоративный ролик",
    budgetPerEpisode: { min: 400_000, max: 2_000_000 },
    durationDaysPerEpisode: { min: 10, max: 20 },
    typicalEpisodeCount: { min: 1, max: 3 },
  },
  ad: {
    label: "Рекламный ролик",
    description: "Короткий рекламный ролик для продвижения",
    budgetPerEpisode: { min: 500_000, max: 3_000_000 },
    durationDaysPerEpisode: { min: 7, max: 15 },
    typicalEpisodeCount: { min: 1, max: 3 },
  },
  documentary: {
    label: "Документальный фильм или мини-сериал",
    description: "Полнометражный или сериальный документальный проект",
    budgetPerEpisode: { min: 800_000, max: 4_000_000 },
    durationDaysPerEpisode: { min: 20, max: 45 },
    typicalEpisodeCount: { min: 1, max: 6 },
  },
  webshow: {
    label: "Веб-шоу или сериал",
    description: "Сценарный сериал или шоу для онлайн-платформ",
    budgetPerEpisode: { min: 400_000, max: 1_800_000 },
    durationDaysPerEpisode: { min: 8, max: 15 },
    typicalEpisodeCount: { min: 4, max: 10 },
  },
  clip: {
    label: "Клип",
    description: "Музыкальный или имиджевый клип",
    budgetPerEpisode: { min: 500_000, max: 2_500_000 },
    durationDaysPerEpisode: { min: 5, max: 12 },
    typicalEpisodeCount: { min: 1, max: 1 },
  },
};

export const PLATFORM_INFO: Record<Platform, { label: string }> = {
  youtube: { label: "YouTube" },
  vk_video: { label: "VK Видео" },
  rutube: { label: "Rutube" },
  telegram: { label: "Telegram" },
  tiktok: { label: "TikTok" },
  reels: { label: "Instagram Reels" },
  vimeo: { label: "Vimeo" },
};

export const RESOURCE_CATEGORY_INFO: Record<ResourceCategory, { label: string }> = {
  stock_music: { label: "Стоки и музыка" },
  editing_color: { label: "Монтаж и цвет" },
  review: { label: "Согласование правок" },
  analytics: { label: "Аналитика и идеи" },
};

export const TEAM_ROLE_INFO: Record<TeamRole, { label: string }> = {
  director: { label: "Режиссёр" },
  camera: { label: "Оператор" },
  editor: { label: "Монтажёр" },
  sound: { label: "Звукорежиссёр" },
  colorist: { label: "Цветокорректор" },
  motion: { label: "Моушн-дизайнер" },
  light: { label: "Light-техник" },
  smm: { label: "SMM и продвижение" },
  translator: { label: "Переводчик и субтитры" },
};

export interface StageTemplate {
  key: string;
  label: string;
  weight: number;
  taskTemplates: string[];
}

// 11 этапов, веса пропорциональны длительности, сумма = 1
export const STAGE_TEMPLATES: StageTemplate[] = [
  {
    key: "concept",
    label: "Концепция и ТЗ",
    weight: 0.05,
    taskTemplates: ["Сформулировать концепцию проекта", "Утвердить ТЗ с заказчиком"],
  },
  {
    key: "budget",
    label: "Бюджет и смета",
    weight: 0.05,
    taskTemplates: ["Собрать смету по статьям", "Утвердить бюджет"],
  },
  {
    key: "script",
    label: "Сценарий и раскадровка",
    weight: 0.12,
    taskTemplates: ["Написать сценарий", "Подготовить раскадровку"],
  },
  {
    key: "team",
    label: "Команда и подрядчики",
    weight: 0.08,
    taskTemplates: ["Подобрать команду", "Согласовать ставки и даты"],
  },
  {
    key: "speakers",
    label: "Спикеры и герои",
    weight: 0.08,
    taskTemplates: ["Подобрать спикеров", "Подтвердить участие и даты"],
  },
  {
    key: "locations",
    label: "Локации",
    weight: 0.07,
    taskTemplates: ["Подобрать локации", "Забронировать площадки"],
  },
  {
    key: "preproduction",
    label: "Подготовка к съёмкам",
    weight: 0.1,
    taskTemplates: ["Составить план съёмочного дня", "Подготовить оборудование и реквизит"],
  },
  {
    key: "shooting",
    label: "Съёмки",
    weight: 0.15,
    taskTemplates: ["Провести съёмочные дни", "Сделать резервное копирование материала"],
  },
  {
    key: "postproduction",
    label: "Монтаж и постпродакшн",
    weight: 0.18,
    taskTemplates: ["Смонтировать черновую версию", "Свести звук и цветокоррекция", "Утвердить финальную версию"],
  },
  {
    key: "release",
    label: "Релиз и продвижение",
    weight: 0.09,
    taskTemplates: ["Подготовить описание и обложки"],
  },
  {
    key: "wrapup",
    label: "Итоги",
    weight: 0.03,
    taskTemplates: ["Собрать итоговый отчёт", "Запросить отзывы об участниках"],
  },
];

// Распределение бюджета по статьям (раздел 6.10)
export const BUDGET_ALLOCATION: { key: string; label: string; share: number }[] = [
  { key: "preproduction", label: "Препродакшн", share: 0.12 },
  { key: "shooting", label: "Съёмки", share: 0.38 },
  { key: "postproduction", label: "Постпродакшн", share: 0.22 },
  { key: "promotion", label: "Продвижение", share: 0.15 },
  { key: "reserve", label: "Резерв", share: 0.1 },
  { key: "rights", label: "Права и музыка", share: 0.03 },
];

export const MIN_DEADLINE_DAYS = 7;
