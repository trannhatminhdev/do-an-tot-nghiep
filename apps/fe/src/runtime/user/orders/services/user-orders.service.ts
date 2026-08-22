import { apiService, type ApiService } from '#fe/core/services/api.service';
import type { CreateOrderInput, Order } from '../types/order.types';

export class UserOrdersService {
  constructor(private readonly api: ApiService = apiService) {}

  /**
   * Tạo đơn hàng mới
   * Endpoint BE: POST /api/v1/orders
   */
  async createOrder(data: CreateOrderInput): Promise<Order> {
    return this.api.post<Order>('/orders', data);
  }

  /**
   * Tra cứu đơn hàng theo Số điện thoại hoặc Mã đơn hàng
   * Endpoint BE: GET /api/v1/orders/lookup?search=...
   */
  async lookupOrders(
    search: string,
    skip?: number,
    take?: number,
  ): Promise<{ data: Order[]; total: number }> {
    const params = new URLSearchParams();
    params.append('search', search);
    if (skip !== undefined) params.append('skip', String(skip));
    if (take !== undefined) params.append('take', String(take));

    return this.api.get<{ data: Order[]; total: number }>(
      `/orders/lookup?${params.toString()}`,
    );
  }

  /**
   * Lấy danh sách đơn hàng của khách hàng theo userId
   * Endpoint BE: GET /api/v1/orders/my-orders?userId=...
   */
  async getMyOrders(
    userId: number,
    skip?: number,
    take?: number,
  ): Promise<{ data: Order[]; total: number }> {
    const params = new URLSearchParams();
    params.append('userId', String(userId));
    if (skip !== undefined) params.append('skip', String(skip));
    if (take !== undefined) params.append('take', String(take));

    return this.api.get<{ data: Order[]; total: number }>(
      `/orders/my-orders?${params.toString()}`,
    );
  }

  /**
   * Lấy chi tiết một đơn hàng theo ID
   * Endpoint BE: GET /api/v1/orders/:id
   */
  async getOrderById(id: number): Promise<Order> {
    return this.api.get<Order>(`/orders/${id}`);
  }
}

export const userOrdersService = new UserOrdersService();
