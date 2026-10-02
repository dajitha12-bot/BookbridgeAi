'use server';

import { getSession } from '../lib/auth/session';
import { db } from '../lib/db/sqliteDb';
import { generateId } from '../lib/db/dbHelper';
import { revalidatePath } from 'next/cache';

export async function getOrCreateConversationAction(bookId: string, sellerId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'You must be logged in to chat.' };

    const buyerId = session.id;

    if (buyerId === sellerId) {
      return { success: false, error: 'You cannot start a chat with yourself.' };
    }

    // Check if conversation already exists for same book, buyer, and seller
    const existing = db
      .prepare(`
      SELECT * FROM chat_conversations
      WHERE book_id = ? AND buyer_id = ? AND seller_id = ?
    `)
      .get(bookId, buyerId, sellerId) as any;

    if (existing) {
      return { success: true, conversationId: existing.id };
    }

    // Create new conversation
    const convId = `conv_${generateId()}`;
    db.prepare(`
      INSERT INTO chat_conversations (id, book_id, buyer_id, seller_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(convId, bookId, buyerId, sellerId);

    return { success: true, conversationId: convId };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to initialize conversation.' };
  }
}

export async function sendMessageAction(conversationId: string, messageText: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    const text = messageText.trim();
    if (!text) return { success: false, error: 'Message cannot be empty.' };

    const conv = db.prepare('SELECT * FROM chat_conversations WHERE id = ?').get(conversationId) as any;
    if (!conv) return { success: false, error: 'Conversation not found.' };

    // Authorization check: Only Buyer or Seller can send message
    if (conv.buyer_id !== session.id && conv.seller_id !== session.id) {
      return { success: false, error: 'Unauthorized access to this conversation.' };
    }

    const receiverId = session.id === conv.buyer_id ? conv.seller_id : conv.buyer_id;
    const msgId = `msg_${generateId()}`;

    // Insert message into chat_messages table
    db.prepare(`
      INSERT INTO chat_messages (id, conversation_id, sender_id, receiver_id, message, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `).run(msgId, conversationId, session.id, receiverId, text);

    // Update conversation timestamp
    db.prepare('UPDATE chat_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(conversationId);

    // Fetch book and sender details for notification
    try {
      const bookRow = db.prepare('SELECT title FROM books WHERE id = ?').get(conv.book_id) as any;
      const senderRow = db.prepare('SELECT name FROM users WHERE id = ?').get(session.id) as any;

      const bookTitle = bookRow?.title || 'Book Listing';
      const senderName = senderRow?.name || 'User';

      const notifTitle = session.id === conv.buyer_id ? `New message from ${senderName}` : `New reply from ${senderName}`;
      const notifMsg = `${senderName} sent a message about "${bookTitle}": "${text.slice(0, 40)}${text.length > 40 ? '...' : ''}"`;

      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, is_read, type, created_at)
        VALUES (?, ?, ?, ?, 0, 'SYSTEM', CURRENT_TIMESTAMP)
      `).run(`notif_${generateId()}`, receiverId, notifTitle, notifMsg);
    } catch (e) {
      // Non-fatal notification error
    }

    revalidatePath('/dashboard/chat');
    revalidatePath('/dashboard/notifications');

    return { success: true, messageId: msgId };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send message.' };
  }
}

export async function getConversationMessagesAction(conversationId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    const conv = db.prepare('SELECT * FROM chat_conversations WHERE id = ?').get(conversationId) as any;
    if (!conv) return { success: false, error: 'Conversation not found.' };

    // Authorization check
    if (conv.buyer_id !== session.id && conv.seller_id !== session.id) {
      return { success: false, error: 'Unauthorized access to this conversation.' };
    }

    const messages = db
      .prepare(`
      SELECT m.*, u.name as senderName
      FROM chat_messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `)
      .all(conversationId) as any[];

    // Mark messages as read for current receiver
    try {
      db.prepare(`
        UPDATE chat_messages
        SET is_read = 1
        WHERE conversation_id = ? AND sender_id != ?
      `).run(conversationId, session.id);
    } catch (e) {}

    // Fetch Book & Other User Details
    const bookRow = db.prepare('SELECT id, title, image_url, expected_price FROM books WHERE id = ?').get(conv.book_id) as any;
    const otherUserId = session.id === conv.buyer_id ? conv.seller_id : conv.buyer_id;
    const otherUserRow = db.prepare('SELECT id, name, email, phone FROM users WHERE id = ?').get(otherUserId) as any;

    return {
      success: true,
      conversation: {
        id: conv.id,
        book: bookRow,
        otherUser: otherUserRow,
        isBuyer: session.id === conv.buyer_id,
      },
      messages: messages.map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        senderName: m.senderName,
        message: m.message,
        isMine: m.sender_id === session.id,
        createdAt: m.created_at,
      })),
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch conversation.' };
  }
}

export async function getUserConversationsAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    const convs = db
      .prepare(`
      SELECT c.id, c.book_id, c.buyer_id, c.seller_id, c.updated_at,
             b.title as bookTitle, b.image_url as bookImageUrl,
             b.owner_id as bookOwnerId
      FROM chat_conversations c
      JOIN books b ON c.book_id = b.id
      WHERE c.buyer_id = ? OR c.seller_id = ?
      ORDER BY c.updated_at DESC
    `)
      .all(session.id, session.id) as any[];

    const result = convs.map((c) => {
      const otherUserId = session.id === c.buyer_id ? c.seller_id : c.buyer_id;
      const otherUser = db.prepare('SELECT name, phone FROM users WHERE id = ?').get(otherUserId) as any;
      const lastMsg = db.prepare('SELECT message, created_at, sender_id, is_read FROM chat_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1').get(c.id) as any;
      const unreadRow = db.prepare('SELECT COUNT(*) as count FROM chat_messages WHERE conversation_id = ? AND sender_id != ? AND is_read = 0').get(c.id, session.id) as any;

      return {
        id: c.id,
        bookId: c.book_id,
        bookTitle: c.bookTitle,
        bookImageUrl: c.bookImageUrl,
        otherUserName: otherUser?.name || 'User',
        otherUserPhone: otherUser?.phone || null,
        lastMessage: lastMsg?.message || 'Conversation started',
        lastMessageTime: lastMsg?.created_at || c.updated_at,
        unreadCount: unreadRow?.count || 0,
        isBuyer: session.id === c.buyer_id,
      };
    });

    return { success: true, conversations: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch user conversations.' };
  }
}
