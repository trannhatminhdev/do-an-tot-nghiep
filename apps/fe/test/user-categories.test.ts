import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserCategoriesService } from '../src/runtime/user/categories/services/user-categories.service';
import type { ApiService } from '../src/runtime/core/services/api.service';

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:3000/api/v1',
    },
  }),
}));

describe('UserCategoriesService', () => {
  let mockApiService: Partial<ApiService>;
  let userCategoriesService: UserCategoriesService;

  beforeEach(() => {
    mockApiService = {
      get: vi.fn(),
    };
    userCategoriesService = new UserCategoriesService(
      mockApiService as ApiService,
    );
  });

  it('should fetch all categories', async () => {
    const mockCategories = [
      { id: 1, name: 'Điện thoại', parentId: null },
      { id: 2, name: 'Laptop', parentId: null },
    ];

    (mockApiService.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockCategories,
    );

    const result = await userCategoriesService.getCategories();

    expect(mockApiService.get).toHaveBeenCalledWith('/categories');
    expect(result).toEqual(mockCategories);
  });

  it('should fetch category by id', async () => {
    const mockCategory = { id: 1, name: 'Điện thoại', parentId: null };

    (mockApiService.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockCategory,
    );

    const result = await userCategoriesService.getCategoryById(1);

    expect(mockApiService.get).toHaveBeenCalledWith('/categories/1');
    expect(result).toEqual(mockCategory);
  });

  it('should handle errors gracefully by returning empty array', async () => {
    (mockApiService.get as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error'),
    );

    const result = await userCategoriesService.getCategories();

    expect(result).toEqual([]);
  });
});
