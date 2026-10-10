import { db } from "../db/sqliteDb";
import { calculateDemandScore } from "./demandScore";
import { analyzeBookImage } from "./imageAnalysis";
async function predictFairPrice(input) {
  const mrp = input.originalPrice || 1e3;
  const edition = input.edition || 1;
  const isbnStr = input.isbn || "ISBN-Not-Specified";
  const titleStr = input.title || "Book Listing";
  const pDateStr = input.purchaseDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const purchase = new Date(pDateStr);
  const now = /* @__PURE__ */ new Date();
  const diffMs = Math.max(0, now.getTime() - purchase.getTime());
  const ageDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
  const totalMonths = Math.max(0, (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth()));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const ageInYears = parseFloat((totalMonths / 12).toFixed(1));
  let ageFormatted = "";
  const yrsText = years === 1 ? "1 year" : `${years} years`;
  const mosText = months === 1 ? "1 month" : `${months} months`;
  if (years === 0 && months === 0) {
    ageFormatted = `0 months (${ageDays} days)`;
  } else if (years === 0) {
    ageFormatted = `${mosText} (${ageDays} days)`;
  } else if (months === 0) {
    ageFormatted = `${yrsText} (${ageDays} days)`;
  } else {
    ageFormatted = `${yrsText} ${mosText} (${ageDays} days)`;
  }
  const depreciationRate = Math.min(0.6, ageInYears * 0.15);
  const baseDepreciatedPrice = mrp * (1 - depreciationRate);
  const visualAnalysis = await analyzeBookImage(input.imageUrl, input.condition);
  let conditionMultiplier = 0.8;
  const condUpper = (visualAnalysis.detectedCondition || input.condition || "GOOD").toUpperCase();
  if (condUpper === "LIKE_NEW" || condUpper === "NEW") conditionMultiplier = 0.92;
  else if (condUpper === "VERY_GOOD") conditionMultiplier = 0.85;
  else if (condUpper === "GOOD") conditionMultiplier = 0.75;
  else conditionMultiplier = 0.6;
  const demandResult = await calculateDemandScore(input.category || input.title);
  const demandScore = demandResult.score;
  const demandMultiplier = 0.85 + demandScore / 100 * 0.3;
  const editionBonus = edition > 2 ? (edition - 1) * 35 : 0;
  let historicalAvgPrice = void 0;
  try {
    const histRow = db.prepare(`
      SELECT AVG(listed_price) as avgPrice FROM price_history
      WHERE LOWER(category) = LOWER(?) OR LOWER(title) LIKE ?
    `).get(input.category || "", `%${titleStr.slice(0, 10).toLowerCase()}%`);
    if (histRow && histRow.avgPrice) {
      historicalAvgPrice = Math.round(histRow.avgPrice);
    }
  } catch (e) {
  }
  let referencePrice = historicalAvgPrice;
  if (!referencePrice) {
    try {
      const mktRow = db.prepare(`
        SELECT avg_market_price FROM market_data
        WHERE LOWER(category) = LOWER(?)
      `).get(input.category || "");
      if (mktRow && mktRow.avg_market_price) {
        referencePrice = Math.round(mktRow.avg_market_price);
      }
    } catch (e) {
    }
  }
  if (!referencePrice) {
    referencePrice = Math.round(mrp * 0.55);
  }
  let calculatedPrice = baseDepreciatedPrice * conditionMultiplier * demandMultiplier + editionBonus;
  if (historicalAvgPrice) {
    calculatedPrice = calculatedPrice * 0.6 + historicalAvgPrice * 0.4;
  }
  const finalPrice = Math.round(Math.min(mrp * 0.9, Math.max(mrp * 0.2, calculatedPrice)));
  const minPrice = Math.round(finalPrice * 0.88);
  const maxPrice = Math.round(finalPrice * 1.12);
  const suggestedRentalPrice5Days = Math.max(35, Math.round(finalPrice * 0.15));
  const totalActivityCount = demandResult.metrics.requestCount + demandResult.metrics.wishlistCount + demandResult.metrics.searchCount + demandResult.metrics.viewCount + demandResult.metrics.salesCount + demandResult.metrics.rentalExchangeCount;
  const isSparseData = totalActivityCount < 2 && !historicalAvgPrice;
  let confidence = Math.min(94, Math.max(65, 80 + Math.round(visualAnalysis.conditionScore % 8 + demandScore / 25)));
  let confidenceText = `${confidence}% confidence based on SQLite market records & condition assessment.`;
  if (isSparseData) {
    confidence = Math.min(confidence, 65);
    confidenceText = "Low confidence \u2014 limited historical marketplace data.";
  }
  const explanation = `Evaluated MRP (\u20B9${mrp}), age (${ageFormatted}), ${input.condition} condition, and ${demandResult.demandLevel} market demand (${demandScore}/100). Recommended selling price: \u20B9${finalPrice}, 5-day rental price: \u20B9${suggestedRentalPrice5Days}.`;
  return {
    suggestedPrice: finalPrice,
    suggestedRentalPrice5Days,
    minPrice,
    maxPrice,
    confidence,
    confidenceText,
    isSparseData,
    explanation,
    bookAnalysis: {
      title: titleStr,
      isbn: isbnStr,
      originalPrice: mrp,
      purchaseDate: pDateStr,
      ageFormatted,
      ageDays,
      condition: input.condition,
      edition
    },
    marketInfo: {
      referencePrice,
      demandScore,
      demandLevel: demandResult.demandLevel,
      isSparseData,
      activityBreakdown: {
        searchCount: demandResult.metrics.searchCount,
        viewCount: demandResult.metrics.viewCount,
        wishlistCount: demandResult.metrics.wishlistCount,
        requestCount: demandResult.metrics.requestCount,
        salesCount: demandResult.metrics.salesCount,
        rentalExchangeCount: demandResult.metrics.rentalExchangeCount
      }
    },
    factorBreakdown: {
      mrp,
      bookAgeYears: ageInYears,
      depreciationRate: parseFloat(depreciationRate.toFixed(2)),
      conditionMultiplier,
      demandMultiplier: parseFloat(demandMultiplier.toFixed(2)),
      editionBonus,
      historicalAvgPrice
    }
  };
}
export {
  predictFairPrice
};
