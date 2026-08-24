import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Product } from '../src/runtime/user/products/types/product.types';

// Import after mocks
import { useUserCart } from '../src/runtime/user/cart/composables/useUserCart';

// Mock vue and nuxt
const stateMap = new Map<string, { value: unknown }>();

vi.mock('vue', () => ({
  computed: <T>(getter: () => T) => ({
    get value() {
      return getter();
    },
  }),
}));

vi.mock('#app', () => ({
  useState: vi.fn((key: string, init: () => unknown) => {
    if (!stateMap.has(key)) {
      stateMap.set(key, { value: init() });
    }
    return stateMap.get(key);
  }),
}));

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock('#fe/core/composables/useToast', () => ({
  useToast: () => mockToast,
}));

describe('useUserCart', () => {
  const inStockProduct: Product = {
    id: 1,
    categoryId: 1,
    name: 'iPhone 15 Pro',
    price: 25000000,
    stock: 5,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  const outOfStockProduct: Product = {
    id: 2,
    categoryId: 1,
    name: 'MacBook Pro M3',
    price: 45000000,
    stock: 0,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  beforeEach(() => {
    stateMap.clear();
    vi.clearAllMocks();
  });

  it('should not add out-of-stock product to cart and should trigger error toast', () => {
    const { cart, addToCart } = useUserCart();

    const result = addToCart(outOfStockProduct, 1);

    expect(result).toBe(false);
    expect(cart.value.length).toBe(0);
    expect(mockToast.error).toHaveBeenCalledWith(
      expect.stringContaining('đã hết hàng'),
    );
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it('should add in-stock product to cart successfully', () => {
    const { cart, cartCount, cartSubtotal, addToCart } = useUserCart();

    const result = addToCart(inStockProduct, 2, 'Titan Tự Nhiên', '256GB');

    expect(result).toBe(true);
    expect(cart.value.length).toBe(1);
    expect(cartCount.value).toBe(2);
    expect(cartSubtotal.value).toBe(50000000);
    expect(cart.value[0]?.selectedColor).toBe('Titan Tự Nhiên');
    expect(cart.value[0]?.selectedStorage).toBe('256GB');
    expect(mockToast.success).toHaveBeenCalledWith(
      expect.stringContaining('Đã thêm'),
    );
  });

  it('should prevent adding more items than available stock', () => {
    const { cart, addToCart } = useUserCart();

    // inStockProduct has stock: 5, requesting 6
    const result = addToCart(inStockProduct, 6);

    expect(result).toBe(false);
    expect(cart.value.length).toBe(0);
    expect(mockToast.error).toHaveBeenCalledWith(
      expect.stringContaining('vượt quá số lượng trong kho'),
    );
  });

  it('should prevent adding items if current cart quantity + requested exceeds stock', () => {
    const { cart, addToCart } = useUserCart();

    // Add 4 items (stock is 5)
    addToCart(inStockProduct, 4);
    expect(cart.value[0]?.quantity).toBe(4);

    // Attempt to add 2 more items (4 + 2 = 6 > 5)
    const result = addToCart(inStockProduct, 2);

    expect(result).toBe(false);
    expect(cart.value[0]?.quantity).toBe(4);
    expect(mockToast.error).toHaveBeenCalledWith(
      expect.stringContaining('Chỉ có thể thêm tối đa 1 sản phẩm nữa'),
    );
  });

  it('should prevent increasing quantity beyond stock via updateQuantity', () => {
    const { cart, addToCart, updateQuantity } = useUserCart();

    addToCart(inStockProduct, 5); // Max stock
    expect(cart.value[0]?.quantity).toBe(5);

    updateQuantity(0, 1); // Try to add 1 more

    expect(cart.value[0]?.quantity).toBe(5);
    expect(mockToast.error).toHaveBeenCalledWith(
      expect.stringContaining('vượt quá tồn kho'),
    );
  });

  it('should allow decreasing quantity and removing item when quantity reaches 0', () => {
    const { cart, addToCart, updateQuantity } = useUserCart();

    addToCart(inStockProduct, 2);
    expect(cart.value[0]?.quantity).toBe(2);

    updateQuantity(0, -1);
    expect(cart.value[0]?.quantity).toBe(1);

    updateQuantity(0, -1);
    expect(cart.value.length).toBe(0);
  });

  it('should remove product by index with removeFromCart', () => {
    const { cart, addToCart, removeFromCart } = useUserCart();

    addToCart(inStockProduct, 1);
    expect(cart.value.length).toBe(1);

    removeFromCart(0);
    expect(cart.value.length).toBe(0);
    expect(mockToast.info).toHaveBeenCalledWith(
      expect.stringContaining('Đã xóa'),
    );
  });

  it('should clear cart with clearCart', () => {
    const { cart, addToCart, clearCart } = useUserCart();

    addToCart(inStockProduct, 2);
    expect(cart.value.length).toBe(1);

    clearCart();
    expect(cart.value.length).toBe(0);
  });
});
