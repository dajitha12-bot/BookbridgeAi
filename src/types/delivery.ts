export type DeliveryStatus = 'ASSIGNED' | 'REACHED_SELLER' | 'PICKED_UP' | 'IN_TRANSIT' | 'REACHED_BUYER' | 'DELIVERED' | 'CANCELLED';

export interface DeliveryStaff {
  id: string;
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
  staffId: string;
  status: DeliveryStatus | 'PENDING';
  pickupCode?: string;
  deliveryCode?: string;
  createdAt: string;
  updatedAt: string;
}
