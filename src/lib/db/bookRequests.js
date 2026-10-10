import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToRequest(row) {
  return {
    id: row.id,
    userId: row.user_id,
    requesterId: row.user_id,
    requesterName: row.requester_name || "Community User",
    title: row.title,
    author: row.author || "",
    category: row.category,
    city: row.city || "Chennai",
    urgency: row.urgency || "MEDIUM",
    status: row.status || "OPEN",
    createdAt: row.created_at
  };
}
async function getAllBookRequests() {
  const rows = db.prepare("SELECT * FROM book_requests ORDER BY created_at DESC").all();
  return rows.map(mapRowToRequest);
}
async function getRequestsByUser(userId) {
  const rows = db.prepare("SELECT * FROM book_requests WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  return rows.map(mapRowToRequest);
}
async function createBookRequest(requestData) {
  const id = `req-${generateId()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  db.prepare(`
    INSERT INTO book_requests (id, user_id, requester_name, title, author, category, city, urgency, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    requestData.userId || requestData.requesterId || "usr-user1",
    requestData.requesterName || requestData.userName || "Community User",
    requestData.title,
    requestData.author || "",
    requestData.category,
    requestData.city || "Chennai",
    requestData.urgency || "MEDIUM",
    requestData.status || "OPEN",
    createdAt
  );
  const row = db.prepare("SELECT * FROM book_requests WHERE id = ?").get(id);
  return mapRowToRequest(row);
}
async function updateBookRequest(id, updates) {
  const existing = db.prepare("SELECT * FROM book_requests WHERE id = ?").get(id);
  if (!existing) return null;
  db.prepare(`
    UPDATE book_requests
    SET status = COALESCE(?, status),
        urgency = COALESCE(?, urgency),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(updates.status ?? null, updates.urgency ?? null, id);
  const row = db.prepare("SELECT * FROM book_requests WHERE id = ?").get(id);
  return mapRowToRequest(row);
}
async function deleteBookRequest(id) {
  const result = db.prepare("DELETE FROM book_requests WHERE id = ?").run(id);
  return result.changes > 0;
}
export {
  createBookRequest,
  deleteBookRequest,
  getAllBookRequests,
  getRequestsByUser,
  updateBookRequest
};
