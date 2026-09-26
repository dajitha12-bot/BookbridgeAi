# Smart Book Circulation & Fair Price Predictor (BookBridge AI)

A complete, full-stack, professional used-book circulation and market intelligence platform built with **Next.js 15 App Router**, **TypeScript**, **Tailwind CSS**, and a **real physical SQLite database (`data/bookbridge.db`)**.

---

## 🌟 Key Features

### 1. Multi-Model Book Circulation
- 🛒 **Buy & Sell**: List textbooks with condition details, AI pricing suggestions, and purchase with home delivery or offline pickup.
- 📖 **Rent a Book**: Rent textbooks for flexible durations (7, 14, 30 days) with automated daily fee & security deposit calculations.
- 🔄 **Exchange & SwapChain**: Peer-to-peer book swaps and multi-user circular trade chain detection (User A → User B → User C → User A).
- 🎁 **Charity Book Donations**: Donate textbooks to verified schools, rural non-profits, and educational trusts.

### 2. Unified AI Pipeline: "Smart Book Market & Fair Price Intelligence"
- **AI-Assisted Visual Condition Analysis**: Evaluates cover photo brightness, contrast, and edge wear to detect visual condition (`LIKE_NEW`, `VERY_GOOD`, `GOOD`, `FAIR`).
- **Open Library ISBN Identification**: Queries public book metadata with graceful SQLite fallback.
- **Dynamic Demand Scoring Engine**: Computes dynamic 0–100 demand scores from SQLite activity logs (Requests 35%, Wishlist 20%, Searches 15%, Views 10%, Sales 10%, Rentals 10%).
- **Explainable Fair Price Predictor**: Calculates AI Fair Price (₹), min/max range, confidence rating (%), and factor breakdown.
- **Book Market Intelligence Page (`/dashboard/market-intelligence`)**: Real-time demand gauges, category price ranges, price trends, and monthly transaction history charts.

### 3. Real SQLite Database (`data/bookbridge.db`)
- **No Mock Arrays or JSON Primary Storage**: Powered by `better-sqlite3` writing directly to `data/bookbridge.db`.
- **23 Relational Tables**: Includes foreign keys, indexes, and automated timestamp tracking.
- **Persistent Storage**: Data persists permanently across application restarts.

### 4. Logistics & Delivery Staff Management
- **Configurable Distance-Based Charges**: Admin configurable fee tiers (0–5 km = ₹30, 5–10 km = ₹40, 10–20 km = ₹60, 20–30 km = ₹80, 30+ km = ₹100).
- **Home Delivery vs. Offline Pickup**: Choice of courier dispatch with unassigned staff routing or coordinate pickup points.
- **Delivery Staff Portal**: Dedicated dashboard for drivers to manage assignments, transit milestones, rental deliveries, and earnings.

---

## 🔑 Demo Login Accounts

Test the application across all three user roles using these working credentials:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **User** | `user@bookbridge.com` | `user123` | Buy, Sell, Rent, Exchange, Donate, Wishlist, Market Intelligence |
| **Delivery Staff** | `staff@bookbridge.com` | `staff123` | Assigned Deliveries, Transit Milestones, Rental Routes, Earnings |
| **Admin** | `admin@bookbridge.com` | `admin123` | User/Staff Mgmt, Order Audits, Delivery Staff Assignment, Settings |

*(Alternative Demo User: `ajitha@gmail.com` / `user123`)*

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router & Server Actions)
- **Language**: TypeScript
- **Database Engine**: SQLite (`better-sqlite3`)
- **Database Location**: `data/bookbridge.db`
- **UI & Styling**: React 19, Tailwind CSS, Lucide React Icons
- **AI / ML**: Local Visual Feature Extractor, Open Library REST API, Explainable Regression Engine

---

## 📁 Project Structure & Documentation

```
├── data/
│   └── bookbridge.db           # Physical SQLite Database File
├── src/
│   ├── actions/                # Server Actions (auth, books, orders, etc.)
│   ├── app/                    # Next.js App Router Pages & Layouts
│   │   ├── dashboard/
│   │   │   ├── market-intelligence/ # Book Market Intelligence Dashboard
│   │   │   ├── my-books/       # 8-Tab Activity Center
│   │   │   ├── rentals/        # Rent Books Catalog
│   │   │   └── ...
│   │   ├── admin/              # Admin Control Panel
│   │   ├── staff/              # Delivery Staff Portal
│   │   └── page.tsx            # SaaS Landing Page with Role Cards
│   ├── components/             # Reusable UI Shell & Components
│   ├── lib/
│   │   ├── ai/                 # Unified AI Pipeline Modules
│   │   │   ├── imageAnalysis.ts
│   │   │   ├── bookIdentification.ts
│   │   │   ├── demandScore.ts
│   │   │   ├── pricePrediction.ts
│   │   │   └── marketIntelligence.ts
│   │   ├── db/                 # SQLite Database Layer (sqliteDb.ts & Repositories)
│   │   └── utils/              # Distance & Delivery Fee Calculation
├── DATABASE_SETUP.md           # Instructions for inspecting bookbridge.db
├── API_SETUP.md                # Open Library API setup & fallback documentation
└── AI_IMPLEMENTATION.md        # Technical guide to the Unified AI Pipeline
```

---

## 🚀 Quick Start & Running the Project

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Development Server
Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The SQLite database `data/bookbridge.db` will automatically initialize and seed with baseline records on first launch.

### 3. Building for Production
Verify production build:
```bash
npm run build
```

---

## 📖 Further Documentation
- Refer to [DATABASE_SETUP.md](DATABASE_SETUP.md) for steps to view `data/bookbridge.db` using VS Code SQLite Viewer or DB Browser for SQLite.
- Refer to [API_SETUP.md](API_SETUP.md) for external API integration details.
- Refer to [AI_IMPLEMENTATION.md](AI_IMPLEMENTATION.md) for deep-dive technical specs on the Unified AI Pipeline.
