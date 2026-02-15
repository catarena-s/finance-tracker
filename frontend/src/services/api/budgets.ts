import { apiClient } from './client';
import { Budget, BudgetWithDetails, BudgetPeriod, ApiResponse } from '@/types/api';

export interface CreateBudgetData {
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetData {
  categoryId?: string;
  amount?: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
}

/**
 * Budget API клиент
 */
export const budgetApi = {
  /**
   * Получить все бюджеты с деталями
   */
  async getAll(): Promise<BudgetWithDetails[]> {
    const response = await apiClient.get<ApiResponse<BudgetWithDetails[]>>('/budgets');
    return response.data.data;
  },

  /**
   * Получить бюджет по ID
   */
  async getById(id: string): Promise<BudgetWithDetails> {
    const response = await apiClient.get<ApiResponse<BudgetWithDetails>>(`/budgets/${id}`);
    return response.data.data;
  },

  /**
   * Создать новый бюджет
   */
  async create(data: CreateBudgetData): Promise<Budget> {
    const response = await apiClient.post<ApiResponse<Budget>>('/budgets', data);
    return response.data.data;
  },

  /**
   * Обновить бюджет
   */
  async update(id: string, data: UpdateBudgetData): Promise<Budget> {
    const response = await apiClient.put<ApiResponse<Budget>>(`/budgets/${id}`, data);
    return response.data.data;
  },

  /**
   * Удалить бюджет
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/budgets/${id}`);
  },
};
