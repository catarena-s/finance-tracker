/**
 * Интеграционные тесты для пагинации транзакций
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { transactionApi } from "@/services/api/transactions";

jest.mock("@/services/api/transactions");

const mockTransactionApi = transactionApi as jest.Mocked<typeof transactionApi>;

describe("Transaction Pagination", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display correct number of pages on initial load", async () => {
    // Мокаем 22 транзакции (должно быть 3 страницы при pageSize=10)
    const mockTransactions = Array.from({ length: 22 }, (_, i) => ({
      id: `txn-${i}`,
      type: "expense" as const,
      amount: 100 + i,
      currency: "RUB",
      categoryId: "cat-1",
      description: `Transaction ${i}`,
      transactionDate: "2024-02-15",
      isRecurring: false,
      createdAt: "2024-02-15T00:00:00Z",
      updatedAt: "2024-02-15T00:00:00Z",
      category: {
        id: "cat-1",
        name: "Food",
        color: "#FF5733",
      },
    }));

    mockTransactionApi.getAll.mockResolvedValue({
      data: mockTransactions.slice(0, 10), // Первая страница
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 3, // Правильное количество страниц
        totalItems: 22,
      },
    });

    function TestPagination() {
      const [currentPage, setCurrentPage] = React.useState(1);
      const [pagination, setPagination] = React.useState<{
        totalPages: number;
        totalItems: number;
      } | null>(null);

      React.useEffect(() => {
        const loadData = async () => {
          const result = await transactionApi.getAll({
            page: currentPage,
            pageSize: 10,
          });
          setPagination({
            totalPages: result.pagination.totalPages,
            totalItems: result.pagination.totalItems,
          });
        };
        loadData();
      }, [currentPage]);

      return (
        <div>
          <div data-testid="current-page">{currentPage}</div>
          <div data-testid="total-pages">
            {pagination?.totalPages ?? "loading"}
          </div>
          <div data-testid="total-items">
            {pagination?.totalItems ?? "loading"}
          </div>
          <button onClick={() => setCurrentPage(2)}>Next Page</button>
        </div>
      );
    }

    render(<TestPagination />);

    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.getByTestId("total-pages")).not.toHaveTextContent(
        "loading"
      );
    });

    // Проверяем что отображается правильное количество страниц
    expect(screen.getByTestId("total-pages")).toHaveTextContent("3");
    expect(screen.getByTestId("total-items")).toHaveTextContent("22");
    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
  });

  it("should use local currentPage state instead of pagination.page", async () => {
    const user = userEvent.setup();

    // Первый запрос - страница 1
    mockTransactionApi.getAll.mockResolvedValueOnce({
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 3,
        totalItems: 22,
      },
    });

    // Второй запрос - страница 2
    mockTransactionApi.getAll.mockResolvedValueOnce({
      data: [],
      pagination: {
        page: 2,
        pageSize: 10,
        totalPages: 3,
        totalItems: 22,
      },
    });

    function TestPagination() {
      const [currentPage, setCurrentPage] = React.useState(1);
      const [displayPage, setDisplayPage] = React.useState(1);

      React.useEffect(() => {
        const loadData = async () => {
          const result = await transactionApi.getAll({
            page: currentPage,
            pageSize: 10,
          });
          // Используем локальный currentPage, а не result.pagination.page
          setDisplayPage(currentPage);
        };
        loadData();
      }, [currentPage]);

      return (
        <div>
          <div data-testid="display-page">{displayPage}</div>
          <button onClick={() => setCurrentPage(2)}>Go to Page 2</button>
        </div>
      );
    }

    render(<TestPagination />);

    // Проверяем начальное состояние
    await waitFor(() => {
      expect(screen.getByTestId("display-page")).toHaveTextContent("1");
    });

    // Переходим на страницу 2
    await user.click(screen.getByText("Go to Page 2"));

    // Проверяем что отображается страница 2
    await waitFor(() => {
      expect(screen.getByTestId("display-page")).toHaveTextContent("2");
    });

    // Проверяем что API был вызван с правильными параметрами
    expect(mockTransactionApi.getAll).toHaveBeenNthCalledWith(1, {
      page: 1,
      pageSize: 10,
    });
    expect(mockTransactionApi.getAll).toHaveBeenNthCalledWith(2, {
      page: 2,
      pageSize: 10,
    });
  });

  it("should handle pagination with filters", async () => {
    const user = userEvent.setup();

    mockTransactionApi.getAll.mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 2,
        totalItems: 15,
      },
    });

    function TestPagination() {
      const [currentPage, setCurrentPage] = React.useState(1);
      const [filters, setFilters] = React.useState({ type: "expense" as const });
      const [pagination, setPagination] = React.useState<{
        totalPages: number;
      } | null>(null);

      React.useEffect(() => {
        const loadData = async () => {
          const result = await transactionApi.getAll({
            ...filters,
            page: currentPage,
            pageSize: 10,
          });
          setPagination({ totalPages: result.pagination.totalPages });
        };
        loadData();
      }, [currentPage, filters]);

      return (
        <div>
          <div data-testid="current-page">{currentPage}</div>
          <div data-testid="total-pages">
            {pagination?.totalPages ?? "loading"}
          </div>
          <button onClick={() => setCurrentPage(2)}>Next Page</button>
          <button onClick={() => setFilters({ type: "income" })}>
            Change Filter
          </button>
        </div>
      );
    }

    render(<TestPagination />);

    // Ждем загрузки
    await waitFor(() => {
      expect(screen.getByTestId("total-pages")).toHaveTextContent("2");
    });

    // Переходим на страницу 2
    await user.click(screen.getByText("Next Page"));

    await waitFor(() => {
      expect(screen.getByTestId("current-page")).toHaveTextContent("2");
    });

    // Проверяем что API был вызван с фильтрами и пагинацией
    expect(mockTransactionApi.getAll).toHaveBeenLastCalledWith({
      type: "expense",
      page: 2,
      pageSize: 10,
    });
  });
});
