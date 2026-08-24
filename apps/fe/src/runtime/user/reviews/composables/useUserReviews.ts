import { ref } from 'vue';
import { useToast } from '#fe/core/composables/useToast';
import { userReviewsService } from '../services/user-reviews.service';
import type { Review } from '../types/review.types';

export function useUserReviews() {
  const reviews = ref<Review[]>([]);
  const isLoading = ref(false);
  const toast = useToast();

  const fetchReviews = async (productId: number): Promise<Review[]> => {
    isLoading.value = true;
    try {
      const data = await userReviewsService.getProductReviews(productId);
      reviews.value = data;
      return data;
    } finally {
      isLoading.value = false;
    }
  };

  const addReview = async (
    input: CreateReviewInput,
    token?: string,
  ): Promise<Review | null> => {
    isLoading.value = true;
    try {
      const newReview = await userReviewsService.createReview(input, token);
      reviews.value.unshift(newReview);
      toast.success('Cảm ơn bạn đã gửi đánh giá sản phẩm!');
      return newReview;
    } catch (err: unknown) {
      const errorObj = err as {
        data?: { message?: string | string[] };
        message?: string;
      };
      const msg =
        (Array.isArray(errorObj?.data?.message)
          ? errorObj.data.message.join(', ')
          : errorObj?.data?.message) ||
        errorObj?.message ||
        'Không thể gửi đánh giá. Vui lòng thử lại sau.';
      toast.error(msg);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    reviews,
    isLoading,
    fetchReviews,
    addReview,
  };
}
