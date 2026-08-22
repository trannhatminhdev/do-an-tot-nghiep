import { useState } from '#app';
import { ref } from 'vue';
import { userProductsService } from '../services/user-products.service';
import type { GetProductsParams, Product } from '../types/product.types';

export function useUserProducts() {
  const products = useState<Product[]>('user_products', () => []);
  const total = useState<number>('user_products_total', () => 0);
  const activeProduct = useState<Product | null>(
    'user_active_product',
    () => null,
  );
  const isLoading = ref(false);

  const fetchProducts = async (
    params?: GetProductsParams,
  ): Promise<Product[]> => {
    isLoading.value = true;
    try {
      const res = await userProductsService.getProducts(params);
      products.value = res.data;
      total.value = res.total;
      return res.data;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchProductById = async (id: number): Promise<Product | null> => {
    isLoading.value = true;
    try {
      const product = await userProductsService.getProductById(id);
      activeProduct.value = product;
      return product;
    } finally {
      isLoading.value = false;
    }
  };

  const formatPrice = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return '0₫';
    return amount.toLocaleString('vi-VN') + '₫';
  };

  return {
    products,
    total,
    activeProduct,
    isLoading,
    fetchProducts,
    fetchProductById,
    formatPrice,
  };
}
