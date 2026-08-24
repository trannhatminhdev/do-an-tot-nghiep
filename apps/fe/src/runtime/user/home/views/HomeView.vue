<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useUserProducts } from '../../products/composables/useUserProducts';
import { useUserCategories } from '../../categories/composables/useUserCategories';
import { useUserCart } from '../../cart/composables/useUserCart';

const { products, fetchProducts, formatPrice, isLoading } = useUserProducts();
const { categories, fetchCategories } = useUserCategories();
const { addToCart } = useUserCart();

const wishlist = ref<number[]>([]);
function toggleWishlist(id: number) {
  const idx = wishlist.value.indexOf(id);
  if (idx > -1) {
    wishlist.value.splice(idx, 1);
  } else {
    wishlist.value.push(id);
  }
}
function isWishlisted(id: number) {
  return wishlist.value.includes(id);
}

const activeSlide = ref(0);
let slideTimer: ReturnType<typeof setInterval> | null = null;

const slides = [
  {
    badge: 'Sản Phẩm Cao Cấp',
    title: 'Đỉnh Cao Công Nghệ',
    highlight: 'Trải Nghiệm Đột Phá',
    desc: 'Hiệu năng vượt trội, chuẩn mực thiết kế tối giản và trải nghiệm số mượt mà cho mọi tác vụ công việc và giải trí.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCXhNzgIlteJAcZ2655Fy1etb3lEc9Xs5_K1a76AOA451NoG9CSi9ZsgBNNTf3vBYjGtjhTuBiRSIa9S_s24LHqzJWVky4BCuvIvoaEyQphk6D9C8CXYKUfoAVRh8DxEk5ykR4ZUvls2w1CDdD7sWEPo-FSnOXwIB5HpqJGOjTqTgrBssd7hlzrFASuJCRowThiPy6qOFpsRF9siFkI8ezM0qM3ygpiAeujB45FLhOOYxDLZ7vnxqwV',
  },
  {
    badge: 'Siêu Phẩm Mới',
    title: 'Thế Hệ Tiếp Theo',
    highlight: 'Thiết Kế Hoàn Mỹ',
    desc: 'Khung viền tinh tế, camera chuyên nghiệp cùng vi xử lý thế hệ mới đưa mọi trải nghiệm lên tầm cao mới.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASw8BkocfZMui0ob8HfodwA4j9rbLE_e-BYTcPLTml8X17i45NTR6Gp7mctCy9olcjqF2Zq__4pX7uhzcmJRdJcZnav_mYR54aWgaDzQZNsI5Hp4xn58ibHygNlbOM7aMR8o5BxYh9YzJ_bOyoFglI7R18zFuQ5IcsDqsJBWfRUB803fSTHLsEH0OfNCKgpuQ90SD6uSbD5BBFWs-wGComROrRMdgadwHAcGXFdGJmH3oiauQhExST',
  },
];

const currentSlide = computed(() => {
  return slides[activeSlide.value] || slides[0]!;
});

onMounted(async () => {
  if (products.value.length === 0) {
    await fetchProducts({ take: 12 });
  }
  if (categories.value.length === 0) {
    await fetchCategories();
  }

  slideTimer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.length;
  }, 6000);
});

onUnmounted(() => {
  if (slideTimer) clearInterval(slideTimer);
});

const featuredProducts = computed(() => {
  return products.value.slice(0, 8);
});

const discountedProducts = computed(() => {
  return products.value.filter(
    (p) => p.discountPercent && p.discountPercent > 0,
  );
});
</script>

<template>
  <div class="space-y-12 max-w-[1280px] mx-auto px-4 md:px-10">
    <!-- Hero Section -->
    <section
      class="relative w-full min-h-[70vh] flex items-center pt-8 overflow-hidden bg-[#0B1120] rounded-3xl mt-4 shadow-xl"
    >
      <div
        class="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-luminosity scale-105 transition-all duration-1000"
        :style="{
          backgroundImage: `url(${currentSlide.image})`,
          backgroundPosition: 'right center',
        }"
      ></div>
      <div
        class="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/80 to-transparent"
      ></div>
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,82,204,0.3),_transparent_40%)]"
      ></div>

      <div
        class="relative z-10 max-w-[1280px] mx-auto px-6 md:px-12 w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-12"
      >
        <div
          class="md:col-span-8 lg:col-span-7 bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl"
        >
          <div
            class="inline-flex items-center space-x-2 px-4 py-1.5 bg-[#0052cc]/30 border border-[#0052cc]/40 rounded-full mb-6"
          >
            <span
              class="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse"
            ></span>
            <span
              class="text-white text-xs tracking-widest uppercase font-bold"
              >{{ currentSlide.badge }}</span
            >
          </div>

          <h1
            class="text-3xl md:text-5xl font-black text-white mb-4 leading-tight"
          >
            {{ currentSlide.title }}<br />
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#3b82f6]"
            >
              {{ currentSlide.highlight }}
            </span>
          </h1>

          <p
            class="text-gray-300 text-sm md:text-base mb-8 max-w-lg leading-relaxed"
          >
            {{ currentSlide.desc }}
          </p>

          <div class="flex flex-wrap gap-4">
            <NuxtLink
              to="/products"
              class="bg-[#0052cc] text-white font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-[#0040a2] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,82,204,0.3)] transition-all flex items-center group cursor-pointer shadow-md"
            >
              Khám Phá Ngay
              <span
                class="material-symbols-outlined ml-2 text-sm group-hover:translate-x-1 transition-transform"
                >arrow_forward</span
              >
            </NuxtLink>
          </div>

          <!-- Slide dots -->
          <div class="flex gap-2 mt-8">
            <button
              v-for="(slide, idx) in slides"
              :key="idx"
              class="h-2 rounded-full transition-all cursor-pointer"
              :class="
                activeSlide === idx ? 'w-8 bg-[#0ea5e9]' : 'w-2 bg-white/40'
              "
              @click="activeSlide = idx"
            ></button>
          </div>
        </div>
      </div>
    </section>

    <!-- Dynamic Category Quick Links -->
    <section v-if="categories.length > 0">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Danh Mục Nổi Bật</h2>
        <NuxtLink
          to="/products"
          class="text-sm font-semibold text-[#0052cc] hover:underline flex items-center"
        >
          Xem tất cả
          <span class="material-symbols-outlined text-base">chevron_right</span>
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/products?categoryId=${cat.id}`"
          class="bg-white rounded-2xl p-5 flex flex-col items-center justify-center h-36 shadow-sm border border-gray-100 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#0052cc]/30 transition-all duration-300 group cursor-pointer"
        >
          <div
            class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-2.5 group-hover:bg-[#0052cc] group-hover:text-white text-[#0052cc] transition-colors duration-300"
          >
            <span class="material-symbols-outlined text-2xl">category</span>
          </div>
          <span
            class="font-bold text-xs text-gray-800 text-center group-hover:text-[#0052cc] transition-colors line-clamp-1"
          >
            {{ cat.name }}
          </span>
        </NuxtLink>
      </div>
    </section>

    <!-- Limited Offers / Discounted Products -->
    <section v-if="discountedProducts.length > 0">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <span class="material-symbols-outlined text-[#ef4444] fill"
            >local_fire_department</span
          >
          Ưu đãi giới hạn
        </h3>
        <NuxtLink
          to="/products"
          class="text-sm font-semibold text-[#0052cc] hover:underline flex items-center"
        >
          Xem tất cả
          <span class="material-symbols-outlined text-base">chevron_right</span>
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="product in discountedProducts.slice(0, 4)"
          :key="product.id"
          class="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group"
        >
          <!-- Favorite button -->
          <button
            class="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#ef4444] bg-gray-50/80 rounded-full z-10 cursor-pointer"
            @click="toggleWishlist(product.id)"
          >
            <span
              class="material-symbols-outlined text-lg"
              :class="{
                fill: isWishlisted(product.id),
                'text-[#ef4444]': isWishlisted(product.id),
              }"
            >
              favorite
            </span>
          </button>

          <!-- Discount badge -->
          <div
            v-if="product.discountPercent"
            class="absolute top-4 left-4 bg-[#ef4444] text-white font-bold text-xs px-2.5 py-1 rounded-md z-10 shadow-sm"
          >
            -{{ product.discountPercent }}%
          </div>

          <!-- Product Image -->
          <NuxtLink
            :to="`/products/${product.id}`"
            class="aspect-[4/3] bg-gray-50 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center cursor-pointer p-3"
          >
            <img
              :src="
                product.images?.[0]?.imageUrl ||
                'https://placehold.co/400x300?text=TechPulse'
              "
              :alt="product.name"
              class="w-[85%] h-[85%] object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
            />
          </NuxtLink>

          <!-- Title -->
          <NuxtLink
            :to="`/products/${product.id}`"
            class="font-semibold text-base line-clamp-2 mb-2 group-hover:text-[#0052cc] transition-colors cursor-pointer text-gray-900"
          >
            {{ product.name }}
          </NuxtLink>

          <!-- Price & Discount -->
          <div class="mt-auto pt-3 border-t border-gray-100">
            <div class="flex items-baseline gap-2 mb-3">
              <span class="text-xl font-bold text-[#0052cc]">{{
                formatPrice(product.price)
              }}</span>
              <span
                v-if="product.originalPrice"
                class="text-xs text-gray-400 line-through"
              >
                {{ formatPrice(product.originalPrice) }}
              </span>
            </div>

            <button
              class="w-full bg-[#0052cc] hover:bg-[#0040a2] text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              @click="addToCart(product)"
            >
              <span class="material-symbols-outlined text-base"
                >add_shopping_cart</span
              >
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured / New Products Grid -->
    <section>
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold text-gray-900">Sản phẩm nổi bật</h3>
        <NuxtLink
          to="/products"
          class="text-sm font-semibold text-[#0052cc] hover:underline"
        >
          Xem tất cả
        </NuxtLink>
      </div>

      <div
        v-if="isLoading && products.length === 0"
        class="flex justify-center py-12"
      >
        <span
          class="animate-spin material-symbols-outlined text-3xl text-[#0052cc]"
          >progress_activity</span
        >
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div
          v-for="product in featuredProducts"
          :key="product.id"
          class="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col hover:shadow-md transition-all group"
        >
          <NuxtLink
            :to="`/products/${product.id}`"
            class="h-36 bg-gray-50 rounded-xl relative flex items-center justify-center p-3 mb-3 cursor-pointer"
          >
            <img
              :src="
                product.images?.[0]?.imageUrl ||
                'https://placehold.co/300x300?text=TechPulse'
              "
              :alt="product.name"
              class="w-full h-full object-contain group-hover:scale-105 transition-transform"
            />
          </NuxtLink>

          <NuxtLink
            :to="`/products/${product.id}`"
            class="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-[#0052cc]"
          >
            {{ product.name }}
          </NuxtLink>

          <div class="mt-auto flex items-center justify-between pt-2">
            <span class="text-base font-bold text-[#0052cc]">{{
              formatPrice(product.price)
            }}</span>
            <button
              class="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-[#0052cc] hover:text-white transition-colors cursor-pointer"
              title="Thêm vào giỏ"
              @click="addToCart(product)"
            >
              <span class="material-symbols-outlined text-base">add</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
