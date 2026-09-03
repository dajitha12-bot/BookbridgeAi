export type DeliveryMethod = 'DELIVERY' | 'PICKUP';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'COD';
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  bookId: string;
  amount: number;
  deliveryMethod: DeliveryMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  pickupLocation?: string;
  createdAt: string;
}
