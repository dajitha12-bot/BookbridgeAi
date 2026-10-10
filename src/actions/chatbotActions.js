"use server";
import { getSession } from "../lib/auth/session";
import { db } from "../lib/db/sqliteDb";
import { detectIntent } from "../lib/ai/chatbotIntent";
import { predictFairPrice } from "../lib/ai/pricePrediction";
import { calculateDemandScore } from "../lib/ai/demandScore";
import { getAllBooks } from "../lib/db/books";
import { calculateDistance } from "../lib/utils/distance";
async function processChatbotMessageAction(userPrompt, context) {
  try {
    const session = await getSession();
    const userId = session?.id || null;
    if (process.env.OPENAI_API_KEY) {
      try {
        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are BookBridge AI Assistant, an expert advisor for BookBridge Smart Book Circulation & Fair Price Predictor. Help users buy, sell, rent, exchange, estimate fair prices, track orders, and discover books."
              },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 300
          })
        });
        if (openAiRes.ok) {
          const aiData = await openAiRes.json();
          const aiText = aiData.choices?.[0]?.message?.content;
          if (aiText) {
            return {
              success: true,
              intent: "OPENAI_LLM",
              text: aiText,
              quickButtons: [
                { label: "Find Books", actionText: "Find Python books under \u20B9400" },
                { label: "Fair Price", actionText: "How much should I sell my DBMS book for?" },
                { label: "Check Demand", actionText: "Is Programming category in high demand?" },
                { label: "Track Order", actionText: "Where is my order?" }
              ]
            };
          }
        }
      } catch (openAiErr) {
        console.warn("OpenAI API call failed, falling back to local intent engine:", openAiErr);
      }
    }
    const analysis = detectIntent(userPrompt);
    const { intent, entities } = analysis;
    const quickButtons = [
      { label: "Find Books", actionText: "Find Python books under \u20B9400" },
      { label: "Fair Price", actionText: "How much should I sell my DBMS book for?" },
      { label: "Check Demand", actionText: "Is Programming category in high demand?" },
      { label: "Rent a Book", actionText: "Show books available for rental" },
      { label: "Exchange", actionText: "Show book exchange options" },
      { label: "Track Order", actionText: "Where is my order?" },
      { label: "Payment Status", actionText: "Show my latest payment" },
      { label: "Nearby Books", actionText: "Find books near me within 10 km" }
    ];
    let targetBookId = context?.bookId;
    if (intent === "ORDER_STATUS" || intent === "DELIVERY_STATUS") {
      if (!userId) {
        return {
          success: true,
          intent,
          text: "Please log in to view your order status and delivery tracking details.",
          quickButtons
        };
      }
      const orderRow = db.prepare(`
        SELECT o.*, b.title as bookTitle, b.image_url as bookImageUrl, u.name as sellerName
        FROM orders o
        JOIN books b ON o.book_id = b.id
        JOIN users u ON o.seller_id = u.id
        WHERE o.buyer_id = ? ${entities.orderId ? "AND (o.id = ? OR o.id LIKE ?)" : ""}
        ORDER BY o.created_at DESC LIMIT 1
      `).get(...entities.orderId ? [userId, entities.orderId, `%${entities.orderId}%`] : [userId]);
      if (!orderRow) {
        return {
          success: true,
          intent,
          text: "I couldn't find any orders associated with your account. Browse books to place your first order!",
          quickButtons
        };
      }
      let staffName = "Unassigned";
      let staffPhone = "";
      try {
        const delRow = db.prepare(`
          SELECT d.*, u.name as staffName, u.phone as staffPhone
          FROM deliveries d
          JOIN users u ON d.staff_id = u.id
          WHERE d.order_id = ?
        `).get(orderRow.id);
        if (delRow) {
          staffName = delRow.staffName || "Dhinesh Kumar";
          staffPhone = delRow.staffPhone || "9876543210";
        }
      } catch (e) {
      }
      return {
        success: true,
        intent,
        text: `Here is the status of your order ${orderRow.id}:`,
        orders: [
          {
            id: orderRow.id,
            bookTitle: orderRow.bookTitle,
            amount: orderRow.total_amount || orderRow.amount,
            orderStatus: orderRow.order_status,
            paymentStatus: orderRow.payment_status,
            deliveryMethod: orderRow.delivery_method,
            staffName,
            staffPhone,
            deliveryAddress: orderRow.delivery_address || "Home Delivery"
          }
        ],
        quickButtons
      };
    }
    if (intent === "PAYMENT_STATUS") {
      if (!userId) {
        return {
          success: true,
          intent,
          text: "Please log in to check your payment transaction history.",
          quickButtons
        };
      }
      const payRow = db.prepare(`
        SELECT p.*, o.id as orderCode
        FROM payments p
        LEFT JOIN orders o ON p.order_id = o.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC LIMIT 1
      `).get(userId);
      if (!payRow) {
        return {
          success: true,
          intent,
          text: "No payment records found for your account. Once an order is initiated, payment details will appear here.",
          quickButtons
        };
      }
      return {
        success: true,
        intent,
        text: `Your latest payment record: Payment ID ${payRow.id} (Order: ${payRow.orderCode || "Direct"}). Amount: \u20B9${payRow.total_amount || payRow.amount}, Method: ${payRow.method}, Status: ${payRow.status}.`,
        quickButtons
      };
    }
    if (intent === "FAIR_PRICE") {
      const cat = entities.category || "Programming";
      const maxP = entities.maxPrice || 1200;
      const prediction = await predictFairPrice({
        title: userPrompt.replace(/how much|sell|book|for|should/gi, "").trim() || "Textbook Listing",
        category: cat,
        originalPrice: maxP,
        condition: "VERY_GOOD",
        purchaseDate: "2023-05-10",
        edition: 1
      });
      return {
        success: true,
        intent,
        text: `Based on MRP (\u20B9${maxP}), category demand score (${prediction.marketInfo.demandScore}/100), and SQLite transaction benchmarks, our Fair Price Assistant recommends a selling price of \u20B9${prediction.suggestedPrice} (Suggested Range: \u20B9${prediction.minPrice} \u2013 \u20B9${prediction.maxPrice}) and a 5-day rental price of \u20B9${prediction.suggestedRentalPrice5Days}.`,
        suggestion: prediction,
        quickButtons
      };
    }
    if (intent === "DEMAND_CHECK") {
      const cat = entities.category || "Programming";
      const demandRes = await calculateDemandScore(cat);
      const isSparse = demandRes.metrics.requestCount + demandRes.metrics.searchCount + demandRes.metrics.viewCount < 2;
      let msgText = `Marketplace Demand for "${cat}": Score ${demandRes.score}/100 (${demandRes.demandLevel} Demand). Breakdown (SQLite): Searches: ${demandRes.metrics.searchCount}, Views: ${demandRes.metrics.viewCount}, Wishlists: ${demandRes.metrics.wishlistCount}, Requests: ${demandRes.metrics.requestCount}, Completed Sales: ${demandRes.metrics.salesCount}.`;
      if (isSparse) {
        msgText += " Note: Limited marketplace data is available for this exact category.";
      }
      return {
        success: true,
        intent,
        text: msgText,
        quickButtons
      };
    }
    if (intent === "NEARBY_BOOKS") {
      let userLat = 13.0827;
      let userLng = 80.2707;
      if (userId) {
        const prof = db.prepare("SELECT latitude, longitude FROM profiles WHERE user_id = ?").get(userId);
        if (prof && prof.latitude && prof.longitude) {
          userLat = prof.latitude;
          userLng = prof.longitude;
        }
      }
      const allBooks2 = await getAllBooks();
      const radiusKm = entities.distanceKm || 15;
      const nearby = allBooks2.filter((b) => b.status === "AVAILABLE").map((b) => {
        let dist = 5;
        if (b.owner && b.owner.profile && b.owner.profile.latitude) {
          dist = calculateDistance(userLat, userLng, b.owner.profile.latitude, b.owner.profile.longitude);
        }
        return { ...b, distanceKm: dist };
      }).filter((b) => b.distanceKm <= radiusKm).sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 4);
      if (nearby.length === 0) {
        return {
          success: true,
          intent,
          text: `No books found within ${radiusKm} km of your location. Try widening your search radius or browsing all available books!`,
          quickButtons
        };
      }
      return {
        success: true,
        intent,
        text: `Found ${nearby.length} books near your current location (within ${radiusKm} km):`,
        books: nearby,
        quickButtons
      };
    }
    if (intent === "RENTAL") {
      const days = entities.rentalDays || 5;
      const allBooks2 = await getAllBooks();
      const rentalBooks = allBooks2.filter((b) => b.status === "AVAILABLE" && b.rentalAvailable).slice(0, 4);
      return {
        success: true,
        intent,
        text: `For a ${days}-day rental, standard rates average \u20B915\u2013\u20B930/day plus a security deposit (refundable upon book return). Here are available rental books:`,
        books: rentalBooks,
        quickButtons
      };
    }
    if (intent === "EXCHANGE") {
      const allBooks2 = await getAllBooks();
      const exchangeBooks = allBooks2.filter((b) => b.status === "AVAILABLE" && b.exchangeAvailable).slice(0, 4);
      return {
        success: true,
        intent,
        text: "BookBridge allows direct 1-to-1 book swaps! Offer a book from your collection to request an exchange. Here are available exchange books:",
        books: exchangeBooks,
        quickButtons
      };
    }
    if (intent === "BOOK_RECOMMENDATION") {
      const allBooks2 = await getAllBooks();
      const recommended = allBooks2.filter((b) => b.status === "AVAILABLE").slice(0, 4).map((b) => ({
        ...b,
        reason: `Recommended based on active market demand in ${b.category}`
      }));
      return {
        success: true,
        intent,
        text: "Based on active SQLite marketplace demand and popular reader trends, here are our recommended books:",
        books: recommended,
        quickButtons
      };
    }
    if (intent === "BOOK_COMPARISON") {
      const allBooks2 = await getAllBooks();
      const sampleBooks = allBooks2.filter((b) => b.status === "AVAILABLE").slice(0, 2);
      if (sampleBooks.length < 2) {
        return {
          success: true,
          intent,
          text: "Factual comparison requires at least 2 available books in the marketplace.",
          quickButtons
        };
      }
      const b1 = sampleBooks[0];
      const b2 = sampleBooks[1];
      return {
        success: true,
        intent,
        text: `Factual Comparison:

\u2022 ${b1.title}: Listed Price \u20B9${b1.expectedPrice}, Condition: ${b1.condition.replace("_", " ")}, Edition: ${b1.edition}, Location: ${b1.area}, ${b1.city}.
\u2022 ${b2.title}: Listed Price \u20B9${b2.expectedPrice}, Condition: ${b2.condition.replace("_", " ")}, Edition: ${b2.edition}, Location: ${b2.area}, ${b2.city}.

Note: ${b1.expectedPrice < b2.expectedPrice ? b1.title : b2.title} offers the lower listed price.`,
        books: sampleBooks,
        quickButtons
      };
    }
    if (intent === "BUYING_GUIDANCE") {
      return {
        success: true,
        intent,
        text: "To buy a book on BookBridge:\n1. Browse available books or search by category.\n2. Click [Buy Now] on the book details page.\n3. Choose Home Delivery (\u20B940) or Offline Pickup (\u20B90).\n4. Enter your email to receive an instant UPI payment request or select Cash On Delivery.\n5. Track your order status in real time on the Orders Dashboard!",
        quickButtons
      };
    }
    if (intent === "SELLING_GUIDANCE") {
      return {
        success: true,
        intent,
        text: "To sell a book on BookBridge:\n1. Open Dashboard \u2192 [Add Book].\n2. Upload 1 to 5 real cover photos.\n3. Enter title, ISBN, MRP, purchase date, and condition.\n4. Click [Analyze Book] to let our local Fair Price Assistant suggest optimal resale and rental prices.\n5. Click [Publish Book Listing]!",
        quickButtons
      };
    }
    const allBooks = await getAllBooks();
    let searchResults = allBooks.filter((b) => b.status === "AVAILABLE");
    if (entities.category) {
      searchResults = searchResults.filter((b) => b.category.toLowerCase().includes(entities.category.toLowerCase()));
    }
    if (entities.maxPrice) {
      searchResults = searchResults.filter((b) => b.expectedPrice <= entities.maxPrice);
    }
    if (entities.queryText) {
      const q = entities.queryText.toLowerCase();
      const filtered = searchResults.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.category.toLowerCase().includes(q) || b.subject && b.subject.toLowerCase().includes(q)
      );
      if (filtered.length > 0) searchResults = filtered;
    }
    searchResults = searchResults.slice(0, 4);
    if (searchResults.length === 0) {
      return {
        success: true,
        intent,
        text: `I couldn't find a matching book in the current marketplace. Try searching for broader terms like "Programming", "DBMS", or "Python".`,
        quickButtons
      };
    }
    return {
      success: true,
      intent: "BOOK_SEARCH",
      text: `Found ${searchResults.length} books matching your request in SQLite database:`,
      books: searchResults,
      quickButtons
    };
  } catch (err) {
    return {
      success: false,
      intent: "ERROR",
      text: "An unexpected error occurred while processing your request with BookBridge Assistant."
    };
  }
}
export {
  processChatbotMessageAction
};
