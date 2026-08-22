import { apiService, type ApiService } from '#fe/core/services/api.service';
import type { Voucher } from '../types/voucher.types';

export class UserVouchersService {
  constructor(private readonly api: ApiService = apiService) {}

  async applyVoucher(code: string): Promise<Voucher> {
    return this.api.post<Voucher>('/vouchers/apply', { code });
  }
}

export const userVouchersService = new UserVouchersService();
