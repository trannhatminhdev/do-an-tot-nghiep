import type { Category } from '../../categories/types/category.types';

export interface ProductImage {
  id: number;
  productId?: number;
  imageUrl: string;
  isThumbnail: boolean;
  createdAt?: string;
}

export interface ProductSpecification {
  id: number;
  productId?: number;
  specName: string;
  specValue: string;
  createdAt?: string;
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  discountPercent?: number;
}

export interface GetProductsParams {
  skip?: number;
  take?: number;
  search?: string;
  categoryId?: number;
}

export interface GetProductsResponse {
  data: Product[];
  total: number;
}
