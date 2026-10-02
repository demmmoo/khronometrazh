"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("khronometrazh-theme", next ? "dark" : "light");
    } catch {
      // игнорируем недоступность localStorage
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Переключить тему"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-sm hover:bg-surface-muted"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
