/**
 * Integration Tests - Data Loading
 * 
 * Tests data loading on Dashboard and Budgets pages:
 * - Dashboard analytics data loading
 * - Budget page data loading with category mapping
 * - Error handling during data loading
 * - Loading states
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { analyticsApi } from '@/services/api/analytics';
import { categoryApi } from '@/services/api/categories';
import { budgetApi } from '@/services/api/budgets';

// Mock the API modules
jest.mock('@/services/api/analytics');
jest.mock('@/services/api/categories');
jest.mock('@/services/api/budgets');
jest.mock('@/services/api/transactions');

const mockAnalyticsApi = analyticsApi as jest.Mocked<typeof analyticsApi>;
const mockCategoryApi = categoryApi as jest.Mocked<typeof categoryApi>;
const mockBudgetApi = budgetApi as jest.Mocked<typeof budgetApi>;

describe('Integration Tests - Data Loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dashboard Data Loading', () => {
    it('should load summary data successfully', async () => {
      const mockSummary = {
        totalIncome: 5000.00,
        totalExpenses: 3000.00,
        balance: 2000.00,
        transactionCount: 25,
      };

      mockAnalyticsApi.getSummary.mockResolvedValue(mockSummary);

      function TestDashboard() {
        const { loadSummary, summary, loading } = useApp();

        React.useEffect(() => {
          loadSummary();
        }, []);

        return (
          <div>
            <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
            <div data-testid="total-income">{summary?.totalIncome || 0}</div>
            <div data-testid="total-expenses">{summary?.totalExpenses || 0}</div>
            <div data-testid="balance">{summary?.balance || 0}</div>
          </div>
        );
      }

      render(
        <AppProvider>
          <TestDashboard />
        </AppProvider>
      );

      // Verify loading state
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('idle');
        expect(screen.getByTestId('total-income')).toHaveTextContent('5000');
        expect(screen.getByTestId('total-expenses')).toHaveTextContent('3000');
        expect(screen.getByTestId('balance')).toHaveTextContent('2000');
      });

      expect(mockAnalyticsApi.getSummary).toHaveBeenCalledTimes(1);
    });

    it('should load trends data successfully', async () => {
      const mockTrends = [
        { date: '2024-01', income: 5000, expense: 3000 },
        { date: '2024-02', income: 5500, expense: 3200 },
        { date: '2024-03', income: 6000, expense: 3500 },
      ];

      mockAnalyticsApi.getTrends.mockResolvedValue(mockTrends);

      function TestDashboard() {
        const { loadTrends, trends, loading } = useApp();

        React.useEffect(() => {
          loadTrends();
        }, []);

        return (
          <div>
            <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
            <div data-testid="trends-count">{trends?.length || 0}</div>
            {trends?.map((trend, index) => (
              <div key={index} data-testid={`trend-${index}`}>
                {trend.date}: Income {trend.income}, Expense {trend.expense}
              </div>
            ))}
          </div>
        );
      }

      render(
        <AppProvider>
          <TestDashboard />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('idle');
        expect(screen.getByTestId('trends-count')).toHaveTextContent('3');
      });

      // Verify trend data
      expect(screen.getByTestId('trend-0')).toHaveTextContent('2024-01: Income 5000, Expense 3000');
      expect(screen.getByTestId('trend-1')).toHaveTextContent('2024-02: Income 5500, Expense 3200');
      expect(screen.getByTestId('trend-2')).toHaveTextContent('2024-03: Income 6000, Expense 3500');

      expect(mockAnalyticsApi.getTrends).toHaveBeenCalledTimes(1);
    });

    it('should load top categories data successfully', async () => {
      const mockTopCategories = [
        {
          categoryId: 'cat-1',
          categoryName: 'Продукты',
          categoryColor: '#FF5733',
          totalAmount: 1500.00,
          transactionCount: 10,
          percentage: 50.0,
        },
        {
          categoryId: 'cat-2',
          categoryName: 'Транспорт',
          categoryColor: '#3498db',
          totalAmount: 800.00,
          transactionCount: 5,
          percentage: 26.7,
        },
        {
          categoryId: 'cat-3',
          categoryName: 'Развлечения',
          categoryColor: '#9b59b6',
          totalAmount: 700.00,
          transactionCount: 8,
          percentage: 23.3,
        },
      ];

      mockAnalyticsApi.getTopCategories.mockResolvedValue(mockTopCategories);

      function TestDashboard() {
        const { loadTopCategories, topCategories, loading } = useApp();

        React.useEffect(() => {
          loadTopCategories();
        }, []);

        return (
          <div>
            <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
            <div data-testid="categories-count">{topCategories?.length || 0}</div>
            {topCategories?.map((category, index) => (
              <div key={index} data-testid={`category-${index}`}>
                {category.categoryName}: {category.totalAmount} ({category.percentage}%)
              </div>
            ))}
          </div>
        );
      }

      render(
        <AppProvider>
          <TestDashboard />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('idle');
        expect(screen.getByTestId('categories-count')).toHaveTextContent('3');
      });

      // Verify category data
      expect(screen.getByTestId('category-0')).toHaveTextContent('Продукты: 1500 (50%)');
      expect(screen.getByTestId('category-1')).toHaveTextContent('Транспорт: 800 (26.7%)');
      expect(screen.getByTestId('category-2')).toHaveTextContent('Развлечения: 700 (23.3%)');

      expect(mockAnalyticsApi.getTopCategories).toHaveBeenCalledTimes(1);
    });

    it('should load all dashboard data concurrently', async () => {
      const mockSummary = {
        totalIncome: 5000.00,
        totalExpenses: 3000.00,
        balance: 2000.00,
        transactionCount: 25,
      };

      const mockTrends = [
        { date: '2024-01', income: 5000, expense: 3000 },
      ];

      const mockTopCategories = [
        {
          categoryId: 'cat-1',
          categoryName: 'Продукты',
          categoryColor: '#FF5733',
          totalAmount: 1500.00,
          transactionCount: 10,
          percentage: 50.0,
        },
      ];

      mockAnalyticsApi.getSummary.mockResolvedValue(mockSummary);
      mockAnalyticsApi.getTrends.mockResolvedValue(mockTrends);
      mockAnalyticsApi.getTopCategories.mockResolvedValue(mockTopCategories);

      function TestDashboard() {
        const { loadSummary, loadTrends, loadTopCategories, summary, trends, topCategories } = useApp();

        React.useEffect(() => {
          loadSummary();
          loadTrends();
          loadTopCategories();
        }, []);

        return (
          <div>
            <div data-testid="summary-loaded">{summary ? 'yes' : 'no'}</div>
            <div data-testid="trends-loaded">{trends ? 'yes' : 'no'}</div>
            <div data-testid="categories-loaded">{topCategories ? 'yes' : 'no'}</div>
          </div>
        );
      }

      render(
        <AppProvider>
          <TestDashboard />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('summary-loaded')).toHaveTextContent('yes');
        expect(screen.getByTestId('trends-loaded')).toHaveTextContent('yes');
        expect(screen.getByTestId('categories-loaded')).toHaveTextContent('yes');
      });

      // Verify all APIs were called
      expect(mockAnalyticsApi.getSummary).toHaveBeenCalledTimes(1);
      expect(mockAnalyticsApi.getTrends).toHaveBeenCalledTimes(1);
      expect(mockAnalyticsApi.getTopCategories).toHaveBeenCalledTimes(1);
    });

    it('should handle dashboard data loading errors', async () => {
      mockAnalyticsApi.getSummary.mockRejectedValue(new Error('Failed to load summary'));

      function TestDashboard() {
        const { loadSummary, error, loading } = useApp();

        React.useEffect(() => {
          loadSummary().catch(() => {});
        }, []);

        return (
          <div>
            <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
            <div data-testid="error">{error || 'none'}</div>
          </div>
        );
      }

      render(
        <AppProvider>
          <TestDashboard />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('idle');
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to load summary');
      });
    });
  });

  describe('Budget Page Data Loading', () => {
    it('should load budgets and categories successfully', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Продукты',
          type: 'expense' as const,
          color: '#FF5733',
          icon: '🛒',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'cat-2',
          name: 'Транспорт',
          type: 'expense' as const,
          color: '#3498db',
          icon: '🚗',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockBudgets = [
        {
          id: 'budget-1',
          categoryId: 'cat-1',
          amount: 15000.00,
          period: 'monthly' as const,
          startDate: '2024-02-01',
          endDate: '2024-02-29',
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z',
        },
        {
          id: 'budget-2',
          categoryId: 'cat-2',
          amount: 5000.00,
          period: 'monthly' as const,
          startDate: '2024-02-01',
          endDate: '2024-02-29',
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z',
        },
      ];

      mockCategoryApi.getAll.mockResolvedValue(mockCategories);
      mockBudgetApi.getAll.mockResolvedValue(mockBudgets);

      function TestBudgetPage() {
        const { loadCategories, loadBudgets, categories, budgets, loading } = useApp();

        React.useEffect(() => {
          loadCategories();
          loadBudgets();
        }, []);

        return (
          <div>
            <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
            <div data-testid="categories-count">{categories.length}</div>
            <div data-testid="budgets-count">{budgets.length}</div>
          </div>
        );
      }

      render(
        <AppProvider>
          <TestBudgetPage />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('idle');
        expect(screen.getByTestId('categories-count')).toHaveTextContent('2');
        expect(screen.getByTestId('budgets-count')).toHaveTextContent('2');
      });

      expect(mockCategoryApi.getAll).toHaveBeenCalledTimes(1);
      expect(mockBudgetApi.getAll).toHaveBeenCalledTimes(1);
    });

    it('should map category names to budgets correctly', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Продукты',
          type: 'expense' as const,
          color: '#FF5733',
          icon: '🛒',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'cat-2',
          name: 'Транспорт',
          type: 'expense' as const,
          color: '#3498db',
          icon: '🚗',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockBudgets = [
        {
          id: 'budget-1',
          categoryId: 'cat-1',
          amount: 15000.00,
          period: 'monthly' as const,
          startDate: '2024-02-01',
          endDate: '2024-02-29',
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z',
        },
        {
          id: 'budget-2',
          categoryId: 'cat-2',
          amount: 5000.00,
          period: 'monthly' as const,
          startDate: '2024-02-01',
          endDate: '2024-02-29',
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z',
        },
      ];

      mockCategoryApi.getAll.mockResolvedValue(mockCategories);
      mockBudgetApi.getAll.mockResolvedValue(mockBudgets);

      function TestBudgetPage() {
        const { loadCategories, loadBudgets, categories, budgets } = useApp();

        React.useEffect(() => {
          loadCategories();
          loadBudgets();
        }, []);

        // Map budgets to categories (simulating BudgetList component logic)
        const budgetsWithCategories = budgets.map((budget) => {
          const category = categories.find((c) => c.id === budget.categoryId);
          return {
            ...budget,
            categoryName: category?.name || budget.categoryId,
            categoryColor: category?.color || '#000000',
          };
        });

        return (
          <div>
            <div data-testid="budgets-count">{budgetsWithCategories.length}</div>
            {budgetsWithCategories.map((budget, index) => (
              <div key={budget.id} data-testid={`budget-${index}`}>
                {budget.categoryName}: {budget.amount}
              </div>
            ))}
          </div>
        );
      }

      render(
        <AppProvider>
          <TestBudgetPage />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('budgets-count')).toHaveTextContent('2');
      });

      // Verify category names are mapped correctly
      expect(screen.getByTestId('budget-0')).toHaveTextContent('Продукты: 15000');
      expect(screen.getByTestId('budget-1')).toHaveTextContent('Транспорт: 5000');
    });

    it('should handle missing category gracefully', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Продукты',
          type: 'expense' as const,
          color: '#FF5733',
          icon: '🛒',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockBudgets = [
        {
          id: 'budget-1',
          categoryId: 'cat-1',
          amount: 15000.00,
          period: 'monthly' as const,
          startDate: '2024-02-01',
          endDate: '2024-02-29',
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z',
        },
        {
          id: 'budget-2',
          categoryId: 'cat-999', // Category doesn't exist
          amount: 5000.00,
          period: 'monthly' as const,
          startDate: '2024-02-01',
          endDate: '2024-02-29',
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z',
        },
      ];

      mockCategoryApi.getAll.mockResolvedValue(mockCategories);
      mockBudgetApi.getAll.mockResolvedValue(mockBudgets);

      function TestBudgetPage() {
        const { loadCategories, loadBudgets, categories, budgets } = useApp();

        React.useEffect(() => {
          loadCategories();
          loadBudgets();
        }, []);

        const budgetsWithCategories = budgets.map((budget) => {
          const category = categories.find((c) => c.id === budget.categoryId);
          return {
            ...budget,
            categoryName: category?.name || budget.categoryId,
          };
        });

        return (
          <div>
            {budgetsWithCategories.map((budget, index) => (
              <div key={budget.id} data-testid={`budget-${index}`}>
                {budget.categoryName}
              </div>
            ))}
          </div>
        );
      }

      render(
        <AppProvider>
          <TestBudgetPage />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('budget-0')).toHaveTextContent('Продукты');
        // Should fallback to categoryId when category not found
        expect(screen.getByTestId('budget-1')).toHaveTextContent('cat-999');
      });
    });

    it('should handle budget page data loading errors', async () => {
      mockCategoryApi.getAll.mockRejectedValue(new Error('Failed to load categories'));
      mockBudgetApi.getAll.mockResolvedValue([]);

      function TestBudgetPage() {
        const { loadCategories, loadBudgets, error, loading } = useApp();

        React.useEffect(() => {
          loadCategories().catch(() => {});
          loadBudgets();
        }, []);

        return (
          <div>
            <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
            <div data-testid="error">{error || 'none'}</div>
          </div>
        );
      }

      render(
        <AppProvider>
          <TestBudgetPage />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to load categories');
      });
    });

    it('should display empty state when no budgets exist', async () => {
      mockCategoryApi.getAll.mockResolvedValue([]);
      mockBudgetApi.getAll.mockResolvedValue([]);

      function TestBudgetPage() {
        const { loadCategories, loadBudgets, budgets, loading } = useApp();

        React.useEffect(() => {
          loadCategories();
          loadBudgets();
        }, []);

        return (
          <div>
            <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
            <div data-testid="budgets-count">{budgets.length}</div>
            {budgets.length === 0 && <div data-testid="empty-state">Нет бюджетов</div>}
          </div>
        );
      }

      render(
        <AppProvider>
          <TestBudgetPage />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('idle');
        expect(screen.getByTestId('budgets-count')).toHaveTextContent('0');
        expect(screen.getByTestId('empty-state')).toHaveTextContent('Нет бюджетов');
      });
    });
  });
});
