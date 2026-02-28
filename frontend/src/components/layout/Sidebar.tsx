"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  FolderTree,
  PiggyBank,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
  { href: "/transactions", label: "Транзакции", icon: ArrowLeftRight },
  { href: "/categories", label: "Категории", icon: FolderTree },
  { href: "/budgets", label: "Бюджеты", icon: PiggyBank },
  { href: "/recurring", label: "Повторяющиеся", icon: ArrowLeftRight },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-[background-color,color,box-shadow] duration-150",
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
            onClick={handleClose}
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
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={handleClose}
          aria-hidden
        />
      )}

      {/* Sidebar: desktop fixed, mobile slide-out */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 border-r border-border bg-card shadow-fintech transition-transform duration-150 ease-in-out md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-end border-b border-border px-4 md:justify-center">
          <Link
            href="/"
            className="hidden items-center gap-2 md:flex"
            onClick={handleClose}
          >
            <span className="text-xl font-semibold text-foreground">
              Трекер финансов
            </span>
          </Link>
          <button
            type="button"
            className="rounded-xl p-2 text-muted-foreground transition-[background-color,color] duration-150 hover:bg-muted hover:text-foreground md:hidden"
            onClick={handleClose}
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
