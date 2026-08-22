import { useUserProducts } from '../products/composables/useUserProducts';
import { useUserCategories } from '../categories/composables/useUserCategories';
import { useUserCart } from '../cart/composables/useUserCart';
import { useUserVouchers } from '../vouchers/composables/useUserVouchers';
import { useUserReviews } from '../reviews/composables/useUserReviews';
import { useUserOrders } from '../orders/composables/useUserOrders';

export function useUserStore() {
  const products = useUserProducts();
  const categories = useUserCategories();
  const cart = useUserCart();
  const vouchers = useUserVouchers();
  const reviews = useUserReviews();
  const orders = useUserOrders();

  return {
    ...products,
    ...categories,
    ...cart,
    ...vouchers,
    ...reviews,
    ...orders,
  };
}
