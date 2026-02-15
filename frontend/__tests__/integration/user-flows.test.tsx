/**
 * Integration Tests - User Flows
 * 
 * Tests complete user workflows including:
 * - Creating, editing, and deleting transactions
 * - Creating, editing, and deleting categories
 * - Creating, editing, and deleting budgets
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

// Helper component to test context operations
function TestComponent({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

describe('Integration Tests - User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Transaction Management Flow', () => {
    it('should create a transaction successfully', async () => {
      const mockTransaction = {
        id: 'txn-1',
        type: 'expense' as const,
        amount: 50.00,
        currency: 'USD',
        categoryId: 'cat-1',
        description: 'Weekly groceries',
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
            <div data-testid="count">{transactions.length}</div>
            <button
              onClick={() =>
                createTransaction({
                  type: 'expense',
                  amount: 50.00,
                  currency: 'USD',
                  categoryId: 'cat-1',
                  description: 'Weekly groceries',
                  transactionDate: '2024-01-15',
                  isRecurring: false,
                })
              }
            >
              Create
            </button>
          </div>
        );
      }

      const user = userEvent.setup();

      render(
        <TestComponent>
          <TestApp />
        </TestComponent>
      );

      await user.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(mockTransactionApi.create).toHaveBeenCalled();
        expect(screen.getByTestId('count')).toHaveTextContent('1');
      });
    });

    it('should update a transaction successfully', async () => {
      const mockTransaction = {
        id: 'txn-1',
        type: 'expense' as const,
        amount: 50.00,
        currency: 'USD',
        categoryId: 'cat-1',
        description: 'Original',
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

      const updatedTransaction = { ...mockTransaction, description: 'Updated' };

      mockTransactionApi.getAll.mockResolvedValue({
        data: [mockTransaction],
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 1,
          totalItems: 1,
        },
      });
      mockTransactionApi.update.mockResolvedValue(updatedTransaction);

      function TestApp() {
        const { loadTransactions, updateTransaction, transactions } = useApp();

        React.useEffect(() => {
          loadTransactions();
        }, []);

        return (
          <div>
            <div data-testid="description">
              {transactions[0]?.description || 'none'}
            </div>
            <button onClick={() => updateTransaction('txn-1', { description: 'Updated' })}>
              Update
            </button>
          </div>
        );
      }

      const user = userEvent.setup();

      render(
        <TestComponent>
          <TestApp />
        </TestComponent>
      );

      await waitFor(() => {
        expect(screen.getByTestId('description')).toHaveTextContent('Original');
      });

      await user.click(screen.getByText('Update'));

      await waitFor(() => {
        expect(mockTransactionApi.update).toHaveBeenCalledWith('txn-1', { description: 'Updated' });
        expect(screen.getByTestId('description')).toHaveTextContent('Updated');
      });
    });

    it('should delete a transaction successfully', async () => {
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
      mockTransactionApi.delete.mockResolvedValue(undefined);

      function TestApp() {
        const { loadTransactions, deleteTransaction, transactions } = useApp();

        React.useEffect(() => {
          loadTransactions();
        }, []);

        return (
          <div>
            <div data-testid="count">{transactions.length}</div>
            <button onClick={() => deleteTransaction('txn-1')}>Delete</button>
          </div>
        );
      }

      const user = userEvent.setup();

      render(
        <TestComponent>
          <TestApp />
        </TestComponent>
      );

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1');
      });

      await user.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(mockTransactionApi.delete).toHaveBeenCalledWith('txn-1');
        expect(screen.getByTestId('count')).toHaveTextContent('0');
      });
    });
  });

  describe('Category Management Flow', () => {
    it('should create a category successfully', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Entertainment',
        type: 'expense' as const,
        color: '#3498db',
        icon: '🎬',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockCategoryApi.create.mockResolvedValue(mockCategory);

      function TestApp() {
        const { createCategory, categories } = useApp();

        return (
          <div>
            <div data-testid="count">{categories.length}</div>
            <button
              onClick={() =>
                createCategory({
                  name: 'Entertainment',
                  type: 'expense',
                  color: '#3498db',
                  icon: '🎬',
                })
              }
            >
              Create
            </button>
          </div>
        );
      }

      const user = userEvent.setup();

      render(
        <TestComponent>
          <TestApp />
        </TestComponent>
      );

      await user.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(mockCategoryApi.create).toHaveBeenCalled();
        expect(screen.getByTestId('count')).toHaveTextContent('1');
      });
    });

    it('should delete a category successfully', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Entertainment',
        type: 'expense' as const,
        color: '#3498db',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockCategoryApi.getAll.mockResolvedValue([mockCategory]);
      mockCategoryApi.delete.mockResolvedValue(undefined);

      function TestApp() {
        const { loadCategories, deleteCategory, categories } = useApp();

        React.useEffect(() => {
          loadCategories();
        }, []);

        return (
          <div>
            <div data-testid="count">{categories.length}</div>
            <button onClick={() => deleteCategory('cat-1')}>Delete</button>
          </div>
        );
      }

      const user = userEvent.setup();

      render(
        <TestComponent>
          <TestApp />
        </TestComponent>
      );

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1');
      });

      await user.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(mockCategoryApi.delete).toHaveBeenCalledWith('cat-1');
        expect(screen.getByTestId('count')).toHaveTextContent('0');
      });
    });
  });

  describe('Budget Management Flow', () => {
    it('should create a budget successfully', async () => {
      const mockBudget = {
        id: 'budget-1',
        categoryId: 'cat-1',
        amount: 500.00,
        period: 'monthly' as const,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockBudgetApi.create.mockResolvedValue(mockBudget);

      function TestApp() {
        const { createBudget, budgets } = useApp();

        return (
          <div>
            <div data-testid="count">{budgets.length}</div>
            <button
              onClick={() =>
                createBudget({
                  categoryId: 'cat-1',
                  amount: 500.00,
                  period: 'monthly',
                  startDate: '2024-01-01',
                  endDate: '2024-01-31',
                })
              }
            >
              Create
            </button>
          </div>
        );
      }

      const user = userEvent.setup();

      render(
        <TestComponent>
          <TestApp />
        </TestComponent>
      );

      await user.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(mockBudgetApi.create).toHaveBeenCalled();
        expect(screen.getByTestId('count')).toHaveTextContent('1');
      });
    });

    it('should delete a budget successfully', async () => {
      const mockBudget = {
        id: 'budget-1',
        categoryId: 'cat-1',
        amount: 500.00,
        period: 'monthly' as const,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        category: {
          id: 'cat-1',
          name: 'Food',
          color: '#FF5733',
        },
        spent: 0,
        remaining: 500.00,
        percentageUsed: 0,
      };

      mockBudgetApi.getAll.mockResolvedValue([mockBudget]);
      mockBudgetApi.delete.mockResolvedValue(undefined);

      function TestApp() {
        const { loadBudgets, deleteBudget, budgets } = useApp();

        React.useEffect(() => {
          loadBudgets();
        }, []);

        return (
          <div>
            <div data-testid="count">{budgets.length}</div>
            <button onClick={() => deleteBudget('budget-1')}>Delete</button>
          </div>
        );
      }

      const user = userEvent.setup();

      render(
        <TestComponent>
          <TestApp />
        </TestComponent>
      );

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1');
      });

      await user.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(mockBudgetApi.delete).toHaveBeenCalledWith('budget-1');
        expect(screen.getByTestId('count')).toHaveTextContent('0');
      });
    });
  });
});
