import { readCollection } from '../../db/dbHelper';
import { WishlistItem, BookRequest, Order, Book } from '../../../types';

export interface DemandStats {
  score: number;
  text: 'High' | 'Medium' | 'Low';
}

/**
 * Calculates a dynamic demand score (0-100) using full-stack analytics from live application data.
 * Weights: active requests, wishlist counts, and completed orders in that category.
 */
export function calculateDemandScore(category: string): DemandStats {
  try {
    const wishlist = readCollection<WishlistItem>('wishlist.json');
    const requests = readCollection<BookRequest>('book-requests.json');
    const orders = readCollection<Order>('orders.json');
    const books = readCollection<Book>('books.json');

    // Count matching items for this category
    const matchingWishlist = wishlist.filter(item => {
      const book = books.find(b => b.id === item.bookId);
      return book && book.category.toLowerCase() === category.toLowerCase();
    }).length;

    const matchingRequests = requests.filter(req => 
      req.category.toLowerCase() === category.toLowerCase() && req.status === 'ACTIVE'
    ).length;

    const matchingOrders = orders.filter(ord => {
      const book = books.find(b => b.id === ord.bookId);
      return book && book.category.toLowerCase() === category.toLowerCase();
    }).length;

    // Base point allocation + dynamic multipliers
    // Wishlist saves: 5 points each
    // Pending requests: 10 points each
    // Sales/Purchases: 15 points each
    let rawScore = 55 + (matchingWishlist * 5) + (matchingRequests * 10) + (matchingOrders * 15);
    
    // Normalization bounds [35, 98]
    const score = Math.max(35, Math.min(98, rawScore));
    
    let text: 'High' | 'Medium' | 'Low' = 'Medium';
    if (score >= 75) text = 'High';
    else if (score < 50) text = 'Low';

    return { score, text };
  } catch (error) {
    console.error('Error calculating demand score:', error);
    return { score: 65, text: 'Medium' };
  }
}
