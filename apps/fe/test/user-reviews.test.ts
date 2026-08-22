import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserReviewsService } from '../src/runtime/user/reviews/services/user-reviews.service';
import type { ApiService } from '../src/runtime/core/services/api.service';

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBase: 'http://localhost:3000/api/v1',
    },
  }),
}));

describe('UserReviewsService', () => {
  let mockApiService: Partial<ApiService>;
  let userReviewsService: UserReviewsService;

  beforeEach(() => {
    mockApiService = {
      get: vi.fn(),
      post: vi.fn(),
    };
    userReviewsService = new UserReviewsService(mockApiService as ApiService);
  });

  it('should fetch product reviews by productId', async () => {
    const mockReviews = [
      {
        id: 1,
        productId: 1,
        userId: 1,
        rating: 5,
        comment: 'Tuyệt vời',
        createdAt: '2026-01-01',
        user: { id: 1, fullName: 'Nguyễn Văn A', email: 'a@example.com' },
      },
    ];

    (mockApiService.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockReviews,
    );

    const result = await userReviewsService.getProductReviews(1);

    expect(mockApiService.get).toHaveBeenCalledWith('/reviews/product/1');
    expect(result).toEqual(mockReviews);
  });

  it('should create review with token header', async () => {
    const reviewInput = {
      productId: 1,
      rating: 5,
      comment: 'Sản phẩm rất tốt',
    };
    const mockCreated = {
      id: 2,
      ...reviewInput,
      userId: 1,
      createdAt: '2026-01-01',
    };

    (mockApiService.post as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockCreated,
    );

    const result = await userReviewsService.createReview(
      reviewInput,
      'user-bearer-token',
    );

    expect(mockApiService.post).toHaveBeenCalledWith('/reviews', reviewInput, {
      token: 'user-bearer-token',
    });
    expect(result).toEqual(mockCreated);
  });
});
