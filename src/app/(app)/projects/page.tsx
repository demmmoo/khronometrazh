"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, EmptyState, LinkButton, SectionHeading } from "@/components/ui";
import { useStore } from "@/lib/store";
import { FORMAT_INFO } from "@/lib/reference";
import { formatDate, formatMoney } from "@/lib/utils";

export default function ProjectsPage() {
  const currentUserId = useStore((s) => s.currentUserId);
  const allProjects = useStore((s) => s.projects);
  const projects = useMemo(() => allProjects.filter((p) => p.ownerId === currentUserId), [allProjects, currentUserId]);

  return (
    <div>
      <SectionHeading title="Проекты" action={<LinkButton href="/projects/new">+ Новый проект</LinkButton>} />
      {projects.length === 0 ? (
        <EmptyState title="Проектов пока нет" action={<LinkButton href="/projects/new">Создать проект</LinkButton>} />
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
  );
}
