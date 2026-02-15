import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © 2026 Finance Tracker. Все права защищены.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              О проекте
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Поддержка
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
