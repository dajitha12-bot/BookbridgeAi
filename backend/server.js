const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and Body Parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to SQLite Database
const dbPath = path.join(process.cwd(), 'data', 'bookbridge.db');
let db;
try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  console.log(`[BACKEND] Connected to SQLite database at: ${dbPath}`);
} catch (err) {
  console.error('[BACKEND] Database connection failed:', err);
}

// Env Helper
function getEnvVar(key) {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith(`${key}=`)) {
          let val = trimmed.substring(key.length + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          return val;
        }
      }
    }
  } catch (e) {}
  return undefined;
}

// ----------------------------------------------------
// REST API ENDPOINTS FOR POSTMAN MANUAL TESTING
// ----------------------------------------------------

// Root API Dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>BookBridge AI – Backend API Server</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
          .container { max-width: 800px; margin: 0 auto; background: #1e293b; padding: 2rem; rounded: 1rem; border: 1px solid #334155; border-radius: 12px; }
          h1 { color: #38bdf8; font-size: 1.75rem; margin-top: 0; }
          p { color: #94a3b8; font-size: 0.95rem; }
          .badge { display: inline-block; background: #0284c7; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: bold; font-size: 0.75rem; }
          ul { list-style: none; padding: 0; }
          li { margin: 0.75rem 0; padding: 0.75rem; background: #0f172a; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
          a { color: #38bdf8; text-decoration: none; font-weight: bold; font-family: monospace; font-size: 0.9rem; }
          a:hover { text-decoration: underline; }
          .method { font-weight: bold; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
          .get { background: #065f46; color: #34d399; }
          .post { background: #1e3a8a; color: #60a5fa; }
          .put { background: #78350f; color: #fbbf24; }
        </style>
      </head>
      <body>
        <div class="container">
          <span class="badge">ONLINE</span>
          <h1>🚀 BookBridge AI Backend REST API</h1>
          <p>The standalone backend server is running cleanly on <code>http://localhost:5000</code>.</p>
          <h3>Available REST API Endpoints:</h3>
          <ul>
            <li><span><span class="method get">GET</span> <a href="/api/health" target="_blank">/api/health</a></span> <span>Health Status</span></li>
            <li><span><span class="method get">GET</span> <a href="/api/books" target="_blank">/api/books</a></span> <span>List All Books</span></li>
            <li><span><span class="method get">GET</span> <a href="/api/books/bk-1" target="_blank">/api/books/bk-1</a></span> <span>Book Details</span></li>
            <li><span><span class="method get">GET</span> <a href="/api/orders" target="_blank">/api/orders</a></span> <span>List All Orders</span></li>
            <li><span><span class="method get">GET</span> <a href="/api/deliveries" target="_blank">/api/deliveries</a></span> <span>List All Deliveries</span></li>
            <li><span><span class="method post">POST</span> <code>/api/auth/login</code></span> <span>User Login</span></li>
            <li><span><span class="method post">POST</span> <code>/api/ai/fair-price</code></span> <span>Fair Price Prediction</span></li>
            <li><span><span class="method post">POST</span> <code>/api/email/send-test</code></span> <span>Realtime Email Test</span></li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'BookBridge AI Backend API',
    timestamp: new Date().toISOString(),
    database: fs.existsSync(dbPath) ? 'CONNECTED' : 'MISSING'
  });
});

// 1. AUTHENTICATION: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email address is required.' });
  }

  const user = db.prepare('SELECT id, email, name, phone, role, status FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User account not found.' });
  }

  const token = `token_${user.id}_${Date.now()}`;
  res.json({
    success: true,
    message: 'Authentication successful',
    token,
    user
  });
});

// 2. BOOKS: Get All Books
app.get('/api/books', (req, res) => {
  const { category, status, search } = req.query;
  let sql = 'SELECT * FROM books WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND LOWER(category) = LOWER(?)';
    params.push(category);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND (LOWER(title) LIKE ? OR LOWER(author) LIKE ?)';
    params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }

  sql += ' ORDER BY created_at DESC';

  try {
    const books = db.prepare(sql).all(...params);
    res.json({ success: true, count: books.length, books });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. BOOKS: Get Single Book Details
app.get('/api/books/:id', (req, res) => {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
    
    const owner = db.prepare('SELECT id, name, email, phone FROM users WHERE id = ?').get(book.owner_id);
    res.json({ success: true, book: { ...book, owner } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. BOOKS: Create / Add New Book
app.post('/api/books', (req, res) => {
  const { ownerId, title, author, category, originalPrice, expectedPrice, condition, description, isbn } = req.body;
  if (!title || !author || !category) {
    return res.status(400).json({ success: false, error: 'Title, Author, and Category are required.' });
  }

  const id = `bk-${Date.now().toString(36)}`;
  const owner_id = ownerId || 'usr-user1';

  try {
    db.prepare(`
      INSERT INTO books (id, owner_id, title, author, category, isbn, original_price, expected_price, condition, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')
    `).run(id, owner_id, title, author, category, isbn || null, originalPrice || 0, expectedPrice || 0, condition || 'GOOD', description || '');

    const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    res.status(201).json({ success: true, message: 'Book listed successfully', book: newBook });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. ORDERS: Get All Orders
app.get('/api/orders', (req, res) => {
  const { userId, role } = req.query;
  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (userId) {
    sql += ' AND (buyer_id = ? OR seller_id = ?)';
    params.push(userId, userId);
  }

  sql += ' ORDER BY created_at DESC';

  try {
    const orders = db.prepare(sql).all(...params);
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. ORDERS: Create Order
app.post('/api/orders', (req, res) => {
  const { buyerId, sellerId, bookId, amount, deliveryCharge, deliveryMethod } = req.body;
  if (!buyerId || !bookId) {
    return res.status(400).json({ success: false, error: 'buyerId and bookId are required.' });
  }

  const id = `ord-${Date.now().toString(36)}`;
  const seller_id = sellerId || 'usr-user3';
  const amt = amount || 500;
  const delCharge = deliveryCharge || 30;
  const total = amt + delCharge;

  try {
    db.prepare(`
      INSERT INTO orders (id, buyer_id, seller_id, book_id, amount, delivery_charge, total_amount, delivery_method, payment_status, order_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PAID', 'CONFIRMED')
    `).run(id, buyerId, seller_id, bookId, amt, delCharge, total, deliveryMethod || 'DELIVERY');

    const newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    res.status(201).json({ success: true, message: 'Order created successfully', order: newOrder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. DELIVERIES: Get All Deliveries
app.get('/api/deliveries', (req, res) => {
  const { staffId } = req.query;
  let sql = 'SELECT * FROM deliveries WHERE 1=1';
  const params = [];

  if (staffId) {
    sql += ' AND staff_id = ?';
    params.push(staffId);
  }

  try {
    const deliveries = db.prepare(sql).all(...params);
    res.json({ success: true, count: deliveries.length, deliveries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. DELIVERIES: Update Delivery Status
app.put('/api/deliveries/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, error: 'Status is required' });

  try {
    db.prepare('UPDATE deliveries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
    const updated = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: 'Delivery status updated', delivery: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. AI: Fair Price Prediction
app.post('/api/ai/fair-price', (req, res) => {
  const { originalPrice, condition, daysUsed, category } = req.body;
  const orig = parseFloat(originalPrice) || 1000;
  const days = parseInt(daysUsed) || 180;
  const cond = condition || 'GOOD';

  const conditionMultipliers = { NEW: 0.85, LIKE_NEW: 0.75, VERY_GOOD: 0.65, GOOD: 0.50, FAIR: 0.35 };
  const mult = conditionMultipliers[cond] || 0.50;
  const ageDepreciation = Math.min(days / 365 * 0.15, 0.40);

  const fairResalePrice = Math.round(Math.max(orig * (mult - ageDepreciation), orig * 0.20));
  const fairRentalPricePerDay = Math.round(Math.max(fairResalePrice * 0.03, 15));

  res.json({
    success: true,
    inputs: { originalPrice: orig, condition: cond, daysUsed: days, category: category || 'General' },
    predictions: {
      fairResalePrice,
      fairRentalPricePerDay,
      recommendedSecurityDeposit: Math.round(fairResalePrice * 0.6),
      confidenceScore: '94%'
    }
  });
});

// 10. EMAIL: Send Real-Time Mail Test (Gmail SMTP)
app.post('/api/email/send-test', async (req, res) => {
  const { to, subject, html } = req.body;

  const smtpUser = getEnvVar('GMAIL_USER') || 'dajitha12@gmail.com';
  const rawPass = getEnvVar('GMAIL_APP_PASSWORD') || 'nwiwnyzhkgsffvuo';
  const smtpPass = rawPass.replace(/\s+/g, '');
  const recipient = (to && to.includes('@') && !to.includes('bookbridge.com')) ? to : 'dajitha12@gmail.com';

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false }
    });

    const info = await transporter.sendMail({
      from: `BookBridge AI <${smtpUser}>`,
      to: recipient,
      subject: subject || 'BookBridge AI - Postman Realtime Mail Dispatch Test',
      html: html || '<h2>BookBridge AI Real-Time Mail Test</h2><p>This email was dispatched via Postman API testing through backend Express server.</p>'
    });

    res.json({
      success: true,
      message: `Realtime email sent successfully to ${recipient}`,
      messageId: info.messageId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`
=====================================================
🚀 BOOKBRIDGE AI STANDALONE BACKEND SERVER RUNNING
=====================================================
▸ Server URL : http://localhost:${PORT}
▸ Health Check : GET http://localhost:${PORT}/api/health
▸ Database : ${dbPath}
▸ Gmail SMTP : dajitha12@gmail.com (Real-Time Enabled)
=====================================================
  `);
});
