import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
async function getOrCreateConversation(bookId, buyerId, sellerId) {
  const existing = db.prepare(`
    SELECT * FROM chat_conversations
    WHERE book_id = ? AND buyer_id = ? AND seller_id = ?
  `).get(bookId, buyerId, sellerId);
  if (existing) {
    return mapConversation(existing);
  }
  const id = `conv-${generateId()}`;
  db.prepare(`
    INSERT INTO chat_conversations (id, book_id, buyer_id, seller_id)
    VALUES (?, ?, ?, ?)
  `).run(id, bookId, buyerId, sellerId);
  const newRow = db.prepare("SELECT * FROM chat_conversations WHERE id = ?").get(id);
  return mapConversation(newRow);
}
async function getUserConversations(userId) {
  const rows = db.prepare(`
    SELECT c.*, b.title as book_title, u1.name as buyer_name, u2.name as seller_name
    FROM chat_conversations c
    JOIN books b ON c.book_id = b.id
    JOIN users u1 ON c.buyer_id = u1.id
    JOIN users u2 ON c.seller_id = u2.id
    WHERE c.buyer_id = ? OR c.seller_id = ?
    ORDER BY c.updated_at DESC
  `).all(userId, userId);
  return rows.map((r) => ({
    id: r.id,
    bookId: r.book_id,
    bookTitle: r.book_title,
    buyerId: r.buyer_id,
    buyerName: r.buyer_name,
    sellerId: r.seller_id,
    sellerName: r.seller_name,
    updatedAt: r.updated_at
  }));
}
async function getConversationMessages(conversationId) {
  const rows = db.prepare(`
    SELECT m.*, u.name as sender_name
    FROM chat_messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC
  `).all(conversationId);
  return rows.map((r) => ({
    id: r.id,
    conversationId: r.conversation_id,
    senderId: r.sender_id,
    senderName: r.sender_name,
    message: r.message,
    createdAt: r.created_at
  }));
}
async function sendMessage(conversationId, senderId, messageText) {
  const id = `msg-${generateId()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  db.prepare(`
    INSERT INTO chat_messages (id, conversation_id, sender_id, message, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, conversationId, senderId, messageText.trim(), createdAt);
  db.prepare(`
    UPDATE chat_conversations
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(conversationId);
  const senderObj = db.prepare("SELECT name FROM users WHERE id = ?").get(senderId);
  return {
    id,
    conversationId,
    senderId,
    senderName: senderObj?.name || "User",
    message: messageText.trim(),
    createdAt
  };
}
function mapConversation(row) {
  const book = db.prepare("SELECT title FROM books WHERE id = ?").get(row.book_id);
  const buyer = db.prepare("SELECT name FROM users WHERE id = ?").get(row.buyer_id);
  const seller = db.prepare("SELECT name FROM users WHERE id = ?").get(row.seller_id);
  return {
    id: row.id,
    bookId: row.book_id,
    bookTitle: book?.title || "Book",
    buyerId: row.buyer_id,
    buyerName: buyer?.name || "Buyer",
    sellerId: row.seller_id,
    sellerName: seller?.name || "Seller",
    updatedAt: row.updated_at
  };
}
export {
  getConversationMessages,
  getOrCreateConversation,
  getUserConversations,
  sendMessage
};
