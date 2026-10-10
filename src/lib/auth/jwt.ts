import crypto from 'crypto';

export interface JwtPayload {
  sub: string;       // User ID
  email: string;     // User email
  name: string;      // User display name
  role: string;      // 'USER' | 'DELIVERY_STAFF' | 'ADMIN'
  iat?: number;      // Issued at (seconds)
  exp?: number;      // Expiration (seconds)
  iss?: string;      // Issuer
  aud?: string;      // Audience
  [key: string]: any;
}

const JWT_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || 'bookbridge-ai-super-secure-jwt-secret-key-32b';

/**
 * Base64URL encode a buffer or string
 */
function base64UrlEncode(str: string | Buffer): string {
  const buf = typeof str === 'string' ? Buffer.from(str) : str;
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64URL decode
 */
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

/**
 * Sign a standard RFC 7519 JSON Web Token (HMAC-SHA256)
 */
export function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresInSeconds: number = 7 * 24 * 3600): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iss: 'bookbridge-ai',
    aud: 'bookbridge-client',
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  const encodedSignature = base64UrlEncode(signature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Verify and decode an RFC 7519 JSON Web Token
 */
export function verifyJwt(token: string): { valid: boolean; payload?: JwtPayload; error?: string } {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Token missing or invalid' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Malformed JWT structure' };
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    // Verify signature
    const expectedSignature = base64UrlEncode(
      crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest()
    );

    if (encodedSignature !== expectedSignature) {
      return { valid: false, error: 'Invalid JWT signature' };
    }

    const payload: JwtPayload = JSON.parse(base64UrlDecode(encodedPayload));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'JWT token has expired', payload };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err.message || 'JWT verification failed' };
  }
}

/**
 * Decode JWT without verifying (useful for inspection)
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}
