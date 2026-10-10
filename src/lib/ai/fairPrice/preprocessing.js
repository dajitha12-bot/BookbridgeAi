const CATEGORY_DEMAND_FACTORS = {
  "Programming": 1,
  "Artificial Intelligence": 1.2,
  "Database": 0.9,
  "Web Development": 1.1,
  "Operating Systems": 0.8,
  "Computer Networks": 0.8,
  "Mathematics": 0.7,
  "Management": 0.8,
  "Novels": 0.6,
  "Competitive Exams": 0.9
};
function getCategoryWeight(category) {
  return CATEGORY_DEMAND_FACTORS[category] || 0.7;
}
function mapConditionToScore(condition) {
  const cond = condition.toUpperCase().replace("-", "_");
  switch (cond) {
    case "EXCELLENT":
    case "NEW":
      return 5;
    case "LIKE_NEW":
      return 4.5;
    case "VERY_GOOD":
      return 4;
    case "GOOD":
      return 3;
    case "FAIR":
    case "POOR":
      return 2;
    default:
      return 3;
  }
}
function mapScoreToConditionText(score) {
  if (score >= 4.5) return "Excellent";
  if (score >= 3) return "Good";
  if (score >= 2) return "Fair";
  return "Poor";
}
function calculateAgeInYears(purchaseDateStr) {
  const purchaseDate = new Date(purchaseDateStr);
  const currentDate = /* @__PURE__ */ new Date();
  const diffTime = Math.max(0, currentDate.getTime() - purchaseDate.getTime());
  const diffDays = diffTime / (1e3 * 60 * 60 * 24);
  return parseFloat((diffDays / 365).toFixed(2));
}
function getAgeString(purchaseDateStr) {
  const purchaseDate = new Date(purchaseDateStr);
  const currentDate = /* @__PURE__ */ new Date();
  let years = currentDate.getFullYear() - purchaseDate.getFullYear();
  let months = currentDate.getMonth() - purchaseDate.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) return "0 months";
  if (years === 0) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  }
  return `${years} year${years !== 1 ? "s" : ""} ${months} month${months !== 1 ? "s" : ""}`;
}
function normalizeFeatures(originalPrice, ageYears, conditionScore, edition, category, demandScore) {
  return {
    xPrice: originalPrice / 2e3,
    xAge: ageYears / 5,
    xCondition: conditionScore / 5,
    xEdition: edition / 5,
    xCategory: getCategoryWeight(category),
    xDemand: demandScore / 100
  };
}
export {
  CATEGORY_DEMAND_FACTORS,
  calculateAgeInYears,
  getAgeString,
  getCategoryWeight,
  mapConditionToScore,
  mapScoreToConditionText,
  normalizeFeatures
};
