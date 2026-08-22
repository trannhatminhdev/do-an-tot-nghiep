import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserOrdersService } from '../src/runtime/user/orders/services/user-orders.service';
import type { ApiService } from '../src/runtime/core/services/api.service';

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:3000/api/v1',
    },
  }),
}));

describe('UserOrdersService', () => {
  let mockApiService: Partial<ApiService>;
  let userOrdersService: UserOrdersService;

  beforeEach(() => {
    mockApiService = {
      post: vi.fn(),
      get: vi.fn(),
    };
    userOrdersService = new UserOrdersService(mockApiService as ApiService);
  });

  it('should call create order endpoint with payload', async () => {
    const orderInput = {
      customerName: 'Nguyễn Văn A',
      customerPhone: '0987654321',
      shippingAddress: '123 Lê Lợi, Q1, HCM',
      shippingMethod: 'Tiêu chuẩn',
      paymentMethod: 'COD',
      totalAmount: 5000000,
      userId: 1,
      items: [{ productId: 1, quantity: 1, unitPrice: 5000000 }],
    };
    const mockOrderResponse = {
      id: 101,
      ...orderInput,
      status: 'PENDING',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    (mockApiService.post as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrderResponse,
    );

    const result = await userOrdersService.createOrder(orderInput);

    expect(mockApiService.post).toHaveBeenCalledWith('/orders', orderInput);
    expect(result).toEqual(mockOrderResponse);
  });

  it('should lookup orders by phone or order id', async () => {
    const mockResponse = {
      data: [
        {
          id: 101,
          customerName: 'Nguyễn Văn A',
          customerPhone: '0987654321',
          totalAmount: 5000000,
          status: 'PENDING',
          items: [],
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      total: 1,
    };

    (mockApiService.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse,
    );

    const result = await userOrdersService.lookupOrders('0987654321');

    expect(mockApiService.get).toHaveBeenCalledWith(
      '/orders/lookup?search=0987654321',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should fetch user orders with userId and pagination', async () => {
    const mockResponse = {
      data: [
        {
          id: 101,
          customerName: 'Nguyễn Văn A',
          totalAmount: 5000000,
          status: 'PENDING',
          items: [],
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      total: 1,
    };

    (mockApiService.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse,
    );

    const result = await userOrdersService.getMyOrders(1, 0, 10);

    expect(mockApiService.get).toHaveBeenCalledWith(
      '/orders/my-orders?userId=1&skip=0&take=10',
    );
    expect(result).toEqual(mockResponse);
  });

  it('should fetch order by ID', async () => {
    const mockOrder = {
      id: 101,
      customerName: 'Nguyễn Văn A',
      totalAmount: 5000000,
      status: 'PENDING',
      items: [],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    (mockApiService.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrder,
    );

    const result = await userOrdersService.getOrderById(101);

    expect(mockApiService.get).toHaveBeenCalledWith('/orders/101');
    expect(result).toEqual(mockOrder);
  });
});
