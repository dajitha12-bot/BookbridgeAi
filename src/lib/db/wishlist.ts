import { db } from './sqliteDb';
import { WishlistItem } from '../../types';
import { generateId } from './dbHelper';

function mapRowToWishlist(row: any): WishlistItem {
  return {
    id: row.id,
    userId: row.user_id,
    bookId: row.book_id,
    createdAt: row.created_at,
  };
}

export async function getAllWishlistItems(): Promise<WishlistItem[]> {
  const rows = db.prepare('SELECT * FROM wishlist ORDER BY created_at DESC').all();
  return rows.map(mapRowToWishlist);
}

export async function getWishlistByUser(userId: string): Promise<WishlistItem[]> {
  const rows = db.prepare('SELECT * FROM wishlist WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  return rows.map(mapRowToWishlist);
}

export async function addToWishlist(userId: string, bookId: string): Promise<WishlistItem | null> {
  const existing = db.prepare('SELECT * FROM wishlist WHERE user_id = ? AND book_id = ?').get(userId, bookId);
  if (existing) return mapRowToWishlist(existing);

  const id = `w-${generateId()}`;
  const createdAt = new Date().toISOString();

  db.prepare('INSERT INTO wishlist (id, user_id, book_id, created_at) VALUES (?, ?, ?, ?)').run(id, userId, bookId, createdAt);

  return { id, userId, bookId, createdAt };
}

export async function removeFromWishlist(userId: string, bookId: string): Promise<boolean> {
  const result = db.prepare('DELETE FROM wishlist WHERE user_id = ? AND book_id = ?').run(userId, bookId);
  return result.changes > 0;
}

export async function isInWishlist(userId: string, bookId: string): Promise<boolean> {
  const row = db.prepare('SELECT COUNT(*) as count FROM wishlist WHERE user_id = ? AND book_id = ?').get(userId, bookId) as any;
  return row.count > 0;
}
