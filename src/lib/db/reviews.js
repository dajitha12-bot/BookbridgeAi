import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToReview(row) {
  return {
    id: row.id,
    reviewerId: row.reviewer_id,
    targetId: row.target_user_id,
    orderId: row.book_id || void 0,
    rating: row.rating,
    comment: row.comment || "",
    createdAt: row.created_at
  };
}
async function getAllReviews() {
  const rows = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all();
  return rows.map(mapRowToReview);
}
async function getReviewsForTarget(targetId) {
  const rows = db.prepare("SELECT * FROM reviews WHERE target_user_id = ? ORDER BY created_at DESC").all(targetId);
  return rows.map(mapRowToReview);
}
async function getReviewsForUser(userId) {
  return getReviewsForTarget(userId);
}
async function createReview(reviewData) {
  const id = `rev-${generateId()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  db.prepare(`
    INSERT INTO reviews (id, reviewer_id, target_user_id, book_id, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, reviewData.reviewerId, reviewData.targetId, reviewData.orderId || null, reviewData.rating, reviewData.comment || "", createdAt);
  return { id, ...reviewData, createdAt };
}
export {
  createReview,
  getAllReviews,
  getReviewsForTarget,
  getReviewsForUser
};
