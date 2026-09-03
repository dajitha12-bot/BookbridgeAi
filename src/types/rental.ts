import { PaymentStatus } from './order';

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
