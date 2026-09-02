import { readCollection, writeCollection, generateId } from './dbHelper';
import { Notification } from '../../types';

const NOTIFICATIONS_FILE = 'notifications.json';

export async function getAllNotifications(): Promise<Notification[]> {
  return readCollection<Notification>(NOTIFICATIONS_FILE);
}

export async function getNotificationsByUser(userId: string): Promise<Notification[]> {
  const notifications = await getAllNotifications();
  return notifications.filter(n => n.userId === userId);
}

export async function createNotification(userId: string, title: string, message: string): Promise<Notification> {
  const notifications = await getAllNotifications();

  const newNotification: Notification = {
    id: generateId(),
    userId,
    title,
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  notifications.push(newNotification);
  writeCollection(NOTIFICATIONS_FILE, notifications);

  return newNotification;
}

export async function markNotificationRead(id: string): Promise<Notification | null> {
  const notifications = await getAllNotifications();
  const idx = notifications.findIndex(n => n.id === id);
  if (idx === -1) return null;

  notifications[idx].isRead = true;
  writeCollection(NOTIFICATIONS_FILE, notifications);

  return notifications[idx];
}

export async function clearUserNotifications(userId: string): Promise<boolean> {
  const notifications = await getAllNotifications();
  const filtered = notifications.filter(n => n.userId !== userId);
  writeCollection(NOTIFICATIONS_FILE, filtered);
  return true;
}
