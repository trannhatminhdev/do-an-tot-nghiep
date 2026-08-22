import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProductsService } from '../src/runtime/user/products/services/user-products.service';
import type { ApiService } from '../src/runtime/core/services/api.service';

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:3000/api/v1',
    },
  }),
}));

describe('UserProductsService', () => {
  let mockApiService: Partial<ApiService>;
  let userProductsService: UserProductsService;

  beforeEach(() => {
    mockApiService = {
      get: vi.fn(),
    };
    userProductsService = new UserProductsService(mockApiService as ApiService);
  });

  it('should fetch products with query params and enrich discount percentage', async () => {
    const mockApiResponse = {
      data: [
        {
          id: 1,
          name: 'iPhone 15 Pro',
          categoryId: 1,
          price: 25000000,
          originalPrice: 30000000,
          stock: 10,
          description: 'Flagship phone',
          images: [{ id: 1, imageUrl: 'iphone.jpg', isThumbnail: true }],
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      total: 1,
    };

    (mockApiService.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockApiResponse,
    );

    const result = await userProductsService.getProducts({
      categoryId: 1,
      search: 'iPhone',
      skip: 0,
      take: 10,
    });

    expect(mockApiService.get).toHaveBeenCalledWith(
      '/products?skip=0&take=10&search=iPhone&categoryId=1',
    );
    expect(result.total).toBe(1);
    expect(result.data[0]?.discountPercent).toBe(17); // (1 - 25/30) * 100 = 16.66% -> 17%
  });

  it('should fetch product by id and assign fallback image if none provided', async () => {
    const mockProduct = {
      id: 2,
      name: 'AirPods Max',
      categoryId: 2,
      price: 12000000,
      originalPrice: null,
      stock: 5,
      description: 'Audio',
      images: [],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    (mockApiService.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockProduct,
    );

    const result = await userProductsService.getProductById(2);

    expect(mockApiService.get).toHaveBeenCalledWith('/products/2');
    expect(result?.images?.length).toBe(1);
    expect(result?.discountPercent).toBeUndefined();
  });

  it('should return empty list on fetch error', async () => {
    (mockApiService.get as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error'),
    );

    const result = await userProductsService.getProducts();

    expect(result).toEqual({ data: [], total: 0 });
  });
});
