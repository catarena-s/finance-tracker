"use client";

import React, { ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/shadcn/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        title={title}
        showClose={true}
        className={cn("w-full", sizeClasses[size])}
      >
        <div className="pt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
