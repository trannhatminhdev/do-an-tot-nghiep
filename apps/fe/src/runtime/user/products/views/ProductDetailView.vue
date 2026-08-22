<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from '#app';
import { useUserProducts } from '../composables/useUserProducts';
import { useUserReviews } from '../../reviews/composables/useUserReviews';
import { useUserCart } from '../../cart/composables/useUserCart';

const route = useRoute();
const router = useRouter();

const {
  activeProduct,
  isLoading: isProductLoading,
  fetchProductById,
  formatPrice,
} = useUserProducts();
const {
  reviews,
  isLoading: isReviewsLoading,
  fetchReviews,
  addReview,
} = useUserReviews();
const { addToCart } = useUserCart();

const selectedImageIndex = ref(0);
const quantity = ref(1);

// Review Modal State
const isReviewModalOpen = ref(false);
const newRating = ref(5);
const newComment = ref('');
const isSubmittingReview = ref(false);

const productId = computed(() => Number(route.params.id));

async function loadProductData() {
  if (productId.value) {
    await Promise.all([
      fetchProductById(productId.value),
      fetchReviews(productId.value),
    ]);
  }
}

onMounted(() => {
  loadProductData();
});

watch(
  () => route.params.id,
  () => {
    loadProductData();
  },
);

function handleOpenReviewModal() {
  isReviewModalOpen.value = true;
}

async function submitReview() {
  if (newComment.value.trim()) {
    isSubmittingReview.value = true;
    const res = await addReview(
      productId.value,
      newRating.value,
      newComment.value.trim(),
    );
    isSubmittingReview.value = false;
    if (res) {
      isReviewModalOpen.value = false;
      newComment.value = '';
      newRating.value = 5;
    }
  }
}

function handleAddToCart() {
  if (activeProduct.value) {
    addToCart(activeProduct.value, quantity.value);
  }
}

function handleBuyNow() {
  if (activeProduct.value) {
    addToCart(activeProduct.value, quantity.value);
    router.push('/cart');
  }
}
</script>

<template>
  <div class="max-w-[1280px] mx-auto px-4 md:px-10 py-6 pb-24 space-y-10">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs text-gray-500">
      <NuxtLink to="/" class="hover:text-primary transition-colors"
        >Trang chủ</NuxtLink
      >
      <span class="material-symbols-outlined text-xs">chevron_right</span>
      <NuxtLink to="/products" class="hover:text-primary transition-colors"
        >Sản phẩm</NuxtLink
      >
      <span v-if="activeProduct?.category" class="flex items-center gap-2">
        <span class="material-symbols-outlined text-xs">chevron_right</span>
        <NuxtLink
          :to="`/products?categoryId=${activeProduct.category.id}`"
          class="hover:text-primary transition-colors"
        >
          {{ activeProduct.category.name }}
        </NuxtLink>
      </span>
      <span class="material-symbols-outlined text-xs">chevron_right</span>
      <span
        class="text-on-surface font-medium truncate max-w-[200px] md:max-w-none"
      >
        {{ activeProduct?.name || 'Chi tiết' }}
      </span>
    </nav>

    <!-- Loading State -->
    <div
      v-if="isProductLoading && !activeProduct"
      class="flex justify-center items-center py-24"
    >
      <span class="animate-spin material-symbols-outlined text-4xl text-primary"
        >progress_activity</span
      >
    </div>

    <!-- Product Not Found -->
    <div
      v-else-if="!activeProduct"
      class="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-4"
    >
      <span class="material-symbols-outlined text-6xl text-gray-300"
        >inventory_2</span
      >
      <h2 class="text-xl font-bold text-on-surface">Không tìm thấy sản phẩm</h2>
      <p class="text-xs text-gray-500">
        Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.
      </p>
      <NuxtLink
        to="/products"
        class="inline-block bg-primary text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
      >
        Khám phá sản phẩm khác
      </NuxtLink>
    </div>

    <!-- Product Detail Content -->
    <div v-else class="space-y-12">
      <!-- Top Grid: Gallery & Specs -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <!-- Left: Images Gallery -->
        <div class="lg:col-span-6 space-y-4">
          <div
            class="relative bg-white border border-gray-200 rounded-3xl p-8 aspect-square flex items-center justify-center overflow-hidden shadow-sm"
          >
            <img
              :src="
                activeProduct.images?.[selectedImageIndex]?.imageUrl ||
                activeProduct.images?.[0]?.imageUrl ||
                'https://placehold.co/600x600?text=TechPulse'
              "
              :alt="activeProduct.name"
              class="w-full h-full object-contain drop-shadow-lg transition-all duration-300"
            />

            <!-- Badges -->
            <div class="absolute top-4 left-4 flex flex-col gap-2 z-10">
              <span
                v-if="activeProduct.stock > 0"
                class="bg-emerald-500 text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-sm"
              >
                Còn {{ activeProduct.stock }} sản phẩm
              </span>
              <span
                v-else
                class="bg-gray-500 text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-sm"
              >
                Hết hàng
              </span>
            </div>
          </div>

          <!-- Thumbnails switcher -->
          <div
            v-if="(activeProduct.images || []).length > 1"
            class="flex gap-3 overflow-x-auto pb-2"
          >
            <button
              v-for="(img, idx) in activeProduct.images"
              :key="img.id"
              class="w-20 h-20 rounded-2xl bg-white border-2 p-2 flex items-center justify-center overflow-hidden transition-all cursor-pointer flex-shrink-0"
              :class="
                selectedImageIndex === idx
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-gray-200 hover:border-gray-300'
              "
              @click="selectedImageIndex = idx"
            >
              <img
                :src="img.imageUrl"
                :alt="activeProduct.name"
                class="w-full h-full object-contain"
              />
            </button>
          </div>
        </div>

        <!-- Right: Information & Purchase Box -->
        <div class="lg:col-span-6 space-y-6">
          <div>
            <span
              v-if="activeProduct.category"
              class="text-xs font-bold text-primary uppercase tracking-wider block mb-1"
            >
              {{ activeProduct.category.name }}
            </span>
            <h1
              class="text-2xl md:text-3xl font-extrabold text-on-surface leading-tight"
            >
              {{ activeProduct.name }}
            </h1>
            <p
              v-if="activeProduct.description"
              class="text-gray-500 text-xs md:text-sm mt-3 leading-relaxed"
            >
              {{ activeProduct.description }}
            </p>
          </div>

          <!-- Price Display -->
          <div
            class="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex items-baseline gap-4"
          >
            <span class="text-3xl md:text-4xl font-black text-primary">{{
              formatPrice(activeProduct.price)
            }}</span>
            <span
              v-if="activeProduct.originalPrice"
              class="text-sm text-gray-400 line-through"
            >
              {{ formatPrice(activeProduct.originalPrice) }}
            </span>
            <span
              v-if="activeProduct.discountPercent"
              class="bg-error text-white font-bold text-xs px-2.5 py-1 rounded-lg"
            >
              Tiết kiệm {{ activeProduct.discountPercent }}%
            </span>
          </div>

          <!-- Quantity Control -->
          <div class="flex items-center gap-4 pt-2">
            <span class="text-xs font-bold text-gray-700">Số lượng:</span>
            <div
              class="flex items-center bg-gray-50 rounded-xl border border-gray-200"
            >
              <button
                class="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-primary active:bg-gray-200 rounded-l-xl cursor-pointer"
                @click="quantity = Math.max(1, quantity - 1)"
              >
                <span class="material-symbols-outlined text-sm">remove</span>
              </button>
              <span
                class="w-12 text-center font-bold text-sm text-on-surface"
                >{{ quantity }}</span
              >
              <button
                class="w-9 h-9 flex items-center justify-center text-primary active:bg-gray-200 rounded-r-xl cursor-pointer"
                @click="
                  quantity = Math.min(activeProduct.stock || 99, quantity + 1)
                "
              >
                <span class="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              :disabled="activeProduct.stock <= 0"
              class="flex-1 bg-white border-2 border-primary text-primary hover:bg-blue-50 font-bold text-sm py-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              @click="handleAddToCart"
            >
              <span class="material-symbols-outlined text-xl"
                >shopping_cart</span
              >
              Thêm vào giỏ hàng
            </button>
            <button
              :disabled="activeProduct.stock <= 0"
              class="flex-1 bg-primary hover:bg-[#0040a2] text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              @click="handleBuyNow"
            >
              Mua ngay
              <span class="material-symbols-outlined text-xl"
                >arrow_forward</span
              >
            </button>
          </div>

          <!-- Delivery Guarantee Banner -->
          <div
            class="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3.5 text-xs text-gray-600"
          >
            <span class="material-symbols-outlined text-primary text-2xl"
              >local_shipping</span
            >
            <div>
              <div class="font-bold text-gray-800">
                Giao hàng toàn quốc &amp; Đổi trả linh hoạt
              </div>
              <div class="text-gray-400 mt-0.5">
                Cam kết hàng chính hãng 100%, bảo hành theo tiêu chuẩn nhà sản
                xuất.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Technical Specifications (Dynamic from DB) -->
      <section
        v-if="(activeProduct.specifications || []).length > 0"
        class="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm space-y-6"
      >
        <h2 class="text-xl font-bold text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">tune</span>
          Thông số kỹ thuật
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="spec in activeProduct.specifications"
            :key="spec.id"
            class="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center"
          >
            <span
              class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1"
              >{{ spec.specName }}</span
            >
            <span class="text-sm font-bold text-on-surface">{{
              spec.specValue
            }}</span>
          </div>
        </div>
      </section>

      <!-- Reviews Section -->
      <section
        class="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm space-y-6"
      >
        <div
          class="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4"
        >
          <div>
            <h2 class="text-xl font-bold text-on-surface">Đánh giá sản phẩm</h2>
            <p class="text-xs text-gray-500 mt-0.5">
              Nhận xét thực tế từ khách hàng đã trải nghiệm sản phẩm
            </p>
          </div>
          <button
            class="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#0040a2] transition-colors cursor-pointer shadow-md"
            @click="handleOpenReviewModal"
          >
            Viết đánh giá
          </button>
        </div>

        <div v-if="isReviewsLoading" class="flex justify-center py-8">
          <span
            class="animate-spin material-symbols-outlined text-2xl text-primary"
            >progress_activity</span
          >
        </div>

        <div
          v-else-if="reviews.length === 0"
          class="text-center py-8 text-gray-400 space-y-2"
        >
          <span class="material-symbols-outlined text-4xl text-gray-300"
            >rate_review</span
          >
          <p class="text-xs">
            Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh
            giá!
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="rev in reviews"
            :key="rev.id"
            class="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col gap-2"
          >
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs"
                >
                  {{ (rev.user?.fullName || 'K').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="text-xs font-bold text-on-surface">
                    {{ rev.user?.fullName || 'Khách hàng' }}
                  </div>
                  <div class="text-[11px] text-gray-400">
                    {{ new Date(rev.createdAt).toLocaleDateString('vi-VN') }}
                  </div>
                </div>
              </div>

              <div class="flex text-[#FFB020]">
                <span
                  v-for="s in 5"
                  :key="s"
                  class="material-symbols-outlined text-base fill"
                >
                  {{ s <= rev.rating ? 'star' : 'star_border' }}
                </span>
              </div>
            </div>

            <p class="text-xs text-gray-700 leading-relaxed mt-1">
              {{ rev.comment }}
            </p>

            <div
              v-if="rev.adminReply"
              class="bg-blue-50 border border-blue-100 p-3 rounded-xl mt-2 text-xs"
            >
              <span class="font-bold text-primary block mb-0.5"
                >Phản hồi từ TechPulse:</span
              >
              <p class="text-gray-600">{{ rev.adminReply }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Write Review Modal -->
      <div
        v-if="isReviewModalOpen"
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div
          class="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4"
        >
          <div
            class="flex justify-between items-center border-b border-gray-100 pb-3"
          >
            <h3 class="text-base font-bold">Đánh giá sản phẩm</h3>
            <button
              class="text-gray-400 hover:text-gray-700 cursor-pointer"
              @click="isReviewModalOpen = false"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1"
                >Mức độ hài lòng</label
              >
              <div class="flex gap-2 text-[#FFB020] cursor-pointer">
                <button
                  v-for="s in 5"
                  :key="s"
                  type="button"
                  class="material-symbols-outlined text-3xl focus:outline-none"
                  :class="{ fill: s <= newRating }"
                  @click="newRating = s"
                >
                  star
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1"
                >Nhận xét của bạn</label
              >
              <textarea
                v-model="newComment"
                rows="3"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-primary focus:bg-white transition-colors"
              ></textarea>
            </div>
          </div>

          <button
            :disabled="isSubmittingReview || !newComment.trim()"
            class="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-[#0040a2] transition-colors cursor-pointer shadow-md disabled:opacity-40 text-xs flex items-center justify-center gap-2"
            @click="submitReview"
          >
            <span
              v-if="isSubmittingReview"
              class="animate-spin material-symbols-outlined text-sm"
              >progress_activity</span
            >
            <span>{{
              isSubmittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
