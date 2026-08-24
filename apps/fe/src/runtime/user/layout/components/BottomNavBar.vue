<script setup lang="ts">
import { useRoute } from '#app';
import { useUserCart } from '../../cart/composables/useUserCart';

const route = useRoute();
const { cartCount } = useUserCart();
</script>

<template>
  <nav
    class="md:hidden fixed bottom-0 w-full z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
  >
    <div class="flex justify-around items-center h-16 px-2 pb-safe">
      <!-- Home Tab -->
      <NuxtLink
        to="/"
        class="flex flex-col items-center justify-center rounded-xl px-4 py-1 transition-all duration-200"
        :class="route.path === '/' ? 'text-[#0052cc]' : 'text-gray-500'"
      >
        <span
          class="material-symbols-outlined text-xl"
          :class="{ fill: route.path === '/' }"
          >home</span
        >
        <span class="font-medium text-[11px] mt-0.5">Trang chủ</span>
      </NuxtLink>

      <!-- Category / Catalog Tab -->
      <NuxtLink
        to="/products"
        class="flex flex-col items-center justify-center rounded-xl px-4 py-1 transition-all duration-200"
        :class="
          route.path.startsWith('/products')
            ? 'text-[#0052cc]'
            : 'text-gray-500'
        "
      >
        <span
          class="material-symbols-outlined text-xl"
          :class="{ fill: route.path.startsWith('/products') }"
          >category</span
        >
        <span class="font-medium text-[11px] mt-0.5">Sản phẩm</span>
      </NuxtLink>

      <!-- Orders / Lookup Tab -->
      <NuxtLink
        to="/orders"
        class="flex flex-col items-center justify-center rounded-xl px-4 py-1 transition-all duration-200"
        :class="
          route.path.startsWith('/orders') ? 'text-[#0052cc]' : 'text-gray-500'
        "
      >
        <span
          class="material-symbols-outlined text-xl"
          :class="{ fill: route.path.startsWith('/orders') }"
          >receipt_long</span
        >
        <span class="font-medium text-[11px] mt-0.5">Đơn hàng</span>
      </NuxtLink>

      <!-- Cart Tab -->
      <NuxtLink
        to="/cart"
        class="flex flex-col items-center justify-center rounded-xl px-4 py-1 transition-all duration-200 relative"
        :class="route.path === '/cart' ? 'text-[#0052cc]' : 'text-gray-500'"
      >
        <span
          class="material-symbols-outlined text-xl"
          :class="{ fill: route.path === '/cart' }"
          >shopping_bag</span
        >
        <span class="font-medium text-[11px] mt-0.5">Giỏ hàng</span>
        <span
          v-if="cartCount > 0"
          class="absolute top-1 right-3 bg-[#ef4444] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white"
        >
          {{ cartCount }}
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>
