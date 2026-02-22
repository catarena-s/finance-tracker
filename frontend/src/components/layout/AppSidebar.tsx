"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Repeat,
  FolderTree,
  PiggyBank,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Главная", icon: null },
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/transactions", label: "Транзакции", icon: ArrowLeftRight },
  { href: "/recurring", label: "Повторяющиеся", icon: Repeat },
  { href: "/categories", label: "Категории", icon: FolderTree },
  { href: "/budgets", label: "Бюджеты", icon: PiggyBank },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
      isActive(href)
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  const navContent = (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.href)}
            onClick={() => setMobileOpen(false)}
          >
            {Icon ? (
              <Icon className="h-5 w-5 shrink-0" />
            ) : (
              <span className="text-lg">💰</span>
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-2xl bg-card p-2 shadow-fintech md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Открыть меню"
      >
        <Menu className="h-6 w-6 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar: desktop fixed, mobile slide-out */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 border-r border-border bg-card shadow-fintech transition-transform md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4 md:justify-center">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <span className="text-2xl">💰</span>
            <span className="font-semibold text-foreground">Финансы</span>
          </Link>
          <button
            type="button"
            className="rounded-2xl p-2 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Закрыть меню"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {navContent}
      </aside>
    </>
  );
}
