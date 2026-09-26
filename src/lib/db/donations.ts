import { db } from './sqliteDb';
import { DonationRequest } from '../../types';
import { generateId } from './dbHelper';

function mapRowToDonation(row: any): DonationRequest {
  return {
    id: row.id,
    institutionName: row.institution_name,
    regNumber: row.reg_number || '',
    title: row.title || 'Donated Book Request',
    category: row.category || 'General',
    quantityNeeded: row.quantity_needed || 1,
    description: row.purpose || '',
    city: row.city || 'Chennai',
    contactPhone: row.contact_phone || '',
    status: row.status === 'APPROVED' || row.status === 'FULFILLED' ? 'FULFILLED' : 'PENDING',
    createdAt: row.created_at,
  } as any;
}

export async function getAllDonationRequests(): Promise<DonationRequest[]> {
  const rows = db.prepare('SELECT * FROM donations ORDER BY created_at DESC').all();
  return rows.map(mapRowToDonation);
}

export async function createDonationRequest(data: Omit<DonationRequest, 'id' | 'createdAt' | 'status'> & Partial<DonationRequest>): Promise<DonationRequest> {
  const id = `don-${generateId()}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO donations (
      id, institution_name, reg_number, purpose, quantity_needed, city, contact_phone, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.institutionName,
    data.regNumber || '',
    data.description || (data as any).purpose || '',
    data.quantityNeeded || 1,
    data.city || 'Chennai',
    data.contactPhone || '',
    'SUBMITTED',
    createdAt
  );

  const row = db.prepare('SELECT * FROM donations WHERE id = ?').get(id);
  return mapRowToDonation(row);
}

export async function updateDonationRequest(id: string, updates: any): Promise<any> {
  db.prepare(`
    UPDATE donations
    SET status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(updates.status ?? null, id);
  const row = db.prepare('SELECT * FROM donations WHERE id = ?').get(id);
  return mapRowToDonation(row);
}

export async function fulfillDonationRequest(requestId: string, bookId: string): Promise<boolean> {
  const result = db.prepare('UPDATE donations SET status = "FULFILLED", book_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(bookId, requestId);
  return result.changes > 0;
}
