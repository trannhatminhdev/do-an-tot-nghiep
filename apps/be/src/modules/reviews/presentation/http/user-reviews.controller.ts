import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ReviewsService } from '../../application/services/reviews.service';
import { CreateReviewDto } from './dtos/create-review.dto';

@Controller('reviews')
export class UserReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async createReview(@Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview({
      productId: dto.productId,
      phone: dto.phone,
      fullName: dto.fullName,
      rating: dto.rating,
      comment: dto.comment,
    });
  }

  @Get('product/:productId')
  async getProductReviews(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.getProductReviews(productId);
  }
}
