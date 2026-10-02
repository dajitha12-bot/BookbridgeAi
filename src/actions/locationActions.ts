'use server';

import { getSession } from '../lib/auth/session';
import { saveUserLocation, getLatestUserLocation } from '../lib/db/users';
import { revalidatePath } from 'next/cache';

export async function saveLocationAction(data: {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'User must be logged in to save location.' };

    const loc = await saveUserLocation({
      userId: session.id,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
    });

    revalidatePath('/dashboard/profile');
    return { success: true, location: loc };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save location' };
  }
}

export async function getLatestLocationAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    const loc = await getLatestUserLocation(session.id);
    return { success: true, location: loc };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to retrieve location' };
  }
}
