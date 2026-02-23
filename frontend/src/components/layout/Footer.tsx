import React from "react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card px-6 py-4 shadow-sm">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © 2026 Трекер личных финансов. Все права защищены.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            О проекте
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Поддержка
          </a>
        </div>
      </div>
    </footer>
  );
}
