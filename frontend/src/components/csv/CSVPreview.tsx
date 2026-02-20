"use client";

import React from "react";

interface CSVPreviewProps {
  rows: Record<string, string>[];
  mapping: {
    amount: string;
    transactionDate: string;
    type: string;
    categoryName: string;
  };
  maxRows?: number;
}

export function CSVPreview({ rows, mapping, maxRows = 10 }: CSVPreviewProps) {
  const display = rows.slice(0, maxRows);
  const columns = [
    mapping.amount,
    mapping.transactionDate,
    mapping.type,
    mapping.categoryName,
  ].filter(Boolean);

  if (display.length === 0) {
    return <p className="text-gray-500 text-sm">Нет данных для предпросмотра.</p>;
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 text-left font-medium text-gray-700">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {display.map((row, i) => (
            <tr key={i} className="border-t border-gray-200">
              {columns.map((col) => (
                <td key={col} className="px-3 py-2 text-gray-900">
                  {row[col] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <p className="px-3 py-2 text-gray-500 text-xs">
          Показаны первые {maxRows} из {rows.length} строк.
        </p>
      )}
    </div>
  );
}
