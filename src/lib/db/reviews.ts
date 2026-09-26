import { db } from './sqliteDb';
import { Review } from '../../types';
import { generateId } from './dbHelper';

function mapRowToReview(row: any): Review {
  return {
    id: row.id,
    reviewerId: row.reviewer_id,
    targetId: row.target_user_id,
    orderId: row.book_id || undefined,
    rating: row.rating,
    comment: row.comment || '',
    createdAt: row.created_at,
  };
}

export async function getAllReviews(): Promise<Review[]> {
  const rows = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
  return rows.map(mapRowToReview);
}

export async function getReviewsForTarget(targetId: string): Promise<Review[]> {
  const rows = db.prepare('SELECT * FROM reviews WHERE target_user_id = ? ORDER BY created_at DESC').all(targetId);
  return rows.map(mapRowToReview);
}

export async function getReviewsForUser(userId: string): Promise<Review[]> {
  return getReviewsForTarget(userId);
}

export async function createReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  const id = `rev-${generateId()}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO reviews (id, reviewer_id, target_user_id, book_id, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, reviewData.reviewerId, reviewData.targetId, reviewData.orderId || null, reviewData.rating, reviewData.comment || '', createdAt);

  return { id, ...reviewData, createdAt };
}
