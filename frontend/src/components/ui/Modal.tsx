"use client";

import React, { ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/shadcn/dialog";
import { cn } from "@/lib/utils";

/**
 * Modal - Адаптивный компонент модального окна
 *
 * Responsive Design:
 * - Ширина 95% на мобильных устройствах для обеспечения отступов по краям
 * - Фиксированная max-width на desktop для оптимальной читаемости
 * - Прокрутка содержимого при превышении высоты viewport
 *
 * Breakpoints и размеры:
 * - Mobile (< 640px): w-[95%] (95% ширины экрана, 2.5% отступы по краям)
 * - Desktop (>= 640px): sm:max-w-{size} (фиксированная максимальная ширина)
 *
 * Size Options:
 * - sm: max-w-md (448px)
 * - md: max-w-lg (512px)
 * - lg: max-w-2xl (672px)
 * - xl: max-w-4xl (896px)
 *
 * Accessibility:
 * - Кнопка закрытия имеет размер 44x44px для удобного нажатия на сенсорных экранах
 * - Максимальная высота содержимого 85vh для предотвращения обрезки
 * - Вертикальная прокрутка (overflow-y: auto) для длинного содержимого
 *
 * Требования: 4.1, 4.2, 4.5
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

// Адаптивные классы размеров: 95% на mobile, фиксированная max-width на desktop
const sizeClasses = {
  sm: "w-[95%] sm:max-w-md",
  md: "w-[95%] sm:max-w-lg",
  lg: "w-[95%] sm:max-w-2xl",
  xl: "w-[95%] sm:max-w-4xl",
};

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent title={title} showClose={true} className={cn(sizeClasses[size])}>
        {/* Прокрутка содержимого: max-h-[85vh] для предотвращения обрезки, overflow-y-auto для длинного контента */}
        <div className="overflow-y-auto max-h-[85vh] pt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
