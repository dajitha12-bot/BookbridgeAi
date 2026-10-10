import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToOrder(row) {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    bookId: row.book_id,
    amount: row.amount || 0,
    deliveryCharge: row.delivery_charge || 0,
    securityDeposit: row.security_deposit || 0,
    totalAmount: row.total_amount || row.amount || 0,
    deliveryMethod: row.delivery_method || "DELIVERY",
    paymentStatus: row.payment_status || "PENDING",
    orderStatus: row.order_status || "PENDING",
    pickupLocation: row.pickup_location || null,
    deliveryAddress: row.delivery_address || null,
    createdAt: row.created_at
  };
}
async function getAllOrders() {
  const rows = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
  return rows.map(mapRowToOrder);
}
async function getOrderById(id) {
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  return row ? mapRowToOrder(row) : null;
}
async function getOrdersByBuyer(buyerId) {
  const rows = db.prepare("SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC").all(buyerId);
  return rows.map(mapRowToOrder);
}
async function getOrdersBySeller(sellerId) {
  const rows = db.prepare("SELECT * FROM orders WHERE seller_id = ? ORDER BY created_at DESC").all(sellerId);
  return rows.map(mapRowToOrder);
}
async function createOrder(orderData) {
  const id = `ord-${generateId()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const deliveryCharge = orderData.deliveryCharge || (orderData.deliveryMethod === "DELIVERY" ? 30 : 0);
  const totalAmount = orderData.totalAmount || orderData.amount + deliveryCharge;
  db.prepare(`
    INSERT INTO orders (
      id, buyer_id, seller_id, book_id, amount, delivery_charge, security_deposit, total_amount,
      delivery_method, payment_status, order_status, pickup_location, delivery_address, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    orderData.buyerId,
    orderData.sellerId,
    orderData.bookId,
    orderData.amount || 0,
    deliveryCharge,
    orderData.securityDeposit || 0,
    totalAmount,
    orderData.deliveryMethod || "DELIVERY",
    orderData.paymentStatus || "PENDING",
    orderData.orderStatus || "PENDING",
    orderData.pickupLocation || null,
    orderData.deliveryAddress || null,
    createdAt
  );
  return await getOrderById(id);
}
async function updateOrder(id, updates) {
  const existing = await getOrderById(id);
  if (!existing) return null;
  db.prepare(`
    UPDATE orders
    SET payment_status = COALESCE(?, payment_status),
        order_status = COALESCE(?, order_status),
        pickup_location = COALESCE(?, pickup_location),
        delivery_address = COALESCE(?, delivery_address),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    updates.paymentStatus ?? null,
    updates.orderStatus ?? null,
    updates.pickupLocation ?? null,
    updates.deliveryAddress ?? null,
    id
  );
  return getOrderById(id);
}
export {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByBuyer,
  getOrdersBySeller,
  updateOrder
};
