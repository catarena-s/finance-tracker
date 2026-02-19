import { apiClient } from "./client";
import { Budget, BudgetWithDetails, BudgetPeriod, ApiResponse } from "@/types/api";

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
   * Получить все бюджеты
   */
  async getAll(): Promise<Budget[]> {
    const response = await apiClient.get<Budget[]>("/budgets");
    return response.data;
  },

  /**
   * Получить бюджет по ID
   */
  async getById(id: string): Promise<Budget> {
    const response = await apiClient.get<Budget>(`/budgets/${id}`);
    return response.data;
  },

  /**
   * Создать новый бюджет
   */
  async create(data: CreateBudgetData): Promise<Budget> {
    const response = await apiClient.post<Budget>("/budgets", data);
    return response.data;
  },

  /**
   * Обновить бюджет
   */
  async update(id: string, data: UpdateBudgetData): Promise<Budget> {
    const response = await apiClient.put<Budget>(`/budgets/${id}`, data);
    return response.data;
  },

  /**
   * Удалить бюджет
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/budgets/${id}`);
  },
};
