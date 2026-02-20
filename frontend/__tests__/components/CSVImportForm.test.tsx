/**
 * Unit tests — CSVImportForm
 * Рендер формы, выбор файла, открытие диалога маппинга, импорт (с моками API).
 */
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CSVImportForm } from "@/components/csv/CSVImportForm";
import { csvApi } from "@/services/api/csv";
import { tasksApi } from "@/services/api/tasks";

const mockParse = jest.fn((text: string) => {
  const lines = text.trim().split("\n");
  const header = lines[0]?.split(",") ?? [];
  const data = lines.slice(1).map((line) => {
    const values = line.split(",");
    return header.reduce(
      (acc, h, i) => ({ ...acc, [h]: values[i] ?? "" }),
      {} as Record<string, string>
    );
  });
  return { data, meta: { fields: header } };
});

jest.mock("papaparse", () => ({
  __esModule: true,
  default: { parse: (t: string, _opts?: unknown) => mockParse(t) },
}));

jest.mock("@/services/api/csv", () => ({
  csvApi: {
    importCsv: jest.fn(),
  },
}));

jest.mock("@/services/api/tasks", () => ({
  tasksApi: {
    getStatus: jest.fn(),
  },
}));

const mockCsvApi = csvApi as jest.Mocked<typeof csvApi>;

describe("CSVImportForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCsvApi.importCsv.mockResolvedValue({
      taskId: "",
      status: "completed",
      createdCount: 2,
      errorCount: 0,
    });
  });

  it("renders file picker label", () => {
    render(<CSVImportForm />);
    expect(screen.getByText("Выбрать CSV")).toBeInTheDocument();
  });

  it("opens mapping dialog after file selection", async () => {
    const user = userEvent.setup();
    const csvContent = "amount,date,type,category\n100,2024-01-01,expense,Food";
    const file = new File([csvContent], "test.csv", { type: "text/csv" });

    let resolveOnload: (() => void) | null = null;
    const onloadDone = new Promise<void>((r) => {
      resolveOnload = r;
    });
    jest.spyOn(FileReader.prototype, "readAsText").mockImplementation(function (
      this: FileReader
    ) {
      if (this.onload) {
        this.onload({ target: { result: csvContent } } as ProgressEvent<FileReader>);
      }
      resolveOnload?.();
    });

    render(<CSVImportForm />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    await onloadDone;

    await waitFor(() =>
      expect(screen.getByText("Настройка колонок CSV")).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: /применить/i })).toBeInTheDocument();
  });

  it("calls import API and shows result on success", async () => {
    const user = userEvent.setup();
    const csvContent = "amount,date,type,category\n100,2024-01-01,expense,Food";
    const file = new File([csvContent], "test.csv", { type: "text/csv" });

    let resolveOnload: (() => void) | null = null;
    const onloadDone = new Promise<void>((r) => {
      resolveOnload = r;
    });
    jest.spyOn(FileReader.prototype, "readAsText").mockImplementation(function (
      this: FileReader
    ) {
      if (this.onload) {
        this.onload({ target: { result: csvContent } } as ProgressEvent<FileReader>);
      }
      resolveOnload?.();
    });

    render(<CSVImportForm />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    await act(async () => {
      await onloadDone;
    });

    await waitFor(() =>
      expect(screen.getByText("Настройка колонок CSV")).toBeInTheDocument()
    );
    await waitFor(() => expect(mockParse).toHaveBeenCalledWith(csvContent));
    await waitFor(() => expect(screen.getByText(/1 строк/)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /применить/i }));

    await waitFor(() => expect(screen.getByText("Импортировать")).toBeInTheDocument());
    await user.click(screen.getByText("Импортировать"));

    await waitFor(() => {
      expect(mockCsvApi.importCsv).toHaveBeenCalledWith(
        expect.objectContaining({
          mapping: expect.objectContaining({
            amount: expect.any(String),
            transactionDate: expect.any(String),
            type: expect.any(String),
            categoryName: expect.any(String),
          }),
          dateFormat: "%Y-%m-%d",
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Готово: создано 2, ошибок 0/)).toBeInTheDocument();
    });
  });

  it("shows error message when import fails", async () => {
    mockCsvApi.importCsv.mockRejectedValueOnce(new Error("Network error"));
    const user = userEvent.setup();
    const csvContent = "amount,date,type,category\n100,2024-01-01,expense,Food";
    const file = new File([csvContent], "test.csv", { type: "text/csv" });

    let resolveOnload: (() => void) | null = null;
    const onloadDone = new Promise<void>((r) => {
      resolveOnload = r;
    });
    jest.spyOn(FileReader.prototype, "readAsText").mockImplementation(function (
      this: FileReader
    ) {
      if (this.onload) {
        this.onload({ target: { result: csvContent } } as ProgressEvent<FileReader>);
      }
      resolveOnload?.();
    });

    render(<CSVImportForm />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);
    await act(async () => {
      await onloadDone;
    });

    await waitFor(() =>
      expect(screen.getByText("Настройка колонок CSV")).toBeInTheDocument()
    );
    await waitFor(() => expect(screen.getByText(/1 строк/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /применить/i }));
    await waitFor(() => expect(screen.getByText("Импортировать")).toBeInTheDocument());
    await user.click(screen.getByText("Импортировать"));

    await waitFor(() => {
      expect(screen.getByText(/Ошибка импорта/)).toBeInTheDocument();
    });
  });
});
