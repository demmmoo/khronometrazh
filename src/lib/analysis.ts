import { FORMAT_INFO } from "./reference";
import type { Analysis, ProjectBrief, Scenario, ScenarioTier } from "./types";
import { daysBetween, formatMoney, todayIso } from "./utils";

const OVERHEAD_DAYS_MIN = 10;
const OVERHEAD_DAYS_MAX = 16;

export function assessBudget(brief: ProjectBrief) {
  const info = FORMAT_INFO[brief.format];
  const refMin = info.budgetPerEpisode.min * brief.episodeCount;
  const refMax = info.budgetPerEpisode.max * brief.episodeCount;

  let status: Analysis["budgetStatus"];
  let message: string;
  if (brief.budget >= refMax) {
    status = "enough";
    message = `Бюджет ${formatMoney(brief.budget)} покрывает ориентир для ${brief.episodeCount} вып. (${formatMoney(refMin)}–${formatMoney(refMax)}).`;
  } else if (brief.budget >= refMin) {
    status = "tight";
    message = `Бюджет ${formatMoney(brief.budget)} укладывается впритык в ориентир ${formatMoney(refMin)}–${formatMoney(refMax)} для ${brief.episodeCount} вып.`;
  } else {
    status = "insufficient";
    message = `Бюджета ${formatMoney(brief.budget)} не хватает для ориентира ${formatMoney(refMin)}–${formatMoney(refMax)} при ${brief.episodeCount} вып.`;
  }
  return { status, message, refMin, refMax };
}

export function assessTimeline(brief: ProjectBrief) {
  const info = FORMAT_INFO[brief.format];
  const availableDays = daysBetween(todayIso(), brief.deadline);
  const refMinDays = info.durationDaysPerEpisode.min * brief.episodeCount + OVERHEAD_DAYS_MIN;
  const refMaxDays = info.durationDaysPerEpisode.max * brief.episodeCount + OVERHEAD_DAYS_MAX;

  let status: Analysis["timelineStatus"];
  let message: string;
  if (availableDays >= refMaxDays) {
    status = "enough";
    message = `До дедлайна ${availableDays} дн. — достаточно для ориентира ${refMinDays}–${refMaxDays} дн.`;
  } else if (availableDays >= refMinDays) {
    status = "tight";
    message = `До дедлайна ${availableDays} дн. — впритык к ориентиру ${refMinDays}–${refMaxDays} дн.`;
  } else {
    status = "insufficient";
    message = `До дедлайна ${availableDays} дн. — меньше ориентира ${refMinDays}–${refMaxDays} дн.`;
  }
  return { status, message, refMinDays, refMaxDays, availableDays };
}

export function maxEpisodesForBudget(brief: ProjectBrief): number {
  const info = FORMAT_INFO[brief.format];
  const max = Math.floor(brief.budget / info.budgetPerEpisode.min);
  return Math.max(1, max);
}

export function buildScenarios(brief: ProjectBrief): Scenario[] {
  const info = FORMAT_INFO[brief.format];
  const n = brief.episodeCount;
  const economyCost = info.budgetPerEpisode.min * n;
  const premiumCost = info.budgetPerEpisode.max * n * 1.25;
  const optimalCost = (economyCost + info.budgetPerEpisode.max * n) / 2;

  const tiers: { tier: ScenarioTier; label: string; cost: number; composition: string[] }[] = [
    {
      tier: "economy",
      label: "Эконом",
      cost: economyCost,
      composition: [
        "Минимальная команда (оператор + монтажёр)",
        "Локации из личной базы или удалённо",
        "Без цветокоррекции и моушн-графики",
      ],
    },
    {
      tier: "optimal",
      label: "Оптимум",
      cost: optimalCost,
      composition: [
        "Полная съёмочная команда",
        "Аренда студии или подходящей локации",
        "Цветокоррекция, базовая моушн-графика",
        "Продвижение на 1–2 площадках",
      ],
    },
    {
      tier: "premium",
      label: "Премиум",
      cost: premiumCost,
      composition: [
        "Расширенная команда с режиссёром и light-техником",
        "Премиальная локация, доп. смены на съёмках",
        "Полный цикл постпродакшна и моушн-графики",
        "Продвижение на всех выбранных площадках",
      ],
    },
  ];

  let bestIdx = 0;
  let bestDiff = Infinity;
  tiers.forEach((t, idx) => {
    const diff = t.cost <= brief.budget ? brief.budget - t.cost : Infinity;
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = idx;
    }
  });
  if (bestDiff === Infinity) {
    bestIdx = 0; // ничего не укладывается — подсвечиваем самый дешёвый
  }

  return tiers.map((t, idx) => ({ ...t, recommended: idx === bestIdx }));
}

export function buildRisksAndTips(
  brief: ProjectBrief,
  budget: ReturnType<typeof assessBudget>,
  timeline: ReturnType<typeof assessTimeline>,
): { risks: string[]; tips: string[] } {
  const risks: string[] = [];
  const tips: string[] = [];
  const maxEp = maxEpisodesForBudget(brief);

  if (budget.status === "insufficient") {
    risks.push("Текущий бюджет ниже ориентира формата — высок риск срыва качества или сроков.");
    tips.push(`При этом бюджете реалистично снять не больше ${maxEp} вып. вместо ${brief.episodeCount}.`);
  }
  if (budget.status === "tight") {
    tips.push("Бюджет впритык — держите резерв на непредвиденные расходы минимальным, фиксируйте расходы заранее.");
  }
  if (timeline.status === "insufficient") {
    risks.push("Срок сдачи короче типичного для формата — потребуется параллельная работа команд или сокращение этапов.");
    tips.push("Рассмотрите перенос дедлайна или уменьшение числа выпусков в первом релизе.");
  }
  if (timeline.status === "tight") {
    tips.push("Сроки впритык — закладывайте минимум правок на постпродакшне.");
  }
  if (brief.platforms.length > 3) {
    risks.push("Много площадок публикации одновременно — усложняет адаптацию форматов и продвижение.");
  }
  if (brief.platforms.length === 0) {
    risks.push("Не выбраны площадки публикации — невозможно спланировать этап релиза.");
  }
  risks.push("Требования площадок к формату и монетизации могут измениться — проверяйте актуальные условия перед релизом.");
  tips.push("Проверьте доступность спикеров и локаций на даты съёмок заранее.");

  return { risks, tips };
}

export function buildAnalysis(brief: ProjectBrief): Analysis {
  const budget = assessBudget(brief);
  const timeline = assessTimeline(brief);
  const scenarios = buildScenarios(brief);
  const { risks, tips } = buildRisksAndTips(brief, budget, timeline);

  return {
    budgetStatus: budget.status,
    budgetMessage: budget.message,
    timelineStatus: timeline.status,
    timelineMessage: timeline.message,
    scenarios,
    risks,
    tips,
    maxEpisodes: maxEpisodesForBudget(brief),
  };
}
