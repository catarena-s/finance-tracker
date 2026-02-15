/**
 * Integration Tests - Navigation and State Persistence
 * 
 * Tests navigation between pages and state persistence:
 * - State preservation during operations
 * - Optimistic updates and rollback
 * - Error handling and recovery
 * 
 * Requirements: 14.6, 15.1, 15.2, 15.3, 15.4
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { transactionApi } from '@/services/api/transactions';
import { categoryApi } from '@/services/api/categories';
import { budgetApi } from '@/services/api/budgets';

// Mock the API modules
jest.mock('@/services/api/transactions');
jest.mock('@/services/api/categories');
jest.mock('@/services/api/budgets');
jest.mock('@/services/api/analytics');

const mockTransactionApi = transactionApi as jest.Mocked<typeof transactionApi>;
const mockCategoryApi = categoryApi as jest.Mocked<typeof categoryApi>;
const mockBudgetApi = budgetApi as jest.Mocked<typeof budgetApi>;

describe('Integration Tests - Navigation and State Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('State Persistence', () => {
    it('should maintain filter state during pagination', async () => {
      const mockTransactions = Array.from({ length: 25 }, (_, i) => ({
        id: `txn-${i}`,
        type: i % 2 === 0 ? ('expense' as const) : ('income' as const),
        amount: 50.00 + i,
        currency: 'USD',
        categoryId: 'cat-1',
        description: `Transaction ${i}`,
        transactionDate: '2024-01-15',
        isRecurring: false,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        category: {
          id: 'cat-1',
          name: 'Food',
          color: '#FF5733',
        },
      }));

      mockTransactionApi.getAll.mockResolvedValue({
        data: mockTransactions,
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 3,
          totalItems: 25,
        },
      });

      function TestApp() {
        const { loadTransactions, transactions } = useApp();
        const [filters, setFilters] = React.useState({ type: 'expense' as const });
        const [page, setPage] = React.useState(1);

        React.useEffect(() => {
          loadTransactions({ ...filters, page, pageSize: 10 });
        }, [filters, page]);

        return (
          <div>
            <div data-testid="transactions-count">{transactions.length}</div>
            <div data-testid="current-page">{page}</div>
            <div data-testid="current-filter">{filters.type}</div>
            <button onClick={() => setPage(2)}>Next Page</button>
          </div>
        );
      }

      const user = userEvent.setup();

      render(
        <AppProvider>
          <TestApp />
        </AppProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('transactions-count')).toHaveTextContent('25');
      });

      // Verify initial state
      expect(screen.getByTestId('current-page')).toHaveTextContent('1');
      expect(screen.getByTestId('current-filter')).toHaveTextContent('expense');

      // Navigate to next page
      await user.click(screen.getByText('Next Page'));

      // Verify filter is maintained
      await waitFor(() => {
        expect(screen.getByTestId('current-page')).toHaveTextContent('2');
        expect(screen.getByTestId('current-filter')).toHaveTextContent('expense');
      });

      // Verify API was called with filters
      expect(mockTransactionApi.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'expense',
          page: 2,
          pageSize: 10,
        })
      );
    });
  });

  describe('Optimistic Updates and Rollback', () => {
    it('should apply optimistic updates immediately', async () => {
      const mockTransaction = {
        id: 'txn-1',
        type: 'expense' as const,
        amount: 50.00,
        currency: 'USD',
        categoryId: 'cat-1',
        description: 'Test',
        transactionDate: '2024-01-15',
        isRecurring: false,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      };

      mockTransactionApi.create.mockResolvedValue(mockTransaction);

      function TestApp() {
        const { createTransaction, transactions } = useApp();

        return (
          <div>
            <div data-testid="transactions-count">{transactions.length}</div>
            <button
              onClick={() =>
                createTransaction({
                  type: 'expense',
                  amount: 50.00,
                  currency: 'USD',
                  categoryId: 'cat-1',
                  description: 'Test',
                  transactionDate: '2024-01-15',
                  isRecurring: false,
                })
              }
            >
              Create Transaction
            </button>
          </div>
        );
      }

      const user = userEvent.setup();

      render(
        <AppProvider>
          <TestApp />
        </AppProvider>
      );

      // Initial state
      expect(screen.getByTestId('transactions-count')).toHaveTextContent('0');

      // Create transaction
      await user.click(screen.getByText('Create Transaction'));

      // Verify optimistic update
      await waitFor(() => {
        expect(screen.getByTestId('transactions-count')).toHaveTextContent('1');
      });
    });

    it('should rollback on failure', async () => {
      const mockTransaction = {
        id: 'txn-1',
        type: 'expense' as const,
        amount: 50.00,
        currency: 'USD',
        categoryId: 'cat-1',
        description: 'Test',
        transactionDate: '2024-01-15',
        isRecurring: false,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        category: {
          id: 'cat-1',
          name: 'Food',
          color: '#FF5733',
        },
      };

      mockTransactionApi.getAll.mockResolvedValue({
        data: [mockTransaction],
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 1,
          totalItems: 1,
        },
      });
      mockTransactionApi.delete.mockRejectedValue(new Error('Delete failed'));

      function TestApp() {
        const { loadTransactions, deleteTransaction, transactions, error } = useApp();

        React.useEffect(() => {
          loadTransactions();
        }, []);

        return (
          <div>
            <div data-testid="transactions-count">{transactions.length}</div>
            <div data-testid="error">{error || 'none'}</div>
            <button onClick={() => deleteTransaction('txn-1').catch(() => {})}>
              Delete Transaction
            </button>
          </div>
        );
      }

      const user = userEvent.setup();

      render(
        <AppProvider>
          <TestApp />
        </AppProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('transactions-count')).toHaveTextContent('1');
      });

      // Attempt to delete
      await user.click(screen.getByText('Delete Transaction'));

      // Verify rollback after failure
      await waitFor(() => {
        expect(screen.getByTestId('transactions-count')).toHaveTextContent('1');
        expect(screen.getByTestId('error')).toHaveTextContent('Delete failed');
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should display error messages and allow retry', async () => {
      mockTransactionApi.getAll
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: [],
          pagination: {
            page: 1,
            pageSize: 10,
            totalPages: 0,
            totalItems: 0,
          },
        });

      function TestApp() {
        const { loadTransactions, error, clearError } = useApp();

        return (
          <div>
            <div data-testid="error">{error || 'none'}</div>
            <button onClick={() => loadTransactions().catch(() => {})}>
              Load Transactions
            </button>
            <button onClick={clearError}>Clear Error</button>
          </div>
        );
      }

      const user = userEvent.setup();

      render(
        <AppProvider>
          <TestApp />
        </AppProvider>
      );

      // Trigger error
      await user.click(screen.getByText('Load Transactions'));

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      });

      // Clear error
      await user.click(screen.getByText('Clear Error'));

      // Verify error is cleared
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('none');
      });

      // Retry and succeed
      await user.click(screen.getByText('Load Transactions'));

      // Verify success
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('none');
      });
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple simultaneous operations correctly', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Food',
          type: 'expense' as const,
          color: '#FF5733',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockCategoryApi.getAll.mockResolvedValue(mockCategories);
      mockTransactionApi.getAll.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 0,
          totalItems: 0,
        },
      });
      mockBudgetApi.getAll.mockResolvedValue([]);

      function TestApp() {
        const { loadTransactions, loadCategories, loadBudgets, loading } = useApp();
        const [loaded, setLoaded] = React.useState(false);

        const loadAll = async () => {
          await Promise.all([
            loadTransactions(),
            loadCategories(),
            loadBudgets(),
          ]);
          setLoaded(true);
        };

        return (
          <div>
            <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
            <div data-testid="loaded">{loaded ? 'yes' : 'no'}</div>
            <button onClick={loadAll}>Load All</button>
          </div>
        );
      }

      const user = userEvent.setup();

      render(
        <AppProvider>
          <TestApp />
        </AppProvider>
      );

      // Trigger multiple loads
      await user.click(screen.getByText('Load All'));

      // Verify all APIs were called
      await waitFor(() => {
        expect(mockTransactionApi.getAll).toHaveBeenCalled();
        expect(mockCategoryApi.getAll).toHaveBeenCalled();
        expect(mockBudgetApi.getAll).toHaveBeenCalled();
        expect(screen.getByTestId('loaded')).toHaveTextContent('yes');
      });
    });
  });
});
