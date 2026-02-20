"use client";

import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui";
import { csvApi } from "@/services/api/csv";
import { tasksApi } from "@/services/api/tasks";
import type { CSVColumnMapping, CSVImportResult } from "@/types/api";
import { CSVMappingDialog } from "./CSVMappingDialog";
import { CSVPreview } from "./CSVPreview";

function toBase64(str: string): string {
  return typeof btoa !== "undefined"
    ? btoa(unescape(encodeURIComponent(str)))
    : Buffer.from(str, "utf-8").toString("base64");
}

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 120;

export function CSVImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [mapping, setMapping] = useState<CSVColumnMapping | null>(null);
  const [dateFormat, setDateFormat] = useState("%Y-%m-%d");
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [taskPolling, setTaskPolling] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setImportResult(null);
    setMapping(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) || (reader.result as string) || "";
      setCsvText(text);
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      });
      const hs =
        parsed.meta.fields || (parsed.data[0] ? Object.keys(parsed.data[0]) : []);
      setHeaders(hs);
      setRows(parsed.data || []);
      setMappingDialogOpen(true);
    };
    reader.readAsText(f, "UTF-8");
  }, []);

  const handleMappingConfirm = useCallback((m: CSVColumnMapping) => {
    setMapping(m);
    setMappingDialogOpen(false);
  }, []);

  const handleImport = useCallback(async () => {
    if (!csvText || !mapping) return;
    setImporting(true);
    setImportResult(null);
    try {
      const fileContent = toBase64(csvText);
      const result = await csvApi.importCsv({
        fileContent,
        mapping,
        dateFormat,
      });
      setImportResult(result);

      if (result.status === "pending" && result.taskId) {
        setTaskPolling(true);
        let attempts = 0;
        const poll = async () => {
          const status = await tasksApi.getStatus(result.taskId!);
          if (status.status === "completed" && status.result) {
            setImportResult({
              taskId: result.taskId,
              status: "completed",
              createdCount:
                (status.result as { created_count?: number }).created_count ?? 0,
              errorCount: (status.result as { error_count?: number }).error_count ?? 0,
              errors:
                (status.result as { errors?: Array<{ row: number; error: string }> })
                  .errors ?? [],
            });
            setTaskPolling(false);
            return;
          }
          if (status.status === "failed") {
            setImportResult({
              taskId: result.taskId,
              status: "failed",
              errorCount: 1,
              errors: [{ row: 0, error: status.error ?? "Ошибка задачи" }],
            });
            setTaskPolling(false);
            return;
          }
          attempts++;
          if (attempts < MAX_POLL_ATTEMPTS) {
            setTimeout(poll, POLL_INTERVAL_MS);
          } else {
            setTaskPolling(false);
          }
        };
        setTimeout(poll, POLL_INTERVAL_MS);
      }
    } catch (err: unknown) {
      setImportResult({
        taskId: "",
        status: "failed",
        errorCount: 1,
        errors: [{ row: 0, error: (err as Error)?.message ?? "Ошибка импорта" }],
      });
    } finally {
      setImporting(false);
    }
  }, [csvText, mapping, dateFormat]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer">
          <span className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            Выбрать CSV
          </span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        {file && (
          <span className="text-sm text-gray-600">
            {file.name} ({rows.length} строк)
          </span>
        )}
      </div>

      <CSVMappingDialog
        isOpen={mappingDialogOpen}
        onClose={() => setMappingDialogOpen(false)}
        headers={headers}
        initialMapping={mapping ?? undefined}
        onConfirm={handleMappingConfirm}
      />

      {mapping && rows.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Формат даты:</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
            >
              <option value="%Y-%m-%d">YYYY-MM-DD</option>
              <option value="%d.%m.%Y">DD.MM.YYYY</option>
              <option value="%m/%d/%Y">MM/DD/YYYY</option>
            </select>
          </div>
          <CSVPreview
            rows={rows}
            mapping={{
              amount: mapping.amount,
              transactionDate: mapping.transactionDate,
              type: mapping.type,
              categoryName: mapping.categoryName,
            }}
          />
          <Button
            onClick={handleImport}
            disabled={importing || taskPolling}
            loading={importing || taskPolling}
          >
            {taskPolling ? "Импорт в фоне…" : "Импортировать"}
          </Button>
        </>
      )}

      {importResult && (
        <div
          className={`rounded-lg p-4 ${importResult.status === "failed" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}
        >
          <p className="font-medium">
            {importResult.status === "completed"
              ? `Готово: создано ${importResult.createdCount ?? 0}, ошибок ${importResult.errorCount ?? 0}`
              : importResult.status === "pending"
                ? "Импорт в фоне…"
                : "Ошибка импорта"}
          </p>
          {importResult.errors && importResult.errors.length > 0 && (
            <ul className="mt-2 text-sm list-disc list-inside">
              {importResult.errors.slice(0, 10).map((e, i) => (
                <li key={i}>
                  Строка {e.row}: {e.error}
                </li>
              ))}
              {(importResult.errors?.length ?? 0) > 10 && (
                <li>… и ещё {(importResult.errors?.length ?? 0) - 10} ошибок</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
