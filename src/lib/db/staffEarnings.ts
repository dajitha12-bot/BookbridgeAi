import { db } from './sqliteDb';
import { generateId } from './dbHelper';

export interface StaffEarning {
  id: string;
  staffId: string;
  deliveryId: string;
  orderId: string | null;
  deliveryCharge: number;
  earningAmount: number;
  status: 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  paidAt: string | null;
}

function mapRowToEarning(row: any): StaffEarning {
  return {
    id: row.id,
    staffId: row.staff_id,
    deliveryId: row.delivery_id,
    orderId: row.order_id || null,
    deliveryCharge: row.delivery_charge || 40.0,
    earningAmount: row.earning_amount || 20.0,
    status: row.status || 'COMPLETED',
    createdAt: row.created_at,
    paidAt: row.paid_at || null,
  };
}

/**
 * Records a staff earning entry upon delivery completion (prevents duplicates).
 */
export async function createStaffEarning(data: {
  staffId: string;
  deliveryId: string;
  orderId?: string | null;
  deliveryCharge?: number;
  earningAmount?: number;
}): Promise<StaffEarning> {
  const existing = db
    .prepare('SELECT * FROM staff_earnings WHERE staff_id = ? AND delivery_id = ?')
    .get(data.staffId, data.deliveryId);

  if (existing) {
    return mapRowToEarning(existing);
  }

  const id = `earn-${generateId()}`;
  const createdAt = new Date().toISOString();
  const deliveryCharge = data.deliveryCharge ?? 40.0;
  const earningAmount = data.earningAmount ?? deliveryCharge * 0.5; // Default 50% payout

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

  const row = db.prepare('SELECT * FROM staff_earnings WHERE id = ?').get(id);
  return mapRowToEarning(row);
}

/**
 * Gets all earnings for a specific staff member.
 */
export async function getStaffEarningsByStaff(staffId: string): Promise<StaffEarning[]> {
  const rows = db
    .prepare('SELECT * FROM staff_earnings WHERE staff_id = ? AND status = "COMPLETED" ORDER BY created_at DESC')
    .all(staffId);
  return rows.map(mapRowToEarning);
}

/**
 * Computes staff earnings summary (Today, Week, Month, Total).
 */
export async function getStaffEarningsSummary(staffId: string): Promise<{
  today: number;
  week: number;
  month: number;
  total: number;
}> {
  const earnings = await getStaffEarningsByStaff(staffId);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let today = 0;
  let week = 0;
  let month = 0;
  let total = 0;

  for (const e of earnings) {
    const amt = e.earningAmount || 0;
    total += amt;

    const eDate = new Date(e.createdAt);
    const eDateStr = eDate.toISOString().split('T')[0];

    if (eDateStr === todayStr) today += amt;
    if (eDate >= oneWeekAgo) week += amt;
    if (eDate >= oneMonthAgo) month += amt;
  }

  return { today, week, month, total };
}

/**
 * Gets all staff earnings across platform for Admin.
 */
export async function getAllStaffEarnings(): Promise<StaffEarning[]> {
  const rows = db.prepare('SELECT * FROM staff_earnings ORDER BY created_at DESC').all();
  return rows.map(mapRowToEarning);
}
