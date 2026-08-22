import { useState } from '#app';
import { computed, ref } from 'vue';
import { useToast } from '#fe/core/composables/useToast';
import { userVouchersService } from '../services/user-vouchers.service';
import type { Voucher } from '../types/voucher.types';

export function useUserVouchers() {
  const appliedVoucher = useState<Voucher | null>(
    'user_applied_voucher',
    () => null,
  );
  const isLoading = ref(false);
  const toast = useToast();

  const applyVoucherCode = async (code: string): Promise<boolean> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Vui lòng nhập mã giảm giá.');
      return false;
    }

    isLoading.value = true;
    try {
      const voucher = await userVouchersService.applyVoucher(cleanCode);
      appliedVoucher.value = voucher;
      toast.success(`Áp dụng mã giảm giá "${voucher.code}" thành công!`);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const removeVoucher = () => {
    appliedVoucher.value = null;
    toast.info('Đã hủy áp dụng mã giảm giá.');
  };

  const getDiscountAmount = (subtotal: number): number => {
    if (!appliedVoucher.value) return 0;
    if (appliedVoucher.value.discountType === 'FIXED') {
      return Math.min(appliedVoucher.value.discountValue, subtotal);
    }
    // PERCENT
    const percentDiscount =
      (subtotal * appliedVoucher.value.discountValue) / 100;
    return Math.min(percentDiscount, subtotal);
  };

  const formattedDiscountText = computed(() => {
    if (!appliedVoucher.value) return '';
    if (appliedVoucher.value.discountType === 'FIXED') {
      return `Giảm ${appliedVoucher.value.discountValue.toLocaleString('vi-VN')}₫`;
    }
    return `Giảm ${appliedVoucher.value.discountValue}%`;
  });

  return {
    appliedVoucher,
    isLoading,
    applyVoucherCode,
    removeVoucher,
    getDiscountAmount,
    formattedDiscountText,
  };
}
