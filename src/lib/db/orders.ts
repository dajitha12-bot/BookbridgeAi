import { db } from './sqliteDb';
import { Order } from '../../types';
import { generateId } from './dbHelper';

function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    bookId: row.book_id,
    amount: row.amount || 0,
    deliveryCharge: row.delivery_charge || 0,
    securityDeposit: row.security_deposit || 0,
    totalAmount: row.total_amount || row.amount || 0,
    deliveryMethod: row.delivery_method || 'DELIVERY',
    paymentStatus: row.payment_status || 'PENDING',
    orderStatus: row.order_status || 'PENDING',
    pickupLocation: row.pickup_location || null,
    deliveryAddress: row.delivery_address || null,
    createdAt: row.created_at,
  } as any;
}

export async function getAllOrders(): Promise<Order[]> {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  return rows.map(mapRowToOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return row ? mapRowToOrder(row) : null;
}

export async function getOrdersByBuyer(buyerId: string): Promise<Order[]> {
  const rows = db.prepare('SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC').all(buyerId);
  return rows.map(mapRowToOrder);
}

export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  const rows = db.prepare('SELECT * FROM orders WHERE seller_id = ? ORDER BY created_at DESC').all(sellerId);
  return rows.map(mapRowToOrder);
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'> & Partial<Order>): Promise<Order> {
  const id = `ord-${generateId()}`;
  const createdAt = new Date().toISOString();
  const deliveryCharge = (orderData as any).deliveryCharge || (orderData.deliveryMethod === 'DELIVERY' ? 30 : 0);
  const totalAmount = (orderData as any).totalAmount || (orderData.amount + deliveryCharge);

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
    (orderData as any).securityDeposit || 0,
    totalAmount,
    orderData.deliveryMethod || 'DELIVERY',
    orderData.paymentStatus || 'PENDING',
    orderData.orderStatus || 'PENDING',
    orderData.pickupLocation || null,
    (orderData as any).deliveryAddress || null,
    createdAt
  );

  return (await getOrderById(id))!;
}

export async function updateOrder(id: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>> & Record<string, any>): Promise<Order | null> {
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
