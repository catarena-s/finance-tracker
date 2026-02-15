import React, { useEffect } from "react";

export interface ToastProps {
  message: string;
  type?: "error" | "success" | "warning" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "error",
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    error: "bg-red-500 border-red-600",
    success: "bg-green-500 border-green-600",
    warning: "bg-yellow-500 border-yellow-600",
    info: "bg-blue-500 border-blue-600",
  };

  const icons = {
    error: "❌",
    success: "✅",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 text-white ${typeStyles[type]} animate-slide-in`}
      role="alert"
      aria-live="assertive"
    >
      <span className="text-xl">{icons[type]}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-white hover:text-gray-200 transition-colors"
        aria-label="Закрыть уведомление"
      >
        ✕
      </button>
    </div>
  );
}
