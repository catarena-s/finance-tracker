import { apiClient } from "./client";
import type { CSVColumnMapping, CSVImportResult } from "@/types/api";

export interface CSVImportRequest {
  fileContent: string;
  mapping: CSVColumnMapping;
  dateFormat?: string;
}

export interface CSVExportParams {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  columns?: string[];
  dateFormat?: string;
}

export const csvApi = {
  async importCsv(data: CSVImportRequest): Promise<CSVImportResult> {
    const res = await apiClient.post<CSVImportResult>("/csv/import", {
      fileContent: data.fileContent,
      mapping: data.mapping,
      dateFormat: data.dateFormat ?? "%Y-%m-%d",
    });
    return res.data;
  },

  getExportUrl(params: CSVExportParams): string {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const search = new URLSearchParams();
    if (params.startDate) search.set("start_date", params.startDate);
    if (params.endDate) search.set("end_date", params.endDate);
    if (params.categoryId) search.set("category_id", params.categoryId);
    if (params.columns?.length) search.set("columns", params.columns.join(","));
    if (params.dateFormat) search.set("date_format", params.dateFormat);
    const q = search.toString();
    return `${base}/csv/export${q ? `?${q}` : ""}`;
  },
};
