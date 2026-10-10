import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToDonation(row) {
  return {
    id: row.id,
    institutionName: row.institution_name,
    regNumber: row.reg_number || "",
    title: row.title || "Donated Book Request",
    category: row.category || "General",
    quantityNeeded: row.quantity_needed || 1,
    description: row.purpose || "",
    city: row.city || "Chennai",
    contactPhone: row.contact_phone || "",
    status: row.status === "APPROVED" || row.status === "FULFILLED" ? "FULFILLED" : "PENDING",
    createdAt: row.created_at
  };
}
async function getAllDonationRequests() {
  const rows = db.prepare("SELECT * FROM donations ORDER BY created_at DESC").all();
  return rows.map(mapRowToDonation);
}
async function createDonationRequest(data) {
  const id = `don-${generateId()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  db.prepare(`
    INSERT INTO donations (
      id, institution_name, reg_number, purpose, quantity_needed, city, contact_phone, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.institutionName,
    data.regNumber || "",
    data.description || data.purpose || "",
    data.quantityNeeded || 1,
    data.city || "Chennai",
    data.contactPhone || "",
    "SUBMITTED",
    createdAt
  );
  const row = db.prepare("SELECT * FROM donations WHERE id = ?").get(id);
  return mapRowToDonation(row);
}
async function updateDonationRequest(id, updates) {
  db.prepare(`
    UPDATE donations
    SET status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(updates.status ?? null, id);
  const row = db.prepare("SELECT * FROM donations WHERE id = ?").get(id);
  return mapRowToDonation(row);
}
async function fulfillDonationRequest(requestId, bookId) {
  const result = db.prepare('UPDATE donations SET status = "FULFILLED", book_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(bookId, requestId);
  return result.changes > 0;
}
export {
  createDonationRequest,
  fulfillDonationRequest,
  getAllDonationRequests,
  updateDonationRequest
};
