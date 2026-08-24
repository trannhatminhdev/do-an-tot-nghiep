<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from '#app';
import { useToast } from '#fe/core/composables/useToast';
import { useUserProducts } from '../composables/useUserProducts';
import { useUserReviews } from '../../reviews/composables/useUserReviews';
import { useUserCart } from '../../cart/composables/useUserCart';

const route = useRoute();
const router = useRouter();
const toast = useToast();

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
const reviewerPhone = ref('');
const reviewerName = ref('');
const newRating = ref(5);
const hoverRating = ref(0);
const newComment = ref('');
const isSubmittingReview = ref(false);

const ratingLabels: Record<number, string> = {
  1: '1 sao - Rất tệ',
  2: '2 sao - Chưa hài lòng',
  3: '3 sao - Bình thường',
  4: '4 sao - Hài lòng',
  5: '5 sao - Tuyệt vời',
};

const productId = computed(() => Number(route.params.id));

const averageRating = computed(() => {
  if (!reviews.value || reviews.value.length === 0) return 5.0;
  const totalStars = reviews.value.reduce((sum, r) => sum + r.rating, 0);
  return totalStars / reviews.value.length;
});

const ratingCounts = computed(() => {
  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (!reviews.value) return counts;
  for (const rev of reviews.value) {
    if (rev.rating in counts) {
      counts[rev.rating] = (counts[rev.rating] ?? 0) + 1;
    }
  }
  return counts;
});

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
  if (!reviewerPhone.value.trim()) {
    toast.error('Vui lòng nhập số điện thoại đã đặt mua hàng.');
    return;
  }

  isSubmittingReview.value = true;
  const res = await addReview({
    productId: productId.value,
    phone: reviewerPhone.value.trim(),
    fullName: reviewerName.value.trim() || undefined,
    rating: newRating.value,
    comment: newComment.value.trim() || undefined,
  });
  isSubmittingReview.value = false;
  if (res) {
    isReviewModalOpen.value = false;
    newComment.value = '';
    reviewerPhone.value = '';
    reviewerName.value = '';
    newRating.value = 5;
  }
}

function handleAddToCart() {
  if (activeProduct.value) {
    addToCart(activeProduct.value, quantity.value);
  }
}

function handleBuyNow() {
  if (activeProduct.value) {
    const success = addToCart(activeProduct.value, quantity.value);
    if (success) {
      router.push('/cart');
    }
  }
}
</script>

<template>
  <div class="max-w-[1280px] mx-auto px-4 md:px-10 py-6 pb-24 space-y-10">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs text-gray-500">
      <NuxtLink to="/" class="hover:text-[#0052cc] transition-colors"
        >Trang chủ</NuxtLink
      >
      <span class="material-symbols-outlined text-xs">chevron_right</span>
      <NuxtLink to="/products" class="hover:text-[#0052cc] transition-colors"
        >Sản phẩm</NuxtLink
      >
      <span v-if="activeProduct?.category" class="flex items-center gap-2">
        <span class="material-symbols-outlined text-xs">chevron_right</span>
        <NuxtLink
          :to="`/products?categoryId=${activeProduct.category.id}`"
          class="hover:text-[#0052cc] transition-colors"
        >
          {{ activeProduct.category.name }}
        </NuxtLink>
      </span>
      <span class="material-symbols-outlined text-xs">chevron_right</span>
      <span
        class="text-gray-900 font-medium truncate max-w-[200px] md:max-w-none"
      >
        {{ activeProduct?.name || 'Chi tiết' }}
      </span>
    </nav>

    <!-- Loading State -->
    <div
      v-if="isProductLoading && !activeProduct"
      class="flex justify-center items-center py-24"
    >
      <span
        class="animate-spin material-symbols-outlined text-4xl text-[#0052cc]"
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
      <h2 class="text-xl font-bold text-gray-900">Không tìm thấy sản phẩm</h2>
      <p class="text-xs text-gray-500">
        Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.
      </p>
      <NuxtLink
        to="/products"
        class="inline-block bg-[#0052cc] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md hover:bg-[#0040a2] transition-colors"
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
                  ? 'border-[#0052cc] ring-2 ring-[#0052cc]/20'
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
              class="text-xs font-bold text-[#0052cc] uppercase tracking-wider block mb-1"
            >
              {{ activeProduct.category.name }}
            </span>
            <h1
              class="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight"
            >
              {{ activeProduct.name }}
            </h1>

            <!-- Product Rating Summary -->
            <div class="flex items-center gap-3 mt-2.5 flex-wrap">
              <div class="flex items-center gap-1.5">
                <div class="flex text-amber-400">
                  <span
                    v-for="s in 5"
                    :key="s"
                    class="material-symbols-outlined text-lg"
                    :class="
                      s <= Math.round(averageRating)
                        ? 'fill text-amber-400'
                        : 'text-gray-300'
                    "
                  >
                    star
                  </span>
                </div>
                <span class="text-xs font-bold text-gray-900">
                  {{ reviews.length > 0 ? averageRating.toFixed(1) : '5.0' }}
                </span>
              </div>
              <span class="text-gray-300 text-xs">•</span>
              <a
                href="#reviews-section"
                class="text-xs text-gray-500 hover:text-[#0052cc] transition-colors"
              >
                {{ reviews.length }} đánh giá
              </a>
              <span class="text-gray-300 text-xs">•</span>
              <span
                class="text-xs text-emerald-600 font-medium flex items-center gap-1"
              >
                <span
                  class="material-symbols-outlined text-xs fill text-emerald-600"
                  >verified</span
                >
                Chính hãng
              </span>
            </div>

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
            <span class="text-3xl md:text-4xl font-black text-[#0052cc]">{{
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
              class="bg-[#ef4444] text-white font-bold text-xs px-2.5 py-1 rounded-lg"
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
                :disabled="activeProduct.stock <= 0 || quantity <= 1"
                class="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-[#0052cc] active:bg-gray-200 rounded-l-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                @click="quantity = Math.max(1, quantity - 1)"
              >
                <span class="material-symbols-outlined text-sm">remove</span>
              </button>
              <span class="w-12 text-center font-bold text-sm text-gray-900">{{
                activeProduct.stock <= 0 ? 0 : quantity
              }}</span>
              <button
                :disabled="
                  activeProduct.stock <= 0 || quantity >= activeProduct.stock
                "
                class="w-9 h-9 flex items-center justify-center text-[#0052cc] active:bg-gray-200 rounded-r-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                @click="quantity = Math.min(activeProduct.stock, quantity + 1)"
              >
                <span class="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            <span
              v-if="activeProduct.stock > 0"
              class="text-xs text-gray-500 font-medium"
            >
              (Còn {{ activeProduct.stock }} sản phẩm)
            </span>
            <span v-else class="text-xs font-bold text-red-500">
              (Hết hàng)
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              :disabled="activeProduct.stock <= 0"
              class="flex-1 bg-white border-2 border-[#0052cc] text-[#0052cc] hover:bg-blue-50 font-bold text-sm py-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
              @click="handleAddToCart"
            >
              <span class="material-symbols-outlined text-xl">{{
                activeProduct.stock <= 0 ? 'block' : 'shopping_cart'
              }}</span>
              {{ activeProduct.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng' }}
            </button>
            <button
              :disabled="activeProduct.stock <= 0"
              class="flex-1 bg-[#0052cc] hover:bg-[#0040a2] text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              @click="handleBuyNow"
            >
              {{ activeProduct.stock <= 0 ? 'Hết hàng' : 'Mua ngay' }}
              <span
                v-if="activeProduct.stock > 0"
                class="material-symbols-outlined text-xl"
                >arrow_forward</span
              >
            </button>
          </div>

          <!-- Delivery Guarantee Banner -->
          <div
            class="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3.5 text-xs text-gray-600"
          >
            <span class="material-symbols-outlined text-[#0052cc] text-2xl"
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
        <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span class="material-symbols-outlined text-[#0052cc]">tune</span>
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
            <span class="text-sm font-bold text-gray-900">{{
              spec.specValue
            }}</span>
          </div>
        </div>
      </section>

      <!-- Reviews Section -->
      <section
        id="reviews-section"
        class="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm space-y-6 scroll-mt-24"
      >
        <div
          class="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4"
        >
          <div>
            <h2 class="text-xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
            <p class="text-xs text-gray-500 mt-0.5">
              Nhận xét thực tế từ khách hàng đã trải nghiệm sản phẩm
            </p>
          </div>
          <button
            class="bg-[#0052cc] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#0040a2] transition-colors cursor-pointer shadow-md"
            @click="handleOpenReviewModal"
          >
            Viết đánh giá
          </button>
        </div>

        <!-- Rating Summary Box (when reviews exist) -->
        <div
          v-if="reviews.length > 0"
          class="bg-blue-50/40 border border-blue-100/80 rounded-2xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
        >
          <!-- Left: Big score -->
          <div
            class="md:col-span-4 text-center md:text-left flex flex-col items-center md:items-start justify-center"
          >
            <div class="flex items-baseline gap-1.5">
              <span class="text-4xl font-black text-[#0052cc]">
                {{ averageRating.toFixed(1) }}
              </span>
              <span class="text-base text-gray-400 font-medium">/ 5</span>
            </div>
            <div class="flex text-amber-400 my-1.5">
              <span
                v-for="s in 5"
                :key="s"
                class="material-symbols-outlined text-xl"
                :class="
                  s <= Math.round(averageRating)
                    ? 'fill text-amber-400'
                    : 'text-gray-300'
                "
              >
                star
              </span>
            </div>
            <p class="text-xs text-gray-500">
              Dựa trên
              <span class="font-bold text-gray-800">{{ reviews.length }}</span>
              lượt đánh giá
            </p>
          </div>

          <!-- Right: Star breakdown progress bars -->
          <div
            class="md:col-span-8 space-y-2 border-t md:border-t-0 md:border-l border-blue-100/80 pt-4 md:pt-0 md:pl-6"
          >
            <div
              v-for="star in [5, 4, 3, 2, 1]"
              :key="star"
              class="flex items-center gap-3 text-xs"
            >
              <div
                class="flex items-center gap-1 w-12 font-medium text-gray-700 shrink-0"
              >
                <span>{{ star }}</span>
                <span
                  class="material-symbols-outlined text-sm fill text-amber-400"
                  >star</span
                >
              </div>
              <div
                class="flex-grow h-2.5 bg-gray-200 rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-amber-400 rounded-full transition-all duration-500"
                  :style="{
                    width: `${reviews.length > 0 ? ((ratingCounts[star] ?? 0) / reviews.length) * 100 : 0}%`,
                  }"
                />
              </div>
              <span class="w-8 text-right text-[11px] text-gray-500 shrink-0">
                {{ ratingCounts[star] ?? 0 }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="isReviewsLoading" class="flex justify-center py-8">
          <span
            class="animate-spin material-symbols-outlined text-2xl text-[#0052cc]"
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
                  class="w-9 h-9 rounded-full bg-blue-100 text-[#0052cc] font-bold flex items-center justify-center text-xs"
                >
                  {{
                    (rev.user?.fullName || rev.customerName || 'K')
                      .charAt(0)
                      .toUpperCase()
                  }}
                </div>
                <div>
                  <div class="text-xs font-bold text-gray-900">
                    {{ rev.user?.fullName || rev.customerName || 'Khách hàng' }}
                  </div>
                  <div class="text-[11px] text-gray-400">
                    {{ new Date(rev.createdAt).toLocaleDateString('vi-VN') }}
                  </div>
                </div>
              </div>

              <!-- Review Star Rating -->
              <div class="flex items-center gap-0.5">
                <span
                  v-for="s in 5"
                  :key="s"
                  class="material-symbols-outlined text-base"
                  :class="
                    s <= rev.rating ? 'fill text-amber-400' : 'text-gray-300'
                  "
                >
                  star
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
              <span class="font-bold text-[#0052cc] block mb-0.5"
                >Phản hồi từ TechPulse:</span
              >
              <p class="text-gray-600">{{ rev.adminReply }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Write Review Modal -->
      <Teleport to="body">
        <div
          v-if="isReviewModalOpen"
          class="fixed inset-0 z-[99] flex items-center justify-center p-4"
        >
          <!-- Backdrop Overlay -->
          <div
            class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            @click="isReviewModalOpen = false"
          />

          <!-- Modal Dialog Content -->
          <div
            class="relative bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4 z-10"
          >
            <div
              class="flex justify-between items-center border-b border-gray-100 pb-3"
            >
              <h3 class="text-base font-bold text-gray-900">
                Đánh giá sản phẩm
              </h3>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-700 cursor-pointer"
                @click="isReviewModalOpen = false"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">
                  Số điện thoại mua hàng <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="reviewerPhone"
                  type="tel"
                  placeholder="Nhập số điện thoại đã đặt mua hàng..."
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#0052cc] focus:bg-white transition-colors text-gray-900"
                />
                <p class="text-[11px] text-gray-400 mt-1">
                  * Chỉ khách hàng đã mua sản phẩm này mới được đánh giá (1 lần
                  / mỗi lần mua).
                </p>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">
                  Họ và tên của bạn
                </label>
                <input
                  v-model="reviewerName"
                  type="text"
                  placeholder="Nhập họ và tên hiển thị (tuỳ chọn)..."
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#0052cc] focus:bg-white transition-colors text-gray-900"
                />
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-bold text-gray-700">
                    Mức độ hài lòng <span class="text-red-500">*</span>
                  </label>
                  <span class="text-xs font-semibold text-amber-600">
                    {{ ratingLabels[hoverRating || newRating] }}
                  </span>
                </div>
                <div
                  class="flex items-center gap-1 py-1"
                  @mouseleave="hoverRating = 0"
                >
                  <button
                    v-for="s in 5"
                    :key="s"
                    type="button"
                    class="material-symbols-outlined text-3xl focus:outline-none cursor-pointer transition-transform hover:scale-110"
                    :class="
                      s <= (hoverRating || newRating)
                        ? 'fill text-amber-400'
                        : 'text-gray-300'
                    "
                    @mouseenter="hoverRating = s"
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
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#0052cc] focus:bg-white transition-colors text-gray-900"
                ></textarea>
              </div>
            </div>

            <button
              type="button"
              :disabled="isSubmittingReview || !reviewerPhone.trim()"
              class="w-full bg-[#0052cc] text-white font-bold py-3 rounded-xl hover:bg-[#0040a2] transition-colors cursor-pointer shadow-md disabled:opacity-40 text-xs flex items-center justify-center gap-2"
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
      </Teleport>
    </div>
  </div>
</template>
