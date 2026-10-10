import { calculateAgeInYears, getAgeString, normalizeFeatures } from "./preprocessing";
import { analyzeBookImage } from "./imageAnalysis";
import { calculateDemandScore } from "./demandScore";
import { getResaleRatio, getTrainedMetadata, loadPriceHistory } from "./model";
function predictBookFairPrice(originalPrice, purchaseDateStr, conditionText, edition, category, imageFileName, imageBuffer) {
  const imageAnalysis = analyzeBookImage(imageFileName, imageBuffer);
  const mappedFormScore = conditionText === "NEW" ? 5 : conditionText === "LIKE_NEW" ? 4.5 : conditionText === "VERY_GOOD" ? 4 : conditionText === "GOOD" ? 3 : 2;
  const finalConditionScore = parseFloat((imageAnalysis.score * 0.6 + mappedFormScore * 0.4).toFixed(2));
  const ageYears = calculateAgeInYears(purchaseDateStr);
  const ageString = getAgeString(purchaseDateStr);
  const demandStats = calculateDemandScore(category);
  const norm = normalizeFeatures(
    originalPrice,
    ageYears,
    finalConditionScore,
    edition,
    category,
    demandStats.score
  );
  const resaleRatio = getResaleRatio(
    norm.xPrice,
    norm.xAge,
    norm.xCondition,
    norm.xEdition,
    norm.xCategory,
    norm.xDemand
  );
  const suggestedPrice = Math.round(originalPrice * resaleRatio);
  const minRange = Math.round(suggestedPrice * 0.94);
  const maxRange = Math.round(suggestedPrice * 1.06);
  const history = loadPriceHistory();
  const categoryHistory = history.filter((h) => h.category.toLowerCase() === category.toLowerCase());
  let historicalPrice = Math.round(originalPrice * 0.55);
  if (categoryHistory.length > 0) {
    const avgRatio = categoryHistory.reduce((sum, h) => sum + h.finalSellingPrice / h.originalPrice, 0) / categoryHistory.length;
    historicalPrice = Math.round(originalPrice * avgRatio);
  }
  const ageDiscount = Math.round(ageYears * 8);
  const explanations = [
    `Original Cover Price: \u20B9${originalPrice}`,
    `Book Age (${ageString}): Depreciation decreases cover value by ~${ageDiscount}%`,
    `Visual Analysis: Detected ${imageAnalysis.condition} Condition (${imageAnalysis.confidence}% confidence)`,
    `Market Demand: ${demandStats.text} Category Score (${demandStats.score}/100)`,
    `Recommended Resale Value: \u20B9${suggestedPrice} (~${Math.round(resaleRatio * 100)}% of cover price)`
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
export {
  predictBookFairPrice
};
