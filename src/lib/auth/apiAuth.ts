import { NextRequest } from 'next/server';
import { db } from '../db/sqliteDb';
import { verifyJwt } from './jwt';
import { getSession } from './session';

export interface ApiAuthResult {
  authenticated: boolean;
  user?: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
  };
  authType?: 'API_KEY' | 'JWT' | 'SESSION';
  error?: string;
}

/**
 * Validates an incoming NextRequest for API access using either:
 * 1. x-api-key header (bk_live_...)
 * 2. Authorization: Bearer <RFC7519_JWT>
 * 3. Active session cookie
 */
export async function authenticateApiRequest(req: NextRequest): Promise<ApiAuthResult> {
  // 1. Check x-api-key header
  const apiKeyHeader = req.headers.get('x-api-key');
  if (apiKeyHeader) {
    try {
      const keyRow = db.prepare('SELECT * FROM api_keys WHERE api_key = ? AND is_active = 1').get(apiKeyHeader) as any;
      if (keyRow) {
        // Update last_used_at
        db.prepare('UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?').run(keyRow.id);
        
        const userRow = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(keyRow.user_id) as any;
        return {
          authenticated: true,
          authType: 'API_KEY',
          user: userRow || { id: keyRow.user_id, role: 'USER' },
        };
      }
      return { authenticated: false, error: 'Invalid or revoked API Key' };
    } catch (err: any) {
      return { authenticated: false, error: 'API Key verification failed' };
    }
  }

  // 2. Check Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const verified = verifyJwt(token);
    if (verified.valid && verified.payload) {
      return {
        authenticated: true,
        authType: 'JWT',
        user: {
          id: verified.payload.sub,
          email: verified.payload.email,
          name: verified.payload.name,
          role: verified.payload.role,
        },
      };
    }
    return { authenticated: false, error: 'Invalid or expired JWT Bearer token' };
  }

  // 3. Fallback to active browser session
  const session = await getSession();
  if (session && session.id) {
    return {
      authenticated: true,
      authType: 'SESSION',
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    };
  }

  return {
    authenticated: false,
    error: 'Missing authentication credentials. Provide x-api-key header or Authorization: Bearer <jwt> token.',
  };
}
