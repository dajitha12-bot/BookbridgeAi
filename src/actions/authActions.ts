'use server';

import { getUserByEmail, createUser, getUserById, updateUser, getProfileByUserId } from '../lib/db/users';
import { createDeliveryStaff } from '../lib/db/deliveries';
import { hashPassword, verifyPassword } from '../lib/auth/hash';
import { createSession, deleteSession, getSession } from '../lib/auth/session';
import { revalidatePath } from 'next/cache';

// Helper to map city to coordinates
export async function getCityCoordinates(city: string): Promise<{ latitude: number; longitude: number }> {
  const c = city.toLowerCase();
  if (c.includes('chennai')) {
    return { latitude: 13.0827, longitude: 80.2707 };
  } else if (c.includes('madurai')) {
    return { latitude: 9.9252, longitude: 78.1198 };
  } else if (c.includes('coimbatore')) {
    return { latitude: 11.0168, longitude: 76.9558 };
  } else if (c.includes('tiruchirappalli') || c.includes('trichy')) {
    return { latitude: 10.7905, longitude: 78.7047 };
  } else if (c.includes('tirunelveli')) {
    return { latitude: 8.7139, longitude: 77.7567 };
  }
  // Default to Chennai
  return { latitude: 13.0827, longitude: 80.2707 };
}

/**
 * Register Server Action
 */
export async function registerAction(prevState: any, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const city = formData.get('city') as string;
    const area = formData.get('area') as string;
    const address = formData.get('address') as string;
    const pincode = formData.get('pincode') as string;
    const roleInput = formData.get('role') as string || 'USER';

    if (!name || !email || !password || !city || !area || !address || !pincode) {
      return { success: false, error: 'All fields are required.' };
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Hash password
    const pwdHash = hashPassword(password);

    // Map coordinates
    const coords = await getCityCoordinates(city);

    // Determine role
    const role = roleInput.toUpperCase() as any;

    const newUser = await createUser(
      {
        email,
        name,
        phone,
        passwordHash: pwdHash,
        role,
      },
      {
        city,
        area,
        address,
        pincode,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }
    );

    // If registering as delivery staff, log staff attributes
    if (role === 'DELIVERY_STAFF') {
      await createDeliveryStaff({
        userId: newUser.id,
        name,
        phone,
        city,
        area,
        pincode,
        serviceArea: `${area}, ${city}`,
        availability: true,
        activeDeliveries: 0,
      });
    }

    // Create session cookie
    await createSession({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });

    return { success: true, role: newUser.role };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message || 'Something went wrong during registration.' };
  }
}

/**
 * Login Server Action
 */
export async function loginAction(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const roleInput = formData.get('role') as string || 'USER';

    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    if (user.status === 'BLOCKED') {
      return { success: false, error: 'Your account has been blocked. Please contact the administrator.' };
    }

    // Verify role aligns with login target
    if (user.role !== roleInput.toUpperCase()) {
      return { success: false, error: `Invalid credentials for the role: ${roleInput.toUpperCase()}.` };
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Create session
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred during login.' };
  }
}

/**
 * Logout Server Action
 */
export async function logoutAction() {
  await deleteSession();
  return { success: true };
}

/**
 * Get current session user details plus profile details
 */
export async function getMeAction() {
  const session = await getSession();
  if (!session) return null;

  const user = await getUserById(session.id);
  if (!user) return null;

  const profile = await getProfileByUserId(session.id);
  return {
    ...user,
    profile,
  };
}

/**
 * Update Profile Server Action
 */
export async function updateProfileAction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const city = formData.get('city') as string;
    const area = formData.get('area') as string;
    const address = formData.get('address') as string;
    const pincode = formData.get('pincode') as string;
    const avatarUrl = formData.get('avatarUrl') as string || null;

    if (!name || !city || !area || !address || !pincode) {
      return { success: false, error: 'Required fields cannot be empty.' };
    }

    const coords = await getCityCoordinates(city);

    await updateUser(
      session.id,
      { name, phone },
      {
        city,
        area,
        address,
        pincode,
        avatarUrl,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }
    );

    // Recreate session with potentially new name
    await createSession({
      id: session.id,
      name,
      email: session.email,
      role: session.role,
    });

    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile.' };
  }
}
