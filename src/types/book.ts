export type BookCondition = 'LIKE_NEW' | 'VERY_GOOD' | 'GOOD' | 'FAIR' | 'POOR';
export type BookStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

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
  purchaseDate?: string;
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
  status: BookStatus;
  createdAt: string;
}
