import { useState } from '#app';
import { computed } from 'vue';
import { useToast } from '#fe/core/composables/useToast';
import type { CartItem } from '../types/cart.types';
import type { Product } from '../../products/types/product.types';

export function useUserCart() {
  const cart = useState<CartItem[]>('user_cart', () => []);
  const toast = useToast();

  const cartCount = computed(() => {
    return cart.value.reduce((acc, item) => acc + item.quantity, 0);
  });

  const cartSubtotal = computed(() => {
    return cart.value.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
  });

  const addToCart = (
    product: Product,
    quantity = 1,
    color?: string,
    storage?: string,
  ): boolean => {
    if (!product || product.stock <= 0) {
      toast.error(`Sản phẩm "${product?.name || 'này'}" đã hết hàng!`);
      return false;
    }

    if (quantity <= 0) {
      toast.error('Số lượng không hợp lệ!');
      return false;
    }

    const existingIndex = cart.value.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedColor === color &&
        item.selectedStorage === storage,
    );

    const currentQtyInCart =
      existingIndex > -1 && cart.value[existingIndex]
        ? cart.value[existingIndex]!.quantity
        : 0;

    if (currentQtyInCart + quantity > product.stock) {
      if (currentQtyInCart > 0) {
        toast.error(
          `Bạn đã có ${currentQtyInCart} sản phẩm trong giỏ hàng. Chỉ có thể thêm tối đa ${product.stock - currentQtyInCart} sản phẩm nữa (tồn kho: ${product.stock}).`,
        );
      } else {
        toast.error(
          `Số lượng yêu cầu (${quantity}) vượt quá số lượng trong kho (${product.stock}).`,
        );
      }
      return false;
    }

    if (existingIndex > -1 && cart.value[existingIndex]) {
      cart.value[existingIndex]!.quantity += quantity;
    } else {
      cart.value.push({
        product,
        quantity,
        selectedColor: color,
        selectedStorage: storage,
      });
    }

    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
    return true;
  };

  const removeFromCart = (index: number) => {
    if (index >= 0 && index < cart.value.length) {
      const removed = cart.value.splice(index, 1);
      if (removed.length > 0 && removed[0]) {
        toast.info(`Đã xóa "${removed[0].product.name}" khỏi giỏ hàng.`);
      }
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    if (index >= 0 && index < cart.value.length && cart.value[index]) {
      const item = cart.value[index]!;
      const newQty = item.quantity + delta;

      if (delta > 0 && newQty > item.product.stock) {
        toast.error(
          `Số lượng sản phẩm vượt quá tồn kho (còn ${item.product.stock} sản phẩm).`,
        );
        return;
      }

      if (newQty > 0) {
        item.quantity = newQty;
      } else {
        removeFromCart(index);
      }
    }
  };

  const clearCart = () => {
    cart.value = [];
  };

  return {
    cart,
    cartCount,
    cartSubtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
