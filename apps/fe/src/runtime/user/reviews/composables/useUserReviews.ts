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
    productId: number,
    rating: number,
    comment?: string,
    token?: string,
  ): Promise<Review | null> => {
    isLoading.value = true;
    try {
      const newReview = await userReviewsService.createReview(
        { productId, rating, comment },
        token,
      );
      reviews.value.unshift(newReview);
      toast.success('Cảm ơn bạn đã gửi đánh giá sản phẩm!');
      return newReview;
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Không thể gửi đánh giá. Vui lòng thử lại sau.');
      }
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
