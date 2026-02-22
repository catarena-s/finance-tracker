"use client";

import React from "react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border bg-card/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Трекер личных финансов
        </h2>
      </div>
    </header>
  );
}
