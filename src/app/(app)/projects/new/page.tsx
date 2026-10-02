"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, Label, SectionHeading, Select, Textarea } from "@/components/ui";
import { useStore } from "@/lib/store";
import { CITIES, FORMAT_INFO, MIN_DEADLINE_DAYS, PLATFORM_INFO, TOPICS } from "@/lib/reference";
import type { Platform, ProjectFormat } from "@/lib/types";
import { addDays, cx, todayIso } from "@/lib/utils";

const FORMAT_ENTRIES = Object.entries(FORMAT_INFO) as [ProjectFormat, (typeof FORMAT_INFO)[ProjectFormat]][];
const PLATFORM_ENTRIES = Object.entries(PLATFORM_INFO) as [Platform, (typeof PLATFORM_INFO)[Platform]][];

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useStore((s) => s.createProject);

  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<ProjectFormat>("series");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [audience, setAudience] = useState("");
  const [city, setCity] = useState(CITIES[0]);
  const [platforms, setPlatforms] = useState<Platform[]>(["youtube"]);
  const [episodeDurationMin, setEpisodeDurationMin] = useState(15);
  const [episodeCount, setEpisodeCount] = useState(4);
  const [budget, setBudget] = useState(1_500_000);
  const [deadline, setDeadline] = useState(addDays(todayIso(), 30).slice(0, 10));
  const [requirements, setRequirements] = useState("");
  const [error, setError] = useState<string | null>(null);

  function togglePlatform(p: Platform) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Укажите название проекта");
      return;
    }
    const result = createProject({
      title: title.trim(),
      format,
      topic,
      audience: audience.trim(),
      city,
      platforms,
      episodeDurationMin,
      episodeCount,
      budget,
      deadline: new Date(deadline).toISOString(),
      requirements: requirements.trim() || undefined,
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(`/projects/${result.project!.id}`);
  }

  const minDeadline = addDays(todayIso(), MIN_DEADLINE_DAYS).slice(0, 10);

  return (
    <div className="mx-auto max-w-2xl">
      <SectionHeading title="Новый проект" description="Заполните ТЗ — дальше мы посчитаем анализ, дорожную карту, смету и подбор команды." />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Название проекта</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например, «Разговор с основателем»" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="format">Формат</Label>
              <Select id="format" value={format} onChange={(e) => setFormat(e.target.value as ProjectFormat)}>
                {FORMAT_ENTRIES.map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="topic">Тема</Label>
              <Select id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="audience">Аудитория</Label>
            <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Например, предприниматели 25-45 лет" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city">Город съёмок</Label>
              <Select id="city" value={city} onChange={(e) => setCity(e.target.value)}>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="deadline">Дедлайн</Label>
              <Input id="deadline" type="date" min={minDeadline} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Площадки публикации</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_ENTRIES.map(([key, info]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => togglePlatform(key)}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-sm",
                    platforms.includes(key)
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border text-muted hover:bg-surface-muted",
                  )}
                >
                  {info.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="duration">Хронометраж, мин</Label>
              <Input id="duration" type="number" min={1} value={episodeDurationMin} onChange={(e) => setEpisodeDurationMin(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="episodes">Число выпусков</Label>
              <Input id="episodes" type="number" min={1} value={episodeCount} onChange={(e) => setEpisodeCount(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="budget">Бюджет, ₸</Label>
              <Input id="budget" type="number" min={1} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <Label htmlFor="requirements">Особые требования (необязательно)</Label>
            <Textarea id="requirements" rows={3} value={requirements} onChange={(e) => setRequirements(e.target.value)} />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" className="w-full">
            Построить анализ и дорожную карту
          </Button>
        </form>
      </Card>
    </div>
  );
}
