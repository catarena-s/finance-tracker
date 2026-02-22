import React from "react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card px-6 py-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © 2026 Трекер личных финансов. Все права защищены.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            О проекте
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Поддержка
          </a>
        </div>
      </div>
    </footer>
  );
}
