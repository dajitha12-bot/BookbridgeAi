import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToEarning(row) {
  return {
    id: row.id,
    staffId: row.staff_id,
    deliveryId: row.delivery_id,
    orderId: row.order_id || null,
    deliveryCharge: row.delivery_charge || 40,
    earningAmount: row.earning_amount || 20,
    status: row.status || "COMPLETED",
    createdAt: row.created_at,
    paidAt: row.paid_at || null
  };
}
async function createStaffEarning(data) {
  const existing = db.prepare("SELECT * FROM staff_earnings WHERE staff_id = ? AND delivery_id = ?").get(data.staffId, data.deliveryId);
  if (existing) {
    return mapRowToEarning(existing);
  }
  const id = `earn-${generateId()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const deliveryCharge = data.deliveryCharge ?? 40;
  const earningAmount = data.earningAmount ?? deliveryCharge * 0.5;
  db.prepare(`
    INSERT INTO staff_earnings (
      id, staff_id, delivery_id, order_id, delivery_charge, earning_amount, status, created_at, paid_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?, ?)
  `).run(
    id,
    data.staffId,
    data.deliveryId,
    data.orderId || null,
    deliveryCharge,
    earningAmount,
    createdAt,
    createdAt
  );
  const row = db.prepare("SELECT * FROM staff_earnings WHERE id = ?").get(id);
  return mapRowToEarning(row);
}
async function getStaffEarningsByStaff(staffId) {
  const rows = db.prepare('SELECT * FROM staff_earnings WHERE staff_id = ? AND status = "COMPLETED" ORDER BY created_at DESC').all(staffId);
  return rows.map(mapRowToEarning);
}
async function getStaffEarningsSummary(staffId) {
  const earnings = await getStaffEarningsByStaff(staffId);
  const now = /* @__PURE__ */ new Date();
  const todayStr = now.toISOString().split("T")[0];
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
  let today = 0;
  let week = 0;
  let month = 0;
  let total = 0;
  for (const e of earnings) {
    const amt = e.earningAmount || 0;
    total += amt;
    const eDate = new Date(e.createdAt);
    const eDateStr = eDate.toISOString().split("T")[0];
    if (eDateStr === todayStr) today += amt;
    if (eDate >= oneWeekAgo) week += amt;
    if (eDate >= oneMonthAgo) month += amt;
  }
  return { today, week, month, total };
}
async function getAllStaffEarnings() {
  const rows = db.prepare("SELECT * FROM staff_earnings ORDER BY created_at DESC").all();
  return rows.map(mapRowToEarning);
}
export {
  createStaffEarning,
  getAllStaffEarnings,
  getStaffEarningsByStaff,
  getStaffEarningsSummary
};
