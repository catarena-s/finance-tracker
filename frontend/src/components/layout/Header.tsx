"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/shadcn/button";
import { Plus, Menu } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const showAddTransaction = pathname.startsWith("/transactions");
  const showAddCategory = pathname.startsWith("/categories");
  const showAddBudget = pathname.startsWith("/budgets");
  const showAddRecurring = pathname.startsWith("/recurring");

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      {/* Left side: menu button on mobile */}
      <div className="flex items-center md:w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="ml-4 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-[border-color,color,box-shadow] duration-150 hover:border-primary/50 hover:text-primary hover:shadow-md md:hidden"
          aria-label="Открыть меню"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right side: theme switcher and action buttons */}
      <div className="ml-auto flex items-center gap-3 px-4 md:px-6">
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
