import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { IReviewRepository } from '../interfaces/review-repository.interface';
import { OrdersService } from '../../../orders/application/services/orders.service';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(IReviewRepository)
    private readonly reviewRepository: IReviewRepository,
    private readonly ordersService: OrdersService,
  ) {}

  async createReview(dto: {
    productId: number;
    phone: string;
    fullName?: string;
    rating: number;
    comment?: string;
    userId?: number;
  }) {
    const { productId, phone, fullName, rating, comment, userId } = dto;

    if (!phone || !phone.trim()) {
      throw new BadRequestException('Số điện thoại không được để trống');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Điểm đánh giá phải từ 1 đến 5 sao');
    }

    // 1. Find all eligible orders for this phone and product
    const eligibleOrders = await this.ordersService.findPurchasedOrdersByPhone(
      phone,
      productId,
    );

    if (!eligibleOrders || eligibleOrders.length === 0) {
      throw new ForbiddenException(
        'Số điện thoại này chưa mua sản phẩm này hoặc đơn hàng đã bị hủy. Chỉ khách hàng đã mua sản phẩm mới được đánh giá.',
      );
    }

    // 2. Find all existing reviews for this phone on this product
    const existingReviews = await this.reviewRepository.findByProductAndPhone(
      productId,
      phone,
    );

    if (existingReviews.length >= eligibleOrders.length) {
      throw new BadRequestException(
        'Bạn đã đánh giá đủ số lần cho các đơn hàng đã mua sản phẩm này (tối đa 1 lần cho mỗi lần mua).',
      );
    }

    // 3. Link this review to the next unreviewed order
    const reviewedOrderIds = new Set(
      existingReviews.map((r) => r.orderId).filter(Boolean),
    );
    const targetOrder =
      eligibleOrders.find((o) => !reviewedOrderIds.has(o.id)) ||
      eligibleOrders[existingReviews.length] ||
      eligibleOrders[0];

    const customerName =
      fullName?.trim() || targetOrder.customerName || 'Khách hàng';

    return this.reviewRepository.create({
      productId,
      customerPhone: phone.trim(),
      customerName,
      userId: userId || targetOrder.userId || null,
      orderId: targetOrder.id,
      rating,
      comment: comment?.trim() || undefined,
    });
  }

  async getProductReviews(productId: number) {
    return this.reviewRepository.findByProductId(productId);
  }

  async getAllReviews(params?: {
    page?: number;
    limit?: number;
    productId?: number;
    userId?: number;
  }) {
    const { page = 1, limit = 10, productId, userId } = params || {};
    const skip = (page - 1) * limit;

    return this.reviewRepository.findAll({
      skip,
      take: limit,
      productId,
      userId,
    });
  }

  async deleteReviewAsAdmin(id: number) {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return this.reviewRepository.delete(id);
  }

  async replyToReview(id: number, reply: string) {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return this.reviewRepository.updateReply(id, reply);
  }
}
