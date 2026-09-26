# External API Integration & Configuration Guide

## Overview
**Smart Book Circulation & Fair Price Predictor (BookBridge AI)** supports external book data retrieval to enhance automated book listing and pricing intelligence.

---

## 1. External Book Metadata API: Open Library REST API

### API Details
- **API Name**: Open Library Books API
- **Endpoint**: `https://openlibrary.org/api/books`
- **Purpose**: Retrieves book metadata (Title, Author, Publisher, Publication Year, ISBN, Cover Image) when a seller enters an ISBN.
- **API Key Requirement**: **NO API key is required**. Open Library provides open, public REST access.

### Environment Variable Setup
Create or update `.env.local` in the project root:

```env
# Optional API configuration
OPEN_LIBRARY_API_URL=https://openlibrary.org/api/books
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=bookbridge-secret-key-2026-very-secure-random-string
```

---

## 2. Graceful Fallback Hierarchy

To ensure **100% operational resilience**, BookBridge AI uses a multi-tier fallback hierarchy:

```
1. Open Library Public REST API (When online & ISBN matches)
        ↓ (If unavailable or offline)
2. BookBridge SQLite Database Cache (data/bookbridge.db)
        ↓ (If new ISBN)
3. Manual Seller Input Form Fields
```

The application will **never crash** if an external API call times out or if internet connection is lost.

---

## 3. How to Test External Metadata Lookup

1. Log into BookBridge AI as a User (`user@bookbridge.com` / `user123`).
2. Navigate to **Add Book** (`/dashboard/add-book`).
3. Enter a valid 13-digit ISBN (e.g., `9781593279509` for *Eloquent JavaScript* or `9780132350884` for *Clean Code*).
4. Click **Lookup ISBN**.
5. The form will automatically populate the Title, Author, Edition, Category, and Publication Year retrieved from the API or SQLite database cache.
