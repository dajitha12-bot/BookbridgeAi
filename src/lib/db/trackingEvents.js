import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToEvent(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    deliveryId: row.delivery_id || null,
    status: row.status,
    stageName: row.stage_name,
    locationName: row.location_name || null,
    description: row.description || null,
    eventTime: row.event_time || row.created_at,
    createdAt: row.created_at
  };
}
async function createTrackingEvent(data) {
  const id = `trk-${generateId()}`;
  const now = data.eventTime || (/* @__PURE__ */ new Date()).toISOString();
  db.prepare(`
    INSERT INTO delivery_tracking_events (
      id, order_id, delivery_id, status, stage_name, location_name, description, event_time, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.orderId,
    data.deliveryId || null,
    data.status,
    data.stageName,
    data.locationName || null,
    data.description || null,
    now,
    now
  );
  const row = db.prepare("SELECT * FROM delivery_tracking_events WHERE id = ?").get(id);
  return mapRowToEvent(row);
}
async function getTrackingEventsByOrder(orderId) {
  const rows = db.prepare("SELECT * FROM delivery_tracking_events WHERE order_id = ? ORDER BY event_time ASC").all(orderId);
  return rows.map(mapRowToEvent);
}
export {
  createTrackingEvent,
  getTrackingEventsByOrder
};
