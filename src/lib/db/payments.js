import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToPayment(row) {
  return {
    id: row.id,
    orderId: row.order_id || "",
    rentalId: row.rental_id || null,
    userId: row.user_id,
    amount: row.amount || 0,
    deliveryCharge: row.delivery_charge || 0,
    securityDeposit: row.security_deposit || 0,
    totalAmount: row.total_amount || row.amount || 0,
    method: row.method || "ONLINE",
    status: row.status || "PAID",
    transactionId: row.transaction_id || `TXN_${Date.now()}`,
    refundStatus: row.refund_status || "NONE",
    createdAt: row.created_at
  };
}
async function getAllPayments() {
  const rows = db.prepare("SELECT * FROM payments ORDER BY created_at DESC").all();
  return rows.map(mapRowToPayment);
}
async function getPaymentById(id) {
  const row = db.prepare("SELECT * FROM payments WHERE id = ?").get(id);
  return row ? mapRowToPayment(row) : null;
}
async function getPaymentByOrderId(orderId) {
  const row = db.prepare("SELECT * FROM payments WHERE order_id = ? OR rental_id = ?").get(orderId, orderId);
  return row ? mapRowToPayment(row) : null;
}
async function getPaymentsByUser(userId) {
  const rows = db.prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  return rows.map(mapRowToPayment);
}
async function createPayment(paymentData) {
  const id = `pay-${generateId()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const deliveryCharge = paymentData.deliveryCharge || 0;
  const securityDeposit = paymentData.securityDeposit || 0;
  const totalAmount = paymentData.totalAmount || paymentData.amount + deliveryCharge + securityDeposit;
  db.prepare(`
    INSERT INTO payments (
      id, order_id, rental_id, user_id, amount, delivery_charge, security_deposit,
      total_amount, method, status, transaction_id, refund_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    paymentData.orderId || null,
    paymentData.rentalId || null,
    paymentData.userId || "usr-user1",
    paymentData.amount || 0,
    deliveryCharge,
    securityDeposit,
    totalAmount,
    paymentData.method || "ONLINE",
    paymentData.status || "PAID",
    paymentData.transactionId || `TXN_${Date.now()}`,
    paymentData.refundStatus || "NONE",
    createdAt
  );
  return await getPaymentById(id);
}
async function updatePayment(id, updates) {
  const existing = await getPaymentById(id);
  if (!existing) return null;
  db.prepare(`
    UPDATE payments
    SET status = COALESCE(?, status),
        refund_status = COALESCE(?, refund_status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    updates.status ?? null,
    updates.refundStatus ?? null,
    id
  );
  return getPaymentById(id);
}
export {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentByOrderId,
  getPaymentsByUser,
  updatePayment
};
