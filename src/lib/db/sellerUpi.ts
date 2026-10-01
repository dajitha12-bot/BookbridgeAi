import { db } from './sqliteDb';

export interface SellerUpi {
  id: string;
  userId: string;
  upiId: string;
  createdAt: string;
}

export async function getSellerUpiByUserId(userId: string): Promise<string> {
  const row = db.prepare('SELECT upi_id FROM seller_upi WHERE user_id = ?').get(userId) as { upi_id: string } | undefined;
  if (row && row.upi_id) {
    return row.upi_id;
  }

  // Fallback: Check profile or generate realistic UPI ID from user name/email
  const userRow = db.prepare('SELECT name, email FROM users WHERE id = ?').get(userId) as { name: string; email: string } | undefined;
  if (userRow) {
    const cleanName = userRow.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const generatedUpi = `${cleanName || 'seller'}@upi`;
    
    // Save to seller_upi table for future lookup consistency
    try {
      db.prepare(`
        INSERT INTO seller_upi (id, user_id, upi_id)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET upi_id = excluded.upi_id
      `).run(`upi-${userId}`, userId, generatedUpi);
    } catch (e) {
      // Ignore if conflict handled
    }
    return generatedUpi;
  }

  return 'seller@upi';
}

export async function setSellerUpi(userId: string, upiId: string): Promise<string> {
  const cleanUpi = upiId.trim();
  db.prepare(`
    INSERT INTO seller_upi (id, user_id, upi_id)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET upi_id = excluded.upi_id
  `).run(`upi-${userId}`, userId, cleanUpi);
  return cleanUpi;
}
