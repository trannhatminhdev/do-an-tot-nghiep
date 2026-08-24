<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from '#app';
import { useUserProducts } from '../composables/useUserProducts';
import { useUserCategories } from '../../categories/composables/useUserCategories';
import { useUserCart } from '../../cart/composables/useUserCart';

const route = useRoute();
const router = useRouter();

const { products, total, isLoading, fetchProducts, formatPrice } =
  useUserProducts();
const { categories, fetchCategories } = useUserCategories();
const { addToCart } = useUserCart();

const selectedCategoryId = ref<number | null>(null);
const searchQuery = ref('');
const selectedPriceRange = ref('all');
const sortOption = ref('newest');

const currentPage = ref(1);
const limit = ref(9);

async function loadData() {
  const catIdParam = route.query.categoryId
    ? Number(route.query.categoryId)
    : null;
  const searchParam = (route.query.search as string) || '';
  const pageParam = route.query.page ? Number(route.query.page) : 1;

  selectedCategoryId.value = catIdParam;
  searchQuery.value = searchParam;
  currentPage.value = pageParam;

  await Promise.all([
    fetchProducts({
      categoryId: catIdParam || undefined,
      search: searchParam || undefined,
      skip: (pageParam - 1) * limit.value,
      take: limit.value,
    }),
    categories.value.length === 0 ? fetchCategories() : Promise.resolve(),
  ]);
}

onMounted(() => {
  loadData();
});

watch(
  () => [route.query.categoryId, route.query.search, route.query.page],
  () => {
    loadData();
  },
);

function updateFilter(catId: number | null) {
  selectedCategoryId.value = catId;
  currentPage.value = 1;
  const query: Record<string, string | number> = {};
  if (catId) query.categoryId = catId;
  if (searchQuery.value) query.search = searchQuery.value;
  router.push({ path: '/products', query });
}

function handlePageChange(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;
  const query = { ...route.query, page: newPage };
  router.push({ path: '/products', query });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const totalPages = computed(() => {
  return Math.ceil(total.value / limit.value) || 1;
});

const currentCategoryTitle = computed(() => {
  if (selectedCategoryId.value) {
    const found = categories.value.find(
      (c) => c.id === selectedCategoryId.value,
    );
    if (found) return found.name;
  }
  return 'Tất cả sản phẩm';
});

const displayedProducts = computed(() => {
  let list = [...products.value];

  // Price range filter
  if (selectedPriceRange.value === 'under10') {
    list = list.filter((p) => p.price < 10000000);
  } else if (selectedPriceRange.value === '10to20') {
    list = list.filter((p) => p.price >= 10000000 && p.price <= 20000000);
  } else if (selectedPriceRange.value === 'above20') {
    list = list.filter((p) => p.price > 20000000);
  }

  // Sort
  if (sortOption.value === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sortOption.value === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  }

  return list;
});
</script>

<template>
  <div class="max-w-[1280px] mx-auto px-4 md:px-10 py-6">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 mb-6 text-sm text-gray-500">
      <NuxtLink to="/" class="hover:text-[#0052cc] transition-colors"
        >Trang chủ</NuxtLink
      >
      <span class="material-symbols-outlined text-sm">chevron_right</span>
      <span class="text-gray-900 font-medium capitalize">{{
        currentCategoryTitle
      }}</span>
    </nav>

    <div class="flex flex-col md:flex-row gap-8">
      <!-- Sidebar Filters (Desktop) -->
      <aside class="w-full md:w-64 flex-shrink-0 hidden md:block">
        <div
          class="bg-white border border-gray-200 rounded-3xl p-6 sticky top-28 shadow-sm space-y-6"
        >
          <div
            class="flex items-center justify-between pb-3 border-b border-gray-100"
          >
            <h2 class="text-base font-bold text-gray-900">Bộ lọc</h2>
            <button
              v-if="selectedCategoryId !== null || selectedPriceRange !== 'all'"
              class="text-xs text-[#0052cc] font-semibold hover:underline cursor-pointer"
              @click="
                updateFilter(null);
                selectedPriceRange = 'all';
              "
            >
              Đặt lại
            </button>
          </div>

          <!-- Category Filter -->
          <div>
            <h3
              class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3"
            >
              Danh mục
            </h3>
            <div class="flex flex-col gap-1.5 text-sm">
              <button
                class="text-left py-2 px-3 rounded-xl transition-colors cursor-pointer text-xs font-semibold"
                :class="
                  selectedCategoryId === null
                    ? 'text-[#0052cc] font-bold bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                "
                @click="updateFilter(null)"
              >
                Tất cả sản phẩm
              </button>
              <button
                v-for="cat in categories"
                :key="cat.id"
                class="text-left py-2 px-3 rounded-xl transition-colors cursor-pointer text-xs font-semibold"
                :class="
                  selectedCategoryId === cat.id
                    ? 'text-[#0052cc] font-bold bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                "
                @click="updateFilter(cat.id)"
              >
                {{ cat.name }}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Product Grid -->
      <div class="flex-grow">
        <!-- Header Controls -->
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 class="text-2xl font-black text-gray-900">
              {{ currentCategoryTitle }}
              <span class="text-xs font-normal text-gray-400"
                >({{ total }} sản phẩm)</span
              >
            </h1>
            <p v-if="searchQuery" class="text-xs text-gray-500 mt-1">
              Kết quả tìm kiếm cho:
              <span class="font-bold text-[#0052cc]">"{{ searchQuery }}"</span>
            </p>
          </div>

          <div class="flex items-center gap-3 self-end sm:self-auto">
            <span class="text-xs text-gray-500 hidden sm:inline">Sắp xếp:</span>
            <select
              v-model="sortOption"
              class="border border-gray-200 rounded-xl bg-white text-xs font-semibold py-2 px-3 focus:ring-2 focus:ring-[#0052cc] focus:border-[#0052cc] outline-none cursor-pointer text-gray-900"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-20">
          <span
            class="animate-spin material-symbols-outlined text-4xl text-[#0052cc]"
            >progress_activity</span
          >
        </div>

        <!-- Empty state -->
        <div
          v-else-if="displayedProducts.length === 0"
          class="bg-white rounded-3xl p-12 text-center border border-gray-200 my-4 shadow-sm"
        >
          <span class="material-symbols-outlined text-5xl text-gray-300 mb-3"
            >search_off</span
          >
          <h3 class="text-lg font-bold mb-1 text-gray-900">
            Không tìm thấy sản phẩm phù hợp
          </h3>
          <p class="text-xs text-gray-500 mb-4">
            Vui lòng thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.
          </p>
          <button
            class="bg-[#0052cc] hover:bg-[#0040a2] text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-md transition-colors"
            @click="
              updateFilter(null);
              selectedPriceRange = 'all';
            "
          >
            Làm mới bộ lọc
          </button>
        </div>

        <!-- Grid -->
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
        >
          <div
            v-for="product in displayedProducts"
            :key="product.id"
            class="bg-white border border-gray-200 rounded-3xl p-5 flex flex-col hover:shadow-xl hover:border-[#0052cc]/30 transition-all duration-300 group"
          >
            <!-- Badge & Image -->
            <NuxtLink
              :to="`/products/${product.id}`"
              class="aspect-[4/5] mb-4 overflow-hidden rounded-2xl bg-gray-50 flex items-center justify-center relative cursor-pointer"
            >
              <img
                :src="
                  product.images?.[0]?.imageUrl ||
                  'https://placehold.co/400x400?text=TechPulse'
                "
                :alt="product.name"
                class="object-contain w-full h-full p-4 group-hover:scale-105 transition-transform duration-500"
              />
              <div
                v-if="product.discountPercent"
                class="absolute top-3 left-3 bg-[#ef4444] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm"
              >
                -{{ product.discountPercent }}%
              </div>
              <div
                v-if="product.stock <= 0"
                class="absolute top-3 right-3 bg-gray-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm"
              >
                Hết hàng
              </div>
            </NuxtLink>

            <NuxtLink
              :to="`/products/${product.id}`"
              class="font-bold text-base mb-2 text-gray-900 group-hover:text-[#0052cc] transition-colors line-clamp-2 cursor-pointer"
            >
              {{ product.name }}
            </NuxtLink>

            <!-- Price -->
            <div
              class="mt-auto pt-3 border-t border-gray-100 flex items-end justify-between"
            >
              <div>
                <div class="text-lg font-black text-[#0052cc]">
                  {{ formatPrice(product.price) }}
                </div>
                <div
                  v-if="product.originalPrice"
                  class="text-xs text-gray-400 line-through"
                >
                  {{ formatPrice(product.originalPrice) }}
                </div>
              </div>
            </div>

            <!-- Add to Cart CTA -->
            <button
              :disabled="product.stock <= 0"
              class="mt-4 w-full bg-[#0052cc] hover:bg-[#0040a2] text-white font-bold text-xs py-3 rounded-xl transition-all flex justify-center items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
              @click="addToCart(product)"
            >
              <span class="material-symbols-outlined text-base">{{
                product.stock <= 0 ? 'block' : 'add_shopping_cart'
              }}</span>
              {{ product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ' }}
            </button>
          </div>
        </div>

        <!-- Dynamic Pagination -->
        <div
          v-if="totalPages > 1"
          class="flex justify-center items-center gap-2 border-t border-gray-200 pt-8"
        >
          <button
            :disabled="currentPage === 1"
            class="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl text-gray-600 disabled:opacity-30 cursor-pointer"
            @click="handlePageChange(currentPage - 1)"
          >
            <span class="material-symbols-outlined text-sm">chevron_left</span>
          </button>

          <button
            v-for="p in totalPages"
            :key="p"
            class="w-10 h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="
              currentPage === p
                ? 'bg-[#0052cc] text-white shadow-md'
                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
            "
            @click="handlePageChange(p)"
          >
            {{ p }}
          </button>

          <button
            :disabled="currentPage === totalPages"
            class="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl text-gray-600 disabled:opacity-30 cursor-pointer"
            @click="handlePageChange(currentPage + 1)"
          >
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
