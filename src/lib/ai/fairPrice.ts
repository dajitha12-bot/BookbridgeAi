import { mapConditionToScore as preMap } from './fairPrice/preprocessing';
import { trainTensorFlowModel, getTrainedMetadata, ModelMetadata } from './fairPrice/model';
import { predictBookFairPrice } from './fairPrice/pricePrediction';

export function mapConditionToScore(condition: string): number {
  return preMap(condition);
}

export function trainModel(): ModelMetadata {
  // Train model asynchronously and return metadata
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
  // Translate parameters: map conditionScore back to a standard string
  let cond = 'GOOD';
  if (conditionScore >= 4.5) cond = 'LIKE_NEW';
  else if (conditionScore >= 4.0) cond = 'VERY_GOOD';
  else if (conditionScore >= 3.0) cond = 'GOOD';
  else cond = 'FAIR';

  // Purchase date calculation based on predicted age:
  // CurrentYear - ageYears
  const currentYear = new Date().getFullYear();
  const purchaseYear = Math.max(1950, Math.round(currentYear - ageYears));
  const purchaseDate = `${purchaseYear}-06-15`; // mid-year estimate

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
