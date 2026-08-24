<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from '#app';
import { useUserCart } from '../../cart/composables/useUserCart';
import { useUserCategories } from '../../categories/composables/useUserCategories';

const router = useRouter();
const { cartCount } = useUserCart();
const { categories, fetchCategories } = useUserCategories();

const isMobileMenuOpen = ref(false);
const searchQuery = ref('');

onMounted(async () => {
  if (categories.value.length === 0) {
    await fetchCategories();
  }
});

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push(
      `/products?search=${encodeURIComponent(searchQuery.value.trim())}`,
    );
  } else {
    router.push('/products');
  }
  isMobileMenuOpen.value = false;
}

function handleCategoryClick(categoryId?: number) {
  if (categoryId) {
    router.push(`/products?categoryId=${categoryId}`);
  } else {
    router.push('/products');
  }
  isMobileMenuOpen.value = false;
}
</script>

<template>
  <header
    class="bg-white/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-gray-100 fixed top-0 w-full z-50 transition-all duration-300"
  >
    <div
      class="flex items-center justify-between px-4 md:px-10 h-20 max-w-[1280px] mx-auto w-full gap-4 md:gap-8"
    >
      <!-- Mobile Menu Toggle -->
      <button
        class="lg:hidden text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="Toggle Menu"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <span class="material-symbols-outlined">{{
          isMobileMenuOpen ? 'close' : 'menu'
        }}</span>
      </button>

      <!-- Brand Logo -->
      <NuxtLink to="/" class="flex items-center flex-shrink-0 cursor-pointer">
        <span
          class="text-2xl font-black text-[#0052cc] bg-clip-text bg-gradient-to-r from-[#0052cc] to-[#0ea5e9]"
        >
          TechPulse<span class="text-[#0ea5e9]">.</span>
        </span>
      </NuxtLink>

      <!-- Search Bar (Desktop) -->
      <div class="flex-grow max-w-md hidden md:block">
        <form
          class="flex items-center border border-gray-200 rounded-full px-4 py-2 bg-gray-50/80 focus-within:ring-2 focus-within:ring-[#0052cc]/20 focus-within:border-[#0052cc] focus-within:bg-white transition-all"
          @submit.prevent="handleSearch"
        >
          <span class="material-symbols-outlined text-gray-400 mr-2 text-lg"
            >search</span
          >
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            class="bg-transparent border-none focus:outline-none text-sm w-full text-gray-900 placeholder:text-gray-400"
          />
        </form>
      </div>

      <!-- Desktop Nav Links (Dynamic Categories) -->
      <nav class="hidden lg:flex items-center gap-6 flex-shrink-0">
        <NuxtLink
          to="/products"
          class="font-semibold text-sm text-gray-700 hover:text-[#0052cc] transition-colors"
          active-class="text-[#0052cc] font-bold"
        >
          Tất cả
        </NuxtLink>
        <button
          v-for="cat in categories.slice(0, 5)"
          :key="cat.id"
          class="font-semibold text-sm text-gray-700 hover:text-[#0052cc] transition-colors cursor-pointer"
          @click="handleCategoryClick(cat.id)"
        >
          {{ cat.name }}
        </button>
      </nav>

      <!-- Right Controls -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <!-- Order Lookup Button -->
        <NuxtLink
          to="/orders"
          class="p-2 text-gray-700 hover:text-[#0052cc] transition-colors rounded-full hover:bg-gray-100 relative cursor-pointer flex items-center justify-center"
          aria-label="Tra cứu đơn hàng"
          title="Tra cứu đơn hàng"
        >
          <span class="material-symbols-outlined">receipt_long</span>
        </NuxtLink>

        <!-- Cart Button -->
        <NuxtLink
          to="/cart"
          class="p-2 text-gray-700 hover:text-[#0052cc] transition-colors rounded-full hover:bg-gray-100 relative cursor-pointer flex items-center justify-center"
          aria-label="Giỏ hàng"
          title="Giỏ hàng"
        >
          <span class="material-symbols-outlined">shopping_cart</span>
          <span
            v-if="cartCount > 0"
            class="absolute top-0 right-0 bg-[#ef4444] text-white font-bold text-[10px] rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm"
          >
            {{ cartCount }}
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div
      v-if="isMobileMenuOpen"
      class="lg:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 py-4 space-y-4 shadow-lg"
    >
      <form @submit.prevent="handleSearch">
        <div
          class="flex items-center border border-gray-200 rounded-full px-4 py-2 bg-gray-50"
        >
          <span class="material-symbols-outlined text-gray-400 mr-2"
            >search</span
          >
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            class="bg-transparent border-none focus:outline-none text-sm w-full text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </form>

      <div class="flex flex-col space-y-1">
        <button
          class="text-left py-2.5 px-3 rounded-xl font-semibold text-xs text-gray-700 hover:bg-blue-50 hover:text-[#0052cc] transition-colors"
          @click="handleCategoryClick()"
        >
          Tất cả sản phẩm
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="text-left py-2.5 px-3 rounded-xl font-semibold text-xs text-gray-700 hover:bg-blue-50 hover:text-[#0052cc] transition-colors"
          @click="handleCategoryClick(cat.id)"
        >
          {{ cat.name }}
        </button>
        <NuxtLink
          to="/orders"
          class="text-left py-2.5 px-3 rounded-xl font-semibold text-xs text-gray-700 hover:bg-blue-50 hover:text-[#0052cc] transition-colors flex items-center gap-2"
          @click="isMobileMenuOpen = false"
        >
          <span class="material-symbols-outlined text-base">receipt_long</span>
          <span>Tra cứu đơn hàng</span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
