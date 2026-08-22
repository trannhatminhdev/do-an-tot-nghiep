import { useState } from '#app';
import { ref } from 'vue';
import { useToast } from '#fe/core/composables/useToast';
import { userOrdersService } from '../services/user-orders.service';
import type { CreateOrderInput, Order } from '../types/order.types';

export function useUserOrders() {
  const orders = useState<Order[]>('user_orders_list', () => []);
  const total = useState<number>('user_orders_total', () => 0);
  const currentOrder = useState<Order | null>('user_current_order', () => null);
  const isLoading = ref(false);
  const toast = useToast();

  const lookupOrders = async (
    search: string,
    skip?: number,
    take?: number,
  ): Promise<Order[]> => {
    if (!search.trim()) {
      orders.value = [];
      total.value = 0;
      return [];
    }

    isLoading.value = true;
    try {
      const res = await userOrdersService.lookupOrders(
        search.trim(),
        skip,
        take,
      );
      orders.value = res.data;
      total.value = res.total;
      return res.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Không tìm thấy thông tin đơn hàng.');
      }
      orders.value = [];
      total.value = 0;
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const fetchOrderById = async (id: number): Promise<Order | null> => {
    isLoading.value = true;
    try {
      const order = await userOrdersService.getOrderById(id);
      currentOrder.value = order;
      return order;
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Không thể tải thông tin đơn hàng.');
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const createOrder = async (data: CreateOrderInput): Promise<Order | null> => {
    isLoading.value = true;
    try {
      const created = await userOrdersService.createOrder(data);
      toast.success(`Đặt hàng thành công! Mã đơn hàng: #${created.id}`);
      return created;
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    orders,
    total,
    currentOrder,
    isLoading,
    lookupOrders,
    fetchOrderById,
    createOrder,
  };
}
