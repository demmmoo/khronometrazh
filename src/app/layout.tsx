import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const mainFont = Manrope({
  variable: "--font-main",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Хронометраж — рабочее место видеопродюсера",
  description:
    "Общая база спикеров и подрядчиков, анализ проекта по ТЗ и личный кабинет с дорожной картой и задачами.",
};

const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("khronometrazh-theme");
    var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${mainFont.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
