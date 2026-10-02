"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ThemeToggle } from "./ThemeToggle";
import { cx } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Кабинет" },
  { href: "/projects", label: "Проекты" },
  { href: "/tasks", label: "Задачи" },
  { href: "/base/speakers", label: "База" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const logout = useStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-base font-semibold text-brand">
            Хронометраж
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cx(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    active ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <Link
              href="/profile"
              className="hidden rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-surface-muted sm:block"
            >
              {user.name}
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-surface-muted"
          >
            Выйти
          </button>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 sm:hidden">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:bg-surface-muted"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
