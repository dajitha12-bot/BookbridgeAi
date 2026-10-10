"use server";
import { getSession } from "../lib/auth/session";
import { saveUserLocation, getLatestUserLocation } from "../lib/db/users";
import { revalidatePath } from "next/cache";
async function saveLocationAction(data) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "User must be logged in to save location." };
    const loc = await saveUserLocation({
      userId: session.id,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode
    });
    revalidatePath("/dashboard/profile");
    return { success: true, location: loc };
  } catch (err) {
    return { success: false, error: err.message || "Failed to save location" };
  }
}
async function getLatestLocationAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    const loc = await getLatestUserLocation(session.id);
    return { success: true, location: loc };
  } catch (err) {
    return { success: false, error: err.message || "Failed to retrieve location" };
  }
}
export {
  getLatestLocationAction,
  saveLocationAction
};
