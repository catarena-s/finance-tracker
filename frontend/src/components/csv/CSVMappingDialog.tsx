"use client";

import React from "react";
import { Modal, Button, Select } from "@/components/ui";
import type { CSVColumnMapping } from "@/types/api";

interface CSVMappingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  initialMapping?: Partial<CSVColumnMapping>;
  onConfirm: (mapping: CSVColumnMapping) => void;
}

const requiredFields = [
  { key: "amount" as const, label: "Сумма" },
  { key: "transactionDate" as const, label: "Дата" },
  { key: "type" as const, label: "Тип (income/expense)" },
  { key: "categoryName" as const, label: "Категория" },
];
const optionalFields = [
  { key: "currency" as const, label: "Валюта" },
  { key: "description" as const, label: "Описание" },
];

export function CSVMappingDialog({
  isOpen,
  onClose,
  headers,
  initialMapping,
  onConfirm,
}: CSVMappingDialogProps) {
  const [mapping, setMapping] = React.useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    const all = [...requiredFields, ...optionalFields];
    all.forEach(({ key }) => {
      const v = initialMapping?.[key as keyof CSVColumnMapping];
      if (v) m[key] = v;
    });
    return m;
  });

  React.useEffect(() => {
    if (isOpen && headers.length) {
      const m: Record<string, string> = {};
      const lower = headers.map((h) => h.toLowerCase());
      requiredFields.forEach(({ key }) => {
        const prev = initialMapping?.[key as keyof CSVColumnMapping];
        if (prev && headers.includes(prev)) m[key] = prev;
        else {
          const guess =
            key === "amount" &&
            lower.some((h) => h.includes("amount") || h.includes("sum"));
          const idx = guess
            ? lower.findIndex((h) => h.includes("amount") || h.includes("sum"))
            : -1;
          if (idx >= 0) m[key] = headers[idx];
          else if (headers[0]) m[key] = headers[0];
        }
      });
      optionalFields.forEach(({ key }) => {
        const prev = initialMapping?.[key as keyof CSVColumnMapping];
        if (prev && headers.includes(prev)) m[key] = prev;
      });
      setMapping((prev) => ({ ...prev, ...m }));
    }
  }, [isOpen, headers, initialMapping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const out: CSVColumnMapping = {
      amount: mapping.amount || headers[0],
      categoryName: mapping.categoryName || headers[0],
      transactionDate: mapping.transactionDate || headers[0],
      type: mapping.type || headers[0],
    };
    if (mapping.currency) out.currency = mapping.currency;
    if (mapping.description) out.description = mapping.description;
    onConfirm(out);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Настройка колонок CSV" size="lg">
      <form onSubmit={handleSubmit}>
        <p className="text-muted-foreground text-sm mb-4">
          Укажите, какая колонка файла соответствует каждому полю.
        </p>
        <div className="space-y-3">
          {requiredFields.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <label className="w-48 text-sm font-medium text-foreground">{label}</label>
              <select
                className="flex-1 border border-border bg-input text-foreground rounded px-2 py-1.5 text-sm"
                value={mapping[key] ?? ""}
                onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value }))}
                required
              >
                <option value="">— Выберите колонку —</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {optionalFields.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <label className="w-48 text-sm text-muted-foreground">{label}</label>
              <select
                className="flex-1 border border-border bg-input text-foreground rounded px-2 py-1.5 text-sm"
                value={mapping[key] ?? ""}
                onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value }))}
              >
                <option value="">— Не использовать —</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit">Применить</Button>
        </div>
      </form>
    </Modal>
  );
}
