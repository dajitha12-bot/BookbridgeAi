import { mapConditionToScore as preMap } from "./fairPrice/preprocessing";
import { trainTensorFlowModel, getTrainedMetadata } from "./fairPrice/model";
import { predictBookFairPrice } from "./fairPrice/pricePrediction";
function mapConditionToScore(condition) {
  return preMap(condition);
}
function trainModel() {
  trainTensorFlowModel().catch(() => {
  });
  return getTrainedMetadata();
}
function predictFairPrice(originalPrice, ageYears, conditionScore, edition, category) {
  let cond = "GOOD";
  if (conditionScore >= 4.5) cond = "LIKE_NEW";
  else if (conditionScore >= 4) cond = "VERY_GOOD";
  else if (conditionScore >= 3) cond = "GOOD";
  else cond = "FAIR";
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const purchaseYear = Math.max(1950, Math.round(currentYear - ageYears));
  const purchaseDate = `${purchaseYear}-06-15`;
  const result = predictBookFairPrice(
    originalPrice,
    purchaseDate,
    cond,
    edition,
    category,
    "book_cover.jpg"
  );
  return {
    suggestedPrice: result.suggestedPrice,
    ratio: result.suggestedPrice / originalPrice,
    explanations: result.explanations,
    meta: result.meta
  };
}
function calculateFairPrice(originalPrice, ageYears, conditionScore, edition, category) {
  return predictFairPrice(originalPrice, ageYears, conditionScore, edition, category);
}
export {
  calculateFairPrice,
  mapConditionToScore,
  predictFairPrice,
  trainModel
};
