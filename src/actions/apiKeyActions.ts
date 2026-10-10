'use server';

import { db } from '../lib/db/sqliteDb';
import { getSession } from '../lib/auth/session';
import crypto from 'crypto';

export interface ApiKeyItem {
  id: string;
  userId: string;
  apiKey: string;
  name: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

/**
 * Retrieves all API keys belonging to the authenticated session user.
 */
export async function getApiKeysAction(): Promise<{ success: boolean; keys?: ApiKeyItem[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: 'Unauthorized: Please log in to manage API keys' };
    }

    const rows = db.prepare(`
      SELECT id, user_id as userId, api_key as apiKey, name, is_active as isActive, last_used_at as lastUsedAt, created_at as createdAt
      FROM api_keys
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(session.id) as any[];

    const keys: ApiKeyItem[] = rows.map((r) => ({
      ...r,
      isActive: Boolean(r.isActive),
    }));

    return { success: true, keys };
  } catch (err: any) {
    console.error('Error fetching API keys:', err);
    return { success: false, error: err.message || 'Failed to fetch API keys' };
  }
}

/**
 * Generates a new live production API key for the current user.
 */
export async function generateApiKeyAction(name: string = 'Developer API Key'): Promise<{ success: boolean; key?: ApiKeyItem; error?: string }> {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: 'Unauthorized: Please log in to generate an API key' };
    }

    const keyId = `apk_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const rawKey = `bk_live_${crypto.randomBytes(24).toString('hex')}`;

    db.prepare(`
      INSERT INTO api_keys (id, user_id, api_key, name, is_active, created_at)
      VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `).run(keyId, session.id, rawKey, name);

    return {
      success: true,
      key: {
        id: keyId,
        userId: session.id,
        apiKey: rawKey,
        name,
        isActive: true,
        lastUsedAt: null,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    console.error('Error creating API key:', err);
    return { success: false, error: err.message || 'Failed to generate API key' };
  }
}

/**
 * Revokes / deactivates an API key.
 */
export async function revokeApiKeyAction(keyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: 'Unauthorized' };
    }

    db.prepare(`
      UPDATE api_keys SET is_active = 0 WHERE id = ? AND (user_id = ? OR ? = 'ADMIN')
    `).run(keyId, session.id, session.role);

    return { success: true };
  } catch (err: any) {
    console.error('Error revoking API key:', err);
    return { success: false, error: err.message || 'Failed to revoke API key' };
  }
}
