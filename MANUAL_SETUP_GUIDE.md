# BookBridge AI - Manual Setup & Integration Guide

Welcome to the **BookBridge AI (Smart Book Circulation & Fair Price Predictor)** setup guide. This document provides step-by-step instructions for initializing the physical SQLite database, setting up real email notifications, configuring local environment variables, and deploying to Vercel.

---

## 1. Manual Setup Summary Table

| Service / Feature | Setup Category | Required Information |
|---|---|---|
| **SQLite Database** | **AUTOMATIC** | Auto-created at `data/bookbridge.db` via `better-sqlite3`. No setup required. |
| **Open Library API** | **AUTOMATIC** | Public API (No API key needed for standard metadata lookups). |
| **Demo UPI Online Payment** | **AUTOMATIC** | Built-in simulated checkout retrieving seller UPI IDs automatically from SQLite. |
| **Real Email Notifications** | **MANUAL / OPTIONAL** | Configure `RESEND_API_KEY` & `EMAIL_FROM` in `.env.local` for live email dispatch. |
| **Next.js Application** | **AUTOMATIC** | Installed via `npm install`. |
| **Environment File** | **MANUAL** | Create `.env.local` from `.env.example` template. |
| **Production Deployment** | **MANUAL** | Connect GitHub repo `dajitha12-bot/BookbridgeAi` to Vercel and add environment variables. |

---

## 2. Step-by-Step Email Provider Integration (Resend API)

To enable **real transactional email notifications** sent to buyers and sellers upon order confirmation:

### Step 1: Create a Resend Account
1. Open your browser and go to [https://resend.com](https://resend.com).
2. Click **Get Started** and sign up for a free developer account.

### Step 2: Generate an API Key
1. In the Resend Dashboard sidebar, click **API Keys**.
2. Click **Create API Key**.
3. Name your key (e.g. `BookBridge-Dev-Key`) and set permissions to **Full Access**.
4. Copy the generated secret key (starts with `re_...`).

### Step 3: Configure Environment Variables
Open your `.env.local` file (or Vercel Environment Variables) and add:
```env
RESEND_API_KEY=re_123456789_YourActualResendApiKeyHere
EMAIL_FROM=BookBridge AI <onboarding@resend.dev>
```

### Step 4: Restart Next.js Application
Restart your local development server for changes to take effect:
```bash
npm run dev
```

### Step 5: Test Email Dispatch
1. Log in as **Buyer** (`user@bookbridge.com` / `user123`).
2. Purchase a book using **Online UPI (Demo)** or **COD**.
3. Upon checkout, the system automatically sends:
   - **Buyer Confirmation Email**: Subject `BookBridge - Order #BBXXXX Confirmed` containing itemized book price, delivery charge, and order status.
   - **Seller Notification Email**: Subject `BookBridge - Your Book Has Been Ordered` containing buyer details, seller UPI ID, and order amount.

---

## 3. Environment Variables Reference Guide (`.env.example`)

| Variable Name | Purpose | Required/Optional | Example Value |
|---|---|---|---|
| `DATABASE_PATH` | Path to physical SQLite database file | **Required** | `data/bookbridge.db` |
| `NEXT_PUBLIC_APP_URL` | Application base domain URL | **Required** | `http://localhost:3000` |
| `RESEND_API_KEY` | Resend API key for real email sending | **Optional** | `re_123456789_xxxx` |
| `EMAIL_FROM` | Sender email address header | **Optional** | `notifications@bookbridge.com` |
| `OPEN_LIBRARY_BASE_URL` | Open Library API base endpoint | **Required** | `https://openlibrary.org` |
| `SESSION_SECRET` | Session encryption secret key | **Required** | 32-byte hex string |

---

## 4. SQLite Database Inspection

The physical database file is stored at: `data/bookbridge.db`.

### In-Browser DB Table Explorer (Easiest)
1. Start your dev server: `npm run dev`.
2. Open: **[http://localhost:3000/admin/db-viewer](http://localhost:3000/admin/db-viewer)** (or click "Open SQLite Table Explorer" on Admin Settings).
3. Browse and search all 28 relational tables directly inside your web browser.

---

## 5. Vercel Deployment Instructions

1. Push latest code to GitHub:
   ```bash
   git push origin main
   ```
2. Log into [Vercel Dashboard](https://vercel.com).
3. Import repository: `dajitha12-bot/BookbridgeAi`.
4. Under **Environment Variables**, add:
   - `DATABASE_PATH` = `data/bookbridge.db`
   - `NEXT_PUBLIC_APP_URL` = `https://bookbridge-ai-5xam.vercel.app`
   - `RESEND_API_KEY` = `re_...` (optional)
5. Click **Deploy**. Vercel will automatically build and publish your project.
