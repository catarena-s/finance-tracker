"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/shadcn/card";

interface ChartsCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartsCard({ title, children, className }: ChartsCardProps) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {title && (
        <CardHeader className="p-6 pb-2 md:p-8 md:pb-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </CardHeader>
      )}
      <CardContent className={title ? "p-6 pt-0 md:p-8 md:pt-0" : "p-6 md:p-8"}>
        <div className={className}>{children}</div>
      </CardContent>
    </Card>
  );
}
