import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToExchange(row) {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    offeredBookId: row.offered_book_id,
    requestedBookId: row.requested_book_id,
    handoverMethod: row.handover_method || "DELIVERY",
    status: row.status || "PENDING",
    createdAt: row.created_at
  };
}
async function getAllExchanges() {
  const rows = db.prepare("SELECT * FROM exchanges ORDER BY created_at DESC").all();
  return rows.map(mapRowToExchange);
}
async function getExchangeById(id) {
  const row = db.prepare("SELECT * FROM exchanges WHERE id = ?").get(id);
  return row ? mapRowToExchange(row) : null;
}
async function getExchangesByUser(userId) {
  const rows = db.prepare("SELECT * FROM exchanges WHERE sender_id = ? OR receiver_id = ? ORDER BY created_at DESC").all(userId, userId);
  return rows.map(mapRowToExchange);
}
async function createExchange(exchangeData) {
  const id = `exc-${generateId()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  db.prepare(`
    INSERT INTO exchanges (id, sender_id, receiver_id, offered_book_id, requested_book_id, handover_method, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    exchangeData.senderId,
    exchangeData.receiverId,
    exchangeData.offeredBookId,
    exchangeData.requestedBookId,
    exchangeData.handoverMethod || "DELIVERY",
    exchangeData.status || "PENDING",
    createdAt
  );
  return await getExchangeById(id);
}
async function updateExchange(id, updates) {
  const existing = await getExchangeById(id);
  if (!existing) return null;
  db.prepare(`
    UPDATE exchanges
    SET status = COALESCE(?, status),
        handover_method = COALESCE(?, handover_method),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    updates.status ?? null,
    updates.handoverMethod ?? null,
    id
  );
  return getExchangeById(id);
}
export {
  createExchange,
  getAllExchanges,
  getExchangeById,
  getExchangesByUser,
  updateExchange
};
