export type UserRole = 'USER' | 'DELIVERY_STAFF' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface Profile {
  userId: string;
  city: string;
  area: string;
  address: string;
  pincode: string;
  latitude: number;
  longitude: number;
  avatarUrl?: string | null;
}

export type BookStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'EXCHANGED' | 'DONATED' | 'UNAVAILABLE';
export type BookCondition = 'NEW' | 'LIKE_NEW' | 'VERY_GOOD' | 'GOOD' | 'FAIR';

export interface Book {
  id: string;
  ownerId: string;
  title: string;
  author: string;
  category: string;
  subject: string;
  isbn: string;
  edition: number;
  publicationYear: number;
  originalPrice: number;
  expectedPrice: number;
  condition: BookCondition;
  description: string;
  imageUrl?: string | null;
  city: string;
  area: string;
  pincode: string;
  deliveryAvailable: boolean;
  exchangeAvailable: boolean;
  donationAvailable: boolean;
  purchaseDate: string;
  status: BookStatus;
  createdAt: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type DeliveryMethod = 'DELIVERY' | 'PICKUP';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'COD';

export interface Order {
  id: string;
  bookId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  deliveryMethod: DeliveryMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  pickupLocation?: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'ONLINE' | 'COD';
  status: PaymentStatus;
  transactionId?: string | null;
  createdAt: string;
}

export type ExchangeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface Exchange {
  id: string;
  senderId: string;
  receiverId: string;
  offeredBookId: string;
  requestedBookId: string;
  status: ExchangeStatus;
  createdAt: string;
}

export interface SwapChainMember {
  userId: string;
  offeredBookId: string;
  requestedBookId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

export interface SwapChain {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  members: SwapChainMember[];
  createdAt: string;
}

export interface DeliveryStaff {
  userId: string;
  name: string;
  phone: string;
  city: string;
  area: string;
  pincode: string;
  serviceArea: string;
  availability: boolean;
  activeDeliveries: number;
}

export interface Delivery {
  id: string;
  orderId: string;
  staffId: string; // userId of staff
  status: OrderStatus;
  updatedAt: string;
  notes?: string | null;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  bookId?: string | null;
  orderId?: string | null;
  rating: number; // 1 to 5
  comment: string;
  type: 'SELLER' | 'DELIVERY' | 'BOOK';
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
  category: string;
  maxPrice: number;
  preferredCondition: BookCondition;
  city: string;
  status: 'ACTIVE' | 'MATCHED' | 'CLOSED';
  createdAt: string;
}

export interface DonationRequest {
  id: string;
  institutionName: string;
  regNumber: string; // Trust registration details
  title: string;
  category: string;
  quantityNeeded: number;
  description: string;
  city: string;
  contactPhone: string;
  status: 'PENDING' | 'FULFILLED';
  createdAt: string;
}

export interface Rental {
  id: string;
  bookId: string;
  renterId: string;
  ownerId: string;
  durationDays: number;
  rentalFee: number;
  paymentStatus: PaymentStatus;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  startDate: string;
  endDate: string;
}
