import { readCollection } from "../../db/dbHelper";
function calculateDemandScore(category) {
  try {
    const wishlist = readCollection("wishlist.json");
    const requests = readCollection("book-requests.json");
    const orders = readCollection("orders.json");
    const books = readCollection("books.json");
    const matchingWishlist = wishlist.filter((item) => {
      const book = books.find((b) => b.id === item.bookId);
      return book && book.category.toLowerCase() === category.toLowerCase();
    }).length;
    const matchingRequests = requests.filter(
      (req) => req.category.toLowerCase() === category.toLowerCase() && req.status === "ACTIVE"
    ).length;
    const matchingOrders = orders.filter((ord) => {
      const book = books.find((b) => b.id === ord.bookId);
      return book && book.category.toLowerCase() === category.toLowerCase();
    }).length;
    let rawScore = 55 + matchingWishlist * 5 + matchingRequests * 10 + matchingOrders * 15;
    const score = Math.max(35, Math.min(98, rawScore));
    let text = "Medium";
    if (score >= 75) text = "High";
    else if (score < 50) text = "Low";
    return { score, text };
  } catch (error) {
    console.error("Error calculating demand score:", error);
    return { score: 65, text: "Medium" };
  }
}
export {
  calculateDemandScore
};
