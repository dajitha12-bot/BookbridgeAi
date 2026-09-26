import { db } from './sqliteDb';
import { Book } from '../../types';
import { generateId } from './dbHelper';

function mapRowToBook(row: any): Book {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    author: row.author,
    category: row.category,
    subject: row.subject || '',
    isbn: row.isbn || '',
    edition: row.edition || 1,
    publicationYear: row.publication_year || new Date().getFullYear(),
    purchaseDate: row.purchase_date || undefined,
    originalPrice: row.original_price || 0,
    expectedPrice: row.expected_price || 0,
    rentalPricePerDay: row.rental_price_per_day || 0,
    securityDeposit: row.security_deposit || 0,
    condition: row.condition || 'GOOD',
    description: row.description || '',
    imageUrl: row.image_url || null,
    city: row.city || 'Chennai',
    area: row.area || 'Adyar',
    pincode: row.pincode || '600020',
    deliveryAvailable: Boolean(row.delivery_available),
    exchangeAvailable: Boolean(row.exchange_available),
    donationAvailable: Boolean(row.donation_available),
    rentalAvailable: Boolean(row.rental_available),
    status: row.status || 'AVAILABLE',
    createdAt: row.created_at,
  } as any;
}

export async function getAllBooks(): Promise<Book[]> {
  const rows = db.prepare('SELECT * FROM books ORDER BY created_at DESC').all();
  return rows.map(mapRowToBook);
}

export async function getBookById(id: string): Promise<Book | null> {
  const row = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  if (!row) return null;

  // Record book view activity for demand calculations
  try {
    db.prepare('INSERT INTO book_views (id, book_id) VALUES (?, ?)').run(`view_${generateId()}`, id);
  } catch (e) {
    // Ignore non-fatal log error
  }

  return mapRowToBook(row);
}

export async function getBooksByOwner(ownerId: string): Promise<Book[]> {
  // Return books owned by exact ownerId or normalized fallback user
  const rows = db.prepare('SELECT * FROM books WHERE owner_id = ? OR (owner_id = "usr-user1" AND ? = "usr-user1") ORDER BY created_at DESC').all(ownerId, ownerId);
  return rows.map(mapRowToBook);
}

export async function createBook(bookData: Omit<Book, 'id' | 'createdAt' | 'status'> & Partial<Book>): Promise<Book> {
  const id = `bk-${generateId()}`;
  const createdAt = new Date().toISOString();
  const status = bookData.status || 'AVAILABLE';

  db.prepare(`
    INSERT INTO books (
      id, owner_id, title, author, category, subject, isbn, edition, publication_year,
      original_price, expected_price, rental_price_per_day, security_deposit, condition,
      description, image_url, city, area, pincode, delivery_available, exchange_available,
      donation_available, rental_available, status, purchase_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    bookData.ownerId,
    bookData.title,
    bookData.author,
    bookData.category,
    bookData.subject || '',
    bookData.isbn || '',
    bookData.edition || 1,
    bookData.publicationYear || new Date().getFullYear(),
    bookData.originalPrice || 0,
    bookData.expectedPrice || 0,
    (bookData as any).rentalPricePerDay || 0,
    (bookData as any).securityDeposit || 0,
    bookData.condition || 'GOOD',
    bookData.description || '',
    bookData.imageUrl || null,
    bookData.city || 'Chennai',
    bookData.area || 'Adyar',
    bookData.pincode || '600020',
    bookData.deliveryAvailable ? 1 : 0,
    bookData.exchangeAvailable ? 1 : 0,
    bookData.donationAvailable ? 1 : 0,
    (bookData as any).rentalAvailable ? 1 : 0,
    status,
    bookData.purchaseDate || new Date().toISOString().split('T')[0],
    createdAt
  );

  // Insert initial price history record
  try {
    db.prepare(`
      INSERT INTO price_history (id, book_id, title, category, original_price, listed_price, condition, edition, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`ph_${generateId()}`, id, bookData.title, bookData.category, bookData.originalPrice || 0, bookData.expectedPrice || 0, bookData.condition || 'GOOD', bookData.edition || 1, bookData.city || 'Chennai');
  } catch (e) {
    // Non-fatal
  }

  return (await getBookById(id))!;
}

export async function updateBook(id: string, updates: Partial<Omit<Book, 'id' | 'ownerId' | 'createdAt'>> & Record<string, any>): Promise<Book | null> {
  const existing = await getBookById(id);
  if (!existing) return null;

  db.prepare(`
    UPDATE books
    SET title = COALESCE(?, title),
        author = COALESCE(?, author),
        category = COALESCE(?, category),
        expected_price = COALESCE(?, expected_price),
        status = COALESCE(?, status),
        condition = COALESCE(?, condition),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        delivery_available = COALESCE(?, delivery_available),
        exchange_available = COALESCE(?, exchange_available),
        donation_available = COALESCE(?, donation_available),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    updates.title ?? null,
    updates.author ?? null,
    updates.category ?? null,
    updates.expectedPrice ?? null,
    updates.status ?? null,
    updates.condition ?? null,
    updates.description ?? null,
    updates.imageUrl ?? null,
    updates.deliveryAvailable !== undefined ? (updates.deliveryAvailable ? 1 : 0) : null,
    updates.exchangeAvailable !== undefined ? (updates.exchangeAvailable ? 1 : 0) : null,
    updates.donationAvailable !== undefined ? (updates.donationAvailable ? 1 : 0) : null,
    id
  );

  return getBookById(id);
}

export async function deleteBook(id: string): Promise<boolean> {
  const result = db.prepare('DELETE FROM books WHERE id = ?').run(id);
  return result.changes > 0;
}
