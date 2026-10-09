import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { hashPassword } from '../auth/hash';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'bookbridge.db');

// Instantiate better-sqlite3 database instance
export const db = new Database(dbPath);

// Enable Foreign Keys & Write-Ahead Logging for concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Initializes table DDL schemas and auto-seeds baseline data if empty.
 */
export function initDatabase() {
  db.exec(`
    -- 1. Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER', -- USER, DELIVERY_STAFF, ADMIN
      status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, BLOCKED
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Profiles table
    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY,
      city TEXT DEFAULT 'Chennai',
      area TEXT DEFAULT 'Adyar',
      address TEXT DEFAULT '',
      pincode TEXT DEFAULT '600020',
      latitude REAL DEFAULT 13.0827,
      longitude REAL DEFAULT 80.2707,
      avatar_url TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 3. Books table
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL,
      subject TEXT,
      isbn TEXT,
      edition INTEGER DEFAULT 1,
      publication_year INTEGER,
      original_price REAL DEFAULT 0,
      expected_price REAL DEFAULT 0,
      rental_price_per_day REAL DEFAULT 0,
      security_deposit REAL DEFAULT 0,
      condition TEXT DEFAULT 'GOOD', -- NEW, LIKE_NEW, VERY_GOOD, GOOD, FAIR
      description TEXT,
      image_url TEXT,
      city TEXT DEFAULT 'Chennai',
      area TEXT DEFAULT 'Adyar',
      pincode TEXT,
      address TEXT,
      delivery_available BOOLEAN DEFAULT 1,
      exchange_available BOOLEAN DEFAULT 1,
      donation_available BOOLEAN DEFAULT 0,
      rental_available BOOLEAN DEFAULT 1,
      status TEXT DEFAULT 'AVAILABLE', -- AVAILABLE, RESERVED, RENTED, EXCHANGED, SOLD, DONATED, UNAVAILABLE
      purchase_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 4. Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      buyer_id TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      amount REAL DEFAULT 0,
      delivery_charge REAL DEFAULT 0,
      security_deposit REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      delivery_method TEXT DEFAULT 'DELIVERY', -- DELIVERY, PICKUP
      payment_status TEXT DEFAULT 'PENDING', -- PENDING, PAID, COD, REFUNDED, FAILED
      order_status TEXT DEFAULT 'PENDING', -- PENDING, ASSIGNED, CONFIRMED, READY_FOR_PICKUP, IN_TRANSIT, DELIVERED, CANCELLED
      pickup_location TEXT,
      delivery_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (seller_id) REFERENCES users(id),
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    -- 5. Order Items table
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      price REAL NOT NULL,
      item_type TEXT DEFAULT 'SALE', -- SALE, RENTAL, EXCHANGE, DONATION
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    -- 6. Exchanges table
    CREATE TABLE IF NOT EXISTS exchanges (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      offered_book_id TEXT NOT NULL,
      requested_book_id TEXT NOT NULL,
      handover_method TEXT DEFAULT 'DELIVERY', -- DELIVERY, PICKUP
      status TEXT DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id),
      FOREIGN KEY (offered_book_id) REFERENCES books(id),
      FOREIGN KEY (requested_book_id) REFERENCES books(id)
    );

    -- 7. Swap Chains table
    CREATE TABLE IF NOT EXISTS swap_chains (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE', -- ACTIVE, EXECUTED, CANCELLED
      chain_data_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. Rentals table
    CREATE TABLE IF NOT EXISTS rentals (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      renter_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      duration_days INTEGER NOT NULL DEFAULT 7,
      price_per_day REAL DEFAULT 0,
      rental_fee REAL NOT NULL DEFAULT 0,
      security_deposit REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      handover_method TEXT DEFAULT 'DELIVERY', -- DELIVERY, PICKUP
      delivery_address TEXT,
      status TEXT DEFAULT 'REQUESTED', -- REQUESTED, APPROVED, PICKED_UP, ACTIVE, RETURNED, CANCELLED
      payment_status TEXT DEFAULT 'PENDING', -- PENDING, PAID, COD, REFUNDED
      start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id),
      FOREIGN KEY (renter_id) REFERENCES users(id),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );

    -- 9. Donations table
    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      book_id TEXT,
      donor_id TEXT,
      recipient_id TEXT,
      institution_name TEXT NOT NULL,
      reg_number TEXT,
      purpose TEXT NOT NULL,
      quantity_needed INTEGER DEFAULT 1,
      city TEXT DEFAULT 'Chennai',
      contact_phone TEXT,
      status TEXT DEFAULT 'SUBMITTED', -- SUBMITTED, REVIEWED, APPROVED, PICKUP_ARRANGED, COLLECTED, FULFILLED, COMPLETED
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id),
      FOREIGN KEY (donor_id) REFERENCES users(id),
      FOREIGN KEY (recipient_id) REFERENCES users(id)
    );

    -- 10. Delivery Staff table
    CREATE TABLE IF NOT EXISTS delivery_staff (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT DEFAULT 'Chennai',
      area TEXT DEFAULT 'Guindy',
      pincode TEXT,
      service_area TEXT,
      availability BOOLEAN DEFAULT 1,
      active_deliveries INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 11. Deliveries table
    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      rental_id TEXT,
      exchange_id TEXT,
      staff_id TEXT,
      delivery_type TEXT DEFAULT 'ORDER', -- ORDER, RENTAL, EXCHANGE, DONATION
      pickup_address TEXT,
      delivery_address TEXT,
      status TEXT DEFAULT 'ASSIGNED', -- ASSIGNED, ACCEPTED, REACHED_SELLER, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED
      distance_km REAL DEFAULT 5.0,
      delivery_charge REAL DEFAULT 30.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (rental_id) REFERENCES rentals(id),
      FOREIGN KEY (exchange_id) REFERENCES exchanges(id),
      FOREIGN KEY (staff_id) REFERENCES users(id)
    );

    -- 12. Payments table
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      rental_id TEXT,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      delivery_charge REAL DEFAULT 0,
      security_deposit REAL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      method TEXT DEFAULT 'ONLINE', -- ONLINE, COD
      status TEXT DEFAULT 'PENDING', -- PENDING, PAID, COD, FAILED, REFUNDED
      transaction_id TEXT,
      refund_status TEXT DEFAULT 'NONE', -- NONE, REQUESTED, APPROVED, REFUNDED
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (rental_id) REFERENCES rentals(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- 13. Notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      type TEXT DEFAULT 'INFO', -- ORDER, PAYMENT, EXCHANGE, RENTAL, DONATION, SYSTEM
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 14. Wishlist table
    CREATE TABLE IF NOT EXISTS wishlist (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      UNIQUE(user_id, book_id)
    );

    -- 15. Book Requests table
    CREATE TABLE IF NOT EXISTS book_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      requester_name TEXT NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL,
      city TEXT DEFAULT 'Chennai',
      urgency TEXT DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
      status TEXT DEFAULT 'OPEN', -- OPEN, MATCHED, CLOSED
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 16. Reviews table
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      reviewer_id TEXT NOT NULL,
      target_user_id TEXT NOT NULL,
      book_id TEXT,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reviewer_id) REFERENCES users(id),
      FOREIGN KEY (target_user_id) REFERENCES users(id),
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    -- 17. Price History table
    CREATE TABLE IF NOT EXISTS price_history (
      id TEXT PRIMARY KEY,
      book_id TEXT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      original_price REAL DEFAULT 0,
      listed_price REAL NOT NULL,
      sold_price REAL DEFAULT 0,
      condition TEXT DEFAULT 'GOOD',
      edition INTEGER DEFAULT 1,
      location TEXT DEFAULT 'Chennai',
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id)
    );

    -- 18. Market Data table
    CREATE TABLE IF NOT EXISTS market_data (
      id TEXT PRIMARY KEY,
      category TEXT UNIQUE NOT NULL,
      avg_market_price REAL DEFAULT 500,
      min_market_price REAL DEFAULT 200,
      max_market_price REAL DEFAULT 1500,
      demand_score INTEGER DEFAULT 50,
      price_trend TEXT DEFAULT 'STABLE', -- INCREASING, STABLE, DECREASING
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 19. AI Predictions table
    CREATE TABLE IF NOT EXISTS ai_predictions (
      id TEXT PRIMARY KEY,
      book_id TEXT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      visual_condition_score INTEGER DEFAULT 80,
      predicted_fair_price REAL NOT NULL,
      min_suggested_price REAL NOT NULL,
      max_suggested_price REAL NOT NULL,
      demand_score INTEGER DEFAULT 75,
      confidence REAL DEFAULT 85.0,
      features_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- 20. Search Activity table
    CREATE TABLE IF NOT EXISTS search_activity (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      query TEXT NOT NULL,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 21. Book Views table
    CREATE TABLE IF NOT EXISTS book_views (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      book_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    -- 22. Rental Activity table
    CREATE TABLE IF NOT EXISTS rental_activity (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      renter_id TEXT NOT NULL,
      duration_days INTEGER DEFAULT 7,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id),
      FOREIGN KEY (renter_id) REFERENCES users(id)
    );

    -- 23. Delivery Settings Config table
    CREATE TABLE IF NOT EXISTS delivery_settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      tier_0_5 REAL DEFAULT 30.0,
      tier_5_10 REAL DEFAULT 40.0,
      tier_10_20 REAL DEFAULT 60.0,
      tier_20_30 REAL DEFAULT 80.0,
      tier_30_plus REAL DEFAULT 100.0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 24. Seller UPI IDs table
    CREATE TABLE IF NOT EXISTS seller_upi (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      upi_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 25. Chat Conversations table
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      buyer_id TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id),
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (seller_id) REFERENCES users(id)
    );

    -- 26. Chat Messages table
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id)
    );

    -- 27. Delivery Pricing Tiers table (Admin Configurable)
    CREATE TABLE IF NOT EXISTS delivery_pricing (
      id TEXT PRIMARY KEY,
      min_distance REAL NOT NULL,
      max_distance REAL NOT NULL,
      customer_charge REAL NOT NULL,
      staff_earning REAL NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 28. Delivery Checkpoints Tracking table
    CREATE TABLE IF NOT EXISTS delivery_tracking (
      id TEXT PRIMARY KEY,
      delivery_id TEXT NOT NULL,
      status TEXT NOT NULL,
      location_name TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE
    );

    -- 29. Staff Earnings Table
    CREATE TABLE IF NOT EXISTS staff_earnings (
      id TEXT PRIMARY KEY,
      staff_id TEXT NOT NULL,
      delivery_id TEXT NOT NULL,
      order_id TEXT,
      delivery_charge REAL DEFAULT 40.0,
      earning_amount REAL DEFAULT 20.0,
      status TEXT DEFAULT 'COMPLETED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      paid_at DATETIME,
      FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
      UNIQUE(staff_id, delivery_id)
    );

    -- 30. Delivery Tracking Events Table
    CREATE TABLE IF NOT EXISTS delivery_tracking_events (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      delivery_id TEXT,
      status TEXT NOT NULL,
      stage_name TEXT NOT NULL,
      location_name TEXT,
      description TEXT,
      event_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- 31. User Locations Table
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

    -- 32. Book Images Table
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

    -- 33. Assistant Chats Table
    CREATE TABLE IF NOT EXISTS assistant_chats (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 34. Assistant Messages Table
    CREATE TABLE IF NOT EXISTS assistant_messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      intent TEXT,
      metadata_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES assistant_chats(id) ON DELETE CASCADE
    );

    -- Create Indexes for Query Performance
    CREATE INDEX IF NOT EXISTS idx_books_owner ON books(owner_id);
    CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
    CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
    CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
    CREATE INDEX IF NOT EXISTS idx_deliveries_staff ON deliveries(staff_id);
    CREATE INDEX IF NOT EXISTS idx_rentals_renter ON rentals(renter_id);
    CREATE INDEX IF NOT EXISTS idx_search_query ON search_activity(query);
    CREATE INDEX IF NOT EXISTS idx_chat_conv ON chat_conversations(book_id, buyer_id, seller_id);
    CREATE INDEX IF NOT EXISTS idx_staff_earnings_staff ON staff_earnings(staff_id);
    CREATE INDEX IF NOT EXISTS idx_tracking_events_order ON delivery_tracking_events(order_id);
    CREATE INDEX IF NOT EXISTS idx_user_locations_user ON user_locations(user_id);
    CREATE INDEX IF NOT EXISTS idx_book_images_book ON book_images(book_id);
    CREATE INDEX IF NOT EXISTS idx_assistant_chats_user ON assistant_chats(user_id);
    CREATE INDEX IF NOT EXISTS idx_assistant_messages_chat ON assistant_messages(chat_id);
  `);

  // Initialize delivery settings default row if missing
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM delivery_settings').get() as { count: number };
  if (settingsCount.count === 0) {
    db.prepare(`
      INSERT INTO delivery_settings (id, tier_0_5, tier_5_10, tier_10_20, tier_20_30, tier_30_plus)
      VALUES (1, 30.0, 40.0, 60.0, 80.0, 100.0)
    `).run();
  }

  // Seed sample data if users table is empty
  seedInitialData();
}

/**
 * Seeds initial database data for mandatory demo users, books, market metrics, rentals, exchanges, etc.
 */
function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    return; // Already seeded
  }

  console.log('Seeding SQLite database bookbridge.db with initial demonstration records...');

  const userPwdHash = hashPassword('user123');
  const staffPwdHash = hashPassword('staff123');
  const adminPwdHash = hashPassword('admin123');

  // Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, phone, password_hash, role, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertProfile = db.prepare(`
    INSERT INTO profiles (user_id, city, area, address, pincode, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Demo Accounts
  const usersToSeed = [
    { id: 'usr-user1', email: 'ajitha@gmail.com', name: 'Ajitha', phone: '9123456780', hash: userPwdHash, role: 'USER', city: 'Chennai', area: 'Adyar', address: '10, Kasturiba Nagar', pincode: '600020', lat: 13.0067, lng: 80.2572 },
    { id: 'usr-user', email: 'user@bookbridge.com', name: 'Standard User', phone: '9123456781', hash: userPwdHash, role: 'USER', city: 'Chennai', area: 'Mylapore', address: '14, Luz Church Road', pincode: '600004', lat: 13.0333, lng: 80.2667 },
    { id: 'usr-staff1', email: 'dhinesh@delivery.com', name: 'Dhinesh Kumar', phone: '9876543210', hash: staffPwdHash, role: 'DELIVERY_STAFF', city: 'Chennai', area: 'Guindy', address: '45, Mount Road', pincode: '600032', lat: 13.0067, lng: 80.2206 },
    { id: 'usr-staff', email: 'staff@bookbridge.com', name: 'Arun Kumar', phone: '9876543211', hash: staffPwdHash, role: 'DELIVERY_STAFF', city: 'Madurai', area: 'Anna Nagar', address: '8, Sathamangalam', pincode: '625020', lat: 9.9252, lng: 78.1198 },
    { id: 'usr-admin', email: 'admin@bookbridge.com', name: 'Platform Admin', phone: '9988776655', hash: adminPwdHash, role: 'ADMIN', city: 'Chennai', area: 'Nungambakkam', address: '12, College Road', pincode: '600006', lat: 13.0612, lng: 80.2514 },
    { id: 'usr-user3', email: 'priya@gmail.com', name: 'Priya Patel', phone: '9123456782', hash: userPwdHash, role: 'USER', city: 'Chennai', area: 'Velachery', address: '8, Bypass Road', pincode: '600042', lat: 12.9815, lng: 80.2185 },
    { id: 'usr-user4', email: 'karthik@gmail.com', name: 'Karthik Raja', phone: '9123456783', hash: userPwdHash, role: 'USER', city: 'Madurai', area: 'KK Nagar', address: '22, Lake View Road', pincode: '625020', lat: 9.9322, lng: 78.1485 }
  ];

  for (const u of usersToSeed) {
    insertUser.run(u.id, u.email, u.name, u.phone, u.hash, u.role, 'ACTIVE');
    insertProfile.run(u.id, u.city, u.area, u.address, u.pincode, u.lat, u.lng);
  }

  // Insert Delivery Staff Details
  const insertStaff = db.prepare(`
    INSERT INTO delivery_staff (id, user_id, name, phone, city, area, pincode, service_area, availability, active_deliveries)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStaff.run('ds-1', 'usr-staff1', 'Dhinesh Kumar', '9876543210', 'Chennai', 'Guindy', '600032', 'Guindy, Adyar, Mylapore', 1, 1);
  insertStaff.run('ds-2', 'usr-staff', 'Arun Kumar', '9876543211', 'Madurai', 'Anna Nagar', '625020', 'Anna Nagar, KK Nagar', 1, 0);

  // Insert Books
  const insertBook = db.prepare(`
    INSERT INTO books (
      id, owner_id, title, author, category, subject, isbn, edition, publication_year, original_price, expected_price, rental_price_per_day, security_deposit, condition, description, image_url, city, area, pincode, delivery_available, exchange_available, donation_available, rental_available, status, purchase_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const booksToSeed = [
    { id: 'bk-1', owner_id: 'usr-user1', title: 'Python Crash Course', author: 'Eric Matthes', category: 'Programming', subject: 'Python Development', isbn: '9781593279288', edition: 2, year: 2021, origPrice: 1500, expPrice: 850, rentDay: 25, secDep: 500, cond: 'VERY_GOOD', desc: 'Clean copy with no highlight marks. Great reference for beginners.', img: 'https://covers.openlibrary.org/b/isbn/9781593279288-L.jpg', city: 'Chennai', area: 'Adyar', pin: '600020', del: 1, exc: 1, don: 0, rent: 1, status: 'AVAILABLE', date: '2023-05-15' },
    { id: 'bk-2', owner_id: 'usr-user', title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', category: 'Programming', subject: 'Javascript Core', isbn: '9781593279509', edition: 3, year: 2022, origPrice: 1200, expPrice: 700, rentDay: 20, secDep: 400, cond: 'LIKE_NEW', desc: 'Unopened, mint condition textbook.', img: 'https://covers.openlibrary.org/b/isbn/9781593279509-L.jpg', city: 'Chennai', area: 'Mylapore', pin: '600004', del: 1, exc: 1, don: 0, rent: 1, status: 'AVAILABLE', date: '2024-01-10' },
    { id: 'bk-3', owner_id: 'usr-user3', title: 'Clean Code: A Handbook of Agile Software', author: 'Robert C. Martin', category: 'Programming', subject: 'Software Architecture', isbn: '9780132350884', edition: 1, year: 2008, origPrice: 2500, expPrice: 1200, rentDay: 35, secDep: 700, cond: 'VERY_GOOD', desc: 'Essential software engineering guide.', img: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg', city: 'Chennai', area: 'Velachery', pin: '600042', del: 1, exc: 1, don: 0, rent: 1, status: 'AVAILABLE', date: '2022-08-20' },
    { id: 'bk-4', owner_id: 'usr-user3', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', category: 'Artificial Intelligence', subject: 'AI Foundations', isbn: '9780134610993', edition: 4, year: 2020, origPrice: 3500, expPrice: 1800, rentDay: 50, secDep: 1000, cond: 'GOOD', desc: 'Standard university textbook for AI courses.', img: 'https://covers.openlibrary.org/b/isbn/9780134610993-L.jpg', city: 'Chennai', area: 'Velachery', pin: '600042', del: 1, exc: 1, don: 0, rent: 1, status: 'AVAILABLE', date: '2023-01-15' },
    { id: 'bk-5', owner_id: 'usr-user', title: 'Database System Concepts', author: 'Abraham Silberschatz', category: 'Database', subject: 'RDBMS Architecture', isbn: '9780078022159', edition: 7, year: 2019, origPrice: 2200, expPrice: 1100, rentDay: 30, secDep: 600, cond: 'GOOD', desc: 'Comprehensive guide covering SQL and query execution.', img: 'https://covers.openlibrary.org/b/isbn/9780078022159-L.jpg', city: 'Chennai', area: 'Mylapore', pin: '600004', del: 1, exc: 1, don: 0, rent: 1, status: 'AVAILABLE', date: '2023-03-12' },
    { id: 'bk-6', owner_id: 'usr-user4', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', category: 'Database', subject: 'Distributed Systems', isbn: '9781449373320', edition: 1, year: 2017, origPrice: 2800, expPrice: 1600, rentDay: 45, secDep: 900, cond: 'LIKE_NEW', desc: 'Deep dive into data architecture, scalability, and replication.', img: 'https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg', city: 'Madurai', area: 'KK Nagar', pin: '625020', del: 1, exc: 1, don: 0, rent: 1, status: 'AVAILABLE', date: '2023-11-05' },
    { id: 'bk-7', owner_id: 'usr-user3', title: 'Operating System Concepts', author: 'Abraham Silberschatz', category: 'Operating Systems', subject: 'OS Kernels & Memory', isbn: '9781118063330', edition: 9, year: 2018, origPrice: 2100, expPrice: 950, rentDay: 25, secDep: 500, cond: 'GOOD', desc: 'Dinosaurs book covering process scheduling and memory management.', img: 'https://covers.openlibrary.org/b/isbn/9781118063330-L.jpg', city: 'Chennai', area: 'Velachery', pin: '600042', del: 1, exc: 1, don: 0, rent: 1, status: 'AVAILABLE', date: '2022-09-18' },
    { id: 'bk-8', owner_id: 'usr-user1', title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen', category: 'Programming', subject: 'Data Structures & Algorithms', isbn: '9780262033848', edition: 3, year: 2009, origPrice: 3000, expPrice: 0, rentDay: 0, secDep: 0, cond: 'FAIR', desc: 'Heavy highlights, loose binding. Giving it away for free to anyone who needs it.', img: 'https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg', city: 'Chennai', area: 'Adyar', pin: '600020', del: 0, exc: 0, don: 1, rent: 0, status: 'AVAILABLE', date: '2021-06-10' },
    { id: 'bk-9', owner_id: 'usr-user', title: 'The C++ Programming Language', author: 'Bjarne Stroustrup', category: 'Programming', subject: 'C++ Systems', isbn: '9780321563842', edition: 4, year: 2013, origPrice: 2600, expPrice: 0, rentDay: 0, secDep: 0, cond: 'GOOD', desc: 'Classic Stroustrup reference manual. Donating for free.', img: 'https://covers.openlibrary.org/b/isbn/9780321563842-L.jpg', city: 'Chennai', area: 'Mylapore', pin: '600004', del: 0, exc: 0, don: 1, rent: 0, status: 'AVAILABLE', date: '2022-04-12' },
    { id: 'bk-10', owner_id: 'usr-user4', title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', category: 'Mathematics', subject: 'Engineering Math', isbn: '9788174091955', edition: 44, year: 2021, origPrice: 1400, expPrice: 650, rentDay: 20, secDep: 350, cond: 'VERY_GOOD', desc: 'Standard engineering mathematics text book.', img: 'https://covers.openlibrary.org/b/isbn/9788174091955-L.jpg', city: 'Madurai', area: 'KK Nagar', pin: '625020', del: 1, exc: 1, don: 0, rent: 1, status: 'AVAILABLE', date: '2023-07-22' }
  ];

  for (const b of booksToSeed) {
    insertBook.run(
      b.id, b.owner_id, b.title, b.author, b.category, b.subject, b.isbn, b.edition, b.year,
      b.origPrice, b.expPrice, b.rentDay, b.secDep, b.cond, b.desc, b.img, b.city, b.area, b.pin,
      b.del, b.exc, b.don, b.rent, b.status, b.date
    );
  }

  // Insert Orders & Order Items
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, buyer_id, seller_id, book_id, amount, delivery_charge, security_deposit, total_amount, delivery_method, payment_status, order_status, pickup_location, delivery_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertOrder.run('ord-1', 'usr-user1', 'usr-user3', 'bk-3', 1200, 30, 0, 1230, 'DELIVERY', 'PAID', 'IN_TRANSIT', null, '10, Kasturiba Nagar, Adyar, Chennai');
  insertOrder.run('ord-2', 'usr-user', 'usr-user1', 'bk-1', 850, 0, 0, 850, 'PICKUP', 'PAID', 'DELIVERED', 'Adyar Bus Stand, Chennai', null);

  // Insert Rentals
  const insertRental = db.prepare(`
    INSERT INTO rentals (id, book_id, renter_id, owner_id, duration_days, price_per_day, rental_fee, security_deposit, total_amount, handover_method, delivery_address, status, payment_status, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertRental.run('rent-1', 'bk-2', 'usr-user1', 'usr-user', 14, 20, 280, 400, 710, 'DELIVERY', '10, Kasturiba Nagar, Adyar', 'ACTIVE', 'PAID', '2026-09-15 10:00:00', '2026-09-29 10:00:00');
  insertRental.run('rent-2', 'bk-7', 'usr-user1', 'usr-user3', 7, 25, 175, 500, 705, 'DELIVERY', '10, Kasturiba Nagar, Adyar', 'ACTIVE', 'PAID', '2026-09-20 12:00:00', '2026-09-27 12:00:00');

  // Insert Exchanges
  const insertExchange = db.prepare(`
    INSERT INTO exchanges (id, sender_id, receiver_id, offered_book_id, requested_book_id, handover_method, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertExchange.run('exc-1', 'usr-user', 'usr-user1', 'bk-5', 'bk-1', 'DELIVERY', 'PENDING');
  insertExchange.run('exc-2', 'usr-user1', 'usr-user3', 'bk-1', 'bk-4', 'PICKUP', 'ACCEPTED');

  // Insert Donations
  const insertDonation = db.prepare(`
    INSERT INTO donations (id, book_id, donor_id, recipient_id, institution_name, reg_number, purpose, quantity_needed, city, contact_phone, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDonation.run('don-1', 'bk-8', 'usr-user1', null, 'Vidya Seva Trust', 'TRUST/2024/MDU-77', 'Textbook donation for rural middle school library.', 5, 'Chennai', '9876543210', 'APPROVED');
  insertDonation.run('don-2', 'bk-9', 'usr-user', null, 'Akshara Foundation', 'NGO/TN/2023/88', 'Computer science books for free community computer lab.', 3, 'Madurai', '9876543211', 'SUBMITTED');

  // Insert Deliveries
  const insertDelivery = db.prepare(`
    INSERT INTO deliveries (id, order_id, rental_id, exchange_id, staff_id, delivery_type, pickup_address, delivery_address, status, distance_km, delivery_charge)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDelivery.run('del-1', 'ord-1', null, null, 'usr-staff1', 'ORDER', '8, Bypass Road, Velachery', '10, Kasturiba Nagar, Adyar', 'IN_TRANSIT', 4.5, 30.0);
  insertDelivery.run('del-2', null, 'rent-1', null, 'usr-staff1', 'RENTAL', '14, Luz Church Road, Mylapore', '10, Kasturiba Nagar, Adyar', 'DELIVERED', 5.2, 40.0);

  // Sample Assigned Rental Delivery (Part 7 Requirement)
  insertDelivery.run('del-3', null, 'rent-2', null, 'usr-staff1', 'RENTAL', '14, Luz Church Road, Mylapore, Chennai', '10, Kasturiba Nagar, Adyar, Chennai', 'ASSIGNED', 6.0, 40.0);

  // Insert Buyer-Seller Demo Chat Conversation & Messages
  const insertChatConv = db.prepare(`
    INSERT INTO chat_conversations (id, book_id, buyer_id, seller_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  const insertChatMessage = db.prepare(`
    INSERT INTO chat_messages (id, conversation_id, sender_id, message, created_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  insertChatConv.run('conv-1', 'bk-1', 'usr-user1', 'usr-user3');
  insertChatMessage.run('msg-1', 'conv-1', 'usr-user1', 'Hi Priya! Is this Python Crash Course textbook available for sale or exchange?');
  insertChatMessage.run('msg-2', 'conv-1', 'usr-user3', 'Hello Ajitha! Yes, it is in very good condition and available for delivery.');


  // Insert Payments
  const insertPayment = db.prepare(`
    INSERT INTO payments (id, order_id, rental_id, user_id, amount, delivery_charge, security_deposit, total_amount, method, status, transaction_id, refund_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPayment.run('pay-1', 'ord-1', null, 'usr-user1', 1200, 30, 0, 1230, 'ONLINE', 'PAID', 'TXN_ONLINE_99812', 'NONE');
  insertPayment.run('pay-2', null, 'rent-1', 'usr-user1', 280, 30, 400, 710, 'ONLINE', 'PAID', 'TXN_ONLINE_88123', 'NONE');

  // Insert Notifications
  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, is_read, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertNotification.run('notif-1', 'usr-user1', 'Order In Transit', 'Your order for "Clean Code" is currently in transit with delivery staff Dhinesh Kumar.', 0, 'ORDER');
  insertNotification.run('notif-2', 'usr-user1', 'Rental Active', 'Your rental for "Eloquent JavaScript" is active until Sept 29.', 1, 'RENTAL');
  insertNotification.run('notif-3', 'usr-user1', 'Exchange Accepted', 'Priya Patel accepted your exchange offer for "Python Crash Course".', 1, 'EXCHANGE');

  // Insert Book Requests
  const insertRequest = db.prepare(`
    INSERT INTO book_requests (id, user_id, requester_name, title, author, category, city, urgency, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertRequest.run('req-1', 'usr-user1', 'Ajitha', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 'Programming', 'Chennai', 'HIGH', 'OPEN');
  insertRequest.run('req-2', 'usr-user1', 'Ajitha', 'Artificial Intelligence: A Modern Approach (4th Edition)', 'Stuart Russell & Peter Norvig', 'Artificial Intelligence', 'Chennai', 'MEDIUM', 'OPEN');
  insertRequest.run('req-3', 'usr-user', 'Standard User', 'Data Structures & Algorithms in Java', 'Robert Lafore', 'Programming', 'Chennai', 'HIGH', 'OPEN');

  // Insert Wishlist
  const insertWishlist = db.prepare(`
    INSERT INTO wishlist (id, user_id, book_id)
    VALUES (?, ?, ?)
  `);

  insertWishlist.run('w-1', 'usr-user1', 'bk-2');
  insertWishlist.run('w-2', 'usr-user1', 'bk-3');
  insertWishlist.run('w-3', 'usr-user1', 'bk-6');

  // Insert Price History
  const insertPriceHistory = db.prepare(`
    INSERT INTO price_history (id, book_id, title, category, original_price, listed_price, sold_price, condition, edition, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPriceHistory.run('ph-1', 'bk-1', 'Python Crash Course', 'Programming', 1500, 850, 800, 'VERY_GOOD', 2, 'Chennai');
  insertPriceHistory.run('ph-2', 'bk-2', 'Eloquent JavaScript', 'Programming', 1200, 700, 680, 'LIKE_NEW', 3, 'Chennai');
  insertPriceHistory.run('ph-3', 'bk-3', 'Clean Code', 'Programming', 2500, 1200, 1150, 'VERY_GOOD', 1, 'Chennai');
  insertPriceHistory.run('ph-4', 'bk-4', 'Artificial Intelligence', 'Artificial Intelligence', 3500, 1800, 1750, 'GOOD', 4, 'Chennai');
  insertPriceHistory.run('ph-5', 'bk-6', 'Designing Data-Intensive Applications', 'Database', 2800, 1600, 1550, 'LIKE_NEW', 1, 'Madurai');

  // Insert Market Data Summary
  const insertMarketData = db.prepare(`
    INSERT INTO market_data (id, category, avg_market_price, min_market_price, max_market_price, demand_score, price_trend)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertMarketData.run('md-1', 'Programming', 820, 450, 1800, 88, 'INCREASING');
  insertMarketData.run('md-2', 'Artificial Intelligence', 1650, 900, 2800, 92, 'INCREASING');
  insertMarketData.run('md-3', 'Database', 1250, 600, 2200, 76, 'STABLE');
  insertMarketData.run('md-4', 'Operating Systems', 950, 500, 1600, 64, 'STABLE');
  insertMarketData.run('md-5', 'Mathematics', 650, 300, 1200, 58, 'STABLE');

  // Insert Activity Logs (Search, Views, Rental Activity)
  const insertSearch = db.prepare(`INSERT INTO search_activity (id, user_id, query, category) VALUES (?, ?, ?, ?)`);
  insertSearch.run('s-1', 'usr-user1', 'python crash course', 'Programming');
  insertSearch.run('s-2', 'usr-user1', 'clean code', 'Programming');
  insertSearch.run('s-3', 'usr-user', 'artificial intelligence', 'Artificial Intelligence');
  insertSearch.run('s-4', 'usr-user3', 'database silberschatz', 'Database');

  const insertView = db.prepare(`INSERT INTO book_views (id, user_id, book_id) VALUES (?, ?, ?)`);
  insertView.run('v-1', 'usr-user1', 'bk-2');
  insertView.run('v-2', 'usr-user1', 'bk-3');
  insertView.run('v-3', 'usr-user', 'bk-1');
  insertView.run('v-4', 'usr-user3', 'bk-6');

  console.log('Successfully seeded SQLite database bookbridge.db with complete records!');
}

// Auto-run schema initialization upon module loading
try {
  initDatabase();
} catch (err) {
  console.error('SQLite initialization error:', err);
}
