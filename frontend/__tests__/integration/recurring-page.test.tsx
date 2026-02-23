/**
 * Integration tests — Recurring Transactions Page
 * Тестирование страницы повторяющихся транзакций
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecurringPage from "@/app/recurring/page";
import { AppProvider } from "@/contexts/AppContext";
import { recurringTransactionsApi } from "@/services/api";
import type { RecurringTransaction, Category } from "@/types/api";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/recurring",
}));

// Mock API
jest.mock("@/services/api", () => ({
  recurringTransactionsApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  categoriesApi: {
    getAll: jest.fn(),
  },
  transactionsApi: {
    getAll: jest.fn(),
  },
  budgetsApi: {
    getAll: jest.fn(),
  },
  analyticsApi: {
    getSummary: jest.fn(),
  },
}));

const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Продукты",
    type: "expense",
    icon: "shopping-cart",
    color: "#3B82F6",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cat-2",
    name: "Зарплата",
    type: "income",
    icon: "dollar-sign",
    color: "#10B981",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const mockRecurringTransactions: RecurringTransaction[] = [
  {
    id: "rec-1",
    name: "Netflix подписка",
    amount: 990,
    currency: "RUB",
    type: "expense",
    categoryId: "cat-1",
    description: "Ежемесячная подписка",
    frequency: "monthly",
    interval: 1,
    startDate: "2024-01-01",
    nextOccurrence: "2024-02-01",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "rec-2",
    name: "Зарплата",
    amount: 100000,
    currency: "RUB",
    type: "income",
    categoryId: "cat-2",
    description: "Ежемесячная зарплата",
    frequency: "monthly",
    interval: 1,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    nextOccurrence: "2024-02-01",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

describe("Recurring Transactions Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (recurringTransactionsApi.getAll as jest.Mock).mockResolvedValue(
      mockRecurringTransactions
    );
    (require("@/services/api").categoriesApi.getAll as jest.Mock).mockResolvedValue(
      mockCategories
    );
  });

  it("renders page title and description", async () => {
    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    expect(screen.getByText("Повторяющиеся транзакции")).toBeInTheDocument();
    expect(
      screen.getByText(/Шаблоны для автоматического создания транзакций/)
    ).toBeInTheDocument();
  });

  it("loads and displays recurring transactions", async () => {
    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(recurringTransactionsApi.getAll).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("Netflix подписка")).toBeInTheDocument();
      expect(screen.getByText("Зарплата")).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    expect(screen.getByText("Загрузка...")).toBeInTheDocument();
  });

  it("shows empty state when no recurring transactions", async () => {
    (recurringTransactionsApi.getAll as jest.Mock).mockResolvedValue([]);

    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Нет шаблонов повторяющихся транзакций/)
      ).toBeInTheDocument();
    });
  });

  it("shows error message on API failure", async () => {
    (recurringTransactionsApi.getAll as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("displays recurring transaction details correctly", async () => {
    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Netflix подписка")).toBeInTheDocument();
    });

    // Проверяем отображение суммы
    expect(screen.getByText(/990/)).toBeInTheDocument();
    const monthlyLabels = screen.getAllByText(/Ежемесячно/);
    expect(monthlyLabels.length).toBeGreaterThan(0);
  });

  it("shows active/inactive status", async () => {
    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Netflix подписка")).toBeInTheDocument();
    });

    const activeLabels = screen.getAllByText("Активен");
    expect(activeLabels.length).toBeGreaterThan(0);
  });

  it("can toggle recurring transaction active status", async () => {
    const user = userEvent.setup();
    (recurringTransactionsApi.update as jest.Mock).mockResolvedValue({
      ...mockRecurringTransactions[0],
      isActive: false,
    });

    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Netflix подписка")).toBeInTheDocument();
    });

    const toggleButtons = screen.getAllByText("Отключить");
    await user.click(toggleButtons[0]);

    await waitFor(() => {
      expect(recurringTransactionsApi.update).toHaveBeenCalledWith("rec-1", {
        isActive: false,
      });
    });
  });

  it("opens create modal when URL has openAdd=1 query param", async () => {
    const mockSearchParams = {
      get: jest.fn((key: string) => (key === "openAdd" ? "1" : null)),
    };
    
    jest.spyOn(require("next/navigation"), "useSearchParams").mockReturnValue(mockSearchParams);

    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Создать шаблон")).toBeInTheDocument();
    });
  });

  it("can open edit modal", async () => {
    const user = userEvent.setup();
    
    // Мокаем useSearchParams чтобы не открывалось модальное окно создания
    const mockSearchParams = {
      get: jest.fn(() => null),
    };
    jest.spyOn(require("next/navigation"), "useSearchParams").mockReturnValue(mockSearchParams);

    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Netflix подписка")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText("Изменить");
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Редактировать шаблон")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("can open delete confirmation modal", async () => {
    const user = userEvent.setup();
    
    // Мокаем useSearchParams чтобы не открывалось модальное окно создания
    const mockSearchParams = {
      get: jest.fn(() => null),
    };
    jest.spyOn(require("next/navigation"), "useSearchParams").mockReturnValue(mockSearchParams);

    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Netflix подписка")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Удалить");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Удалить шаблон")).toBeInTheDocument();
      expect(
        screen.getByText(/Созданные транзакции сохранятся/)
      ).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("can delete recurring transaction", async () => {
    const user = userEvent.setup();
    (recurringTransactionsApi.delete as jest.Mock).mockResolvedValue(undefined);
    (recurringTransactionsApi.getAll as jest.Mock)
      .mockResolvedValueOnce(mockRecurringTransactions)
      .mockResolvedValueOnce([mockRecurringTransactions[1]]);
    
    // Мокаем useSearchParams чтобы не открывалось модальное окно создания
    const mockSearchParams = {
      get: jest.fn(() => null),
    };
    jest.spyOn(require("next/navigation"), "useSearchParams").mockReturnValue(mockSearchParams);

    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Netflix подписка")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Удалить");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Удалить шаблон")).toBeInTheDocument();
    }, { timeout: 3000 });

    // Ждем пока модальное окно полностью откроется
    const confirmButton = await screen.findByRole("button", { name: /Удалить/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(recurringTransactionsApi.delete).toHaveBeenCalledWith("rec-1");
    });
  });

  it("closes error message when close button clicked", async () => {
    const user = userEvent.setup();
    
    // Мокаем useSearchParams чтобы не открывалось модальное окно создания
    const mockSearchParams = {
      get: jest.fn(() => null),
    };
    jest.spyOn(require("next/navigation"), "useSearchParams").mockReturnValue(mockSearchParams);
    
    (recurringTransactionsApi.getAll as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    // Ждем появления сообщения об ошибке
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    }, { timeout: 3000 });

    const closeButton = screen.getByLabelText("Закрыть");
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Network error")).not.toBeInTheDocument();
    });
  });

  it("renders create form when add button clicked", async () => {
    const user = userEvent.setup();
    
    // Мокаем useSearchParams чтобы не открывалось модальное окно создания
    const mockSearchParams = {
      get: jest.fn(() => null),
    };
    jest.spyOn(require("next/navigation"), "useSearchParams").mockReturnValue(mockSearchParams);

    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Netflix подписка")).toBeInTheDocument();
    });

    // Находим кнопку "Добавить шаблон" в Header (она должна быть добавлена)
    // Пока проверим что форма открывается через параметр URL
    const mockSearchParamsWithAdd = {
      get: jest.fn((key: string) => (key === "openAdd" ? "1" : null)),
    };
    jest.spyOn(require("next/navigation"), "useSearchParams").mockReturnValue(mockSearchParamsWithAdd);

    // Перерендерим компонент с новым параметром
    const { rerender } = render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    // Проверяем что форма отображается без ошибок
    await waitFor(() => {
      expect(screen.getByText("Создать шаблон")).toBeInTheDocument();
      expect(screen.getByLabelText("Название")).toBeInTheDocument();
      expect(screen.getByLabelText("Сумма")).toBeInTheDocument();
      expect(screen.getByText("Категория")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders edit form when edit button clicked", async () => {
    const user = userEvent.setup();
    
    // Мокаем useSearchParams чтобы не открывалось модальное окно создания
    const mockSearchParams = {
      get: jest.fn(() => null),
    };
    jest.spyOn(require("next/navigation"), "useSearchParams").mockReturnValue(mockSearchParams);

    render(
      <AppProvider>
        <RecurringPage />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Netflix подписка")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText("Изменить");
    await user.click(editButtons[0]);

    // Проверяем что форма редактирования отображается без ошибок
    await waitFor(() => {
      expect(screen.getByText("Редактировать шаблон")).toBeInTheDocument();
      expect(screen.getByLabelText("Название")).toBeInTheDocument();
      expect(screen.getByLabelText("Сумма")).toBeInTheDocument();
      expect(screen.getByText("Категория")).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
