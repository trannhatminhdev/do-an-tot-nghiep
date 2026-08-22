import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserVouchersService } from '../src/runtime/user/vouchers/services/user-vouchers.service';
import type { ApiService } from '../src/runtime/core/services/api.service';

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:3000/api/v1',
    },
  }),
}));

describe('UserVouchersService', () => {
  let mockApiService: Partial<ApiService>;
  let userVouchersService: UserVouchersService;

  beforeEach(() => {
    mockApiService = {
      post: vi.fn(),
    };
    userVouchersService = new UserVouchersService(mockApiService as ApiService);
  });

  it('should call apply voucher endpoint with code', async () => {
    const mockVoucher = {
      id: 1,
      code: 'WELCOME10',
      discountType: 'PERCENT' as const,
      discountValue: 10,
    };

    (mockApiService.post as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockVoucher,
    );

    const result = await userVouchersService.applyVoucher('WELCOME10');

    expect(mockApiService.post).toHaveBeenCalledWith('/vouchers/apply', {
      code: 'WELCOME10',
    });
    expect(result).toEqual(mockVoucher);
  });
});
