import React from "react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-slate-500">
          © 2026 Трекер личных финансов. Все права защищены.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            О проекте
          </a>
          <a
            href="#"
            className="text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            Поддержка
          </a>
        </div>
      </div>
    </footer>
  );
}
