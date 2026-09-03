export * from './user';
export * from './book';
export * from './order';
export * from './rental';
export * from './delivery';
export * from './exchange';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'ONLINE' | 'COD';
  status: 'PENDING' | 'PAID' | 'FAILED' | 'COD';
  transactionId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  targetId: string;
  orderId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
}

export interface BookRequest {
  id: string;
  requesterId: string;
  title: string;
  author?: string;
  category: string;
  maxPrice?: number;
  status: 'ACTIVE' | 'MATCHED' | 'CLOSED';
  createdAt: string;
}

export interface DonationRequest {
  id: string;
  institutionName: string;
  regNumber: string;
  title: string;
  category: string;
  quantityNeeded: number;
  description: string;
  city: string;
  contactPhone: string;
  status: 'PENDING' | 'FULFILLED';
  createdAt: string;
}
