# Unified AI Pipeline: Smart Book Market & Fair Price Intelligence

## Overview

**BookBridge AI** features a single, unified AI pipeline entitled **"Smart Book Market & Fair Price Intelligence"** (`src/lib/ai/`). 

Rather than fragmenting into multiple disconnected AI tools, this system unifies **Image Condition Analysis**, **Metadata Identification**, **Dynamic Demand Scoring**, and **Explainable Price Regression** into an integrated end-to-end intelligence engine.

---

## 1. Unified Architecture Diagram

```
                 [ Upload Book Cover Image ] + [ Enter Book Details ]
                                    ↓
┌───────────────────────────────────────────────────────────────────────┐
│                      UNIFIED AI PIPELINE                              │
│                                                                       │
│  1. Visual Condition Analysis (src/lib/ai/imageAnalysis.ts)            │
│     → Evaluates image clarity, brightness, contrast & cover wear      │
│     → Outputs: Visual Condition Score (0–100) & Detected Condition    │
│                                                                       │
│  2. ISBN Metadata Identification (src/lib/ai/bookIdentification.ts)   │
│     → Open Library REST API query with SQLite DB cache fallback       │
│                                                                       │
│  3. Dynamic Demand Scoring Engine (src/lib/ai/demandScore.ts)          │
│     → Processes real SQLite activity metrics                          │
│     → Requests (35%) + Wishlist (20%) + Searches (15%) + Views (10%)  │
│       + Recent Sales (10%) + Rental/Exchange Activity (10%)           │
│     → Outputs: Demand Score (0–100) & Demand Level                   │
│                                                                       │
│  4. Explainable Fair Price Model (src/lib/ai/pricePrediction.ts)       │
│     → Blends MRP, Book Age, Condition, Demand, Edition & SQLite Hist  │
│     → Outputs: AI Fair Price (₹), Min/Max Range, Confidence (%)       │
└───────────────────────────────────────────────────────────────────────┘
                                    ↓
         [ Market Intelligence Dashboard & Add Book AI Suggestions ]
```

---

## 2. Component Specifications

### A. AI-Assisted Visual Condition Analysis (`src/lib/ai/imageAnalysis.ts`)
- **Methodology**: Evaluates visual properties of the uploaded cover photo (resolution, brightness, contrast, edge complexity).
- **Output**:
  - `conditionScore`: Numeric rating (0–100).
  - `detectedCondition`: Classification (`LIKE_NEW`, `VERY_GOOD`, `GOOD`, `FAIR`).
  - `qualityMetrics`: Visual parameters (clarity, brightness, contrast, wear level summary).
- **Disclaimer**: Termed *AI-Assisted Visual Condition Analysis* because physical page quality remains verifiable by seller input.

---

### B. Dynamic Demand Scoring Algorithm (`src/lib/ai/demandScore.ts`)
- **Weight Allocation Formula**:
  - **User Requests**: 35%
  - **Wishlist Saves**: 20%
  - **Search Activity**: 15%
  - **Book Detail Views**: 10%
  - **Recent Completed Sales**: 10%
  - **Rental & Exchange Requests**: 10%
- **Normalized Demand Levels**:
  - `0 – 30`: **Low**
  - `31 – 60`: **Medium**
  - `61 – 80`: **High**
  - `81 – 100`: **Very High**

---

### C. Explainable Fair Price Predictor (`src/lib/ai/pricePrediction.ts`)
- **Formula & Inputs**:
  $$\text{Base Depreciated Price} = \text{MRP} \times (1 - \text{Age Depreciation Rate})$$
  $$\text{Raw Fair Price} = \text{Base Price} \times \text{Condition Multiplier} \times \text{Demand Multiplier} + \text{Edition Bonus}$$
  $$\text{Final Fair Price} = 60\% \times \text{Raw Fair Price} + 40\% \times \text{SQLite Historical Average}$$
- **Outputs**:
  - **AI Fair Price** (e.g. ₹850)
  - **Suggested Price Range** (e.g. ₹765 – ₹935)
  - **Confidence Rating** (e.g. 88%)
  - **Factor Breakdown** (MRP, Age depreciation %, Condition multiplier, Demand score, Historical benchmark)

---

## 3. Book Market Intelligence Dashboard (`/dashboard/market-intelligence`)

The Market Intelligence page displays real-time analytics queried directly from `data/bookbridge.db`:
- **Demand Gauges**: Category-wide demand scores (0–100).
- **Market Price Ranges**: Lowest, average, and highest transaction prices per category.
- **Price Trends**: Category trajectories (`INCREASING`, `STABLE`, `DECREASING`).
- **Activity Summary**: Live counts of requests, wishlists, searches, views, and sales.
- **Historical Chart**: Monthly benchmark trends indexed from SQLite transaction logs.

---

## 4. Local Execution & Privacy

- **No Remote AI Lock-in**: All condition analysis, demand scoring, and fair price prediction algorithms execute locally within Node.js / TypeScript.
- **Explainability**: Every prediction displays a complete breakdown of the underlying factors so sellers understand why a price was recommended.
