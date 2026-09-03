import { mapConditionToScore as preMap } from './fairPrice/preprocessing';
import { trainTensorFlowModel, getTrainedMetadata, ModelMetadata } from './fairPrice/model';
import { predictBookFairPrice } from './fairPrice/pricePrediction';

export function mapConditionToScore(condition: string): number {
  return preMap(condition);
}

export function trainModel(): ModelMetadata {
  trainTensorFlowModel().catch(() => {});
  return getTrainedMetadata();
}

export function predictFairPrice(
  originalPrice: number,
  ageYears: number,
  conditionScore: number,
  edition: number,
  category: string
) {
  let cond = 'GOOD';
  if (conditionScore >= 4.5) cond = 'LIKE_NEW';
  else if (conditionScore >= 4.0) cond = 'VERY_GOOD';
  else if (conditionScore >= 3.0) cond = 'GOOD';
  else cond = 'FAIR';

  const currentYear = new Date().getFullYear();
  const purchaseYear = Math.max(1950, Math.round(currentYear - ageYears));
  const purchaseDate = `${purchaseYear}-06-15`;

  const result = predictBookFairPrice(
    originalPrice,
    purchaseDate,
    cond,
    edition,
    category,
    'book_cover.jpg'
  );

  return {
    suggestedPrice: result.suggestedPrice,
    ratio: result.suggestedPrice / originalPrice,
    explanations: result.explanations,
    meta: result.meta
  };
}

export function calculateFairPrice(
  originalPrice: number,
  ageYears: number,
  conditionScore: number,
  edition: number,
  category: string
) {
  return predictFairPrice(originalPrice, ageYears, conditionScore, edition, category);
}
