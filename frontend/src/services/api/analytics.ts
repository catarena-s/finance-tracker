import { apiClient } from "./client";
import {
  SummaryData,
  TrendData,
  CategorySpending,
  TransactionType,
  ApiResponse,
} from "@/types/api";

export interface SummaryParams {
  startDate: string;
  endDate: string;
}

export interface TrendsParams {
  period?: "week" | "month" | "year";
  startDate: string;
  endDate: string;
}

export interface TopCategoriesParams {
  limit: number;
  type?: TransactionType;
  startDate: string;
  endDate: string;
}

/**
 * Analytics API клиент
 */
export const analyticsApi = {
  /**
   * Получить сводку по финансам
   */
  async getSummary(params: SummaryParams): Promise<SummaryData> {
    const queryParams = new URLSearchParams();
    queryParams.append("start_date", params.startDate);
    queryParams.append("end_date", params.endDate);

    const response = await apiClient.get<SummaryData>(
      `/analytics/summary?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Получить тренды доходов и расходов
   */
  async getTrends(params: TrendsParams): Promise<TrendData[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("start_date", params.startDate);
    queryParams.append("end_date", params.endDate);

    const response = await apiClient.get<{ trends: Array<{ month: string; income: string; expense: string; balance: string }> }>(
      `/analytics/trends?${queryParams.toString()}`
    );
    
    // Transform backend format to frontend format
    return response.data.trends.map(t => ({
      date: t.month,
      income: parseFloat(t.income),
      expense: parseFloat(t.expense),
    }));
  },

  /**
   * Получить топ категорий по расходам
   */
  async getTopCategories(params: TopCategoriesParams): Promise<CategorySpending[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", params.limit.toString());
    queryParams.append("start_date", params.startDate);
    queryParams.append("end_date", params.endDate);
    if (params.type) queryParams.append("type", params.type);

    const response = await apiClient.get<{ topCategories: Array<{ category: string; amount: string }> }>(
      `/analytics/top-categories?${queryParams.toString()}`
    );
    
    // Transform backend format to frontend format
    // Note: Backend doesn't return all fields, so we use defaults
    return response.data.topCategories.map((cat, index) => ({
      categoryId: `cat-${index}`,
      categoryName: cat.category,
      categoryColor: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color as fallback
      totalAmount: parseFloat(cat.amount),
      transactionCount: 0, // Not provided by backend
      percentage: 0, // Will be calculated by component
    }));
  },
};
