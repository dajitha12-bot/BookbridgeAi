import { db } from './sqliteDb';
import { Exchange } from '../../types';
import { generateId } from './dbHelper';

function mapRowToExchange(row: any): Exchange {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    offeredBookId: row.offered_book_id,
    requestedBookId: row.requested_book_id,
    handoverMethod: row.handover_method || 'DELIVERY',
    status: row.status || 'PENDING',
    createdAt: row.created_at,
  } as any;
}

export async function getAllExchanges(): Promise<Exchange[]> {
  const rows = db.prepare('SELECT * FROM exchanges ORDER BY created_at DESC').all();
  return rows.map(mapRowToExchange);
}

export async function getExchangeById(id: string): Promise<Exchange | null> {
  const row = db.prepare('SELECT * FROM exchanges WHERE id = ?').get(id);
  return row ? mapRowToExchange(row) : null;
}

export async function getExchangesByUser(userId: string): Promise<Exchange[]> {
  const rows = db.prepare('SELECT * FROM exchanges WHERE sender_id = ? OR receiver_id = ? ORDER BY created_at DESC').all(userId, userId);
  return rows.map(mapRowToExchange);
}

export async function createExchange(exchangeData: Omit<Exchange, 'id' | 'createdAt'> & Partial<Exchange>): Promise<Exchange> {
  const id = `exc-${generateId()}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO exchanges (id, sender_id, receiver_id, offered_book_id, requested_book_id, handover_method, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    exchangeData.senderId,
    exchangeData.receiverId,
    exchangeData.offeredBookId,
    exchangeData.requestedBookId,
    (exchangeData as any).handoverMethod || 'DELIVERY',
    exchangeData.status || 'PENDING',
    createdAt
  );

  return (await getExchangeById(id))!;
}

export async function updateExchange(id: string, updates: Partial<Omit<Exchange, 'id' | 'createdAt'>> & Record<string, any>): Promise<Exchange | null> {
  const existing = await getExchangeById(id);
  if (!existing) return null;

  db.prepare(`
    UPDATE exchanges
    SET status = COALESCE(?, status),
        handover_method = COALESCE(?, handover_method),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    updates.status ?? null,
    (updates as any).handoverMethod ?? null,
    id
  );

  return getExchangeById(id);
}
