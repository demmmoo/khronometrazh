"use client";

import { useParams } from "next/navigation";
import { Card, EmptyState, Pill, ProgressBar, SectionHeading } from "@/components/ui";
import { useStore } from "@/lib/store";
import { FORMAT_INFO, PLATFORM_INFO } from "@/lib/reference";
import { selectionsShare, selectionsTotal } from "@/lib/budget";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Analysis } from "@/lib/types";

const STATUS_TONE: Record<Analysis["budgetStatus"], "success" | "warning" | "danger"> = {
  enough: "success",
  tight: "warning",
  insufficient: "danger",
};

const STATUS_LABEL: Record<Analysis["budgetStatus"], string> = {
  enough: "Хватает",
  tight: "Впритык",
  insufficient: "Не хватает",
};

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const project = useStore((s) => s.projects.find((p) => p.id === params.id));
  const speakers = useStore((s) => s.speakers);
  const locations = useStore((s) => s.locations);
  const teamMembers = useStore((s) => s.teamMembers);

  if (!project) {
    return <EmptyState title="Проект не найден" />;
  }

  const { brief, analysis, stages, budgetLines, selections } = project;
  const today = new Date();

  function candidateName(kind: string, refId: string) {
    if (kind === "speaker") return speakers.find((s) => s.id === refId)?.name ?? "—";
    if (kind === "location") return locations.find((l) => l.id === refId)?.name ?? "—";
    return teamMembers.find((m) => m.id === refId)?.name ?? "—";
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted">{FORMAT_INFO[brief.format].label}</p>
        <h1 className="text-2xl font-semibold">{brief.title}</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted">
          <span>{brief.city}</span>
          <span>·</span>
          <span>{formatMoney(brief.budget)}</span>
          <span>·</span>
          <span>до {formatDate(brief.deadline)}</span>
          <span>·</span>
          <span>{brief.platforms.map((p) => PLATFORM_INFO[p].label).join(", ") || "площадки не выбраны"}</span>
        </div>
      </div>

      <Card>
        <SectionHeading title="Анализ проекта" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Pill tone={STATUS_TONE[analysis.budgetStatus]}>{STATUS_LABEL[analysis.budgetStatus]}</Pill>
            <p className="mt-2 text-sm text-muted">{analysis.budgetMessage}</p>
          </div>
          <div>
            <Pill tone={STATUS_TONE[analysis.timelineStatus]}>{STATUS_LABEL[analysis.timelineStatus]}</Pill>
            <p className="mt-2 text-sm text-muted">{analysis.timelineMessage}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {analysis.scenarios.map((sc) => (
            <div
              key={sc.tier}
              className={`rounded-xl border p-4 ${sc.recommended ? "border-brand bg-brand-soft" : "border-border"}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{sc.label}</p>
                {sc.recommended && <Pill tone="brand">Рекомендуем</Pill>}
              </div>
              <p className="mb-2 text-lg font-semibold">{formatMoney(sc.cost)}</p>
              <ul className="space-y-1 text-sm text-muted">
                {sc.composition.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Риски</p>
            <ul className="space-y-1 text-sm text-muted">
              {analysis.risks.map((r, i) => (
                <li key={i}>⚠ {r}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Советы</p>
            <ul className="space-y-1 text-sm text-muted">
              {analysis.tips.map((t, i) => (
                <li key={i}>💡 {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeading title="Дорожная карта" description="11 этапов, дедлайны считаются от даты сдачи" />
        <div className="space-y-3">
          {stages.map((stage) => {
            const start = new Date(stage.startDate);
            const end = new Date(stage.endDate);
            const total = end.getTime() - start.getTime();
            const elapsed = Math.min(Math.max(today.getTime() - start.getTime(), 0), total);
            const progress = total > 0 ? (elapsed / total) * 100 : 0;
            const isCurrent = today >= start && today <= end;
            return (
              <div key={stage.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className={isCurrent ? "font-medium text-brand" : ""}>
                    {stage.label} {isCurrent && "· сегодня"}
                  </span>
                  <span className="text-muted">
                    {formatDate(stage.startDate)} — {formatDate(stage.endDate)}
                  </span>
                </div>
                <ProgressBar value={progress} tone={isCurrent ? "brand" : today > end ? "success" : "neutral"} />
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionHeading title="Смета" description="Распределение бюджета по статьям" />
        <div className="space-y-2">
          {budgetLines.map((line) => (
            <div key={line.key} className="flex items-center justify-between text-sm">
              <span>
                {line.label} <span className="text-muted">({Math.round(line.share * 100)}%)</span>
              </span>
              <span className="font-medium">{formatMoney(line.amount)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-border pt-3 text-sm text-muted">
          Выбранные кандидаты: {formatMoney(selectionsTotal(selections))} ({Math.round(selectionsShare(selections, brief.budget) * 100)}% бюджета)
        </div>
      </Card>

      <Card>
        <SectionHeading title="Команда проекта" description="Кандидаты, добавленные кнопкой «В проект»" />
        {selections.length === 0 ? (
          <p className="text-sm text-muted">Пока никто не добавлен. Подбор появится в разделе базы.</p>
        ) : (
          <ul className="space-y-2">
            {selections.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span>{candidateName(s.kind, s.refId)}</span>
                <span className="text-muted">{formatMoney(s.cost)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
