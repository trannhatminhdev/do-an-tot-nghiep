<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserCart } from '../composables/useUserCart';
import { useUserVouchers } from '../../vouchers/composables/useUserVouchers';
import { useUserProducts } from '../../products/composables/useUserProducts';

const { cart, cartCount, cartSubtotal, updateQuantity, removeFromCart } =
  useUserCart();
const {
  appliedVoucher,
  applyVoucherCode,
  removeVoucher,
  getDiscountAmount,
  formattedDiscountText,
  isLoading: isVoucherLoading,
} = useUserVouchers();
const { formatPrice } = useUserProducts();

const voucherInput = ref('');

async function handleApplyVoucher() {
  if (voucherInput.value.trim()) {
    const ok = await applyVoucherCode(voucherInput.value.trim());
    if (ok) voucherInput.value = '';
  }
}

const shippingFee = computed(() => {
  if (cart.value.length === 0) return 0;
  return 0; // Free standard shipping default
});

const discountAmount = computed(() => {
  return getDiscountAmount(cartSubtotal.value);
});

const cartTotal = computed(() => {
  return Math.max(
    0,
    cartSubtotal.value + shippingFee.value - discountAmount.value,
  );
});

const hasInvalidStock = computed(() => {
  return cart.value.some(
    (item) =>
      !item.product ||
      item.product.stock <= 0 ||
      item.quantity > item.product.stock,
  );
});
</script>

<template>
  <div class="max-w-[1280px] mx-auto px-4 md:px-10 py-6 pb-24 space-y-8">
    <!-- Header -->
    <div
      class="flex items-center justify-between border-b border-gray-200 pb-4"
    >
      <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900">
        Giỏ Hàng Của Bạn
      </h1>
      <NuxtLink
        to="/products"
        class="text-xs md:text-sm font-semibold text-[#0052cc] hover:underline flex items-center gap-1"
      >
        <span class="material-symbols-outlined text-base">arrow_back</span>
        Tiếp tục mua sắm
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div
      v-if="cart.length === 0"
      class="bg-white rounded-3xl p-12 text-center border border-gray-200 my-8 shadow-sm space-y-4"
    >
      <span class="material-symbols-outlined text-6xl text-gray-300"
        >shopping_cart_off</span
      >
      <h2 class="text-xl font-bold text-gray-900">
        Giỏ hàng của bạn đang trống
      </h2>
      <p class="text-xs text-gray-500 max-w-sm mx-auto">
        Hãy khám phá các sản phẩm công nghệ tuyệt vời và thêm vào giỏ hàng nhé!
      </p>
      <NuxtLink
        to="/products"
        class="inline-block bg-[#0052cc] text-white font-bold text-xs px-8 py-3.5 rounded-xl hover:bg-[#0040a2] transition-colors shadow-md"
      >
        Khám phá ngay
      </NuxtLink>
    </div>

    <!-- Cart Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left: Cart Items & Voucher Input -->
      <div class="lg:col-span-8 space-y-6">
        <!-- List of Items -->
        <div class="space-y-4">
          <article
            v-for="(item, idx) in cart"
            :key="item.product.id"
            class="bg-white rounded-3xl border border-gray-200 p-4 md:p-6 flex gap-4 md:gap-6 items-center shadow-sm"
          >
            <!-- Product Thumbnail -->
            <NuxtLink
              :to="`/products/${item.product.id}`"
              class="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl bg-gray-50 flex items-center justify-center p-2 border border-gray-100"
            >
              <img
                :src="
                  item.product.images?.[0]?.imageUrl ||
                  'https://placehold.co/100x100?text=SP'
                "
                :alt="item.product.name"
                class="w-full h-full object-contain"
              />
            </NuxtLink>

            <!-- Item Details -->
            <div class="flex-grow flex flex-col justify-between min-h-[80px]">
              <div>
                <NuxtLink
                  :to="`/products/${item.product.id}`"
                  class="font-bold text-sm md:text-base text-gray-900 hover:text-[#0052cc] transition-colors line-clamp-2"
                >
                  {{ item.product.name }}
                </NuxtLink>
                <div class="flex gap-2 mt-1.5 flex-wrap">
                  <span
                    v-if="item.selectedColor"
                    class="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-md font-medium"
                  >
                    Màu: {{ item.selectedColor }}
                  </span>
                  <span
                    v-if="item.selectedStorage"
                    class="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-md font-medium"
                  >
                    {{ item.selectedStorage }}
                  </span>
                </div>
              </div>

              <!-- Price & Quantity -->
              <div
                class="flex flex-wrap items-center justify-between gap-4 mt-3"
              >
                <span class="font-bold text-base text-[#0052cc]">{{
                  formatPrice(item.product.price)
                }}</span>

                <!-- Quantity Control & Stock Warning -->
                <div class="flex flex-col gap-1 items-end">
                  <div
                    class="flex items-center bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <button
                      class="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#0052cc] active:bg-gray-200 rounded-l-xl cursor-pointer"
                      aria-label="Giảm số lượng"
                      @click="updateQuantity(idx, -1)"
                    >
                      <span class="material-symbols-outlined text-sm"
                        >remove</span
                      >
                    </button>
                    <span
                      class="w-8 text-center font-bold text-xs text-gray-900"
                      >{{ item.quantity }}</span
                    >
                    <button
                      :disabled="item.quantity >= item.product.stock"
                      class="w-8 h-8 flex items-center justify-center text-[#0052cc] active:bg-gray-200 rounded-r-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Tăng số lượng"
                      @click="updateQuantity(idx, 1)"
                    >
                      <span class="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>

                  <span
                    v-if="item.product.stock <= 0"
                    class="text-[11px] font-bold text-red-500"
                  >
                    Hết hàng
                  </span>
                  <span
                    v-else-if="item.quantity >= item.product.stock"
                    class="text-[11px] font-medium text-amber-600"
                  >
                    Tối đa {{ item.product.stock }} sp
                  </span>
                </div>
              </div>
            </div>

            <!-- Remove Button -->
            <button
              class="text-gray-400 hover:text-[#ef4444] transition-colors p-2 cursor-pointer self-start md:self-center"
              title="Xóa sản phẩm"
              @click="removeFromCart(idx)"
            >
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </article>
        </div>

        <!-- Voucher Code Section -->
        <div
          class="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-sm"
        >
          <h3 class="font-bold text-sm text-gray-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-[#0052cc]"
              >local_offer</span
            >
            Mã giảm giá / Voucher
          </h3>

          <form class="flex gap-2" @submit.prevent="handleApplyVoucher">
            <input
              v-model="voucherInput"
              type="text"
              placeholder="Nhập mã voucher (VD: TECHPULSE10)..."
              class="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#0052cc] focus:bg-white uppercase text-gray-900"
            />
            <button
              type="submit"
              :disabled="isVoucherLoading"
              class="bg-[#0052cc] text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-[#0040a2] transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1"
            >
              <span
                v-if="isVoucherLoading"
                class="animate-spin material-symbols-outlined text-sm"
                >progress_activity</span
              >
              <span>Áp Dụng</span>
            </button>
          </form>

          <!-- Active Voucher Tag -->
          <div
            v-if="appliedVoucher"
            class="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3"
          >
            <div
              class="flex items-center gap-2 text-xs font-bold text-[#0052cc]"
            >
              <span class="material-symbols-outlined text-base"
                >check_circle</span
              >
              <span
                >Mã: {{ appliedVoucher.code }} ({{
                  formattedDiscountText
                }})</span
              >
            </div>
            <button
              class="text-gray-400 hover:text-[#ef4444] cursor-pointer"
              @click="removeVoucher"
            >
              <span class="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Order Summary Box -->
      <div
        class="lg:col-span-4 bg-white rounded-3xl border border-gray-200 p-6 space-y-6 shadow-sm sticky top-28"
      >
        <h2
          class="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4"
        >
          Tóm Tắt Đơn Hàng
        </h2>

        <div class="space-y-3 text-xs">
          <div class="flex justify-between text-gray-600">
            <span>Tạm tính ({{ cartCount }} sản phẩm):</span>
            <span class="font-bold text-gray-900">{{
              formatPrice(cartSubtotal)
            }}</span>
          </div>

          <div class="flex justify-between text-gray-600">
            <span>Phí vận chuyển:</span>
            <span class="font-bold text-emerald-600">Miễn phí</span>
          </div>

          <div
            v-if="discountAmount > 0"
            class="flex justify-between text-[#ef4444] font-bold"
          >
            <span>Giảm giá voucher:</span>
            <span>-{{ formatPrice(discountAmount) }}</span>
          </div>
        </div>

        <div
          class="border-t border-gray-200 pt-4 flex items-baseline justify-between"
        >
          <span class="font-bold text-sm text-gray-900">Tổng cộng:</span>
          <div class="text-right">
            <span class="text-2xl font-black text-[#0052cc] block">{{
              formatPrice(cartTotal)
            }}</span>
            <span class="text-[10px] text-gray-400">Đã bao gồm VAT</span>
          </div>
        </div>

        <div
          v-if="hasInvalidStock"
          class="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-start gap-2"
        >
          <span class="material-symbols-outlined text-base shrink-0 mt-0.5"
            >error</span
          >
          <span
            >Có sản phẩm trong giỏ hàng đã hết hàng hoặc vượt quá tồn kho. Vui
            lòng điều chỉnh trước khi thanh toán.</span
          >
        </div>

        <!-- Checkout Button -->
        <NuxtLink
          v-if="!hasInvalidStock"
          to="/checkout"
          class="w-full bg-[#0052cc] hover:bg-[#0040a2] text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <span class="material-symbols-outlined text-base">lock</span>
          Tiến Hành Thanh Toán
        </NuxtLink>
        <button
          v-else
          disabled
          class="w-full bg-gray-300 text-gray-500 font-bold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <span class="material-symbols-outlined text-base">lock</span>
          Tiến Hành Thanh Toán
        </button>
      </div>
    </div>
  </div>
</template>
