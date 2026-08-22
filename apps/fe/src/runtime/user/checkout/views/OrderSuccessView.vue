<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from '#app';

const route = useRoute();

const rawOrderId = computed(() => {
  return (route.query.orderId as string) || '';
});

const orderId = computed(() => {
  return rawOrderId.value ? `#${rawOrderId.value}` : 'Đã ghi nhận';
});
</script>

<template>
  <div class="max-w-xl mx-auto px-4 py-16 pb-28 text-center space-y-6">
    <!-- Success Icon Animation -->
    <div
      class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce"
    >
      <span class="material-symbols-outlined text-4xl font-bold"
        >check_circle</span
      >
    </div>

    <div class="space-y-2">
      <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900">
        Đặt Hàng Thành Công!
      </h1>
      <p class="text-gray-500 text-xs md:text-sm">
        Cảm ơn bạn đã tin tưởng mua sắm tại TechPulse. Mã đơn hàng của bạn là
        <span class="font-black text-[#0052cc]">{{ orderId }}</span
        >.
      </p>
    </div>

    <!-- Info Box -->
    <div
      class="bg-white rounded-3xl border border-gray-200 p-6 text-left space-y-3 text-xs text-gray-600 shadow-sm"
    >
      <div
        class="flex items-center gap-2 font-bold text-gray-800 border-b border-gray-100 pb-2.5"
      >
        <span class="material-symbols-outlined text-[#0052cc] text-lg"
          >local_shipping</span
        >
        <span>Thông tin giao hàng &amp; xử lý</span>
      </div>
      <p>• Đơn hàng đang được hệ thống tiếp nhận và chuẩn bị đóng gói.</p>
      <p>
        • Nhân viên hỗ trợ có thể liên hệ với bạn để xác nhận thông tin đơn hàng
        trước khi gửi.
      </p>
      <p>
        • Bạn có thể tra cứu tình trạng đơn bất kỳ lúc nào bằng mã đơn hàng hoặc
        số điện thoại.
      </p>
    </div>

    <!-- CTAs -->
    <div class="flex flex-col sm:flex-row gap-3 justify-center pt-4">
      <NuxtLink
        v-if="rawOrderId"
        :to="`/orders?search=${rawOrderId}`"
        class="bg-[#0052cc] text-white font-bold text-xs px-7 py-3.5 rounded-xl hover:bg-[#0040a2] transition-colors cursor-pointer shadow-md"
      >
        Theo dõi đơn hàng này
      </NuxtLink>
      <NuxtLink
        to="/products"
        class="bg-gray-100 text-gray-700 font-bold text-xs px-7 py-3.5 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
      >
        Tiếp tục mua sắm
      </NuxtLink>
    </div>
  </div>
</template>
