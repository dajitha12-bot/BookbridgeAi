import { readCollection, writeCollection, generateId } from './dbHelper';
import { WishlistItem } from '../../types';

const WISHLIST_FILE = 'wishlist.json';

export async function getAllWishlistItems(): Promise<WishlistItem[]> {
  return readCollection<WishlistItem>(WISHLIST_FILE);
}

export async function getWishlistByUser(userId: string): Promise<WishlistItem[]> {
  const items = await getAllWishlistItems();
  return items.filter(w => w.userId === userId);
}

export async function addToWishlist(userId: string, bookId: string): Promise<WishlistItem | null> {
  const items = await getAllWishlistItems();
  
  // Prevent duplicate saves
  const exists = items.find(w => w.userId === userId && w.bookId === bookId);
  if (exists) return exists;

  const newItem: WishlistItem = {
    id: generateId(),
    userId,
    bookId,
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  writeCollection(WISHLIST_FILE, items);

  return newItem;
}

export async function removeFromWishlist(userId: string, bookId: string): Promise<boolean> {
  const items = await getAllWishlistItems();
  const filtered = items.filter(w => !(w.userId === userId && w.bookId === bookId));
  if (items.length === filtered.length) return false;

  writeCollection(WISHLIST_FILE, filtered);
  return true;
}

export async function isInWishlist(userId: string, bookId: string): Promise<boolean> {
  const items = await getAllWishlistItems();
  return !!items.find(w => w.userId === userId && w.bookId === bookId);
}
