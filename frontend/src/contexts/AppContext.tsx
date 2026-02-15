'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Transaction, Category, Budget, SummaryData, TrendData, CategorySpending } from '@/types/api';
import { transactionApi } from '@/services/api/transactions';
import { categoryApi } from '@/services/api/categories';
import { budgetApi } from '@/services/api/budgets';
import { analyticsApi } from '@/services/api/analytics';

interface AppContextValue {
  // State
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  summary: SummaryData | null;
  trends: TrendData[];
  topCategories: CategorySpending[];
  loading: boolean;
  error: string | null;

  // Transaction actions
  loadTransactions: (filters?: any) => Promise<void>;
  createTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Category actions
  loadCategories: (type?: 'income' | 'expense') => Promise<void>;
  createCategory: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Budget actions
  loadBudgets: () => Promise<void>;
  createBudget: (data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudget: (id: string, data: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Analytics actions
  loadSummary: (startDate?: string, endDate?: string) => Promise<void>;
  loadTrends: (period?: 'week' | 'month' | 'year', startDate?: string, endDate?: string) => Promise<void>;
  loadTopCategories: (limit?: number, type?: 'income' | 'expense', startDate?: string, endDate?: string) => Promise<void>;

  // UI actions
  setError: (error: string | null) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [topCategories, setTopCategories] = useState<CategorySpending[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transaction actions
  const loadTransactions = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionApi.getAll(filters);
      setTransactions(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticTransaction = {
        ...data,
        id: tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Transaction;
      setTransactions(prev => [optimisticTransaction, ...prev]);

      // Map transactionDate to date for API
      const apiData = {
        type: data.type,
        amount: data.amount,
        categoryId: data.categoryId,
        description: data.description || '',
        date: data.transactionDate,
      };
      const created = await transactionApi.create(apiData);
      
      // Replace optimistic with real data
      setTransactions(prev => 
        prev.map(t => t.id === tempId ? created : t)
      );
    } catch (err: any) {
      // Rollback optimistic update
      setTransactions(prev => prev.filter(t => !t.id.startsWith('temp-')));
      setError(err.message || 'Failed to create transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>) => {
    const previousTransactions = [...transactions];
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      setTransactions(prev =>
        prev.map(t => t.id === id ? { ...t, ...data } : t)
      );

      // Map transactionDate to date for API
      const apiData: any = {};
      if (data.type !== undefined) apiData.type = data.type;
      if (data.amount !== undefined) apiData.amount = data.amount;
      if (data.categoryId !== undefined) apiData.categoryId = data.categoryId;
      if (data.description !== undefined) apiData.description = data.description;
      if (data.transactionDate !== undefined) apiData.date = data.transactionDate;

      const updated = await transactionApi.update(id, apiData);
      
      // Replace with real data
      setTransactions(prev =>
        prev.map(t => t.id === id ? updated : t)
      );
    } catch (err: any) {
      // Rollback
      setTransactions(previousTransactions);
      setError(err.message || 'Failed to update transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    const previousTransactions = [...transactions];
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      setTransactions(prev => prev.filter(t => t.id !== id));

      await transactionApi.delete(id);
    } catch (err: any) {
      // Rollback
      setTransactions(previousTransactions);
      setError(err.message || 'Failed to delete transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  // Category actions
  const loadCategories = useCallback(async (type?: 'income' | 'expense') => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryApi.getAll(type);
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticCategory = {
        ...data,
        id: tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Category;
      setCategories(prev => [...prev, optimisticCategory]);

      const created = await categoryApi.create(data);
      
      // Replace optimistic with real data
      setCategories(prev =>
        prev.map(c => c.id === tempId ? created : c)
      );
    } catch (err: any) {
      // Rollback
      setCategories(prev => prev.filter(c => !c.id.startsWith('temp-')));
      setError(err.message || 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, data: Partial<Category>) => {
    const previousCategories = [...categories];
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      setCategories(prev =>
        prev.map(c => c.id === id ? { ...c, ...data } : c)
      );

      const updated = await categoryApi.update(id, data);
      
      // Replace with real data
      setCategories(prev =>
        prev.map(c => c.id === id ? updated : c)
      );
    } catch (err: any) {
      // Rollback
      setCategories(previousCategories);
      setError(err.message || 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categories]);

  const deleteCategory = useCallback(async (id: string) => {
    const previousCategories = [...categories];
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      setCategories(prev => prev.filter(c => c.id !== id));

      await categoryApi.delete(id);
    } catch (err: any) {
      // Rollback
      setCategories(previousCategories);
      setError(err.message || 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categories]);

  // Budget actions
  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await budgetApi.getAll();
      setBudgets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load budgets');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBudget = useCallback(async (data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticBudget = {
        ...data,
        id: tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Budget;
      setBudgets(prev => [...prev, optimisticBudget]);

      const created = await budgetApi.create(data);
      
      // Replace optimistic with real data
      setBudgets(prev =>
        prev.map(b => b.id === tempId ? created : b)
      );
    } catch (err: any) {
      // Rollback
      setBudgets(prev => prev.filter(b => !b.id.startsWith('temp-')));
      setError(err.message || 'Failed to create budget');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBudget = useCallback(async (id: string, data: Partial<Budget>) => {
    const previousBudgets = [...budgets];
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      setBudgets(prev =>
        prev.map(b => b.id === id ? { ...b, ...data } : b)
      );

      const updated = await budgetApi.update(id, data);
      
      // Replace with real data
      setBudgets(prev =>
        prev.map(b => b.id === id ? updated : b)
      );
    } catch (err: any) {
      // Rollback
      setBudgets(previousBudgets);
      setError(err.message || 'Failed to update budget');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [budgets]);

  const deleteBudget = useCallback(async (id: string) => {
    const previousBudgets = [...budgets];
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      setBudgets(prev => prev.filter(b => b.id !== id));

      await budgetApi.delete(id);
    } catch (err: any) {
      // Rollback
      setBudgets(previousBudgets);
      setError(err.message || 'Failed to delete budget');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [budgets]);

  // Analytics actions
  const loadSummary = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Default to last 30 days if no dates provided
      const end = endDate || new Date().toISOString().split('T')[0];
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const data = await analyticsApi.getSummary({ startDate: start, endDate: end });
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load summary');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTrends = useCallback(async (period: 'week' | 'month' | 'year' = 'month', startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Default to last 30 days if no dates provided
      const end = endDate || new Date().toISOString().split('T')[0];
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const data = await analyticsApi.getTrends({ period, startDate: start, endDate: end });
      setTrends(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trends');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTopCategories = useCallback(async (limit: number = 5, type?: 'income' | 'expense', startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Default to last 30 days if no dates provided
      const end = endDate || new Date().toISOString().split('T')[0];
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const data = await analyticsApi.getTopCategories({ limit, type, startDate: start, endDate: end });
      setTopCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load top categories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AppContextValue = {
    transactions,
    categories,
    budgets,
    summary,
    trends,
    topCategories,
    loading,
    error,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    loadBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    loadSummary,
    loadTrends,
    loadTopCategories,
    setError,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
