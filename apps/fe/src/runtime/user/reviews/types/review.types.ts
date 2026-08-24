export interface ReviewUser {
  id: number;
  fullName: string;
  email?: string;
}

export interface Review {
  id: number;
  productId: number;
  userId?: number | null;
  orderId?: number | null;
  customerPhone?: string | null;
  customerName?: string | null;
  rating: number;
  comment: string | null;
  adminReply?: string | null;
  createdAt: string;
  user?: ReviewUser | null;
}

export interface CreateReviewInput {
  productId: number;
  phone: string;
  fullName?: string;
  rating: number;
  comment?: string;
}
