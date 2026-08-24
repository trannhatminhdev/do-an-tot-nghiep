<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from '#app';
import { useUserOrders } from '../composables/useUserOrders';
import { useUserProducts } from '../../products/composables/useUserProducts';

const route = useRoute();
const router = useRouter();
const { orders, total, isLoading, lookupOrders } = useUserOrders();
const { formatPrice } = useUserProducts();

const searchQuery = ref('');
const hasSearched = ref(false);

async function handleSearch() {
  if (!searchQuery.value.trim()) return;
  hasSearched.value = true;
  router.replace({ query: { search: searchQuery.value.trim() } });
  await lookupOrders(searchQuery.value.trim());
}

onMounted(async () => {
  const initialQuery =
    (route.query.search as string) || (route.query.orderId as string) || '';
  if (initialQuery) {
    searchQuery.value = initialQuery;
    await handleSearch();
  }
});

const statusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'DELIVERED':
      return { text: 'Đã giao hàng', class: 'bg-emerald-100 text-emerald-800' };
    case 'SHIPPED':
      return {
        text: 'Đang vận chuyển',
        class: 'bg-indigo-100 text-indigo-800',
      };
    case 'PROCESSING':
      return { text: 'Đang xử lý', class: 'bg-blue-100 text-blue-800' };
    case 'CANCELLED':
      return { text: 'Đã hủy', class: 'bg-red-100 text-red-800' };
    default:
      return { text: 'Chờ xác nhận', class: 'bg-amber-100 text-amber-800' };
  }
};
</script>

<template>
  <div class="max-w-[1280px] mx-auto px-4 md:px-10 py-8 pb-24 space-y-8">
    <!-- Header -->
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <div
        class="inline-flex items-center justify-center w-14 h-14 bg-blue-100 text-[#0052cc] rounded-2xl mb-1"
      >
        <span class="material-symbols-outlined text-3xl">receipt_long</span>
      </div>
      <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900">
        Tra Cứu Đơn Hàng
      </h1>
      <p class="text-xs md:text-sm text-gray-500">
        Nhập số điện thoại đặt hàng hoặc mã đơn hàng của bạn để kiểm tra tình
        trạng xử lý và tiến độ giao hàng.
      </p>
    </div>

    <!-- Search Box Card -->
    <div
      class="max-w-xl mx-auto bg-white rounded-3xl p-4 md:p-6 border border-gray-200 shadow-md"
    >
      <form
        class="flex flex-col sm:flex-row gap-3"
        @submit.prevent="handleSearch"
      >
        <div class="relative flex-grow">
          <span
            class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
          >
            search
          </span>
          <input
            v-model="searchQuery"
            type="text"
            required
            placeholder="Nhập số điện thoại hoặc mã đơn (VD: 1, 0912345678)..."
            class="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-xs md:text-sm outline-none focus:border-[#0052cc] focus:bg-white transition-all text-gray-900"
          />
        </div>
        <button
          type="submit"
          :disabled="isLoading"
          class="bg-[#0052cc] hover:bg-[#0040a2] text-white font-bold text-xs md:text-sm px-7 py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <span
            v-if="isLoading"
            class="animate-spin material-symbols-outlined text-base"
            >progress_activity</span
          >
          <span v-else class="material-symbols-outlined text-base">search</span>
          <span>Tra cứu</span>
        </button>
      </form>
    </div>

    <!-- Search Results / States -->
    <div class="max-w-4xl mx-auto">
      <!-- Loading -->
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3"
      >
        <span
          class="animate-spin material-symbols-outlined text-4xl text-[#0052cc]"
          >progress_activity</span
        >
        <p class="text-xs md:text-sm font-medium">
          Đang tìm kiếm thông tin đơn hàng...
        </p>
      </div>

      <!-- No Results Found -->
      <div
        v-else-if="hasSearched && orders.length === 0"
        class="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-4"
      >
        <span class="material-symbols-outlined text-6xl text-gray-300"
          >search_off</span
        >
        <h2 class="text-lg font-bold text-gray-900">
          Không tìm thấy đơn hàng nào
        </h2>
        <p class="text-xs text-gray-500 max-w-md mx-auto">
          Không tìm thấy đơn hàng tương ứng với từ khóa "<span
            class="font-bold text-gray-700"
            >{{ searchQuery }}</span
          >". Vui lòng kiểm tra lại số điện thoại hoặc mã đơn hàng.
        </p>
      </div>

      <!-- Not Searched Yet State -->
      <div
        v-else-if="!hasSearched"
        class="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm space-y-3 text-gray-400"
      >
        <span class="material-symbols-outlined text-5xl text-blue-200"
          >manage_search</span
        >
        <p class="text-xs text-gray-500">
          Kết quả tra cứu thông tin đơn hàng và tiến độ vận chuyển sẽ xuất hiện
          tại đây.
        </p>
      </div>

      <!-- Orders List Result -->
      <div v-else class="space-y-6">
        <div class="text-xs text-gray-500 px-2 font-medium">
          Tìm thấy <span class="font-bold text-[#0052cc]">{{ total }}</span> đơn
          hàng phù hợp:
        </div>

        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all space-y-0"
        >
          <!-- Order Card Header -->
          <div
            class="bg-gray-50/70 border-b border-gray-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4"
          >
            <div class="flex items-center gap-3">
              <span class="font-black text-base text-[#0052cc]"
                >Mã đơn #{{ order.id }}</span
              >
              <span class="text-xs text-gray-500">
                {{
                  new Date(order.createdAt).toLocaleDateString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                }}
              </span>
            </div>

            <div class="flex items-center gap-3">
              <span
                class="text-xs font-bold px-3 py-1 rounded-full"
                :class="statusBadge(order.status).class"
              >
                {{ statusBadge(order.status).text }}
              </span>
            </div>
          </div>

          <!-- Customer & Shipping Info -->
          <div
            class="px-6 py-4 bg-blue-50/30 border-b border-gray-100 text-xs text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <div>
              <span class="text-gray-400 block mb-0.5">Khách hàng:</span>
              <span class="font-bold text-gray-800">{{
                order.customerName
              }}</span>
              ({{ order.customerPhone }})
            </div>
            <div>
              <span class="text-gray-400 block mb-0.5">Địa chỉ nhận hàng:</span>
              <span class="font-medium text-gray-800">{{
                order.shippingAddress
              }}</span>
            </div>
            <div>
              <span class="text-gray-400 block mb-0.5"
                >Phương thức thanh toán:</span
              >
              <span class="font-bold text-gray-800">{{
                order.paymentMethod
              }}</span>
              ({{ order.shippingMethod }})
            </div>
          </div>

          <!-- Order Items -->
          <div class="p-6 divide-y divide-gray-100">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4"
            >
              <div
                class="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-1 shrink-0"
              >
                <img
                  :src="
                    item.product?.images?.[0]?.imageUrl ||
                    'https://placehold.co/100x100?text=SP'
                  "
                  :alt="item.product?.name || 'Sản phẩm'"
                  class="w-full h-full object-contain"
                />
              </div>

              <div class="flex-grow">
                <h4
                  class="font-bold text-xs md:text-sm text-gray-900 line-clamp-1"
                >
                  {{ item.product?.name || `Sản phẩm #${item.productId}` }}
                </h4>
                <div class="text-[11px] text-gray-500 mt-0.5">
                  Số lượng: {{ item.quantity }} ×
                  {{ formatPrice(item.unitPrice) }}
                </div>
              </div>

              <div class="font-bold text-xs md:text-sm text-gray-900 shrink-0">
                {{ formatPrice(item.unitPrice * item.quantity) }}
              </div>
            </div>
          </div>

          <!-- Order Footer Total -->
          <div
            class="bg-gray-50/60 border-t border-gray-200/80 px-6 py-4 flex items-center justify-between text-xs"
          >
            <span class="font-semibold text-gray-600">Tổng thanh toán:</span>
            <span class="text-xl font-black text-[#0052cc]">{{
              formatPrice(order.totalAmount)
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
