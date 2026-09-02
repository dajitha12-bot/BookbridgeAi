import { readCollection, writeCollection, generateId } from './dbHelper';
import { Review } from '../../types';

const REVIEWS_FILE = 'reviews.json';

export async function getAllReviews(): Promise<Review[]> {
  return readCollection<Review>(REVIEWS_FILE);
}

export async function getReviewsForUser(userId: string): Promise<Review[]> {
  const reviews = await getAllReviews();
  return reviews.filter(r => r.revieweeId === userId);
}

export async function getReviewsByUser(userId: string): Promise<Review[]> {
  const reviews = await getAllReviews();
  return reviews.filter(r => r.reviewerId === userId);
}

export async function createReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  const reviews = await getAllReviews();

  const newReview: Review = {
    ...reviewData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  reviews.push(newReview);
  writeCollection(REVIEWS_FILE, reviews);

  return newReview;
}
