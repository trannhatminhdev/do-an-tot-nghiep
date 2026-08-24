import { Injectable } from '@nestjs/common';
import {
  IReviewRepository,
  CreateReviewData,
} from '../../application/interfaces/review-repository.interface';
import { PrismaService } from '../../../../core/database/prisma.service';
import { formatProductImages } from '../../../../shared/utils/image-url.util';

@Injectable()
export class ReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReviewData) {
    return this.prisma.review.create({
      data: {
        productId: data.productId,
        customerPhone: data.customerPhone,
        customerName: data.customerName,
        userId: data.userId,
        orderId: data.orderId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    productId?: number;
    userId?: number;
  }) {
    const { skip, take, productId, userId } = params || {};
    const where = {
      ...(productId ? { productId } : {}),
      ...(userId ? { userId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        skip,
        take,
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              images: {
                where: { isThumbnail: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    const formattedData = data.map((review) => ({
      ...review,
      product: review.product
        ? {
            ...review.product,
            images: formatProductImages(review.product.images),
          }
        : review.product,
    }));

    return { data: formattedData, total };
  }

  async findByProductId(productId: number) {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProductAndPhone(productId: number, phone: string) {
    const rawPhone = phone.trim();
    const cleanDigits = rawPhone.replace(/\D/g, '');
    const normalizedPhone =
      cleanDigits.startsWith('84') && cleanDigits.length >= 10
        ? '0' + cleanDigits.slice(2)
        : cleanDigits;

    const reviews = await this.prisma.review.findMany({
      where: { productId },
    });

    return reviews.filter((r) => {
      if (!r.customerPhone) return false;
      const rDigits = r.customerPhone.replace(/\D/g, '');
      const rNorm =
        rDigits.startsWith('84') && rDigits.length >= 10
          ? '0' + rDigits.slice(2)
          : rDigits;

      return (
        rNorm === normalizedPhone ||
        r.customerPhone.trim() === rawPhone ||
        (cleanDigits.length >= 8 && rDigits === cleanDigits)
      );
    });
  }

  async findById(id: number) {
    return this.prisma.review.findUnique({
      where: { id },
    });
  }

  async delete(id: number) {
    await this.prisma.review.delete({
      where: { id },
    });
  }

  async updateReply(id: number, adminReply: string) {
    return this.prisma.review.update({
      where: { id },
      data: { adminReply },
    });
  }
}
