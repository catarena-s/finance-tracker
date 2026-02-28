"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/shadcn/button";
import { Plus } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Header() {
  const pathname = usePathname();
  const showAddTransaction = pathname.startsWith("/transactions");
  const showAddCategory = pathname.startsWith("/categories");
  const showAddBudget = pathname.startsWith("/budgets");
  const showAddRecurring = pathname.startsWith("/recurring");

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-end border-b border-border bg-card/95 px-6 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center gap-3">
        {/* Theme switcher positioned below menu button (z-index: 30 < 50) */}
        <ThemeSwitcher />
        {showAddTransaction && (
          <Button
            asChild
            size="default"
            className="rounded-2xl shadow-sm transition-[box-shadow] duration-200 hover:shadow-md"
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
            className="rounded-2xl shadow-sm transition-[box-shadow] duration-200 hover:shadow-md"
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
            className="rounded-2xl shadow-sm transition-[box-shadow] duration-200 hover:shadow-md"
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
            className="rounded-2xl shadow-sm transition-[box-shadow] duration-200 hover:shadow-md"
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
