export interface Voucher {
  id: number;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  createdAt?: string;
  updatedAt?: string;
}
