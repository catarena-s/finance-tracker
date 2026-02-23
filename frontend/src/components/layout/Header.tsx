"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/shadcn/button";
import { Plus } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";

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
  const showAddTransaction = pathname.startsWith("/transactions");
  const showAddCategory = pathname.startsWith("/categories");
  const showAddBudget = pathname.startsWith("/budgets");
  const showAddRecurring = pathname.startsWith("/recurring");

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <span className="text-lg font-semibold text-foreground" aria-hidden="true">
        {title}
      </span>
      <div className="flex items-center gap-3">
        <ThemeSwitcher />
        {showAddTransaction && (
          <Button
            asChild
            size="default"
            className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <Link href="/transactions?openAdd=1">
              <Plus className="mr-2 h-4 w-4" />
              Добавить транзакцию
            </Link>
          </Button>
        )}
        {showAddCategory && (
          <Button
            asChild
            size="default"
            className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <Link href="/categories?openAdd=1">
              <Plus className="mr-2 h-4 w-4" />
              Добавить категорию
            </Link>
          </Button>
        )}
        {showAddBudget && (
          <Button
            asChild
            size="default"
            className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <Link href="/budgets?openAdd=1">
              <Plus className="mr-2 h-4 w-4" />
              Добавить бюджет
            </Link>
          </Button>
        )}
        {showAddRecurring && (
          <Button
            asChild
            size="default"
            className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <Link href="/recurring?openAdd=1">
              <Plus className="mr-2 h-4 w-4" />
              Добавить шаблон
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
