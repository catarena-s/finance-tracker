"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  FolderTree,
  PiggyBank,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
  { href: "/transactions", label: "Транзакции", icon: ArrowLeftRight },
  { href: "/categories", label: "Категории", icon: FolderTree },
  { href: "/budgets", label: "Бюджеты", icon: PiggyBank },
  { href: "/recurring", label: "Повторяющиеся", icon: ArrowLeftRight },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
      isActive(href)
        ? "bg-primary text-primary-foreground shadow-sm [&_svg]:text-primary-foreground"
        : "text-muted-foreground [&_svg]:text-muted-foreground hover:bg-muted hover:text-foreground hover:[&_svg]:text-primary"
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
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        className="group fixed left-4 top-4 z-50 rounded-xl border border-border bg-card p-2.5 shadow-fintech transition-all duration-150 hover:shadow-fintech-hover hover:border-primary/30 md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Открыть меню"
      >
        <Menu className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 border-r border-border bg-card shadow-fintech transition-transform duration-150 ease-in-out md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4 md:justify-center">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <span className="text-xl font-semibold text-foreground">
              Трекер финансов
            </span>
          </Link>
          <button
            type="button"
            className="rounded-xl p-2 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground md:hidden"
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
