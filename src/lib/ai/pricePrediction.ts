/**
 * Explainable Fair Price Predictor Engine
 * Combines Visual condition score, MRP, Book age, Edition, Demand Score,
 * and Historical SQLite transaction data to suggest an optimal fair resale price.
 */

import { db } from '../db/sqliteDb';
import { calculateDemandScore } from './demandScore';
import { analyzeBookImage } from './imageAnalysis';

export interface PricePredictionResult {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number; // e.g. 87%
  explanation: string;
  factorBreakdown: {
    mrp: number;
    bookAgeYears: number;
    depreciationRate: number; // e.g. 0.35 (35% off)
    conditionMultiplier: number; // e.g. 0.90
    demandMultiplier: number; // e.g. 1.10
    editionBonus: number; // e.g. 50
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
  imageUrl?: string | null;
}

export async function predictFairPrice(input: FairPriceInput): Promise<PricePredictionResult> {
  const mrp = input.originalPrice || 1000;
  const edition = input.edition || 1;

  // 1. Calculate Book Age
  let ageInYears = 1.5;
  if (input.purchaseDate) {
    const purchase = new Date(input.purchaseDate);
    const now = new Date();
    const diffMonths = (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth());
    ageInYears = Math.max(0.2, diffMonths / 12);
  }

  // 2. Base Depreciation Rate based on Age (15% per year, max 60%)
  const depreciationRate = Math.min(0.60, ageInYears * 0.15);
  let baseDepreciatedPrice = mrp * (1 - depreciationRate);

  // 3. Condition Multiplier
  const visualAnalysis = await analyzeBookImage(input.imageUrl, input.condition);
  let conditionMultiplier = 0.80;
  const condUpper = (visualAnalysis.detectedCondition || input.condition || 'GOOD').toUpperCase();

  if (condUpper === 'LIKE_NEW' || condUpper === 'NEW') conditionMultiplier = 0.92;
  else if (condUpper === 'VERY_GOOD') conditionMultiplier = 0.85;
  else if (condUpper === 'GOOD') conditionMultiplier = 0.75;
  else conditionMultiplier = 0.60;

  // 4. Demand Score Impact
  const demandResult = await calculateDemandScore(input.category || input.title);
  const demandScore = demandResult.score;
  const demandMultiplier = 0.85 + (demandScore / 100) * 0.30; // 0.85 to 1.15

  // 5. Edition Bonus
  const editionBonus = edition > 2 ? (edition - 1) * 30 : 0;

  // 6. Historical Price Benchmark from SQLite
  let historicalAvgPrice: number | undefined = undefined;
  try {
    const histRow = db.prepare(`
      SELECT AVG(listed_price) as avgPrice FROM price_history
      WHERE LOWER(category) = LOWER(?) OR LOWER(title) LIKE ?
    `).get(input.category, `%${input.title.slice(0, 10)}%`) as { avgPrice: number | null };

    if (histRow && histRow.avgPrice) {
      historicalAvgPrice = Math.round(histRow.avgPrice);
    }
  } catch (e) {
    // Non-fatal
  }

  // 7. Calculate Raw Price Recommendation
  let calculatedPrice = baseDepreciatedPrice * conditionMultiplier * demandMultiplier + editionBonus;

  if (historicalAvgPrice) {
    // Blend 60% calculated + 40% historical average
    calculatedPrice = calculatedPrice * 0.60 + historicalAvgPrice * 0.40;
  }

  // Ensure reasonable bounds relative to MRP
  const finalPrice = Math.round(Math.min(mrp * 0.90, Math.max(mrp * 0.20, calculatedPrice)));
  const minPrice = Math.round(finalPrice * 0.90);
  const maxPrice = Math.round(finalPrice * 1.10);
  const confidence = Math.min(94, Math.max(78, 80 + Math.round((visualAnalysis.conditionScore % 10) + (demandScore / 20))));

  const explanation = `Based on MRP (₹${mrp}), book age (${ageInYears.toFixed(1)} yrs), ${input.condition} condition, and ${demandResult.demandLevel} market demand (${demandScore}/100), our AI model recommends ₹${finalPrice}.`;

  return {
    suggestedPrice: finalPrice,
    minPrice,
    maxPrice,
    confidence,
    explanation,
    factorBreakdown: {
      mrp,
      bookAgeYears: parseFloat(ageInYears.toFixed(1)),
      depreciationRate: parseFloat(depreciationRate.toFixed(2)),
      conditionMultiplier,
      demandMultiplier: parseFloat(demandMultiplier.toFixed(2)),
      editionBonus,
      historicalAvgPrice,
    },
  };
}
