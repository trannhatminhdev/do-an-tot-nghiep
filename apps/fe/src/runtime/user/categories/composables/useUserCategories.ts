import { useState } from '#app';
import { ref } from 'vue';
import { userCategoriesService } from '../services/user-categories.service';
import type { Category } from '../types/category.types';

export function useUserCategories() {
  const categories = useState<Category[]>('user_categories', () => []);
  const isLoading = ref(false);

  const fetchCategories = async (): Promise<Category[]> => {
    isLoading.value = true;
    try {
      const data = await userCategoriesService.getCategories();
      categories.value = data;
      return data;
    } finally {
      isLoading.value = false;
    }
  };

  const getCategoryName = (id: number | null | undefined): string => {
    if (!id) return '';
    const found = categories.value.find((c) => c.id === id);
    return found ? found.name : '';
  };

  return {
    categories,
    isLoading,
    fetchCategories,
    getCategoryName,
  };
}
