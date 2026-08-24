import { Test, TestingModule } from '@nestjs/testing';
import { UserReviewsController } from '../../src/modules/reviews/presentation/http/user-reviews.controller';
import { ReviewsService } from '../../src/modules/reviews/application/services/reviews.service';

describe('UserReviewsController', () => {
  let controller: UserReviewsController;
  let service: Partial<Record<keyof ReviewsService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      createReview: jest.fn(),
      getProductReviews: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserReviewsController],
      providers: [{ provide: ReviewsService, useValue: service }],
    }).compile();

    controller = module.get<UserReviewsController>(UserReviewsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createReview', () => {
    it('should create a review', async () => {
      const dto = {
        productId: 1,
        phone: '0912345678',
        fullName: 'Minh',
        rating: 5,
        comment: 'Nice',
      };
      const created = { id: 1, ...dto };
      service.createReview!.mockResolvedValue(created as any);

      const result = await controller.createReview(dto);
      expect(result).toEqual(created);
      expect(service.createReview).toHaveBeenCalledWith({
        productId: 1,
        phone: '0912345678',
        fullName: 'Minh',
        rating: 5,
        comment: 'Nice',
      });
    });
  });

  describe('getProductReviews', () => {
    it('should get product reviews', async () => {
      const reviews = [{ id: 1 }] as any[];
      service.getProductReviews!.mockResolvedValue(reviews);

      const result = await controller.getProductReviews(1);
      expect(result).toEqual(reviews);
      expect(service.getProductReviews).toHaveBeenCalledWith(1);
    });
  });
});
