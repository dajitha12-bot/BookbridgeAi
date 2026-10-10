"use server";
import { getNotificationsByUser, markNotificationRead, clearUserNotifications } from "../lib/db/notifications";
import { getSession } from "../lib/auth/session";
import { revalidatePath } from "next/cache";
async function getNotificationsAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized.", notifications: [] };
    const notifications = await getNotificationsByUser(session.id);
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, notifications };
  } catch (error) {
    return { success: false, error: "Failed to load notifications.", notifications: [] };
  }
}
async function markNotificationReadAction(id) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized." };
    await markNotificationRead(id);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update notification." };
  }
}
async function clearAllNotificationsAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized." };
    await clearUserNotifications(session.id);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to clear notifications." };
  }
}
export {
  clearAllNotificationsAction,
  getNotificationsAction,
  markNotificationReadAction
};
