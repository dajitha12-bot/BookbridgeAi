import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToNotif(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    isRead: Boolean(row.is_read),
    type: row.type || "INFO",
    createdAt: row.created_at
  };
}
async function getNotificationsByUser(userId) {
  const rows = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  return rows.map(mapRowToNotif);
}
async function createNotification(userId, title, message, type = "INFO") {
  const id = `notif-${generateId()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
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
    createdAt
  };
}
async function markNotificationAsRead(id) {
  const result = db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(id);
  return result.changes > 0;
}
async function markNotificationRead(id) {
  return markNotificationAsRead(id);
}
async function markAllNotificationsAsRead(userId) {
  const result = db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(userId);
  return result.changes > 0;
}
async function clearUserNotifications(userId) {
  const result = db.prepare("DELETE FROM notifications WHERE user_id = ?").run(userId);
  return result.changes > 0;
}
export {
  clearUserNotifications,
  createNotification,
  getNotificationsByUser,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  markNotificationRead
};
