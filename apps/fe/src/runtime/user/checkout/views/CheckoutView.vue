<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from '#app';
import { useToast } from '#fe/core/composables/useToast';
import { useUserCart } from '../../cart/composables/useUserCart';
import { useUserVouchers } from '../../vouchers/composables/useUserVouchers';
import { useUserOrders } from '../../orders/composables/useUserOrders';
import { useUserProducts } from '../../products/composables/useUserProducts';

const router = useRouter();
const toast = useToast();
const { cart, cartSubtotal, clearCart } = useUserCart();
const { getDiscountAmount, removeVoucher } = useUserVouchers();
const { createOrder, isLoading: isSubmitting } = useUserOrders();
const { formatPrice } = useUserProducts();

const fullName = ref('');
const phone = ref('');
const city = ref('TP. Hồ Chí Minh');
const district = ref('Quận 1');
const address = ref('');
const shippingMethod = ref<'standard' | 'express'>('standard');
const paymentMethod = ref<'cod' | 'card' | 'ewallet'>('cod');

const shippingFee = computed(() => {
  return shippingMethod.value === 'express' ? 50000 : 0;
});

const discountAmount = computed(() => {
  return getDiscountAmount(cartSubtotal.value);
});

const finalTotal = computed(() => {
  return Math.max(
    0,
    cartSubtotal.value + shippingFee.value - discountAmount.value,
  );
});

async function handleCompleteOrder() {
  if (!fullName.value || !phone.value || !address.value) {
    toast.error(
      'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.',
    );
    return;
  }

  if (cart.value.length === 0) {
    router.push('/cart');
    return;
  }

  const invalidStockItem = cart.value.find(
    (item) =>
      !item.product ||
      item.product.stock <= 0 ||
      item.quantity > item.product.stock,
  );
  if (invalidStockItem) {
    if (!invalidStockItem.product || invalidStockItem.product.stock <= 0) {
      toast.error(
        `Sản phẩm "${invalidStockItem.product?.name || 'này'}" đã hết hàng! Vui lòng cập nhật giỏ hàng.`,
      );
    } else {
      toast.error(
        `Sản phẩm "${invalidStockItem.product.name}" chỉ còn ${invalidStockItem.product.stock} sản phẩm trong kho (bạn đặt ${invalidStockItem.quantity}).`,
      );
    }
    return;
  }

  const createdOrder = await createOrder({
    customerName: fullName.value,
    customerPhone: phone.value,
    shippingAddress: `${address.value}, ${district.value}, ${city.value}`,
    shippingMethod:
      shippingMethod.value === 'express' ? 'Hỏa tốc' : 'Tiêu chuẩn',
    paymentMethod: paymentMethod.value.toUpperCase(),
    totalAmount: finalTotal.value,
    items: cart.value.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.product.price,
    })),
  });

  if (createdOrder) {
    clearCart();
    removeVoucher();
    router.push(`/checkout/success?orderId=${createdOrder.id}`);
  }
}
</script>

<template>
  <div class="max-w-[1280px] mx-auto px-4 md:px-10 py-6 pb-24 space-y-8">
    <!-- Header -->
    <div
      class="flex items-center justify-between border-b border-gray-200 pb-4"
    >
      <NuxtLink
        to="/cart"
        class="text-xs md:text-sm font-semibold text-[#0052cc] hover:underline flex items-center gap-1"
      >
        <span class="material-symbols-outlined text-base">arrow_back</span>
        Quay lại giỏ hàng
      </NuxtLink>
      <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900">
        Thanh Toán Đơn Hàng
      </h1>
      <div class="w-10"></div>
    </div>

    <!-- Empty Cart Protection -->
    <div
      v-if="cart.length === 0"
      class="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-4"
    >
      <span class="material-symbols-outlined text-5xl text-gray-300"
        >shopping_cart</span
      >
      <h2 class="text-xl font-bold text-gray-900">
        Giỏ hàng của bạn đang trống
      </h2>
      <NuxtLink
        to="/products"
        class="inline-block bg-[#0052cc] hover:bg-[#0040a2] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-colors"
      >
        Mua sắm ngay
      </NuxtLink>
    </div>

    <!-- Checkout Main Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Forms (Address, Shipping, Payment) -->
      <div class="lg:col-span-8 space-y-6">
        <!-- 1. Address Section -->
        <section
          class="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-sm"
        >
          <h2
            class="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3"
          >
            <span class="material-symbols-outlined text-[#0052cc] text-xl"
              >location_on</span
            >
            1. Thông tin giao hàng
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5"
                >Họ và tên người nhận</label
              >
              <input
                v-model="fullName"
                type="text"
                required
                placeholder="Nhập họ và tên..."
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#0052cc] focus:bg-white transition-colors text-gray-900"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5"
                >Số điện thoại</label
              >
              <input
                v-model="phone"
                type="tel"
                required
                placeholder="Nhập số điện thoại..."
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#0052cc] focus:bg-white transition-colors text-gray-900"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5"
                >Tỉnh / Thành phố</label
              >
              <select
                v-model="city"
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#0052cc] focus:bg-white transition-colors text-gray-900"
              >
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Cần Thơ">Cần Thơ</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5"
                >Quận / Huyện</label
              >
              <input
                v-model="district"
                type="text"
                placeholder="Nhập quận/huyện..."
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#0052cc] focus:bg-white transition-colors text-gray-900"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-gray-700 mb-1.5"
                >Địa chỉ cụ thể (Số nhà, tên đường, phường/xã)</label
              >
              <input
                v-model="address"
                type="text"
                required
                placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Phường Bến Nghé..."
                class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#0052cc] focus:bg-white transition-colors text-gray-900"
              />
            </div>
          </div>
        </section>

        <!-- 2. Shipping Method Section -->
        <section
          class="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-sm"
        >
          <h2
            class="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3"
          >
            <span class="material-symbols-outlined text-[#0052cc] text-xl"
              >local_shipping</span
            >
            2. Phương thức vận chuyển
          </h2>

          <div class="space-y-3">
            <label
              class="border rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all"
              :class="
                shippingMethod === 'standard'
                  ? 'border-[#0052cc] bg-blue-50/50 ring-2 ring-[#0052cc]/20'
                  : 'border-gray-200 hover:bg-gray-50'
              "
            >
              <input
                v-model="shippingMethod"
                type="radio"
                name="shipping"
                value="standard"
                class="text-[#0052cc] focus:ring-[#0052cc] h-4 w-4"
              />
              <div class="flex-grow">
                <div
                  class="flex justify-between items-center font-bold text-xs text-gray-900"
                >
                  <span>Giao hàng tiêu chuẩn</span>
                  <span class="text-emerald-600 font-bold">Miễn phí</span>
                </div>
                <div class="text-[11px] text-gray-500 mt-0.5">
                  Dự kiến giao trong 2-3 ngày làm việc
                </div>
              </div>
            </label>

            <label
              class="border rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all"
              :class="
                shippingMethod === 'express'
                  ? 'border-[#0052cc] bg-blue-50/50 ring-2 ring-[#0052cc]/20'
                  : 'border-gray-200 hover:bg-gray-50'
              "
            >
              <input
                v-model="shippingMethod"
                type="radio"
                name="shipping"
                value="express"
                class="text-[#0052cc] focus:ring-[#0052cc] h-4 w-4"
              />
              <div class="flex-grow">
                <div
                  class="flex justify-between items-center font-bold text-xs text-gray-900"
                >
                  <span>Giao hàng hỏa tốc (Express)</span>
                  <span class="text-[#0052cc] font-bold">50.000₫</span>
                </div>
                <div class="text-[11px] text-gray-500 mt-0.5">
                  Giao nhanh trong 24 giờ
                </div>
              </div>
            </label>
          </div>
        </section>

        <!-- 3. Payment Method Section -->
        <section
          class="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-sm"
        >
          <h2
            class="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3"
          >
            <span class="material-symbols-outlined text-[#0052cc] text-xl"
              >payments</span
            >
            3. Phương thức thanh toán
          </h2>

          <div class="space-y-3 text-xs">
            <label
              class="border rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all"
              :class="
                paymentMethod === 'cod'
                  ? 'border-[#0052cc] bg-blue-50/50 ring-2 ring-[#0052cc]/20'
                  : 'border-gray-200 hover:bg-gray-50'
              "
            >
              <input
                v-model="paymentMethod"
                type="radio"
                name="payment"
                value="cod"
                class="text-[#0052cc] focus:ring-[#0052cc] h-4 w-4"
              />
              <span class="material-symbols-outlined text-gray-600"
                >payments</span
              >
              <span class="font-bold text-gray-800 flex-grow"
                >Thanh toán khi nhận hàng (COD)</span
              >
            </label>

            <!-- <label
              class="border rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all"
              :class="
                paymentMethod === 'card'
                  ? 'border-[#0052cc] bg-blue-50/50 ring-2 ring-[#0052cc]/20'
                  : 'border-gray-200 hover:bg-gray-50'
              "
            >
              <input
                v-model="paymentMethod"
                type="radio"
                name="payment"
                value="card"
                class="text-[#0052cc] focus:ring-[#0052cc] h-4 w-4"
              />
              <span class="material-symbols-outlined text-gray-600"
                >credit_card</span
              >
              <span class="font-bold text-gray-800 flex-grow"
                >Thẻ ATM / Visa / Mastercard</span
              >
            </label>

            <label
              class="border rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all"
              :class="
                paymentMethod === 'ewallet'
                  ? 'border-[#0052cc] bg-blue-50/50 ring-2 ring-[#0052cc]/20'
                  : 'border-gray-200 hover:bg-gray-50'
              "
            >
              <input
                v-model="paymentMethod"
                type="radio"
                name="payment"
                value="ewallet"
                class="text-[#0052cc] focus:ring-[#0052cc] h-4 w-4"
              />
              <span class="material-symbols-outlined text-gray-600"
                >account_balance_wallet</span
              >
              <span class="font-bold text-gray-800 flex-grow"
                >Ví MoMo / ZaloPay / VNPay</span
              >
            </label> -->
          </div>
        </section>
      </div>

      <!-- Right Order Summary Sidebar -->
      <div
        class="lg:col-span-4 bg-white rounded-3xl border border-gray-200 p-6 space-y-6 shadow-sm sticky top-28"
      >
        <h2
          class="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-[#0052cc] text-xl"
            >receipt_long</span
          >
          Tóm tắt đơn hàng
        </h2>

        <!-- Items List -->
        <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
          <div
            v-for="item in cart"
            :key="item.product.id"
            class="flex items-center gap-3 text-xs border-b border-gray-100 pb-2.5"
          >
            <img
              :src="
                item.product.images?.[0]?.imageUrl ||
                'https://placehold.co/100x100?text=SP'
              "
              :alt="item.product.name"
              class="w-12 h-12 object-contain bg-gray-50 rounded-xl p-1 shrink-0"
            />
            <div class="flex-grow">
              <div class="font-bold text-gray-900 line-clamp-1">
                {{ item.product.name }}
              </div>
              <div class="text-gray-400">SL: {{ item.quantity }}</div>
            </div>
            <div class="font-bold text-gray-900 shrink-0">
              {{ formatPrice(item.product.price * item.quantity) }}
            </div>
          </div>
        </div>

        <div class="space-y-2.5 text-xs border-t border-gray-100 pt-3">
          <div class="flex justify-between text-gray-600">
            <span>Tạm tính:</span>
            <span class="font-bold text-gray-900">{{
              formatPrice(cartSubtotal)
            }}</span>
          </div>

          <div class="flex justify-between text-gray-600">
            <span>Phí vận chuyển:</span>
            <span class="font-bold text-gray-900">{{
              shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)
            }}</span>
          </div>

          <div
            v-if="discountAmount > 0"
            class="flex justify-between text-[#ef4444] font-bold"
          >
            <span>Giảm giá:</span>
            <span>-{{ formatPrice(discountAmount) }}</span>
          </div>
        </div>

        <div
          class="border-t border-gray-200 pt-4 flex items-baseline justify-between"
        >
          <span class="font-bold text-sm text-gray-900">Tổng thanh toán:</span>
          <span class="text-2xl font-black text-[#0052cc]">{{
            formatPrice(finalTotal)
          }}</span>
        </div>

        <button
          :disabled="isSubmitting"
          class="w-full bg-[#0052cc] hover:bg-[#0040a2] text-white font-bold text-sm py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          @click="handleCompleteOrder"
        >
          <span
            v-if="isSubmitting"
            class="animate-spin material-symbols-outlined text-base"
            >progress_activity</span
          >
          <span v-else class="material-symbols-outlined text-base">lock</span>
          <span>{{
            isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'
          }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
