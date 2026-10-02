import { BUDGET_ALLOCATION } from "./reference";
import type { Location, ProjectBrief, Speaker, TeamMember, TeamRole } from "./types";
import { formatMoney } from "./utils";

export interface RankedCandidate<T> {
  candidate: T;
  score: number;
  reasons: string[];
  estimatedCost: number;
}

function shootingBudget(brief: ProjectBrief): number {
  const share = BUDGET_ALLOCATION.find((l) => l.key === "shooting")?.share ?? 0.38;
  return brief.budget * share;
}

function scoreCityAndRating(
  rating: number,
  city: string,
  remote: boolean,
  brief: ProjectBrief,
  reasons: string[],
): number {
  let score = rating * 2;
  reasons.push(`Рейтинг ${rating.toFixed(1)} из 5`);
  if (remote) {
    score += 5;
    reasons.push("Готов(а) работать удалённо");
  } else if (city === brief.city) {
    score += 5;
    reasons.push(`Город совпадает (${city})`);
  }
  return score;
}

function scoreBudgetFit(estimatedCost: number, ceiling: number, reasons: string[]): number {
  if (estimatedCost <= ceiling * 0.3) {
    reasons.push(`Хорошо укладывается в ориентир бюджета (~${formatMoney(estimatedCost)})`);
    return 4;
  }
  if (estimatedCost <= ceiling) {
    reasons.push(`Укладывается в ориентир бюджета (~${formatMoney(estimatedCost)})`);
    return 2;
  }
  reasons.push(`Выше ориентира бюджета (~${formatMoney(estimatedCost)})`);
  return 0;
}

export function rankSpeakers(speakers: Speaker[], brief: ProjectBrief): RankedCandidate<Speaker>[] {
  const ceiling = shootingBudget(brief);
  return speakers
    .map((candidate) => {
      const reasons: string[] = [];
      let score = scoreCityAndRating(candidate.rating, candidate.city, candidate.remote, brief, reasons);
      if (candidate.topics.includes(brief.topic)) {
        score += 5;
        reasons.push(`Специализируется на теме «${brief.topic}»`);
      }
      const estimatedCost = candidate.fee;
      score += scoreBudgetFit(estimatedCost, ceiling, reasons);
      return { candidate, score, reasons, estimatedCost };
    })
    .sort((a, b) => b.score - a.score);
}

export function rankLocations(locations: Location[], brief: ProjectBrief): RankedCandidate<Location>[] {
  const ceiling = shootingBudget(brief);
  return locations
    .map((candidate) => {
      const reasons: string[] = [];
      let score = scoreCityAndRating(candidate.rating, candidate.city, false, brief, reasons);
      const estimatedCost = candidate.pricePerHour * 8;
      score += scoreBudgetFit(estimatedCost, ceiling, reasons);
      return { candidate, score, reasons, estimatedCost };
    })
    .sort((a, b) => b.score - a.score);
}

export function rankTeamMembers(
  members: TeamMember[],
  brief: ProjectBrief,
  role?: TeamRole,
): RankedCandidate<TeamMember>[] {
  const ceiling = shootingBudget(brief);
  return members
    .filter((m) => !role || m.role === role)
    .map((candidate) => {
      const reasons: string[] = [];
      let score = scoreCityAndRating(candidate.rating, candidate.city, candidate.remote, brief, reasons);
      const estimatedCost = candidate.dayRate * 3;
      score += scoreBudgetFit(estimatedCost, ceiling, reasons);
      return { candidate, score, reasons, estimatedCost };
    })
    .sort((a, b) => b.score - a.score);
}
