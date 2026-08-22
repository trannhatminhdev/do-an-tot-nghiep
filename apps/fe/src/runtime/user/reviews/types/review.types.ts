export interface ReviewUser {
  id: number;
  fullName: string;
  email: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string | null;
  adminReply?: string | null;
  createdAt: string;
  user?: ReviewUser;
}

export interface CreateReviewInput {
  productId: number;
  rating: number;
  comment?: string;
}
