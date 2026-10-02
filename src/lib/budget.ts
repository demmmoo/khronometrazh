import { BUDGET_ALLOCATION } from "./reference";
import type { BudgetLine, TeamSelection } from "./types";

export function buildBudgetLines(budget: number): BudgetLine[] {
  return BUDGET_ALLOCATION.map((line) => ({
    key: line.key,
    label: line.label,
    share: line.share,
    amount: Math.round(budget * line.share),
  }));
}

export function selectionsTotal(selections: TeamSelection[]): number {
  return selections.reduce((sum, s) => sum + s.cost, 0);
}

export function selectionsShare(selections: TeamSelection[], budget: number): number {
  if (budget <= 0) return 0;
  return selectionsTotal(selections) / budget;
}
