function normalizeText(text) {
  return text.toLowerCase().trim().replace(/[^\w\s\d]/gi, "");
}
function detectIntent(userPrompt) {
  const norm = normalizeText(userPrompt);
  const entities = {};
  const priceMatch = norm.match(/(?:under|below|less than|max|within|₹|\$)\s*(\d+)/i) || norm.match(/(\d+)\s*(?:rupees|rs|inr)/i);
  if (priceMatch && priceMatch[1]) {
    entities.maxPrice = parseInt(priceMatch[1], 10);
  }
  const daysMatch = norm.match(/(\d+)\s*days/i);
  if (daysMatch && daysMatch[1]) {
    entities.rentalDays = parseInt(daysMatch[1], 10);
  }
  const distMatch = norm.match(/(\d+)\s*(?:km|kms|kilometers)/i);
  if (distMatch && distMatch[1]) {
    entities.distanceKm = parseInt(distMatch[1], 10);
  }
  const ordMatch = userPrompt.match(/ORD-?[A-Z0-9_-]+/i);
  if (ordMatch) {
    entities.orderId = ordMatch[0].toUpperCase();
  }
  const categories = [
    "Programming",
    "Artificial Intelligence",
    "Database",
    "Web Development",
    "Operating Systems",
    "Computer Networks",
    "Mathematics",
    "Management",
    "Novels",
    "Competitive Exams",
    "Physics",
    "Chemistry",
    "Biology",
    "Java",
    "Python",
    "DBMS",
    "C++",
    "Algorithms"
  ];
  for (const cat of categories) {
    if (norm.includes(cat.toLowerCase())) {
      entities.category = cat;
      break;
    }
  }
  if (norm.includes("where is my order") || norm.includes("track order") || norm.includes("order status") || norm.includes("latest order") || entities.orderId) {
    return { intent: "ORDER_STATUS", confidence: 0.95, entities };
  }
  if (norm.includes("who is delivering") || norm.includes("delivery staff") || norm.includes("picked up") || norm.includes("out for delivery") || norm.includes("delivery status")) {
    return { intent: "DELIVERY_STATUS", confidence: 0.92, entities };
  }
  if (norm.includes("payment") || norm.includes("receipt") || norm.includes("paid") || norm.includes("transaction")) {
    return { intent: "PAYMENT_STATUS", confidence: 0.9, entities };
  }
  if (norm.includes("rent") || norm.includes("rental") || norm.includes("days") || norm.includes("hire")) {
    return { intent: "RENTAL", confidence: 0.9, entities };
  }
  if (norm.includes("exchange") || norm.includes("swap") || norm.includes("have java and want") || norm.includes("trade")) {
    return { intent: "EXCHANGE", confidence: 0.9, entities };
  }
  if (norm.includes("near me") || norm.includes("nearby") || norm.includes("distance") || norm.includes("km") || norm.includes("closest")) {
    return { intent: "NEARBY_BOOKS", confidence: 0.92, entities };
  }
  if (norm.includes("how much should i sell") || norm.includes("fair price") || norm.includes("price suggestion") || norm.includes("worth") || norm.includes("price assistant")) {
    return { intent: "FAIR_PRICE", confidence: 0.95, entities };
  }
  if (norm.includes("demand") || norm.includes("popular") || norm.includes("is this book popular") || norm.includes("trend")) {
    return { intent: "DEMAND_CHECK", confidence: 0.92, entities };
  }
  if (norm.includes("recommend") || norm.includes("suggestion") || norm.includes("what to read") || norm.includes("top books")) {
    return { intent: "BOOK_RECOMMENDATION", confidence: 0.9, entities };
  }
  if (norm.includes("compare") || norm.includes("which costs less") || norm.includes("difference between")) {
    return { intent: "BOOK_COMPARISON", confidence: 0.9, entities };
  }
  if (norm.includes("donate") || norm.includes("donation") || norm.includes("free book") || norm.includes("giving away")) {
    return { intent: "DONATION", confidence: 0.92, entities };
  }
  if (norm.includes("how do i buy") || norm.includes("how to buy") || norm.includes("how delivery works") || norm.includes("payment method")) {
    return { intent: "BUYING_GUIDANCE", confidence: 0.9, entities };
  }
  if (norm.includes("how can i sell") || norm.includes("how to sell") || norm.includes("list a book") || norm.includes("post book")) {
    return { intent: "SELLING_GUIDANCE", confidence: 0.9, entities };
  }
  if (norm.includes("find") || norm.includes("show") || norm.includes("search") || norm.includes("need") || norm.includes("looking for") || entities.category || entities.maxPrice) {
    entities.queryText = userPrompt;
    return { intent: "BOOK_SEARCH", confidence: 0.88, entities };
  }
  return { intent: "GENERAL_BOOKBRIDGE_HELP", confidence: 0.7, entities };
}
export {
  detectIntent
};
