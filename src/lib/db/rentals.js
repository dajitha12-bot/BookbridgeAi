import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToRental(row) {
  return {
    id: row.id,
    bookId: row.book_id,
    renterId: row.renter_id,
    ownerId: row.owner_id,
    durationDays: row.duration_days,
    pricePerDay: row.price_per_day || 0,
    rentalFee: row.rental_fee,
    securityDeposit: row.security_deposit || 0,
    totalAmount: row.total_amount || row.rental_fee + (row.security_deposit || 0),
    handoverMethod: row.handover_method || "DELIVERY",
    deliveryAddress: row.delivery_address || null,
    status: row.status,
    paymentStatus: row.payment_status,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at
  };
}
async function getAllRentals() {
  const rows = db.prepare("SELECT * FROM rentals ORDER BY created_at DESC").all();
  return rows.map(mapRowToRental);
}
async function getRentalById(id) {
  const row = db.prepare("SELECT * FROM rentals WHERE id = ?").get(id);
  return row ? mapRowToRental(row) : null;
}
async function createRental(data) {
  const id = `rent-${generateId()}`;
  const startDate = /* @__PURE__ */ new Date();
  const endDate = /* @__PURE__ */ new Date();
  const duration = data.durationDays || 7;
  endDate.setDate(startDate.getDate() + duration);
  const pricePerDay = data.pricePerDay || 20;
  const rentalFee = data.rentalFee || pricePerDay * duration;
  const securityDeposit = data.securityDeposit || 400;
  const totalAmount = data.totalAmount || rentalFee + securityDeposit + (data.handoverMethod === "DELIVERY" ? 30 : 0);
  const status = data.status || "ACTIVE";
  const paymentStatus = data.paymentStatus || "PAID";
  db.prepare(`
    INSERT INTO rentals (
      id, book_id, renter_id, owner_id, duration_days, price_per_day, rental_fee,
      security_deposit, total_amount, handover_method, delivery_address, status,
      payment_status, start_date, end_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.bookId,
    data.renterId,
    data.ownerId,
    duration,
    pricePerDay,
    rentalFee,
    securityDeposit,
    totalAmount,
    data.handoverMethod || "DELIVERY",
    data.deliveryAddress || null,
    status,
    paymentStatus,
    startDate.toISOString(),
    endDate.toISOString(),
    startDate.toISOString()
  );
  try {
    db.prepare("INSERT INTO rental_activity (id, book_id, renter_id, duration_days) VALUES (?, ?, ?, ?)").run(`ract_${generateId()}`, data.bookId, data.renterId, duration);
  } catch (e) {
  }
  return await getRentalById(id);
}
async function updateRental(id, updates) {
  const existing = await getRentalById(id);
  if (!existing) return null;
  db.prepare(`
    UPDATE rentals
    SET status = COALESCE(?, status),
        payment_status = COALESCE(?, payment_status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    updates.status ?? null,
    updates.paymentStatus ?? null,
    id
  );
  return getRentalById(id);
}
export {
  createRental,
  getAllRentals,
  getRentalById,
  updateRental
};
