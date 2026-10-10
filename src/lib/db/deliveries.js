import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToDelivery(row) {
  return {
    id: row.id,
    orderId: row.order_id || "",
    rentalId: row.rental_id || null,
    exchangeId: row.exchange_id || null,
    staffId: row.staff_id || "",
    deliveryType: row.delivery_type || "ORDER",
    pickupAddress: row.pickup_address || "",
    deliveryAddress: row.delivery_address || "",
    status: row.status || "ASSIGNED",
    distanceKm: row.distance_km || 5,
    deliveryCharge: row.delivery_charge || 30,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at
  };
}
function mapRowToStaff(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    phone: row.phone,
    city: row.city || "Chennai",
    area: row.area || "Guindy",
    pincode: row.pincode || "600032",
    serviceArea: row.service_area || "Chennai Central",
    availability: Boolean(row.availability),
    activeDeliveries: row.active_deliveries || 0
  };
}
async function getAllDeliveries() {
  const rows = db.prepare("SELECT * FROM deliveries ORDER BY created_at DESC").all();
  return rows.map(mapRowToDelivery);
}
async function getDeliveryById(id) {
  const row = db.prepare("SELECT * FROM deliveries WHERE id = ?").get(id);
  return row ? mapRowToDelivery(row) : null;
}
async function getDeliveryByOrderId(orderId) {
  const row = db.prepare("SELECT * FROM deliveries WHERE order_id = ? OR rental_id = ? OR exchange_id = ?").get(orderId, orderId, orderId);
  return row ? mapRowToDelivery(row) : null;
}
async function getDeliveriesByStaff(staffId) {
  const rows = db.prepare("SELECT * FROM deliveries WHERE staff_id = ? ORDER BY created_at DESC").all(staffId);
  return rows.map(mapRowToDelivery);
}
async function createDelivery(deliveryData) {
  const id = `del-${generateId()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  db.prepare(`
    INSERT INTO deliveries (
      id, order_id, rental_id, exchange_id, staff_id, delivery_type, pickup_address,
      delivery_address, status, distance_km, delivery_charge, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    deliveryData.orderId || null,
    deliveryData.rentalId || null,
    deliveryData.exchangeId || null,
    deliveryData.staffId || null,
    deliveryData.deliveryType || "ORDER",
    deliveryData.pickupAddress || "",
    deliveryData.deliveryAddress || "",
    deliveryData.status || "ASSIGNED",
    deliveryData.distanceKm || 5,
    deliveryData.deliveryCharge || 30,
    createdAt
  );
  return await getDeliveryById(id);
}
async function updateDelivery(id, updates) {
  const existing = await getDeliveryById(id);
  if (!existing) return null;
  db.prepare(`
    UPDATE deliveries
    SET staff_id = COALESCE(?, staff_id),
        status = COALESCE(?, status),
        pickup_address = COALESCE(?, pickup_address),
        delivery_address = COALESCE(?, delivery_address),
        delivery_charge = COALESCE(?, delivery_charge),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    updates.staffId ?? null,
    updates.status ?? null,
    updates.pickupAddress ?? null,
    updates.deliveryAddress ?? null,
    updates.deliveryCharge ?? null,
    id
  );
  return getDeliveryById(id);
}
async function getAllDeliveryStaff() {
  const rows = db.prepare("SELECT * FROM delivery_staff ORDER BY name ASC").all();
  return rows.map(mapRowToStaff);
}
async function getDeliveryStaffById(userId) {
  const row = db.prepare("SELECT * FROM delivery_staff WHERE user_id = ? OR id = ?").get(userId, userId);
  return row ? mapRowToStaff(row) : null;
}
async function createDeliveryStaff(staffData) {
  const id = staffData.id || `ds-${generateId()}`;
  db.prepare(`
    INSERT INTO delivery_staff (id, user_id, name, phone, city, area, pincode, service_area, availability, active_deliveries)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    staffData.userId,
    staffData.name,
    staffData.phone,
    staffData.city || "Chennai",
    staffData.area || "Guindy",
    staffData.pincode || "600032",
    staffData.serviceArea || "Chennai Central",
    staffData.availability ? 1 : 0,
    staffData.activeDeliveries || 0
  );
  return await getDeliveryStaffById(staffData.userId);
}
async function updateDeliveryStaff(userId, updates) {
  const existing = await getDeliveryStaffById(userId);
  if (!existing) return null;
  db.prepare(`
    UPDATE delivery_staff
    SET availability = COALESCE(?, availability),
        active_deliveries = COALESCE(?, active_deliveries),
        service_area = COALESCE(?, service_area),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ? OR id = ?
  `).run(
    updates.availability !== void 0 ? updates.availability ? 1 : 0 : null,
    updates.activeDeliveries ?? null,
    updates.serviceArea ?? null,
    userId,
    userId
  );
  return getDeliveryStaffById(userId);
}
export {
  createDelivery,
  createDeliveryStaff,
  getAllDeliveries,
  getAllDeliveryStaff,
  getDeliveriesByStaff,
  getDeliveryById,
  getDeliveryByOrderId,
  getDeliveryStaffById,
  updateDelivery,
  updateDeliveryStaff
};
