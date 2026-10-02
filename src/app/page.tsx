"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Input, Label } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";

export default function Home() {
  const router = useRouter();
  const hydrated = useHydrated();
  const currentUserId = useStore((s) => s.currentUserId);
  const loginOrRegister = useStore((s) => s.loginOrRegister);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && currentUserId) {
      router.replace("/dashboard");
    }
  }, [hydrated, currentUserId, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Укажите имя и почту");
      return;
    }
    setError(null);
    loginOrRegister({ name: name.trim(), email: email.trim(), company: company.trim() || undefined, city: city.trim() || undefined });
    router.replace("/dashboard");
  }

  if (!hydrated) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted">Загрузка…</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 px-4 py-10 sm:flex-row">
        <div className="max-w-md">
          <p className="mb-2 inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
            Рабочее место видеопродюсера
          </p>
          <h1 className="mb-4 text-3xl font-semibold leading-tight text-foreground">Хронометраж</h1>
          <p className="text-sm leading-6 text-muted">
            Введите ТЗ — получите оценку бюджета и сроков, дорожную карту с дедлайнами, смету
            и подбор спикеров, локаций и команды. Ведите проект в личном кабинете и фиксируйте,
            что сделано.
          </p>
        </div>

        <Card className="w-full max-w-sm">
          <h2 className="mb-1 text-base font-semibold">Вход и регистрация</h2>
          <p className="mb-4 text-sm text-muted">Без пароля: если почта уже знакома — просто войдём.</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="name">Имя</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Асель Нурланова" />
            </div>
            <div>
              <Label htmlFor="email">Почта</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.kz" />
            </div>
            <div>
              <Label htmlFor="company">Компания (необязательно)</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Продюсерский центр" />
            </div>
            <div>
              <Label htmlFor="city">Город (необязательно)</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Алматы" />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full">
              Войти в кабинет
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
