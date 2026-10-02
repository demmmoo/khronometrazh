"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, EmptyState, LinkButton, Pill, SectionHeading } from "@/components/ui";
import { useStore } from "@/lib/store";
import { FORMAT_INFO } from "@/lib/reference";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/taskLabels";
import { formatDate, formatMoney } from "@/lib/utils";

export default function DashboardPage() {
  const currentUserId = useStore((s) => s.currentUserId);
  const allProjects = useStore((s) => s.projects);
  const allTasks = useStore((s) => s.tasks);
  const journal = useStore((s) => s.journal);
  const projects = useMemo(() => allProjects.filter((p) => p.ownerId === currentUserId), [allProjects, currentUserId]);
  const tasks = useMemo(() => allTasks.filter((t) => t.ownerId === currentUserId), [allTasks, currentUserId]);

  const now = new Date();
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);

  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done");
  const doneLast7 = tasks.filter((t) => t.doneAt && new Date(t.doneAt) >= new Date(now.getTime() - 7 * 86400000));
  const todayAndOverdue = tasks
    .filter((t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) <= in7Days)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 8);

  const feed = [...journal]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Личный кабинет"
        description="Счётчики, задачи на сегодня и журнал исполнения по всем проектам"
        action={<LinkButton href="/projects/new">+ Новый проект</LinkButton>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <p className="text-2xl font-semibold">{projects.length}</p>
          <p className="text-sm text-muted">Проекты</p>
        </Card>
        <Card>
          <p className="text-2xl font-semibold">{inProgress}</p>
          <p className="text-sm text-muted">Задач в работе</p>
        </Card>
        <Card>
          <p className="text-2xl font-semibold text-danger">{overdue.length}</p>
          <p className="text-sm text-muted">Просрочено</p>
        </Card>
        <Card>
          <p className="text-2xl font-semibold text-success">{doneLast7.length}</p>
          <p className="text-sm text-muted">Готово за 7 дней</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeading title="Сегодня и просрочено" />
          {todayAndOverdue.length === 0 ? (
            <p className="text-sm text-muted">Нет задач с близким сроком — хорошая новость.</p>
          ) : (
            <ul className="space-y-2">
              {todayAndOverdue.map((t) => {
                const isOverdue = t.dueDate && new Date(t.dueDate) < now;
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{t.title}</p>
                      {t.dueDate && (
                        <p className={`text-xs ${isOverdue ? "text-danger" : "text-muted"}`}>
                          Срок: {formatDate(t.dueDate)}
                        </p>
                      )}
                    </div>
                    <Pill tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Pill>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <SectionHeading title="Лента исполнения" />
          {feed.length === 0 ? (
            <p className="text-sm text-muted">Записей пока нет — они появятся при смене статусов задач.</p>
          ) : (
            <ul className="space-y-2">
              {feed.map((entry) => (
                <li key={entry.id} className="text-sm">
                  <span className="text-muted">{formatDate(entry.createdAt)} — </span>
                  {entry.text}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div>
        <SectionHeading title="Проекты" />
        {projects.length === 0 ? (
          <EmptyState
            title="Проектов пока нет"
            description="Создайте первый проект по ТЗ — получите анализ, дорожную карту и подбор команды."
            action={<LinkButton href="/projects/new">Создать проект</LinkButton>}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="h-full transition-colors hover:border-brand">
                  <p className="font-medium">{p.brief.title}</p>
                  <p className="mb-2 text-sm text-muted">{FORMAT_INFO[p.brief.format].label}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">{formatMoney(p.brief.budget)}</span>
                    <span className="text-muted">до {formatDate(p.brief.deadline)}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
