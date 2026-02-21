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
  currency?: string;
}

export interface TrendsParams {
  period?: "day" | "week" | "month" | "year";
  startDate: string;
  endDate: string;
  currency?: string;
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
  async getSummary(params: SummaryParams): Promise<SummaryData> {
    const queryParams = new URLSearchParams();
    queryParams.append("start_date", params.startDate);
    queryParams.append("end_date", params.endDate);
    if (params.currency) queryParams.append("currency", params.currency);

    const response = await apiClient.get<SummaryData>(
      `/analytics/summary?${queryParams.toString()}`
    );
    return response.data;
  },

  async getTrends(params: TrendsParams): Promise<TrendData[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("start_date", params.startDate);
    queryParams.append("end_date", params.endDate);
    if (params.period) queryParams.append("period", params.period);
    if (params.currency) queryParams.append("currency", params.currency);

    const response = await apiClient.get<{
      trends: Array<{
        month: string;
        income: string;
        expense: string;
        balance: string;
      }>;
    }>(`/analytics/trends?${queryParams.toString()}`);

    return response.data.trends.map((t) => ({
      date: t.month,
      income: parseFloat(t.income),
      expense: parseFloat(t.expense),
    }));
  },

  async getTopCategories(params: TopCategoriesParams): Promise<CategorySpending[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", params.limit.toString());
    queryParams.append("start_date", params.startDate);
    queryParams.append("end_date", params.endDate);
    if (params.type) queryParams.append("type", params.type);

    const response = await apiClient.get<{
      top_categories: Array<{ category: string; amount: string }>;
    }>(`/analytics/top-categories?${queryParams.toString()}`);

    const list = response.data.top_categories ?? [];
    const total = list.reduce((s, c) => s + parseFloat(c.amount), 0);
    return list.map((cat, index) => {
      const totalAmount = parseFloat(cat.amount);
      return {
        categoryId: `cat-${index}`,
        categoryName: cat.category,
        categoryColor: "#" + Math.floor(Math.random() * 16777215).toString(16),
        totalAmount,
        transactionCount: 0,
        percentage: total > 0 ? (totalAmount / total) * 100 : 0,
      };
    });
  },
};
