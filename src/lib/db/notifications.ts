import { db } from './sqliteDb';
import { Notification } from '../../types';
import { generateId } from './dbHelper';

function mapRowToNotif(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    isRead: Boolean(row.is_read),
    type: row.type || 'INFO',
    createdAt: row.created_at,
  } as any;
}

export async function getNotificationsByUser(userId: string): Promise<Notification[]> {
  const rows = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  return rows.map(mapRowToNotif);
}

export async function createNotification(userId: string, title: string, message: string, type: string = 'INFO'): Promise<Notification> {
  const id = `notif-${generateId()}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, is_read, type, created_at)
    VALUES (?, ?, ?, ?, 0, ?, ?)
  `).run(id, userId, title, message, type, createdAt);

  return {
    id,
    userId,
    title,
    message,
    isRead: false,
    createdAt,
  };
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  const result = db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
  return result.changes > 0;
}

export async function markNotificationRead(id: string): Promise<boolean> {
  return markNotificationAsRead(id);
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const result = db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
  return result.changes > 0;
}

export async function clearUserNotifications(userId: string): Promise<boolean> {
  const result = db.prepare('DELETE FROM notifications WHERE user_id = ?').run(userId);
  return result.changes > 0;
}
