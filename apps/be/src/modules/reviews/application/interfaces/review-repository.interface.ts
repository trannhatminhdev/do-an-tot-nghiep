import { Review } from '@prisma/client';

export const IReviewRepository = Symbol('IReviewRepository');

export interface CreateReviewData {
  productId: number;
  customerPhone: string;
  customerName?: string;
  userId?: number | null;
  orderId?: number | null;
  rating: number;
  comment?: string;
}

export interface IReviewRepository {
  create(data: CreateReviewData): Promise<Review>;
  findAll(params?: {
    skip?: number;
    take?: number;
    productId?: number;
    userId?: number;
  }): Promise<{ data: Review[]; total: number }>;
  findByProductId(productId: number): Promise<Review[]>;
  findByProductAndPhone(productId: number, phone: string): Promise<Review[]>;
  findById(id: number): Promise<Review | null>;
  delete(id: number): Promise<void>;
  updateReply(id: number, adminReply: string): Promise<Review>;
}
