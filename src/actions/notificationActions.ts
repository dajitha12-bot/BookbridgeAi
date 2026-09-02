'use server';

import { getNotificationsByUser, markNotificationRead, clearUserNotifications } from '../lib/db/notifications';
import { getSession } from '../lib/auth/session';
import { revalidatePath } from 'next/cache';

/**
 * Fetch notifications for current user
 */
export async function getNotificationsAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.', notifications: [] };

    const notifications = await getNotificationsByUser(session.id);
    
    // Sort descending by timestamp in memory
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, notifications };
  } catch (error: any) {
    return { success: false, error: 'Failed to load notifications.', notifications: [] };
  }
}

/**
 * Mark notification as Read
 */
export async function markNotificationReadAction(id: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    await markNotificationRead(id);

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to update notification.' };
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotificationsAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    await clearUserNotifications(session.id);

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to clear notifications.' };
  }
}
