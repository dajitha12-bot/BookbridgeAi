import { db } from "../db/sqliteDb";
async function calculateDemandScore(categoryOrTitle) {
  const searchTerm = `%${categoryOrTitle.trim().toLowerCase()}%`;
  const reqRow = db.prepare(`
    SELECT COUNT(*) as count FROM book_requests
    WHERE LOWER(category) LIKE ? OR LOWER(title) LIKE ?
  `).get(searchTerm, searchTerm);
  const requestCount = reqRow?.count || 0;
  const wishRow = db.prepare(`
    SELECT COUNT(*) as count FROM wishlist w
    JOIN books b ON w.book_id = b.id
    WHERE LOWER(b.category) LIKE ? OR LOWER(b.title) LIKE ?
  `).get(searchTerm, searchTerm);
  const wishlistCount = wishRow?.count || 0;
  const searchRow = db.prepare(`
    SELECT COUNT(*) as count FROM search_activity
    WHERE LOWER(query) LIKE ? OR LOWER(category) LIKE ?
  `).get(searchTerm, searchTerm);
  const searchCount = searchRow?.count || 0;
  const viewRow = db.prepare(`
    SELECT COUNT(*) as count FROM book_views v
    JOIN books b ON v.book_id = b.id
    WHERE LOWER(b.category) LIKE ? OR LOWER(b.title) LIKE ?
  `).get(searchTerm, searchTerm);
  const viewCount = viewRow?.count || 0;
  const salesRow = db.prepare(`
    SELECT COUNT(*) as count FROM orders o
    JOIN books b ON o.book_id = b.id
    WHERE (LOWER(b.category) LIKE ? OR LOWER(b.title) LIKE ?) AND o.order_status = 'DELIVERED'
  `).get(searchTerm, searchTerm);
  const salesCount = salesRow?.count || 0;
  const rentRow = db.prepare(`
    SELECT COUNT(*) as count FROM rentals r
    JOIN books b ON r.book_id = b.id
    WHERE LOWER(b.category) LIKE ? OR LOWER(b.title) LIKE ?
  `).get(searchTerm, searchTerm);
  const excRow = db.prepare(`
    SELECT COUNT(*) as count FROM exchanges e
    JOIN books b ON e.requested_book_id = b.id
    WHERE LOWER(b.category) LIKE ? OR LOWER(b.title) LIKE ?
  `).get(searchTerm, searchTerm);
  const rentalExchangeCount = (rentRow?.count || 0) + (excRow?.count || 0);
  const requestPoints = Math.min(35, requestCount * 12);
  const wishlistPoints = Math.min(20, wishlistCount * 7);
  const searchPoints = Math.min(15, searchCount * 4);
  const viewPoints = Math.min(10, viewCount * 3);
  const salesPoints = Math.min(10, salesCount * 5);
  const rentalExchangePoints = Math.min(10, rentalExchangeCount * 5);
  let score = Math.round(requestPoints + wishlistPoints + searchPoints + viewPoints + salesPoints + rentalExchangePoints);
  if (score < 45) {
    const catLower = categoryOrTitle.toLowerCase();
    if (catLower.includes("programm") || catLower.includes("python") || catLower.includes("code")) score += 35;
    else if (catLower.includes("ai") || catLower.includes("artific")) score += 40;
    else if (catLower.includes("data") || catLower.includes("sql")) score += 28;
    else score += 20;
  }
  score = Math.min(98, Math.max(15, score));
  let demandLevel = "Medium";
  if (score >= 81) demandLevel = "Very High";
  else if (score >= 61) demandLevel = "High";
  else if (score >= 31) demandLevel = "Medium";
  else demandLevel = "Low";
  return {
    score,
    demandLevel,
    metrics: {
      requestCount,
      wishlistCount,
      searchCount,
      viewCount,
      salesCount,
      rentalExchangeCount
    },
    breakdown: {
      requestPoints,
      wishlistPoints,
      searchPoints,
      viewPoints,
      salesPoints,
      rentalExchangePoints
    }
  };
}
export {
  calculateDemandScore
};
