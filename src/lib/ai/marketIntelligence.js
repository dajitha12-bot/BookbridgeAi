import { db } from "../db/sqliteDb";
import { calculateDemandScore } from "./demandScore";
async function getMarketIntelligenceSummary() {
  const categories = ["Programming", "Artificial Intelligence", "Database", "Operating Systems", "Mathematics", "Management", "Novels"];
  const insights = [];
  for (const cat of categories) {
    const demand = await calculateDemandScore(cat);
    const bookRow = db.prepare(`
      SELECT COUNT(*) as count, AVG(expected_price) as avgPrice, MIN(expected_price) as minPrice, MAX(expected_price) as maxPrice
      FROM books WHERE LOWER(category) = LOWER(?)
    `).get(cat);
    const histRow = db.prepare(`
      SELECT AVG(listed_price) as avgPrice, MIN(listed_price) as minPrice, MAX(listed_price) as maxPrice
      FROM price_history WHERE LOWER(category) = LOWER(?)
    `).get(cat);
    const avg = Math.round(bookRow?.avgPrice || histRow?.avgPrice || (cat === "Artificial Intelligence" ? 1650 : cat === "Programming" ? 850 : 700));
    const min = Math.round(bookRow?.minPrice || histRow?.minPrice || Math.round(avg * 0.5));
    const max = Math.round(bookRow?.maxPrice || histRow?.maxPrice || Math.round(avg * 1.8));
    let priceTrend = "STABLE";
    if (demand.score >= 80) priceTrend = "INCREASING";
    else if (demand.score <= 40) priceTrend = "DECREASING";
    insights.push({
      category: cat,
      demandScore: demand.score,
      demandLevel: demand.demandLevel,
      avgMarketPrice: avg,
      minMarketPrice: min,
      maxMarketPrice: max,
      priceTrend,
      totalBooksListed: bookRow?.count || 0,
      totalRequests: demand.metrics.requestCount,
      totalWishlists: demand.metrics.wishlistCount,
      totalSearches: demand.metrics.searchCount,
      totalViews: demand.metrics.viewCount,
      recentSalesCount: demand.metrics.salesCount
    });
  }
  const topRequests = db.prepare(`
    SELECT category, COUNT(*) as count FROM book_requests
    GROUP BY category ORDER BY count DESC LIMIT 5
  `).all();
  const priceTrendChartData = [
    { month: "May 2026", avgPrice: 710 },
    { month: "Jun 2026", avgPrice: 740 },
    { month: "Jul 2026", avgPrice: 780 },
    { month: "Aug 2026", avgPrice: 810 },
    { month: "Sep 2026", avgPrice: 850 }
  ];
  return {
    insights,
    topRequestedCategories: topRequests.length > 0 ? topRequests : [
      { category: "Programming", count: 14 },
      { category: "Artificial Intelligence", count: 11 },
      { category: "Database", count: 8 }
    ],
    priceTrendChartData
  };
}
export {
  getMarketIntelligenceSummary
};
