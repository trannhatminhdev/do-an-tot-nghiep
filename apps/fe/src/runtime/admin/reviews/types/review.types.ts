export interface ReviewUser {
  id: number;
  fullName: string;
}

export interface ReviewProductImage {
  imageUrl: string;
}

export interface ReviewProduct {
  id: number;
  name: string;
  images: ReviewProductImage[];
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
  adminReply: string | null;
  createdAt: string;
  user?: ReviewUser | null;
  product: ReviewProduct;
}

export interface PaginatedReviewResponse {
  data: Review[];
  total: number;
}
