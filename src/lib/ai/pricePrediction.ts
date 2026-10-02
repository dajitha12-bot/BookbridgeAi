/**
 * Explainable Fair Price Predictor Engine
 * Combines Visual condition score, MRP, Dynamic Book age, Edition,
 * Category Demand Score, and Historical SQLite transaction records to suggest an optimal fair resale price.
 */

import { db } from '../db/sqliteDb';
import { calculateDemandScore, DemandScoreResult } from './demandScore';
import { analyzeBookImage } from './imageAnalysis';

export interface PricePredictionResult {
  suggestedPrice: number;
  suggestedRentalPrice5Days: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  confidenceText: string;
  isSparseData: boolean;
  explanation: string;
  bookAnalysis: {
    title: string;
    isbn: string;
    originalPrice: number;
    purchaseDate: string;
    ageFormatted: string; // e.g. "1 year 8 months (608 days)"
    ageDays: number;
    condition: string;
    edition: number;
  };
  marketInfo: {
    referencePrice: number;
    demandScore: number;
    demandLevel: 'Low' | 'Medium' | 'High' | 'Very High';
    isSparseData: boolean;
    activityBreakdown: {
      searchCount: number;
      viewCount: number;
      wishlistCount: number;
      requestCount: number;
      salesCount: number;
      rentalExchangeCount: number;
    };
  };
  factorBreakdown: {
    mrp: number;
    bookAgeYears: number;
    depreciationRate: number;
    conditionMultiplier: number;
    demandMultiplier: number;
    editionBonus: number;
    historicalAvgPrice?: number;
  };
}

export interface FairPriceInput {
  title: string;
  category: string;
  originalPrice: number;
  purchaseDate?: string;
  condition: string;
  edition?: number;
  isbn?: string;
  imageUrl?: string | null;
}

export async function predictFairPrice(input: FairPriceInput): Promise<PricePredictionResult> {
  const mrp = input.originalPrice || 1000;
  const edition = input.edition || 1;
  const isbnStr = input.isbn || 'ISBN-Not-Specified';
  const titleStr = input.title || 'Book Listing';
  const pDateStr = input.purchaseDate || new Date().toISOString().split('T')[0];

  // 1. Dynamic Book Age Calculation (Years, Months, and Total Days)
  const purchase = new Date(pDateStr);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - purchase.getTime());
  const ageDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const totalMonths = Math.max(0, (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth()));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const ageInYears = parseFloat((totalMonths / 12).toFixed(1));

  let ageFormatted = '';
  const yrsText = years === 1 ? '1 year' : `${years} years`;
  const mosText = months === 1 ? '1 month' : `${months} months`;

  if (years === 0 && months === 0) {
    ageFormatted = `0 months (${ageDays} days)`;
  } else if (years === 0) {
    ageFormatted = `${mosText} (${ageDays} days)`;
  } else if (months === 0) {
    ageFormatted = `${yrsText} (${ageDays} days)`;
  } else {
    ageFormatted = `${yrsText} ${mosText} (${ageDays} days)`;
  }

  // 2. Base Depreciation Rate based on Age (15% per year, capped at 60%)
  const depreciationRate = Math.min(0.60, ageInYears * 0.15);
  const baseDepreciatedPrice = mrp * (1 - depreciationRate);

  // 3. Visual & Selected Condition Multiplier
  const visualAnalysis = await analyzeBookImage(input.imageUrl, input.condition);
  let conditionMultiplier = 0.80;
  const condUpper = (visualAnalysis.detectedCondition || input.condition || 'GOOD').toUpperCase();

  if (condUpper === 'LIKE_NEW' || condUpper === 'NEW') conditionMultiplier = 0.92;
  else if (condUpper === 'VERY_GOOD') conditionMultiplier = 0.85;
  else if (condUpper === 'GOOD') conditionMultiplier = 0.75;
  else conditionMultiplier = 0.60;

  // 4. Demand Score & Marketplace Activity Impact from SQLite
  const demandResult: DemandScoreResult = await calculateDemandScore(input.category || input.title);
  const demandScore = demandResult.score;
  const demandMultiplier = 0.85 + (demandScore / 100) * 0.30; // 0.85 to 1.15

  // 5. Edition Bonus
  const editionBonus = edition > 2 ? (edition - 1) * 35 : 0;

  // 6. Historical Reference Price Benchmark from SQLite
  let historicalAvgPrice: number | undefined = undefined;
  try {
    const histRow = db.prepare(`
      SELECT AVG(listed_price) as avgPrice FROM price_history
      WHERE LOWER(category) = LOWER(?) OR LOWER(title) LIKE ?
    `).get(input.category || '', `%${titleStr.slice(0, 10).toLowerCase()}%`) as { avgPrice: number | null };

    if (histRow && histRow.avgPrice) {
      historicalAvgPrice = Math.round(histRow.avgPrice);
    }
  } catch (e) {
    // Non-fatal
  }

  // If no specific history found, grab category baseline from market_data
  let referencePrice = historicalAvgPrice;
  if (!referencePrice) {
    try {
      const mktRow = db.prepare(`
        SELECT avg_market_price FROM market_data
        WHERE LOWER(category) = LOWER(?)
      `).get(input.category || '') as { avg_market_price: number | null };
      if (mktRow && mktRow.avg_market_price) {
        referencePrice = Math.round(mktRow.avg_market_price);
      }
    } catch (e) {
      // Non-fatal
    }
  }
  if (!referencePrice) {
    referencePrice = Math.round(mrp * 0.55); // Default reference price
  }

  // 7. Calculate Raw Selling Price
  let calculatedPrice = baseDepreciatedPrice * conditionMultiplier * demandMultiplier + editionBonus;

  if (historicalAvgPrice) {
    // Blend 60% calculated algorithm + 40% historical SQLite transaction average
    calculatedPrice = calculatedPrice * 0.60 + historicalAvgPrice * 0.40;
  }

  // Bound selling price between 20% and 90% of MRP
  const finalPrice = Math.round(Math.min(mrp * 0.90, Math.max(mrp * 0.20, calculatedPrice)));
  const minPrice = Math.round(finalPrice * 0.88);
  const maxPrice = Math.round(finalPrice * 1.12);

  // 5-Day Rental Price Recommendation (~15% of selling price or minimum ₹35)
  const suggestedRentalPrice5Days = Math.max(35, Math.round(finalPrice * 0.15));

  // Determine if Marketplace Data is Sparse
  const totalActivityCount =
    demandResult.metrics.requestCount +
    demandResult.metrics.wishlistCount +
    demandResult.metrics.searchCount +
    demandResult.metrics.viewCount +
    demandResult.metrics.salesCount +
    demandResult.metrics.rentalExchangeCount;

  const isSparseData = totalActivityCount < 2 && !historicalAvgPrice;

  // Confidence Calculation
  let confidence = Math.min(94, Math.max(65, 80 + Math.round((visualAnalysis.conditionScore % 8) + (demandScore / 25))));
  let confidenceText = `${confidence}% confidence based on SQLite market records & condition assessment.`;

  if (isSparseData) {
    confidence = Math.min(confidence, 65);
    confidenceText = 'Low confidence — limited historical marketplace data.';
  }

  const explanation = `Evaluated MRP (₹${mrp}), age (${ageFormatted}), ${input.condition} condition, and ${demandResult.demandLevel} market demand (${demandScore}/100). Recommended selling price: ₹${finalPrice}, 5-day rental price: ₹${suggestedRentalPrice5Days}.`;

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
      edition,
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
        rentalExchangeCount: demandResult.metrics.rentalExchangeCount,
      },
    },
    factorBreakdown: {
      mrp,
      bookAgeYears: ageInYears,
      depreciationRate: parseFloat(depreciationRate.toFixed(2)),
      conditionMultiplier,
      demandMultiplier: parseFloat(demandMultiplier.toFixed(2)),
      editionBonus,
      historicalAvgPrice,
    },
  };
}
