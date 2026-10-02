# BookBridge Assistant Architecture & User Guide

> **Note**: The BookBridge Assistant does not use a third-party generative AI API (such as OpenAI, Gemini, or Claude). It uses application-specific intent detection, database queries, deterministic pricing algorithms, and existing BookBridge intelligence modules.

---

## 1. Architecture Overview

```
User Prompt (Text / Quick Button)
              ↓
  [ Intent & Entity Detection ] (src/lib/ai/chatbotIntent.ts)
              ↓
  [ Chatbot Actions Handler ] (src/actions/chatbotActions.ts)
              ↓
┌─────────────────────────────────────────────────────────────┐
│             REAL SQLITE DATABASE QUERY ENGINE               │
│                                                             │
│  • Books & Search Activity (books, search_activity)         │
│  • Market Intelligence & Demand (market_data, book_views)   │
│  • Fair Price Predictor Engine (pricePrediction.ts)          │
│  • Rentals & Exchanges (rentals, exchanges)                 │
│  • Orders & Tracking (orders, deliveries)                   │
│  • Payments & Receipts (payments)                           │
│  • User Location (user_locations, profiles)                 │
└─────────────────────────────────────────────────────────────┘
              ↓
   Structured Response (Text + Book Cards + Quick Buttons)
              ↓
 [ BookBridge Assistant UI Panel ] (BookBridgeAssistantWidget.tsx)
```

---

## 2. Intent Detection & Keyword Rules (`src/lib/ai/chatbotIntent.ts`)

The assistant parses natural user queries locally using rule-based classification and entity extraction:

| Intent | Sample User Query | Trigger Keywords / Pattern | Action Taken |
| :--- | :--- | :--- | :--- |
| **`BOOK_SEARCH`** | *"Find Python books under ₹400"* | `find`, `show`, `search`, `under`, `category` | Queries `books` table by category and max price. |
| **`BOOK_RECOMMENDATION`** | *"Recommend some database books"* | `recommend`, `suggest`, `top books` | Blends user activity and category demand to suggest books. |
| **`FAIR_PRICE`** | *"How much should I sell my DBMS book for?"* | `fair price`, `how much should i sell`, `worth` | Runs `predictFairPrice` regression algorithm. |
| **`DEMAND_CHECK`** | *"Is Programming category in high demand?"* | `demand`, `popular`, `trend` | Queries `calculateDemandScore` (searches, views, wishlists, sales). |
| **`RENTAL`** | *"Show books available for rental"* | `rent`, `rental`, `days` | Computes daily rate, 5-day estimate, security deposit. |
| **`EXCHANGE`** | *"I have Java and want Python"* | `exchange`, `swap`, `trade` | Matches available 1-to-1 book swap listings. |
| **`NEARBY_BOOKS`** | *"Find books near me within 10 km"* | `near me`, `nearby`, `distance`, `km` | Uses GPS coordinates from `user_locations` / `profiles`. |
| **`BOOK_COMPARISON`** | *"Compare these two books"* | `compare`, `costs less`, `difference` | Returns factual side-by-side comparison. |
| **`ORDER_STATUS`** | *"Where is my order?"* | `order status`, `where is my order`, `track order` | Returns logged-in user's latest order & tracking stage. |
| **`DELIVERY_STATUS`** | *"Who is delivering my book?"* | `delivery staff`, `picked up`, `delivery status` | Returns assigned delivery staff name and phone. |
| **`PAYMENT_STATUS`** | *"Show my latest payment"* | `payment`, `receipt`, `transaction` | Queries `payments` table for logged-in user. |
| **`DONATION`** | *"How do I donate a book?"* | `donate`, `donation`, `free book` | Displays free donation listings and instructions. |
| **`BUYING_GUIDANCE`** | *"How do I buy a book?"* | `how to buy`, `how delivery works` | Returns step-by-step buyer guide. |
| **`SELLING_GUIDANCE`** | *"How can I sell my book?"* | `how to sell`, `list a book` | Returns step-by-step seller guide. |

---

## 3. Security & Permission Scoping
- **Strict User Privacy**: Queries regarding orders, payments, deliveries, and saved locations ONLY access records matching `session.id`.
- **No Data Fabrication**: If a book or order does not exist in SQLite, the assistant explicitly reports that no matching data was found.

---

## 4. SQLite Storage (`assistant_chats` & `assistant_messages`)

Conversations are optionally logged to SQLite database tables:
```sql
CREATE TABLE IF NOT EXISTS assistant_chats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assistant_messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  intent TEXT,
  metadata_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES assistant_chats(id) ON DELETE CASCADE
);
```
