import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToBook(row) {
  const cleanIsbn = (row.isbn || "").replace(/[^0-9X]/gi, "");
  let resolvedImageUrl = row.image_url || null;
  if (!resolvedImageUrl && cleanIsbn) {
    resolvedImageUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
  }
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    author: row.author,
    category: row.category,
    subject: row.subject || "",
    isbn: row.isbn || "",
    edition: row.edition || 1,
    publicationYear: row.publication_year || (/* @__PURE__ */ new Date()).getFullYear(),
    purchaseDate: row.purchase_date || void 0,
    originalPrice: row.original_price || 0,
    expectedPrice: row.expected_price || 0,
    rentalPricePerDay: row.rental_price_per_day || 0,
    securityDeposit: row.security_deposit || 0,
    condition: row.condition || "GOOD",
    description: row.description || "",
    imageUrl: resolvedImageUrl,
    city: row.city || "Chennai",
    area: row.area || "Adyar",
    pincode: row.pincode || "600020",
    deliveryAvailable: Boolean(row.delivery_available),
    exchangeAvailable: Boolean(row.exchange_available),
    donationAvailable: Boolean(row.donation_available),
    rentalAvailable: Boolean(row.rental_available),
    status: row.status || "AVAILABLE",
    createdAt: row.created_at
  };
}
function getBookImages(bookId) {
  try {
    const rows = db.prepare("SELECT * FROM book_images WHERE book_id = ? ORDER BY display_order ASC").all(bookId);
    return rows.map((r) => ({
      id: r.id,
      bookId: r.book_id,
      imageUrl: r.image_url,
      imageType: r.image_type || "Cover Page",
      displayOrder: r.display_order || 1,
      isPrimary: Boolean(r.is_primary)
    }));
  } catch (e) {
    return [];
  }
}
function saveBookImages(bookId, images) {
  try {
    db.prepare("DELETE FROM book_images WHERE book_id = ?").run(bookId);
    const stmt = db.prepare(`
      INSERT INTO book_images (id, book_id, image_url, image_type, display_order, is_primary)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    images.forEach((img, idx) => {
      stmt.run(
        `img_${generateId()}`,
        bookId,
        img.imageUrl,
        img.imageType || (idx === 0 ? "Cover Page" : idx === 1 ? "Spine" : idx === 2 ? "Inside Pages" : "Back Cover"),
        img.displayOrder || idx + 1,
        img.isPrimary ? 1 : idx === 0 ? 1 : 0
      );
    });
  } catch (e) {
    console.error("Failed to save book images:", e);
  }
}
async function getAllBooks() {
  const rows = db.prepare("SELECT * FROM books ORDER BY created_at DESC").all();
  return rows.map((row) => {
    const b = mapRowToBook(row);
    const images = getBookImages(b.id);
    b.images = images;
    if (images.length > 0) {
      const primary = images.find((img) => img.isPrimary) || images[0];
      if (primary) b.imageUrl = primary.imageUrl;
    }
    return b;
  });
}
async function getBookById(id) {
  const row = db.prepare("SELECT * FROM books WHERE id = ?").get(id);
  if (!row) return null;
  try {
    db.prepare("INSERT INTO book_views (id, book_id) VALUES (?, ?)").run(`view_${generateId()}`, id);
  } catch (e) {
  }
  const b = mapRowToBook(row);
  const images = getBookImages(b.id);
  b.images = images;
  if (images.length > 0) {
    const primary = images.find((img) => img.isPrimary) || images[0];
    if (primary) b.imageUrl = primary.imageUrl;
  }
  return b;
}
async function getBooksByOwner(ownerId) {
  const rows = db.prepare("SELECT * FROM books WHERE owner_id = ? OR (owner_id = 'usr-user1' AND ? = 'usr-user1') ORDER BY created_at DESC").all(ownerId, ownerId);
  return rows.map((row) => {
    const b = mapRowToBook(row);
    const images = getBookImages(b.id);
    b.images = images;
    if (images.length > 0) {
      const primary = images.find((img) => img.isPrimary) || images[0];
      if (primary) b.imageUrl = primary.imageUrl;
    }
    return b;
  });
}
async function createBook(bookData) {
  const id = `bk-${generateId()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const status = bookData.status || "AVAILABLE";
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
    bookData.subject || "",
    bookData.isbn || "",
    bookData.edition || 1,
    bookData.publicationYear || (/* @__PURE__ */ new Date()).getFullYear(),
    bookData.originalPrice || 0,
    bookData.expectedPrice || 0,
    bookData.rentalPricePerDay || 0,
    bookData.securityDeposit || 0,
    bookData.condition || "GOOD",
    bookData.description || "",
    bookData.imageUrl || null,
    bookData.city || "Chennai",
    bookData.area || "Adyar",
    bookData.pincode || "600020",
    bookData.deliveryAvailable ? 1 : 0,
    bookData.exchangeAvailable ? 1 : 0,
    bookData.donationAvailable ? 1 : 0,
    bookData.rentalAvailable ? 1 : 0,
    status,
    bookData.purchaseDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    createdAt
  );
  try {
    db.prepare(`
      INSERT INTO price_history (id, book_id, title, category, original_price, listed_price, condition, edition, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`ph_${generateId()}`, id, bookData.title, bookData.category, bookData.originalPrice || 0, bookData.expectedPrice || 0, bookData.condition || "GOOD", bookData.edition || 1, bookData.city || "Chennai");
  } catch (e) {
  }
  return await getBookById(id);
}
async function updateBook(id, updates) {
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
    updates.deliveryAvailable !== void 0 ? updates.deliveryAvailable ? 1 : 0 : null,
    updates.exchangeAvailable !== void 0 ? updates.exchangeAvailable ? 1 : 0 : null,
    updates.donationAvailable !== void 0 ? updates.donationAvailable ? 1 : 0 : null,
    id
  );
  return getBookById(id);
}
async function deleteBook(id) {
  const result = db.prepare("DELETE FROM books WHERE id = ?").run(id);
  return result.changes > 0;
}
export {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  getBookImages,
  getBooksByOwner,
  saveBookImages,
  updateBook
};
