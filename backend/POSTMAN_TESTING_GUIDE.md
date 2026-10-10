# BookBridge AI – Standalone Backend API & Postman Testing Guide

This guide provides step-by-step instructions to run the standalone backend server and manually test all REST API endpoints using **Postman**.

---

## 🚀 Step 1: Start the Standalone Backend Server

In your terminal, run the following command inside the project root directory:

```bash
node backend/server.js
```

Or run via npm script:

```bash
npm run backend
```

You will see the startup message:

```text
=====================================================
🚀 BOOKBRIDGE AI STANDALONE BACKEND SERVER RUNNING
=====================================================
▸ Server URL : http://localhost:5000
▸ Health Check : GET http://localhost:5000/api/health
▸ Database : data/bookbridge.db
▸ Gmail SMTP : dajitha12@gmail.com (Real-Time Enabled)
=====================================================
```

---

## 📥 Step 2: Import the Postman Collection (1-Click Setup)

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag & drop or select the file:
   `backend/BookBridge_AI.postman_collection.json`
4. Click **Import**. All 11 API endpoints will be instantly loaded into your Postman workspace!

---

## 🧪 Step 3: Manual API Testing Endpoints

### 1. Health Check
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/health`
* **Expected Response**:
  ```json
  {
    "status": "ONLINE",
    "service": "BookBridge AI Backend API",
    "timestamp": "2026-10-10T07:30:00.000Z",
    "database": "CONNECTED"
  }
  ```

---

### 2. User Authentication (Login)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/login`
* **Headers**: `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "email": "ajitha@gmail.com",
    "password": "user123",
    "role": "USER"
  }
  ```
* **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Authentication successful",
    "token": "token_usr-user1_1760072000000",
    "user": {
      "id": "usr-user1",
      "email": "ajitha@gmail.com",
      "name": "Ajitha",
      "phone": "9123456780",
      "role": "USER",
      "status": "ACTIVE"
    }
  }
  ```

---

### 3. Get All Books
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/books`
* **Optional Query Params**: `?category=Programming` or `?search=Python`

---

### 4. Get Single Book Details
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/books/bk-1`

---

### 5. Add New Book Listing
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/books`
* **Headers**: `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "ownerId": "usr-user1",
    "title": "System Design Interview",
    "author": "Alex Xu",
    "category": "Programming",
    "originalPrice": 2500,
    "expectedPrice": 1400,
    "condition": "VERY_GOOD",
    "isbn": "9781736049112",
    "description": "Clean copy covering scalable backend architecture."
  }
  ```

---

### 6. Get All Orders
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/orders`

---

### 7. Create New Order
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/orders`
* **Headers**: `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "buyerId": "usr-user1",
    "sellerId": "usr-user3",
    "bookId": "bk-3",
    "amount": 1200,
    "deliveryCharge": 30,
    "deliveryMethod": "DELIVERY"
  }
  ```

---

### 8. Get Delivery Staff Assignments
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/deliveries?staffId=usr-staff1`

---

### 9. Update Delivery Status
* **Method**: `PUT`
* **URL**: `http://localhost:5000/api/deliveries/del-1/status`
* **Headers**: `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "status": "DELIVERED"
  }
  ```

---

### 10. AI Smart Fair Price Prediction
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/ai/fair-price`
* **Headers**: `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "originalPrice": 2000,
    "condition": "VERY_GOOD",
    "daysUsed": 120,
    "category": "Programming"
  }
  ```

---

### 11. Realtime Email Dispatch Test (Gmail SMTP)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/email/send-test`
* **Headers**: `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "to": "ajitha@gmail.com",
    "subject": "Postman Realtime Mail Dispatch Test",
    "html": "<h2>BookBridge AI Postman Email Test</h2><p>This mail was triggered directly from Postman via backend Express API.</p>"
  }
  ```
* **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Realtime email sent successfully to ajitha@gmail.com",
    "messageId": "<702a2eac-2e0c-9e87-d052-8a652b6c79e9@gmail.com>"
  }
  ```
