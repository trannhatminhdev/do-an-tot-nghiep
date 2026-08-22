import { apiService, type ApiService } from '#fe/core/services/api.service';
import type { Category } from '../types/category.types';

export class UserCategoriesService {
  constructor(private readonly api: ApiService = apiService) {}

  async getCategories(): Promise<Category[]> {
    try {
      return await this.api.get<Category[]>('/categories');
    } catch (error) {
      console.error('Failed to fetch categories', error);
      return [];
    }
  }

  async getCategoryById(id: number): Promise<Category | null> {
    try {
      return await this.api.get<Category>(`/categories/${id}`);
    } catch (error) {
      console.error(`Failed to fetch category with ID ${id}`, error);
      return null;
    }
  }
}

export const userCategoriesService = new UserCategoriesService();
