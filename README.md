# BookBridge AI – Smart Book Exchange & Delivery Platform

**Tagline**: Buy. Sell. Exchange. Deliver.

BookBridge AI is a professional, city-wide book sharing, buy/sell, donation, and logistics platform designed for readers to exchange literature and engineering textbooks locally. It combines Next.js App Router, SQLite, Prisma ORM, and Tailwind CSS with a local multivariable linear regression AI for fair price estimation.

---

## Approximate Project Composition
- **Full-Stack & Business Logic**: 80–85%
- **Embedded AI/ML (Fair Price Suggestion)**: 15–20%

---

## 1. Core Platform Features
- **Buy Used Books**: Purchase pre-owned textbooks or novels listed in your neighborhood.
- **Sell Used Books**: List old books and get instant pricing suggestions from our AI model.
- **Direct Book Exchange**: Propose direct swaps between two users.
- **SwapChain Exchange**: Graph cycle DFS detection finds multi-user exchange loops (e.g. A -> B -> C -> A) when direct swaps are unavailable.
- **Donate Books**: Mark books as free donations.
- **Book Requests**: Request unavailable titles and get notified when someone lists them in your city.
- **Geographic Distance**: Sort listings by nearest distance calculated using the Haversine formula on registered addresses.
- **Logistics Choices**: Choose between Home Delivery or Offline Pickups.
- **Payment Abstraction**: Supports Cash on Delivery (COD) or simulated online credit card authorization.
- **Logistics Workloads**: Matches orders to available delivery staff using weighted logistics rules.
- **Reviews & Ratings**: Evaluate book conditions, seller reliability, and delivery staff performance.

---

## 2. Three Dashboards
1. **User Dashboard**: Acts as both Buyer, Seller, Exchanger, and Donor. Features statistics counters, active order logs, nearby listing maps, book request boards, and SwapChain proposes.
2. **Delivery Staff Dashboard**: Access assigned delivery routes, update shipment milestones, and view history.
3. **Admin Dashboard**: System diagnostics, user blocks/unblocks, logs verification, unassigned order logs, and weighted staff recommendations.

---

## 3. Technology Stack
- **Frontend**: Next.js, React.js (App Router), TypeScript, Tailwind CSS, Lucide React Icons.
- **Backend**: Next.js Server Actions, Next.js API Routes, TypeScript.
- **Database**: SQLite + Prisma ORM.
- **Authentication**: Email/Password authentication, secure cookies, PBKDF2 hashing, and role authorization.
- **AI/ML**: Custom Embedded Multivariable Linear Regression with Gradient Descent.

---

## 4. Database Setup & Schema
Prisma models configured in SQLite:
- `User` & `Profile`: Authentication and geolocation coordinates.
- `Book` & `Category`: Listings and genres.
- `Wishlist` & `BookRequest`: Saved titles and buy requests.
- `Order` & `Payment`: Transaction logs.
- `Exchange` & `SwapChain`: Direct and loop trades.
- `DeliveryStaff` & `Delivery`: Shipments and staff.
- `Review` & `Notification`: User feedback and alerts.

---

## 5. Non-AI Smart Algorithms
- **Smart Book Recommendations**: Database-backed matching category interests.
- **Nearby Seller Ranking**: Mathematical Haversine distance formula.
- **SwapChain cycle finder**: DFS graph cycle analysis.
- **Delivery Staff Assignment**: Weighted matching rules.

---

## 6. Installation & Execution

### 6.1 Prerequisites
- Node.js (v18 or higher)
- npm (v10 or higher)

### 6.2 Environment Configuration
Create a `.env` file at the project root based on `.env.example`:
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-32-byte-hex-string-for-cookie-encryption"
```

### 6.3 Prisma Setup & Seeding
Install dependencies and run database synchronization:
```bash
# Install npm dependencies
npm install

# Sync Prisma Schema and generate Client
npx prisma db push

# Seed the database with sample users and books
npx prisma db seed
```

### 6.4 Running the Application
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Future Enhancements
- Replace the local TypeScript regression pricing model with a TensorFlow.js regression model or custom neural network.
- Integrate real-time GPS tracking for delivery staff.
- Expand payment methods to include UPI and Stripe gateway webhooks.
- Support book cover image uploads directly to Cloudinary or AWS S3.
