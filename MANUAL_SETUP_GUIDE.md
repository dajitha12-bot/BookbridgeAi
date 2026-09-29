# BookBridge AI - Comprehensive Manual Connection & Setup Guide

Welcome to the **BookBridge AI (Smart Book Circulation & Fair Price Predictor)** setup guide. This document provides step-by-step instructions for establishing manual connections, configuring environment variables, setting up payment integration, and verifying platform integrity.

---

## 1. Manual Setup Summary Table

| Service / Feature | Manual Setup Required? | Setup Category | Required Information |
|---|---|---|---|
| **SQLite Database** | **No** | **AUTOMATIC** | Auto-created at `data/bookbridge.db` via `better-sqlite3` |
| **Open Library API** | **No** | **AUTOMATIC** | Public API (No key required for standard lookup) |
| **Razorpay Test Mode** | **YES** | **MANUAL** | `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` from Razorpay Dashboard |
| **Razorpay Webhook** | **YES** | **MANUAL** | Webhook URL (`/api/payments/webhook`) & `RAZORPAY_WEBHOOK_SECRET` |
| **Razorpay Live Mode** | **YES** | **MANUAL** | Live Account Activation/KYC + Live API Credentials |
| **External Market API** | **Optional** | **OPTIONAL** | `MARKET_API_KEY` (Fallback to SQLite Market Data if omitted) |
| **AI Price Engine** | **No** | **AUTOMATIC** | Built-in TensorFlow / Heuristic 0-100 Demand Engine |
| **Next.js Application** | **No** | **AUTOMATIC** | Installed via `npm install` |
| **Environment Variables** | **YES** | **MANUAL** | Configure `.env.local` using `.env.example` template |
| **Production Deployment** | **YES** | **MANUAL** | Production domain & environment variables on host (e.g. Vercel/Node) |

---

## 2. First-Time Project Setup (Step-by-Step)

Follow these exact steps to launch BookBridge AI on a new system:

1. **Install Node.js**: Ensure Node.js v18 LTS or higher is installed (`node -v`).
2. **Open Project Folder**: Navigate to the project directory:
   ```bash
   cd bookbridge-ai
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Create Local Environment File**: Create `.env.local` in the root folder:
   ```bash
   cp .env.example .env.local
   ```
5. **Populate Environment Variables**: Fill in `.env.local` values (see Section 7).
6. **Initialize SQLite Database**: Run the database creation script:
   ```bash
   npm run db:init
   ```
   *(Creates `data/bookbridge.db` and DDL schemas for all 23 relational tables).*
7. **Seed Baseline Data**:
   ```bash
   npm run db:seed
   ```
8. **Start Development Server**:
   ```bash
   npm run dev
   ```
9. **Open Browser Application**: Visit [http://localhost:3000](http://localhost:3000).
10. **Test Demo Logins**:
    * **User**: `user@bookbridge.com` / `user123` (or `ajitha@gmail.com` / `user123`)
    * **Admin**: `admin@bookbridge.com` / `admin123`
    * **Delivery Staff**: `staff@bookbridge.com` / `staff123`
11. **Configure Razorpay Test Credentials**: Generate test keys in Razorpay Dashboard and paste into `.env.local`.
12. **Test Payment Flow**: Place a book order choosing Online Payment or Cash on Delivery.
13. **Open Admin Dashboard**: Access `/admin` to verify live sales, deliveries, and payment records.
14. **Check Integration Status**: Access `/admin/settings/integrations` to test live connections.

---

## 3. SQLite Database Setup & Manual Inspection

### Automatic Setup
BookBridge AI automatically initializes the physical SQLite database at `data/bookbridge.db` using `better-sqlite3`.
* WAL (Write-Ahead Logging) is automatically enabled for fast concurrent read/write transactions.
* Foreign keys are enforced (`PRAGMA foreign_keys = ON;`).

### How to Inspect the Database Externally

#### Option 1: VS Code SQLite Viewer Extension
1. Open VS Code.
2. Search for and install the **SQLite Viewer** extension by *qwtel*.
3. Open the project folder in VS Code.
4. Expand the `data/` folder and right-click `bookbridge.db`.
5. Select **Open with SQLite Viewer**.
6. View real-time tables: `users`, `books`, `orders`, `payments`, `deliveries`, `search_activity`, `price_history`.

#### Option 2: DB Browser for SQLite (Desktop App)
1. Download and install **DB Browser for SQLite** from [sqlitebrowser.org](https://sqlitebrowser.org/).
2. Launch DB Browser for SQLite.
3. Click **Open Database**.
4. Navigate to `bookbridge-ai/data/bookbridge.db`.
5. Select the **Browse Data** tab.
6. Choose tables from the dropdown menu (`users`, `orders`, `payments`, `swap_chains`, `market_data`).

---

## 4. Open Library API Connection

### Overview
The Open Library REST API is an open public repository used by BookBridge AI for real-time ISBN lookup and book metadata auto-population.

```
Enter ISBN (e.g. 9780132350884)
            ↓
Click "Lookup ISBN" Button
            ↓
Next.js Server API route queries Open Library
            ↓
Title / Author / Category / Publication Year populated
            ↓
User verifies & adjusts details
            ↓
Save Book to SQLite database
```

### Manual Configuration
* **API Key Required?** **NO**. Open Library is completely free and public.
* **Fallback Mechanism**: If Open Library is unreachable or an unlisted ISBN is provided, BookBridge AI automatically falls back to **BookBridge SQLite Market Data**, allowing seamless manual book entry without blocking the user.

---

## 5. Razorpay Test Mode Setup

### Step-by-Step Instructions

1. **Create Razorpay Account**: Visit [https://razorpay.com](https://razorpay.com) and sign up for a developer account.
2. **Access Dashboard**: Log into the [Razorpay Dashboard](https://dashboard.razorpay.com).
3. **Switch to Test Mode**: Look at the top menu bar toggle and switch from **Live Mode** to **Test Mode**.
4. **Navigate to API Keys**: Go to **Account & Settings** → **API Keys** under Developer Controls.
5. **Generate Test Key Pair**: Click **Generate Test Key**.
6. **Copy Credentials**: Copy the `Key ID` and `Key Secret`.
7. **Add to `.env.local`**:
   ```env
   RAZORPAY_KEY_ID=rzp_test_YourGeneratedKeyId
   RAZORPAY_KEY_SECRET=YourGeneratedKeySecret
   ```
8. **Restart Next.js Server**: Save `.env.local` and restart `npm run dev`.

---

## 6. Razorpay Webhook Setup

### Local Development Tunneling (ngrok)
Because Razorpay servers cannot send HTTP requests directly to `http://localhost:3000`, use a tunneling tool like **ngrok** during local development:

```
Next.js Application (localhost:3000)
              ↑
       HTTPS Tunnel (ngrok)
              ↑
Public HTTPS URL (https://xxxx.ngrok-free.app)
              ↑
Razorpay Webhook Event Engine
              ↑
    /api/payments/webhook
```

### Webhook Configuration Steps

1. Start your local app: `npm run dev`.
2. Start ngrok in a separate terminal:
   ```bash
   npx ngrok http 3000
   ```
3. Copy the public HTTPS forwarding URL (e.g. `https://a1b2c3.ngrok-free.app`).
4. Append the webhook route: `https://a1b2c3.ngrok-free.app/api/payments/webhook`.
5. Open Razorpay Dashboard → **Settings** → **Webhooks** → **Add New Webhook**.
6. Paste the complete Webhook URL.
7. Enter a **Webhook Secret** (e.g. `my_secret_webhook_123`).
8. Check the following events:
   * `payment.authorized`
   * `payment.captured`
   * `payment.failed`
   * `refund.created`
9. Click **Save Webhook**.
10. Add the webhook secret to `.env.local`:
    ```env
    RAZORPAY_WEBHOOK_SECRET=my_secret_webhook_123
    ```
11. Restart Next.js dev server (`npm run dev`).

---

## 7. Environment Variables Reference Guide

The following variables are supported in `.env.local`:

| Variable Name | Purpose | Required/Optional | Example Format | Restart Required? |
|---|---|---|---|---|
| `DATABASE_PATH` | Path to physical SQLite `.db` file | **Required** | `data/bookbridge.db` | Yes |
| `NEXT_PUBLIC_APP_URL` | Base application URL | **Required** | `http://localhost:3000` | Yes |
| `RAZORPAY_KEY_ID` | Razorpay public key ID | **Required (for online pay)** | `rzp_test_xxxx` | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay private key secret | **Required (for online pay)** | `xxxxSecret` | Yes |
| `RAZORPAY_WEBHOOK_SECRET` | Secret key for verifying webhooks | **Required (for webhooks)** | `webhook_secret_123` | Yes |
| `OPEN_LIBRARY_BASE_URL` | Open Library API base endpoint | **Required** | `https://openlibrary.org` | Yes |
| `MARKET_API_KEY` | Key for external market price API | **Optional** | `market_api_key_xxxx` | Yes |
| `SESSION_SECRET` | Session encryption secret key | **Required** | 32-byte hex string | Yes |

> [!IMPORTANT]
> Never commit `.env.local` or secret keys to GitHub. Use `.env.example` as a safe template.

---

## 8. Payment Flow Testing Procedures

### A. Testing Successful Online Payment (Test Mode)
1. Log in as a registered user (`user@bookbridge.com` / `user123`).
2. Go to **Browse Books** and click on any available book.
3. Select **Buy Now** or **Rent Now** and proceed to Checkout.
4. Select **Home Delivery** (distance fee auto-calculated) or **Offline Pickup**.
5. Choose **Online Payment (Razorpay)** and click **Pay & Place Order**.
6. In the Razorpay modal, select **Card** or **UPI** test details:
   * **Card Number**: `4111 1111 1111 1111`
   * **Expiry**: `12/30`
   * **CVV**: `123`
7. Click **Success**.
8. Verify order changes to `CONFIRMED` and payment record is stored in SQLite table `payments`.

### B. Testing Failed Online Payment
1. Repeat steps 1–5 above.
2. In the Razorpay modal, click **Failure** or simulate payment drop.
3. Verify order status remains `PENDING` or `PAYMENT_FAILED`.
4. Check that an error notification is displayed without crashing the UI.

### C. Testing Cash On Delivery (COD) / Offline Pickup
1. Select **Cash on Delivery** at checkout.
2. Submit order.
3. Verify order is created immediately with payment status `COD_PENDING`.
4. Log in as **Delivery Staff** (`staff@bookbridge.com`) to accept and mark delivery as `DELIVERED` & payment `COLLECTED`.

---

## 9. Razorpay Live Mode Setup

When transitioning from sandbox testing to live financial operations:

1. **Complete Account Activation**: Complete business KYC verification on the Razorpay Dashboard.
2. **Generate Live Keys**: Switch dashboard toggle to **Live Mode** and go to **API Keys** → **Generate Live Key**.
3. **Update Production Environment Variables**:
   ```env
   RAZORPAY_KEY_ID=rzp_live_YourLiveKeyId
   RAZORPAY_KEY_SECRET=YourLiveKeySecret
   RAZORPAY_WEBHOOK_SECRET=YourLiveWebhookSecret
   ```
4. **Set Production Webhook**: Update Webhook URL in Razorpay Dashboard to your live HTTPS domain (e.g. `https://your-domain.vercel.app/api/payments/webhook`).
5. **Enforce HTTPS**: Ensure your hosting provider enforces valid SSL/TLS certificates.
6. **Perform Test Transaction**: Execute a real low-value transaction (e.g. ₹10) to verify end-to-end webhook verification.

---

## 10. API Connection Test Page

BookBridge AI provides an interactive **Integrations Dashboard** located at:
👉 `/admin/settings/integrations`

### Features
* Displays live connection status for **SQLite Database**, **Open Library API**, **Razorpay Gateway**, **Razorpay Webhook**, **External Market API**, and **AI Model**.
* Includes interactive **Test Connection** buttons to verify external service responsiveness.
* **Security Enforced**: API secret keys, passwords, and tokens are NEVER rendered on screen or exposed in API responses.

---

## 11. Troubleshooting Common Setup Issues

| Problem | Root Cause | Solution |
|---|---|---|
| **Razorpay modal does not open** | `RAZORPAY_KEY_ID` missing or invalid format | Check `.env.local` for `RAZORPAY_KEY_ID=rzp_test_...` and restart `npm run dev`. |
| **Payment succeeded but order status is pending** | Webhook secret mismatch or missing payment verification call | Verify `RAZORPAY_WEBHOOK_SECRET` matches Razorpay dashboard setting and check server logs. |
| **Open Library details not auto-populating** | Network block or invalid ISBN | Verify internet connectivity. BookBridge automatically falls back to manual entry. |
| **SQLite DB file not visible in VS Code** | File not initialized yet | Run `npm run db:init` or trigger any API request to auto-create `data/bookbridge.db`. |
| **AI Fair Price prediction returning default** | Insufficient market data | Add book original price and purchase year; the heuristic engine will calculate fair value. |

---

## 12. Final Manual Setup Checklist

Verify that your installation is complete by checking off each item:

- [x] **Node.js** installed and package dependencies updated (`npm install`)
- [x] **`.env.local`** created from `.env.example`
- [x] **SQLite Database** initialized at `data/bookbridge.db` (`npm run db:init`)
- [x] **Seed Data** inserted for users, books, and delivery staff (`npm run db:seed`)
- [x] **Next.js Dev Server** running cleanly (`npm run dev`)
- [x] **Open Library API** ISBN lookup tested on Add Book page
- [x] **Razorpay Test Keys** added to `.env.local`
- [x] **Razorpay Checkout Modal** tested and verified
- [x] **Payment Verification** updating SQLite `payments` and `orders` tables
- [x] **Admin Integrations Page** accessible at `/admin/settings/integrations`
- [x] **Delivery Staff Workflow** tested on `/staff` dashboard
- [x] **AI Fair Price Predictor** returning explainable valuation cards
- [x] **Cash on Delivery (COD)** workflow verified
