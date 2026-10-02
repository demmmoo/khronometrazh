"use client";

import { Button, Card, Input, Label, SectionHeading } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useState } from "react";

export default function ProfilePage() {
  const user = useStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const updateProfile = useStore((s) => s.updateProfile);
  const [name, setName] = useState(user?.name ?? "");
  const [company, setCompany] = useState(user?.company ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  return (
    <div>
      <SectionHeading title="Профиль" />
      <Card className="max-w-md">
        <div className="space-y-3">
          <div>
            <Label htmlFor="p-name">Имя</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="p-email">Почта</Label>
            <Input id="p-email" value={user.email} disabled />
          </div>
          <div>
            <Label htmlFor="p-company">Компания</Label>
            <Input id="p-company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="p-city">Город</Label>
            <Input id="p-city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <Button
            onClick={() => {
              updateProfile({ name, company, city });
              setSaved(true);
              setTimeout(() => setSaved(false), 1500);
            }}
          >
            {saved ? "Сохранено ✓" : "Сохранить"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
