/**
 * BookBridge Local Intent Detection & Entity Extraction Engine
 * Matches user prompts to specific marketplace action intents without third-party LLM APIs.
 */

export type ChatbotIntent =
  | 'BOOK_SEARCH'
  | 'BOOK_RECOMMENDATION'
  | 'FAIR_PRICE'
  | 'DEMAND_CHECK'
  | 'BUYING_GUIDANCE'
  | 'SELLING_GUIDANCE'
  | 'RENTAL'
  | 'EXCHANGE'
  | 'NEARBY_BOOKS'
  | 'BOOK_COMPARISON'
  | 'ORDER_STATUS'
  | 'DELIVERY_STATUS'
  | 'PAYMENT_STATUS'
  | 'BOOK_IMAGE_ANALYSIS'
  | 'DONATION'
  | 'GENERAL_BOOKBRIDGE_HELP';

export interface ExtractedEntities {
  queryText?: string;
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  rentalDays?: number;
  distanceKm?: number;
  orderId?: string;
  condition?: string;
  isbn?: string;
  offeredBook?: string;
  requestedBook?: string;
}

export interface IntentAnalysisResult {
  intent: ChatbotIntent;
  confidence: number;
  entities: ExtractedEntities;
}

/**
 * Normalizes text input for keyword and entity parsing.
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s\d]/gi, '');
}

/**
 * Main Intent Classification Function
 */
export function detectIntent(userPrompt: string): IntentAnalysisResult {
  const norm = normalizeText(userPrompt);
  const entities: ExtractedEntities = {};

  // Extract Price Numbers (e.g., "under 400", "below 300", "price 500")
  const priceMatch = norm.match(/(?:under|below|less than|max|within|₹|\$)\s*(\d+)/i) || norm.match(/(\d+)\s*(?:rupees|rs|inr)/i);
  if (priceMatch && priceMatch[1]) {
    entities.maxPrice = parseInt(priceMatch[1], 10);
  }

  // Extract Rental Days (e.g., "for 5 days", "7 days rental")
  const daysMatch = norm.match(/(\d+)\s*days/i);
  if (daysMatch && daysMatch[1]) {
    entities.rentalDays = parseInt(daysMatch[1], 10);
  }

  // Extract Distance (e.g., "within 10 km", "5km near me")
  const distMatch = norm.match(/(\d+)\s*(?:km|kms|kilometers)/i);
  if (distMatch && distMatch[1]) {
    entities.distanceKm = parseInt(distMatch[1], 10);
  }

  // Extract Order ID (e.g., "ORD-1", "ORD-BB1025")
  const ordMatch = userPrompt.match(/ORD-?[A-Z0-9_-]+/i);
  if (ordMatch) {
    entities.orderId = ordMatch[0].toUpperCase();
  }

  // Extract Categories
  const categories = [
    'Programming',
    'Artificial Intelligence',
    'Database',
    'Web Development',
    'Operating Systems',
    'Computer Networks',
    'Mathematics',
    'Management',
    'Novels',
    'Competitive Exams',
    'Physics',
    'Chemistry',
    'Biology',
    'Java',
    'Python',
    'DBMS',
    'C++',
    'Algorithms',
  ];

  for (const cat of categories) {
    if (norm.includes(cat.toLowerCase())) {
      entities.category = cat;
      break;
    }
  }

  // Intent Pattern Rules

  // 1. ORDER_STATUS & DELIVERY_STATUS
  if (norm.includes('where is my order') || norm.includes('track order') || norm.includes('order status') || norm.includes('latest order') || entities.orderId) {
    return { intent: 'ORDER_STATUS', confidence: 0.95, entities };
  }

  if (norm.includes('who is delivering') || norm.includes('delivery staff') || norm.includes('picked up') || norm.includes('out for delivery') || norm.includes('delivery status')) {
    return { intent: 'DELIVERY_STATUS', confidence: 0.92, entities };
  }

  // 2. PAYMENT_STATUS
  if (norm.includes('payment') || norm.includes('receipt') || norm.includes('paid') || norm.includes('transaction')) {
    return { intent: 'PAYMENT_STATUS', confidence: 0.90, entities };
  }

  // 3. RENTAL
  if (norm.includes('rent') || norm.includes('rental') || norm.includes('days') || norm.includes('hire')) {
    return { intent: 'RENTAL', confidence: 0.90, entities };
  }

  // 4. EXCHANGE
  if (norm.includes('exchange') || norm.includes('swap') || norm.includes('have java and want') || norm.includes('trade')) {
    return { intent: 'EXCHANGE', confidence: 0.90, entities };
  }

  // 5. NEARBY_BOOKS
  if (norm.includes('near me') || norm.includes('nearby') || norm.includes('distance') || norm.includes('km') || norm.includes('closest')) {
    return { intent: 'NEARBY_BOOKS', confidence: 0.92, entities };
  }

  // 6. FAIR_PRICE
  if (norm.includes('how much should i sell') || norm.includes('fair price') || norm.includes('price suggestion') || norm.includes('worth') || norm.includes('price assistant')) {
    return { intent: 'FAIR_PRICE', confidence: 0.95, entities };
  }

  // 7. DEMAND_CHECK
  if (norm.includes('demand') || norm.includes('popular') || norm.includes('is this book popular') || norm.includes('trend')) {
    return { intent: 'DEMAND_CHECK', confidence: 0.92, entities };
  }

  // 8. BOOK_RECOMMENDATION
  if (norm.includes('recommend') || norm.includes('suggestion') || norm.includes('what to read') || norm.includes('top books')) {
    return { intent: 'BOOK_RECOMMENDATION', confidence: 0.90, entities };
  }

  // 9. BOOK_COMPARISON
  if (norm.includes('compare') || norm.includes('which costs less') || norm.includes('difference between')) {
    return { intent: 'BOOK_COMPARISON', confidence: 0.90, entities };
  }

  // 10. DONATION
  if (norm.includes('donate') || norm.includes('donation') || norm.includes('free book') || norm.includes('giving away')) {
    return { intent: 'DONATION', confidence: 0.92, entities };
  }

  // 11. BUYING_GUIDANCE & SELLING_GUIDANCE
  if (norm.includes('how do i buy') || norm.includes('how to buy') || norm.includes('how delivery works') || norm.includes('payment method')) {
    return { intent: 'BUYING_GUIDANCE', confidence: 0.90, entities };
  }

  if (norm.includes('how can i sell') || norm.includes('how to sell') || norm.includes('list a book') || norm.includes('post book')) {
    return { intent: 'SELLING_GUIDANCE', confidence: 0.90, entities };
  }

  // 12. BOOK_SEARCH
  if (
    norm.includes('find') ||
    norm.includes('show') ||
    norm.includes('search') ||
    norm.includes('need') ||
    norm.includes('looking for') ||
    entities.category ||
    entities.maxPrice
  ) {
    entities.queryText = userPrompt;
    return { intent: 'BOOK_SEARCH', confidence: 0.88, entities };
  }

  // Default Fallback
  return { intent: 'GENERAL_BOOKBRIDGE_HELP', confidence: 0.70, entities };
}
