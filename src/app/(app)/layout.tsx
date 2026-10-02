"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const currentUserId = useStore((s) => s.currentUserId);
  const ensureSeedData = useStore((s) => s.ensureSeedData);

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUserId) {
      router.replace("/");
      return;
    }
    ensureSeedData();
  }, [hydrated, currentUserId, router, ensureSeedData]);

  if (!hydrated || !currentUserId) {
    return <div className="flex flex-1 items-center justify-center text-sm text-muted">Загрузка…</div>;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
