import { db } from './sqliteDb';

console.log('Seeding extra demo records for seller_upi, ai_predictions, chat, price_history...');

try {
  // 1. Seller UPI
  db.prepare(`
    INSERT OR REPLACE INTO seller_upi (id, user_id, upi_id)
    VALUES 
      ('upi-usr-user1', 'usr-user1', 'ajitha@upi'),
      ('upi-usr-user', 'usr-user', 'user@upi'),
      ('upi-usr-admin', 'usr-admin', 'admin@upi'),
      ('upi-usr-staff', 'usr-staff', 'staff@upi'),
      ('upi-usr-user3', 'usr-user3', 'priya@upi')
  `).run();

  // 2. AI Predictions
  db.prepare(`
    INSERT OR REPLACE INTO ai_predictions (
      id, user_id, book_id, title, visual_condition_score, predicted_fair_price,
      min_suggested_price, max_suggested_price, demand_score, confidence
    ) VALUES 
      ('ai-pred-1', 'usr-user1', 'bk-1', 'Clean Code: A Handbook of Agile Software Craftsmanship', 88, 480, 420, 550, 85, 92.5),
      ('ai-pred-2', 'usr-user', 'bk-2', 'The Pragmatic Programmer: Your Journey to Mastery', 90, 520, 460, 580, 82, 94.0),
      ('ai-pred-3', 'usr-user3', 'bk-3', 'Design Patterns: Elements of Reusable Object-Oriented Software', 82, 390, 350, 440, 78, 89.0)
  `).run();

  // 3. Chat Conversations & Messages
  db.prepare(`
    INSERT OR REPLACE INTO chat_conversations (id, book_id, buyer_id, seller_id)
    VALUES ('conv-demo-1', 'bk-1', 'usr-user', 'usr-user1')
  `).run();

  db.prepare(`
    INSERT OR REPLACE INTO chat_messages (id, conversation_id, sender_id, message)
    VALUES 
      ('msg-demo-1', 'conv-demo-1', 'usr-user', 'Hi Ajitha! Is Clean Code available for home delivery or offline pickup near Adyar?'),
      ('msg-demo-2', 'conv-demo-1', 'usr-user1', 'Hello! Yes, both home delivery and offline pickup near Kasturiba Nagar Adyar are available.')
  `).run();

  // 4. Delivery Pricing Tiers
  db.prepare(`
    INSERT OR REPLACE INTO delivery_pricing (id, min_distance, max_distance, customer_charge, staff_earning, status)
    VALUES 
      ('dp-1', 0, 5, 30.0, 25.0, 'ACTIVE'),
      ('dp-2', 5, 10, 40.0, 30.0, 'ACTIVE'),
      ('dp-3', 10, 20, 60.0, 45.0, 'ACTIVE'),
      ('dp-4', 20, 30, 80.0, 60.0, 'ACTIVE'),
      ('dp-5', 30, 100, 100.0, 75.0, 'ACTIVE')
  `).run();

  console.log('Extra demo records inserted successfully into SQLite!');
} catch (e: any) {
  console.error('Seed extra error:', e.message);
}
