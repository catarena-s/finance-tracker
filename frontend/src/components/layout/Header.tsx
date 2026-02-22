"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/shadcn/button";
import { Plus } from "lucide-react";

const pathTitles: Record<string, string> = {
  "/dashboard": "Обзор",
  "/transactions": "Транзакции",
  "/categories": "Категории",
  "/budgets": "Бюджеты",
  "/recurring": "Повторяющиеся",
};

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Трекер личных финансов";
  for (const [path, title] of Object.entries(pathTitles)) {
    if (pathname.startsWith(path)) return title;
  }
  return "Трекер личных финансов";
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const showAddTransaction =
    pathname.startsWith("/transactions") || pathname === "/";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <span className="text-lg font-semibold text-slate-900" aria-hidden="true">
        {title}
      </span>
      <div className="flex items-center gap-3">
        {showAddTransaction && (
          <Button asChild size="default" className="rounded-2xl shadow-sm">
            <Link href="/transactions?openAdd=1">
              <Plus className="mr-2 h-4 w-4" />
              Добавить транзакцию
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
