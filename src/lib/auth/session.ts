import crypto from 'crypto';
import { cookies } from 'next/headers';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.SESSION_SECRET || 'default-session-secret-must-be-long-and-secure-key';

// Derive a 32-byte key from the secret key
const KEY = crypto.scryptSync(SECRET_KEY, 'bookbridge-salt', 32);

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(text: string): string {
  try {
    const parts = text.split(':');
    if (parts.length !== 2) return '';
    const [ivHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return '';
  }
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string; // "USER" | "DELIVERY_STAFF" | "ADMIN"
}

/**
 * Creates and sets an encrypted session cookie.
 */
export async function createSession(user: SessionUser) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionData = JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    expiresAt: expiresAt.toISOString(),
  });
  
  const token = encrypt(sessionData);
  const cookieStore = await cookies();
  
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

/**
 * Deletes the session cookie completely.
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.set('session_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });
  cookieStore.delete('session_token');
}

/**
 * Reads, decrypts, and validates the session cookie.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  const decrypted = decrypt(token);
  if (!decrypted) return null;

  try {
    const data = JSON.parse(decrypted);
    
    // Check if session has expired
    if (new Date(data.expiresAt) < new Date()) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    };
  } catch (e) {
    return null;
  }
}
