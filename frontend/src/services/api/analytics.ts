import { apiClient } from './client';
import {
  SummaryData,
  TrendData,
  CategorySpending,
  TransactionType,
  ApiResponse,
} from '@/types/api';

export interface SummaryParams {
  startDate: string;
  endDate: string;
}

export interface TrendsParams {
  period?: 'week' | 'month' | 'year';
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
    queryParams.append('start_date', params.startDate);
    queryParams.append('end_date', params.endDate);

    const response = await apiClient.get<ApiResponse<SummaryData>>(
      `/analytics/summary?${queryParams.toString()}`
    );
    return response.data.data;
  },

  /**
   * Получить тренды доходов и расходов
   */
  async getTrends(params: TrendsParams): Promise<TrendData[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('start_date', params.startDate);
    queryParams.append('end_date', params.endDate);

    const response = await apiClient.get<ApiResponse<TrendData[]>>(
      `/analytics/trends?${queryParams.toString()}`
    );
    return response.data.data;
  },

  /**
   * Получить топ категорий по расходам
   */
  async getTopCategories(params: TopCategoriesParams): Promise<CategorySpending[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', params.limit.toString());
    queryParams.append('start_date', params.startDate);
    queryParams.append('end_date', params.endDate);
    if (params.type) queryParams.append('type', params.type);

    const response = await apiClient.get<ApiResponse<CategorySpending[]>>(
      `/analytics/top-categories?${queryParams.toString()}`
    );
    return response.data.data;
  },
};
