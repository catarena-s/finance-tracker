import { apiClient } from './client';
import { Category, TransactionType, ApiResponse } from '@/types/api';

export interface CreateCategoryData {
  name: string;
  type: TransactionType;
  color: string;
  icon?: string;
}

export interface UpdateCategoryData {
  name?: string;
  type?: TransactionType;
  color?: string;
  icon?: string;
}

/**
 * Category API клиент
 */
export const categoryApi = {
  /**
   * Получить все категории с опциональной фильтрацией по типу
   */
  async getAll(type?: TransactionType): Promise<Category[]> {
    const params = type ? `?type=${type}` : '';
    const response = await apiClient.get<ApiResponse<Category[]>>(`/categories${params}`);
    return response.data.data;
  },

  /**
   * Получить категорию по ID
   */
  async getById(id: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  /**
   * Создать новую категорию
   */
  async create(data: CreateCategoryData): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  /**
   * Обновить категорию
   */
  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  /**
   * Удалить категорию
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
