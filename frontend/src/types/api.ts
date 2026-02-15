// Transaction types
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionWithCategory extends Transaction {
  category: {
    id: string;
    name: string;
    color: string;
  };
}

// Category types
export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

// Budget types
export type BudgetPeriod = 'monthly' | 'yearly';

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetWithDetails extends Budget {
  category: {
    id: string;
    name: string;
    color: string;
  };
  spent: number;
  remaining: number;
  percentageUsed: number;
}

// Analytics types
export interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface TrendData {
  date: string;
  income: number;
  expense: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// Pagination info
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}
