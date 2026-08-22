import { apiService, type ApiService } from '#fe/core/services/api.service';
import type { CreateReviewInput, Review } from '../types/review.types';

export class UserReviewsService {
  constructor(private readonly api: ApiService = apiService) {}

  async getProductReviews(productId: number): Promise<Review[]> {
    try {
      return await this.api.get<Review[]>(`/reviews/product/${productId}`);
    } catch (error) {
      console.error(`Failed to fetch reviews for product ${productId}`, error);
      return [];
    }
  }

  async createReview(
    input: CreateReviewInput,
    token?: string,
  ): Promise<Review> {
    return this.api.post<Review>('/reviews', input, { token });
  }
}

export const userReviewsService = new UserReviewsService();
