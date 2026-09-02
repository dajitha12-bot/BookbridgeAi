export const CATEGORY_DEMAND_FACTORS: Record<string, number> = {
  'Programming': 1.0,
  'Artificial Intelligence': 1.2,
  'Database': 0.9,
  'Web Development': 1.1,
  'Operating Systems': 0.8,
  'Computer Networks': 0.8,
  'Mathematics': 0.7,
  'Management': 0.8,
  'Novels': 0.6,
  'Competitive Exams': 0.9,
};

export function getCategoryWeight(category: string): number {
  return CATEGORY_DEMAND_FACTORS[category] || 0.7;
}

export function mapConditionToScore(condition: string): number {
  const cond = condition.toUpperCase().replace('-', '_');
  switch (cond) {
    case 'EXCELLENT':
    case 'NEW':
      return 5;
    case 'LIKE_NEW':
      return 4.5;
    case 'VERY_GOOD':
      return 4;
    case 'GOOD':
      return 3;
    case 'FAIR':
    case 'POOR':
      return 2;
    default:
      return 3;
  }
}

export function mapScoreToConditionText(score: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
  if (score >= 4.5) return 'Excellent';
  if (score >= 3.0) return 'Good';
  if (score >= 2.0) return 'Fair';
  return 'Poor';
}

export function calculateAgeInYears(purchaseDateStr: string): number {
  const purchaseDate = new Date(purchaseDateStr);
  const currentDate = new Date();
  
  // Calculate difference in milliseconds
  const diffTime = Math.max(0, currentDate.getTime() - purchaseDate.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return parseFloat((diffDays / 365).toFixed(2));
}

export function getAgeString(purchaseDateStr: string): string {
  const purchaseDate = new Date(purchaseDateStr);
  const currentDate = new Date();
  
  let years = currentDate.getFullYear() - purchaseDate.getFullYear();
  let months = currentDate.getMonth() - purchaseDate.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years < 0) return '0 months';
  
  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
}

export interface NormalizedFeatures {
  xPrice: number;
  xAge: number;
  xCondition: number;
  xEdition: number;
  xCategory: number;
  xDemand: number;
}

export function normalizeFeatures(
  originalPrice: number,
  ageYears: number,
  conditionScore: number,
  edition: number,
  category: string,
  demandScore: number
): NormalizedFeatures {
  return {
    xPrice: originalPrice / 2000,
    xAge: ageYears / 5,
    xCondition: conditionScore / 5,
    xEdition: edition / 5,
    xCategory: getCategoryWeight(category),
    xDemand: demandScore / 100,
  };
}
