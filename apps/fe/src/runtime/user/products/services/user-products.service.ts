import { apiService, type ApiService } from '#fe/core/services/api.service';
import type {
  GetProductsParams,
  GetProductsResponse,
  Product,
} from '../types/product.types';

export class UserProductsService {
  constructor(private readonly api: ApiService = apiService) {}

  /**
   * Lấy danh sách sản phẩm theo bộ lọc (phân trang, từ khoá tìm kiếm, danh mục)
   */
  async getProducts(params?: GetProductsParams): Promise<GetProductsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.skip !== undefined)
      searchParams.append('skip', String(params.skip));
    if (params?.take !== undefined)
      searchParams.append('take', String(params.take));
    if (params?.search) searchParams.append('search', params.search);
    if (params?.categoryId !== undefined)
      searchParams.append('categoryId', String(params.categoryId));

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';

    try {
      const res = await this.api.get<{ data: Product[]; total: number }>(
        endpoint,
      );
      return {
        data: res.data.map(this.enrichProduct),
        total: res.total,
      };
    } catch (error) {
      console.error('Failed to fetch products', error);
      return { data: [], total: 0 };
    }
  }

  /**
   * Lấy chi tiết sản phẩm theo ID
   */
  async getProductById(id: number): Promise<Product | null> {
    try {
      const res = await this.api.get<Product>(`/products/${id}`);
      return this.enrichProduct(res);
    } catch (error) {
      console.error(`Failed to fetch product with ID ${id}`, error);
      return null;
    }
  }

  /**
   * Bổ sung các trường tính toán (discountPercent, hình ảnh mặc định)
   */
  private enrichProduct(product: Product): Product {
    const discountPercent =
      product.originalPrice && product.originalPrice > product.price
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : undefined;

    const images =
      product.images && product.images.length > 0
        ? product.images
        : [
            {
              id: 0,
              imageUrl:
                'https://placehold.co/600x400/eeeeee/999999?text=No+Image',
              isThumbnail: true,
            },
          ];

    return {
      ...product,
      images,
      discountPercent,
    };
  }
}

export const userProductsService = new UserProductsService();
