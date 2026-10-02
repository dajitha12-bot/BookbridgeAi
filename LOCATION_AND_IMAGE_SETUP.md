# Location & Multiple Image Upload Documentation

## Overview

This document describes the implementation, browser API behavior, database schemas, security validation, and testing procedures for **Real-Time Device Location Access** and **Multiple Book Image Upload** in **BookBridge AI**.

---

## Part 1: Real-Time Location Access

### 1. Browser Geolocation API
The location feature is implemented inside [ProfileForm.tsx](file:///C:/Users/91812/.gemini/antigravity/scratch/bookbridge-ai/src/components/ProfileForm.tsx) using native HTML5 browser geolocation:
- **`navigator.geolocation.getCurrentPosition()`**: Fetches instantaneous high-accuracy GPS coordinates (`latitude`, `longitude`, `accuracy`).
- **`navigator.geolocation.watchPosition()`**: Enables continuous tracking updates when enabled.

### 2. Location Permission Handling
The application handles all browser permission states safely without crashing:
- **Permission Granted**: Displays real latitude (e.g. `13.082700`), longitude (e.g. `80.270700`), accuracy radius in meters (`±15 meters`), and last-updated timestamp (`02 Oct 2026, 8:30 PM`).
- **Permission Denied**: `Location permission was denied. Please allow location access in your browser settings.`
- **Position Unavailable**: `Your current location could not be determined.`
- **Timeout**: `Location request timed out. Please try again.`
- **Unsupported Browser**: `Location access is not supported by this browser.`

### 3. Separation of Saved Address vs. Current Location
- **Saved Delivery Address**: Manually entered street address stored in the `profiles` table.
- **Current Device Location**: Live GPS coordinates detected from the browser API.
- Clicking `[ 📍 Get Current Location ]` detects device position. Clicking `[ Save Current Location ]` persists coordinates to the SQLite `user_locations` table without force-overwriting the manual delivery address.

### 4. Reverse Geocoding & Localhost vs. Production
- **Localhost Testing**: Geolocation API works natively on `http://localhost:3000`.
- **Production Deployment**: Requires **HTTPS** (`https://`) per browser security standards for Geolocation APIs.
- **Reverse Geocoding Fallback**: Attempts lightweight client reverse geocoding via OpenStreetMap Nominatim (`https://nominatim.openstreetmap.org/reverse`). If offline or unconfigured, the UI continues displaying exact Latitude, Longitude, Accuracy, and Timestamp cleanly.

### 5. SQLite Table Schema (`user_locations`)
```sql
CREATE TABLE IF NOT EXISTS user_locations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  accuracy REAL,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Part 2: Multiple Book Image Upload & Gallery

### 1. Upload Capabilities (Add Book Page)
- Sellers can upload up to **5 real photos** per book listing ([AddBookClient.tsx](file:///C:/Users/91812/.gemini/antigravity/scratch/bookbridge-ai/src/app/dashboard/add-book/AddBookClient.tsx)).
- **Supported Formats**: JPG, JPEG, PNG, WEBP.
- **Maximum File Size**: 5 MB per image.
- **Image Labels**: `Cover Page`, `Back Cover`, `Spine`, `Inside Pages`, `Page Condition`, `Other`.
- **Primary Image Selection**: First uploaded photo is primary by default; seller can switch primary photo anytime via `[Set Main]`.

### 2. Client & Server Security Validation
- **Client Validation**: Verifies file MIME type (`image/jpeg`, `image/png`, `image/webp`) and size limit before reading file payload.
- **Server Validation**: Sanitize inputs, enforce max image count, generate safe filenames (`img_<uuid>`), and store permanent image paths in SQLite `book_images` table.

### 3. SQLite Table Schema (`book_images`)
```sql
CREATE TABLE IF NOT EXISTS book_images (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_type TEXT DEFAULT 'Cover Page',
  display_order INTEGER DEFAULT 1,
  is_primary BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
```

### 4. Interactive Book Details Gallery & Lightbox
- **Large Primary Image**: Displays active main book photo ([BookDetailsClient.tsx](file:///C:/Users/91812/.gemini/antigravity/scratch/bookbridge-ai/src/components/BookDetailsClient.tsx)).
- **Thumbnails Bar**: Clickable thumbnail selector (`[Cover] [Spine] [Pages] [Back]`).
- **"BOOK PHOTOS" Section**: Dedicated card section displaying seller's uploaded photos with assigned labels.
- **Modal Lightbox Viewer**: Clicking main image opens fullscreen modal with **Next**, **Previous**, **Zoom (+ / -)**, and **Close** controls.

---

## Testing Procedures

### Location Verification Test
1. Log in to User Dashboard → Open **My Profile**.
2. Click `[ 📍 Get Current Location ]`.
3. Allow browser location prompt.
4. Verify Latitude, Longitude, Accuracy, and Timestamp.
5. Click `[ Save Current Location ]` and verify SQLite persistence.

### Image Upload Verification Test
1. Open **Add Book** page.
2. Select 4 real book photos.
3. Label Photo 1 = Cover Page, Photo 2 = Spine, Photo 3 = Inside Pages, Photo 4 = Back Cover.
4. Verify primary image badge, remove an image, add another.
5. Submit book and open **Book Details** page.
6. Test thumbnail switching, Lightbox zoom (+ / -), and Next/Prev controls.
