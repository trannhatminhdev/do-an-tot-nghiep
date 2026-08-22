import type { Product } from '../../products/types/product.types';

export type OrderStatus =
  'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  createdAt?: string;
  product?: Product;
}

export interface Order {
  id: number;
  userId: number | null;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingMethod: string;
  paymentMethod: string;
  totalAmount: number;
  status: OrderStatus | string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingMethod: string;
  paymentMethod: string;
  totalAmount: number;
  userId?: number;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}
