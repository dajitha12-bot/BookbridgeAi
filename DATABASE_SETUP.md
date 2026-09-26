# SQLite Database Setup & Manual Inspection Guide

## Project Title
**Smart Book Circulation & Fair Price Predictor (BookBridge AI)**

---

## 1. Database Location
The application uses a **REAL, physical SQLite database file** stored directly within the project workspace at:

```
DATABASE LOCATION:
data/bookbridge.db
```

All application reads and writes persist directly into this physical SQLite `.db` file using `better-sqlite3`. Data persists across application restarts.

---

## 2. Step-by-Step Instructions to Manually Inspect `bookbridge.db`

You can manually open and inspect the actual tables and data inside `data/bookbridge.db` using either of the following two standard tools:

### Option 1: VS Code + SQLite Viewer Extension (Recommended)
1. Open the project folder in **VS Code**.
2. Go to the Extensions tab (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3. Search for **SQLite Viewer** (by *qwtel* or *alexcvzz*) and click **Install**.
4. In the VS Code File Explorer, expand the `data/` folder and right-click `data/bookbridge.db`.
5. Select **Open with...** → **SQLite Viewer**.
6. Click on any table name (e.g., `users`, `books`, `orders`, `market_data`) to inspect live relational database records.

---

### Option 2: DB Browser for SQLite (Standalone Application)
1. Download and install **DB Browser for SQLite** from [https://sqlitebrowser.org/](https://sqlitebrowser.org/).
2. Open DB Browser for SQLite.
3. Click **Open Database** in the top toolbar.
4. Navigate to your project directory and select `data/bookbridge.db`.
5. Click on the **Browse Data** tab.
6. Select any table from the dropdown menu (e.g., `users`, `books`, `orders`, `price_history`, `ai_predictions`) to view and query records.

---

## 3. Database Schema Overview (23 Relational SQLite Tables)

The `data/bookbridge.db` file consists of the following 23 tables:

1. **`users`**: Platform user credentials, roles (`USER`, `DELIVERY_STAFF`, `ADMIN`), and account statuses.
2. **`profiles`**: User locations, city, area, pincode, street address, and GPS coordinates.
3. **`books`**: Book catalog listings (Title, Author, Category, ISBN, MRP, Expected Price, Rental Price/day, Condition, Logistics flags).
4. **`orders`**: Buy/sell order transactions, delivery methods, payment statuses, and fulfillment states.
5. **`order_items`**: Detailed line items attached to orders.
6. **`exchanges`**: Circular book swap proposals, offered books, requested books, and handover methods.
7. **`swap_chains`**: Multi-user circular trade chain loops (e.g. User A → User B → User C → User A).
8. **`rentals`**: Book rental contracts (Duration, Rental fee, Security deposit, Start/End dates).
9. **`donations`**: Charity book donation requests posted by non-profit trusts and schools.
10. **`delivery_staff`**: Registered delivery personnel, service areas, and active workload counts.
11. **`deliveries`**: Delivery assignments, pickup/drop addresses, delivery status milestones, distance (km), and charges.
12. **`payments`**: Payment records (Amount, Delivery fee, Security deposit, Online vs COD, Transaction IDs, Refund status).
13. **`notifications`**: User notification log entries.
14. **`wishlist`**: Saved wishlist items per user.
15. **`book_requests`**: Public requests posted by users seeking specific textbooks.
16. **`reviews`**: Peer ratings (1–5 stars) and user feedback comments.
17. **`price_history`**: Historical textbook resale transaction records used by the AI price model.
18. **`market_data`**: Aggregated category demand scores, market price ranges, and price trends.
19. **`ai_predictions`**: Log of generated AI Fair Price predictions and confidence scores.
20. **`search_activity`**: Search logs used for demand score calculations.
21. **`book_views`**: Book detail view logs for demand metrics.
22. **`rental_activity`**: Rental logs for category demand calculations.
23. **`delivery_settings`**: Admin configurable distance-based delivery charge rules (0–5km = ₹30, 5–10km = ₹40, etc.).

---

## 4. Seeding & Data Persistence

Upon initial startup (`npm run dev` or `npx tsx test_db.ts`), `data/bookbridge.db` initializes automatically and seeds:
- **7 Working Accounts** (including `user@bookbridge.com`, `staff@bookbridge.com`, `admin@bookbridge.com`).
- **10 Book Catalog Listings** spanning Programming, AI, Database, and Mathematics categories.
- **Orders, Rentals, Exchanges, Deliveries, Wishlists, Requests, Price Histories, and Market Data**.

All subsequent additions (Add Book, Place Order, Create Rental, Update Profile) write directly to `data/bookbridge.db` and persist permanently across server restarts.
