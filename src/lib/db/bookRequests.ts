import { db } from './sqliteDb';
import { BookRequest } from '../../types';
import { generateId } from './dbHelper';

function mapRowToRequest(row: any): BookRequest {
  return {
    id: row.id,
    userId: row.user_id,
    requesterId: row.user_id,
    requesterName: row.requester_name || 'Community User',
    title: row.title,
    author: row.author || '',
    category: row.category,
    city: row.city || 'Chennai',
    urgency: row.urgency || 'MEDIUM',
    status: row.status || 'OPEN',
    createdAt: row.created_at,
  } as any;
}

export async function getAllBookRequests(): Promise<BookRequest[]> {
  const rows = db.prepare('SELECT * FROM book_requests ORDER BY created_at DESC').all();
  return rows.map(mapRowToRequest);
}

export async function getRequestsByUser(userId: string): Promise<BookRequest[]> {
  const rows = db.prepare('SELECT * FROM book_requests WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  return rows.map(mapRowToRequest);
}

export async function createBookRequest(requestData: Omit<BookRequest, 'id' | 'createdAt' | 'status'> & Partial<BookRequest>): Promise<BookRequest> {
  const id = `req-${generateId()}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO book_requests (id, user_id, requester_name, title, author, category, city, urgency, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    (requestData as any).userId || requestData.requesterId || 'usr-user1',
    (requestData as any).requesterName || (requestData as any).userName || 'Community User',
    requestData.title,
    requestData.author || '',
    requestData.category,
    (requestData as any).city || 'Chennai',
    (requestData as any).urgency || 'MEDIUM',
    requestData.status || 'OPEN',
    createdAt
  );

  const row = db.prepare('SELECT * FROM book_requests WHERE id = ?').get(id);
  return mapRowToRequest(row);
}

export async function updateBookRequest(id: string, updates: Partial<Omit<BookRequest, 'id' | 'createdAt'>> & Record<string, any>): Promise<BookRequest | null> {
  const existing = db.prepare('SELECT * FROM book_requests WHERE id = ?').get(id);
  if (!existing) return null;

  db.prepare(`
    UPDATE book_requests
    SET status = COALESCE(?, status),
        urgency = COALESCE(?, urgency),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(updates.status ?? null, updates.urgency ?? null, id);

  const row = db.prepare('SELECT * FROM book_requests WHERE id = ?').get(id);
  return mapRowToRequest(row);
}

export async function deleteBookRequest(id: string): Promise<boolean> {
  const result = db.prepare('DELETE FROM book_requests WHERE id = ?').run(id);
  return result.changes > 0;
}
