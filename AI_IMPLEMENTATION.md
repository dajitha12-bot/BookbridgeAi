# Unified AI Pipeline: Smart Book Market & Fair Price Intelligence

## Overview

**BookBridge AI** features a single, deterministic, explainable AI pricing model entitled **"Smart Book Market & Fair Price Intelligence"** (`src/lib/ai/`). 

Rather than relying on third-party generative LLMs (Gemini, OpenAI, Claude), this system implements **our own locally executed algorithms** combining **Visual Condition Analysis**, **ISBN Identification**, **Dynamic SQLite Demand Scoring**, and **Explainable Regression** into an integrated end-to-end intelligence engine.

---

## 1. Smart Book Fair Price Assistant (Add Book Integration)

The **Smart Book Fair Price Assistant** is integrated directly into the Add Book page (`src/app/dashboard/add-book/AddBookClient.tsx`), placed near the pricing fields (`Original Price`, `Purchase Date`, `Condition`, `Expected Selling Price`).

### Card Structure & 3 Analysis Sections

When a seller inputs details and clicks **`[ Analyze Book ]`**, the system executes `analyzeFairPriceAction` which computes real-time metrics and displays a card with three distinct sections:

1. **Book Analysis Section**:
   - **Title**: User-provided or ISBN-populated title.
   - **ISBN**: Extracted or manually entered ISBN code.
   - **Original Price (MRP)**: Base publication MRP in ₹.
   - **Purchase Date**: ISO date of original purchase.
   - **Calculated Book Age**: Dynamically calculated using current `new Date()` vs purchase date. Formatted explicitly with years/months AND total days (e.g. `1 year 8 months (608 days)`).
   - **Condition**: Selected or visual condition rating.
   - **Edition**: Book edition number.

2. **Market Information Section**:
   - **Reference Price**: Category benchmark price or historical transaction average from SQLite `price_history` / `market_data`.
   - **Demand Score**: Dynamic 0–100 score computed from live SQLite activity logs.
   - **Demand Level**: Categorized into `Low` (0–30), `Medium` (31–60), `High` (61–80), or `Very High` (81–100).
   - **Activity Breakdown**: Real counts from SQLite `search_activity`, `book_views`, `wishlist`, `book_requests`, `orders`, `rentals`, and `exchanges`.
   - **Sparse Data Indicator**: If transaction/activity data is low (< 2 events), displays: `⚠️ Limited marketplace data`.

3. **Fair Price Suggestion Section**:
   - **Recommended Selling Price (₹)**: Computed optimal resale price.
   - **Recommended 5-Day Rental Price (₹)**: Computed 5-day rental price (~15% of selling price or ₹35 min).
   - **Suggested Selling Range**: Recommended bounds (₹ min – ₹ max).
   - **Confidence Score**: Quantitative percentage (e.g., `85%`). Displays `Low confidence — limited historical marketplace data` if data is sparse.
   - **Valuation Rationale**: Natural language breakdown explaining how MRP, age depreciation, condition multiplier, and demand score influenced the price.

### Action Buttons
- **`[ Use Selling Price (₹X) ]`**: Instantly populates the `expectedPrice` form field with the recommended selling price.
- **`[ Use Rental Price (₹Y) ]`**: Instantly populates the `expectedPrice` form field with the recommended 5-day rental price.

### SQLite Database Persistence
Every analysis run via `analyzeFairPriceAction` inserts a record into the SQLite `ai_predictions` table:
```sql
INSERT INTO ai_predictions (id, book_id, user_id, title, visual_condition_score, predicted_fair_price, min_suggested_price, max_suggested_price, demand_score, confidence, features_json)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
```

---

## 2. Dynamic Demand Scoring Algorithm (`src/lib/ai/demandScore.ts`)

The demand score (0–100) is calculated strictly from empirical records stored in `data/bookbridge.db`:

$$\text{Demand Score} = \min(35, N_{\text{requests}} \times 12) + \min(20, N_{\text{wishlist}} \times 7) + \min(15, N_{\text{searches}} \times 4) + \min(10, N_{\text{views}} \times 3) + \min(10, N_{\text{sales}} \times 5) + \min(10, N_{\text{rentals/exchanges}} \times 5)$$

### Weighted Factors:
- **User Requests**: 35%
- **Wishlist Saves**: 20%
- **Search Activity**: 15%
- **Book Views**: 10%
- **Recent Completed Sales**: 10%
- **Rental & Exchange Requests**: 10%

---

## 3. Explainable Fair Price Predictor Formula (`src/lib/ai/pricePrediction.ts`)

$$\text{Base Depreciated Price} = \text{MRP} \times (1 - \min(0.60, \text{AgeInYears} \times 0.15))$$

$$\text{Condition Multiplier} = \begin{cases} 
0.92 & \text{LIKE\_NEW} \\
0.85 & \text{VERY\_GOOD} \\
0.75 & \text{GOOD} \\
0.60 & \text{FAIR}
\end{cases}$$

$$\text{Demand Multiplier} = 0.85 + \left(\frac{\text{DemandScore}}{100} \times 0.30\right)$$

$$\text{Raw Calculated Price} = (\text{Base Depreciated Price} \times \text{Condition Multiplier} \times \text{Demand Multiplier}) + \text{Edition Bonus}$$

$$\text{Final Fair Price} = \begin{cases} 
60\% \times \text{Raw Calculated Price} + 40\% \times \text{Historical Avg Price} & \text{if history exists} \\
\text{Raw Calculated Price} & \text{otherwise}
\end{cases}$$

---

## 4. Viva Defense Guide (Why Local Algorithms Over External LLMs?)

1. **Determinism & Reproducibility**: LLMs return non-deterministic text responses. Our local mathematical regression guarantees that identical book attributes yield consistent, explainable price outputs.
2. **Data Grounding**: Prices are anchored strictly in real transaction records, MRPs, and active SQLite marketplace demand, preventing hallucinations.
3. **Zero External API Costs & Latency**: Runs entirely in-process within Node.js in milliseconds without needing API keys or cloud dependencies.
4. **Privacy & Offline Support**: Sensitive user listings and transactional activity remain safely inside the local SQLite database (`bookbridge.db`).
