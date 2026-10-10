import { db } from "./sqliteDb";
async function getSellerUpiByUserId(userId) {
  const row = db.prepare("SELECT upi_id FROM seller_upi WHERE user_id = ?").get(userId);
  if (row && row.upi_id) {
    return row.upi_id;
  }
  const userRow = db.prepare("SELECT name, email FROM users WHERE id = ?").get(userId);
  if (userRow) {
    const cleanName = userRow.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const generatedUpi = `${cleanName || "seller"}@upi`;
    try {
      db.prepare(`
        INSERT INTO seller_upi (id, user_id, upi_id)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET upi_id = excluded.upi_id
      `).run(`upi-${userId}`, userId, generatedUpi);
    } catch (e) {
    }
    return generatedUpi;
  }
  return "seller@upi";
}
async function setSellerUpi(userId, upiId) {
  const cleanUpi = upiId.trim();
  db.prepare(`
    INSERT INTO seller_upi (id, user_id, upi_id)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET upi_id = excluded.upi_id
  `).run(`upi-${userId}`, userId, cleanUpi);
  return cleanUpi;
}
export {
  getSellerUpiByUserId,
  setSellerUpi
};
