import { db } from './sqliteDb';
import { Delivery, DeliveryStaff } from '../../types';
import { generateId } from './dbHelper';

function mapRowToDelivery(row: any): Delivery {
  return {
    id: row.id,
    orderId: row.order_id || '',
    rentalId: row.rental_id || null,
    exchangeId: row.exchange_id || null,
    staffId: row.staff_id || '',
    deliveryType: row.delivery_type || 'ORDER',
    pickupAddress: row.pickup_address || '',
    deliveryAddress: row.delivery_address || '',
    status: row.status || 'ASSIGNED',
    distanceKm: row.distance_km || 5.0,
    deliveryCharge: row.delivery_charge || 30.0,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  } as any;
}

function mapRowToStaff(row: any): DeliveryStaff {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    phone: row.phone,
    city: row.city || 'Chennai',
    area: row.area || 'Guindy',
    pincode: row.pincode || '600032',
    serviceArea: row.service_area || 'Chennai Central',
    availability: Boolean(row.availability),
    activeDeliveries: row.active_deliveries || 0,
  } as any;
}

export async function getAllDeliveries(): Promise<Delivery[]> {
  const rows = db.prepare('SELECT * FROM deliveries ORDER BY created_at DESC').all();
  return rows.map(mapRowToDelivery);
}

export async function getDeliveryById(id: string): Promise<Delivery | null> {
  const row = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(id);
  return row ? mapRowToDelivery(row) : null;
}

export async function getDeliveryByOrderId(orderId: string): Promise<Delivery | null> {
  const row = db.prepare('SELECT * FROM deliveries WHERE order_id = ? OR rental_id = ? OR exchange_id = ?').get(orderId, orderId, orderId);
  return row ? mapRowToDelivery(row) : null;
}

export async function getDeliveriesByStaff(staffId: string): Promise<Delivery[]> {
  const rows = db.prepare('SELECT * FROM deliveries WHERE staff_id = ? ORDER BY created_at DESC').all(staffId);
  return rows.map(mapRowToDelivery);
}

export async function createDelivery(deliveryData: Omit<Delivery, 'id' | 'updatedAt'> & Partial<Delivery>): Promise<Delivery> {
  const id = `del-${generateId()}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO deliveries (
      id, order_id, rental_id, exchange_id, staff_id, delivery_type, pickup_address,
      delivery_address, status, distance_km, delivery_charge, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    deliveryData.orderId || null,
    (deliveryData as any).rentalId || null,
    (deliveryData as any).exchangeId || null,
    deliveryData.staffId || null,
    (deliveryData as any).deliveryType || 'ORDER',
    (deliveryData as any).pickupAddress || '',
    (deliveryData as any).deliveryAddress || '',
    deliveryData.status || 'ASSIGNED',
    (deliveryData as any).distanceKm || 5.0,
    (deliveryData as any).deliveryCharge || 30.0,
    createdAt
  );

  return (await getDeliveryById(id))!;
}

export async function updateDelivery(id: string, updates: Partial<Omit<Delivery, 'id' | 'updatedAt'>> & Record<string, any>): Promise<Delivery | null> {
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

// --- DELIVERY STAFF REPOSITORY ---

export async function getAllDeliveryStaff(): Promise<DeliveryStaff[]> {
  const rows = db.prepare('SELECT * FROM delivery_staff ORDER BY name ASC').all();
  return rows.map(mapRowToStaff);
}

export async function getDeliveryStaffById(userId: string): Promise<DeliveryStaff | null> {
  const row = db.prepare('SELECT * FROM delivery_staff WHERE user_id = ? OR id = ?').get(userId, userId);
  return row ? mapRowToStaff(row) : null;
}

export async function createDeliveryStaff(staffData: DeliveryStaff): Promise<DeliveryStaff> {
  const id = staffData.id || `ds-${generateId()}`;

  db.prepare(`
    INSERT INTO delivery_staff (id, user_id, name, phone, city, area, pincode, service_area, availability, active_deliveries)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    staffData.userId,
    staffData.name,
    staffData.phone,
    staffData.city || 'Chennai',
    staffData.area || 'Guindy',
    staffData.pincode || '600032',
    staffData.serviceArea || 'Chennai Central',
    staffData.availability ? 1 : 0,
    staffData.activeDeliveries || 0
  );

  return (await getDeliveryStaffById(staffData.userId))!;
}

export async function updateDeliveryStaff(userId: string, updates: Partial<Omit<DeliveryStaff, 'userId'>> & Record<string, any>): Promise<DeliveryStaff | null> {
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
    updates.availability !== undefined ? (updates.availability ? 1 : 0) : null,
    updates.activeDeliveries ?? null,
    updates.serviceArea ?? null,
    userId,
    userId
  );

  return getDeliveryStaffById(userId);
}
