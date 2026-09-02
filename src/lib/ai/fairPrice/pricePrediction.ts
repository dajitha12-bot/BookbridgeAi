import { calculateAgeInYears, getAgeString, normalizeFeatures } from './preprocessing';
import { analyzeBookImage } from './imageAnalysis';
import { calculateDemandScore } from './demandScore';
import { getResaleRatio, getTrainedMetadata, loadPriceHistory } from './model';

export interface PricePredictionResult {
  suggestedPrice: number;
  suggestedRange: { min: number; max: number };
  ageString: string;
  detectedCondition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  conditionConfidence: number;
  demandRating: 'High' | 'Medium' | 'Low';
  demandScore: number;
  historicalPrice: number;
  originalPrice: number;
  explanations: string[];
  meta: any;
}

/**
 * Predicts the fair current selling price of a used book based on image analysis and product specs.
 */
export function predictBookFairPrice(
  originalPrice: number,
  purchaseDateStr: string,
  conditionText: string,
  edition: number,
  category: string,
  imageFileName: string,
  imageBuffer?: Buffer
): PricePredictionResult {
  // 1. Image Condition Analysis
  const imageAnalysis = analyzeBookImage(imageFileName, imageBuffer);
  
  // Use image condition score or combine it with forms selection condition
  const mappedFormScore = conditionText === 'NEW' ? 5 : 
                           conditionText === 'LIKE_NEW' ? 4.5 : 
                           conditionText === 'VERY_GOOD' ? 4 : 
                           conditionText === 'GOOD' ? 3 : 2;

  // Hybrid score: weighted average of visual analysis (60%) and form input details (40%)
  const finalConditionScore = parseFloat((imageAnalysis.score * 0.6 + mappedFormScore * 0.4).toFixed(2));
  
  // 2. Age calculations
  const ageYears = calculateAgeInYears(purchaseDateStr);
  const ageString = getAgeString(purchaseDateStr);

  // 3. Demand Score Calculation
  const demandStats = calculateDemandScore(category);

  // 4. Normalize regression features
  const norm = normalizeFeatures(
    originalPrice,
    ageYears,
    finalConditionScore,
    edition,
    category,
    demandStats.score
  );

  // 5. Predict Resale Ratio
  const resaleRatio = getResaleRatio(
    norm.xPrice,
    norm.xAge,
    norm.xCondition,
    norm.xEdition,
    norm.xCategory,
    norm.xDemand
  );

  const suggestedPrice = Math.round(originalPrice * resaleRatio);
  
  // Calculate recommended range (+/- 6% bounds)
  const minRange = Math.round(suggestedPrice * 0.94);
  const maxRange = Math.round(suggestedPrice * 1.06);

  // Estimate historical price based on catalog averages
  const history = loadPriceHistory();
  const categoryHistory = history.filter(h => h.category.toLowerCase() === category.toLowerCase());
  let historicalPrice = Math.round(originalPrice * 0.55); // fallback ratio

  if (categoryHistory.length > 0) {
    const avgRatio = categoryHistory.reduce((sum, h) => sum + (h.finalSellingPrice / h.originalPrice), 0) / categoryHistory.length;
    historicalPrice = Math.round(originalPrice * avgRatio);
  }

  // 6. Build breakdown descriptions
  const ageDiscount = Math.round(ageYears * 8); // estimate 8% yearly depreciation
  const explanations = [
    `Original Cover Price: ₹${originalPrice}`,
    `Book Age (${ageString}): Depreciation decreases cover value by ~${ageDiscount}%`,
    `Visual Analysis: Detected ${imageAnalysis.condition} Condition (${imageAnalysis.confidence}% confidence)`,
    `Market Demand: ${demandStats.text} Category Score (${demandStats.score}/100)`,
    `Recommended Resale Value: ₹${suggestedPrice} (~${Math.round(resaleRatio * 100)}% of cover price)`
  ];

  return {
    suggestedPrice,
    suggestedRange: { min: minRange, max: maxRange },
    ageString,
    detectedCondition: imageAnalysis.condition,
    conditionConfidence: imageAnalysis.confidence,
    demandRating: demandStats.text,
    demandScore: demandStats.score,
    historicalPrice,
    originalPrice,
    explanations,
    meta: getTrainedMetadata()
  };
}
