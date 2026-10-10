"use server";
import { db } from "../lib/db/sqliteDb";
import { getSession } from "../lib/auth/session";
import crypto from "crypto";
async function getApiKeysAction() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: "Unauthorized: Please log in to manage API keys" };
    }
    const rows = db.prepare(`
      SELECT id, user_id as userId, api_key as apiKey, name, is_active as isActive, last_used_at as lastUsedAt, created_at as createdAt
      FROM api_keys
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(session.id);
    const keys = rows.map((r) => ({
      ...r,
      isActive: Boolean(r.isActive)
    }));
    return { success: true, keys };
  } catch (err) {
    console.error("Error fetching API keys:", err);
    return { success: false, error: err.message || "Failed to fetch API keys" };
  }
}
async function generateApiKeyAction(name = "Developer API Key") {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: "Unauthorized: Please log in to generate an API key" };
    }
    const keyId = `apk_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const rawKey = `bk_live_${crypto.randomBytes(24).toString("hex")}`;
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
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
  } catch (err) {
    console.error("Error creating API key:", err);
    return { success: false, error: err.message || "Failed to generate API key" };
  }
}
async function revokeApiKeyAction(keyId) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return { success: false, error: "Unauthorized" };
    }
    db.prepare(`
      UPDATE api_keys SET is_active = 0 WHERE id = ? AND (user_id = ? OR ? = 'ADMIN')
    `).run(keyId, session.id, session.role);
    return { success: true };
  } catch (err) {
    console.error("Error revoking API key:", err);
    return { success: false, error: err.message || "Failed to revoke API key" };
  }
}
export {
  generateApiKeyAction,
  getApiKeysAction,
  revokeApiKeyAction
};
