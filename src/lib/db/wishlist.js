import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToWishlist(row) {
  return {
    id: row.id,
    userId: row.user_id,
    bookId: row.book_id,
    createdAt: row.created_at
  };
}
async function getAllWishlistItems() {
  const rows = db.prepare("SELECT * FROM wishlist ORDER BY created_at DESC").all();
  return rows.map(mapRowToWishlist);
}
async function getWishlistByUser(userId) {
  const rows = db.prepare("SELECT * FROM wishlist WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  return rows.map(mapRowToWishlist);
}
async function addToWishlist(userId, bookId) {
  const existing = db.prepare("SELECT * FROM wishlist WHERE user_id = ? AND book_id = ?").get(userId, bookId);
  if (existing) return mapRowToWishlist(existing);
  const id = `w-${generateId()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  db.prepare("INSERT INTO wishlist (id, user_id, book_id, created_at) VALUES (?, ?, ?, ?)").run(id, userId, bookId, createdAt);
  return { id, userId, bookId, createdAt };
}
async function removeFromWishlist(userId, bookId) {
  const result = db.prepare("DELETE FROM wishlist WHERE user_id = ? AND book_id = ?").run(userId, bookId);
  return result.changes > 0;
}
async function isInWishlist(userId, bookId) {
  const row = db.prepare("SELECT COUNT(*) as count FROM wishlist WHERE user_id = ? AND book_id = ?").get(userId, bookId);
  return row.count > 0;
}
export {
  addToWishlist,
  getAllWishlistItems,
  getWishlistByUser,
  isInWishlist,
  removeFromWishlist
};
