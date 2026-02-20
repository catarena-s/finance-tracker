"use client";

import React, { useState } from "react";
import { Modal, Button } from "@/components/ui";
import { csvApi } from "@/services/api/csv";
import type { Category } from "@/types/api";

const COLUMNS = [
  { id: "amount", label: "Сумма" },
  { id: "currency", label: "Валюта" },
  { id: "category_name", label: "Категория" },
  { id: "description", label: "Описание" },
  { id: "transaction_date", label: "Дата" },
  { id: "type", label: "Тип" },
];

const DATE_FORMATS = [
  { value: "%Y-%m-%d", label: "YYYY-MM-DD" },
  { value: "%d.%m.%Y", label: "DD.MM.YYYY" },
  { value: "%m/%d/%Y", label: "MM/DD/YYYY" },
];

interface CSVExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: Category[];
}

export function CSVExportDialog({
  isOpen,
  onClose,
  categories = [],
}: CSVExportDialogProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    COLUMNS.map((c) => c.id)
  );
  const [dateFormat, setDateFormat] = useState("%Y-%m-%d");

  const toggleColumn = (id: string) => {
    setSelectedColumns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleDownload = () => {
    const url = csvApi.getExportUrl({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      categoryId: categoryId || undefined,
      columns: selectedColumns.length ? selectedColumns : undefined,
      dateFormat,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Экспорт в CSV" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата с
            </label>
            <input
              type="date"
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата по
            </label>
            <input
              type="date"
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Категория
          </label>
          <select
            className="w-full border rounded px-2 py-1.5 text-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Колонки
          </label>
          <div className="flex flex-wrap gap-2">
            {COLUMNS.map((c) => (
              <label
                key={c.id}
                className="inline-flex items-center gap-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(c.id)}
                  onChange={() => toggleColumn(c.id)}
                />
                <span className="text-sm">{c.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Формат даты
          </label>
          <select
            className="w-full border rounded px-2 py-1.5 text-sm"
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
          >
            {DATE_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleDownload}>Скачать CSV</Button>
        </div>
      </div>
    </Modal>
  );
}
