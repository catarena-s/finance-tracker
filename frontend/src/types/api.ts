// Transaction types
export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  categoryId: string;
  description?: string;
  transactionDate: string;
  isRecurring: boolean;
  recurringPattern?: any;
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
export type BudgetPeriod = "monthly" | "yearly";

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  currency: string;
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
export interface SummaryByCurrency {
  currency: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  displayCurrency?: string;
  transactionCount?: number;
  byCurrency?: SummaryByCurrency[];
  currencyRates?: Record<string, number>;
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

// CSV Import/Export
export interface CSVColumnMapping {
  amount: string;
  currency?: string;
  categoryName: string;
  description?: string;
  transactionDate: string;
  type: string;
}

export interface CSVImportResult {
  taskId: string;
  status: string;
  createdCount?: number;
  errorCount?: number;
  errors?: Array<{ row: number; error: string }>;
}

// Recurring transactions
export type FrequencyType = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  currency: string;
  categoryId: string;
  description?: string;
  type: TransactionType;
  frequency: FrequencyType;
  interval: number;
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTransactionCreate {
  name: string;
  amount: number;
  currency: string;
  categoryId: string;
  description?: string;
  type: TransactionType;
  frequency: FrequencyType;
  interval: number;
  startDate: string;
  endDate?: string;
}

// Currencies
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  createdAt: string;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: string;
  createdAt: string;
}

// Task status
export type TaskStatus = "pending" | "running" | "completed" | "failed";

export interface TaskStatusResponse {
  taskId: string;
  taskType: string;
  status: TaskStatus;
  result?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
