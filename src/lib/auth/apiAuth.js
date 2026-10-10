import { db } from "../db/sqliteDb";
import { verifyJwt } from "./jwt";
import { getSession } from "./session";
async function authenticateApiRequest(req) {
  const apiKeyHeader = req.headers.get("x-api-key");
  if (apiKeyHeader) {
    try {
      const keyRow = db.prepare("SELECT * FROM api_keys WHERE api_key = ? AND is_active = 1").get(apiKeyHeader);
      if (keyRow) {
        db.prepare("UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?").run(keyRow.id);
        const userRow = db.prepare("SELECT id, email, name, role FROM users WHERE id = ?").get(keyRow.user_id);
        return {
          authenticated: true,
          authType: "API_KEY",
          user: userRow || { id: keyRow.user_id, role: "USER" }
        };
      }
      return { authenticated: false, error: "Invalid or revoked API Key" };
    } catch (err) {
      return { authenticated: false, error: "API Key verification failed" };
    }
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const verified = verifyJwt(token);
    if (verified.valid && verified.payload) {
      return {
        authenticated: true,
        authType: "JWT",
        user: {
          id: verified.payload.sub,
          email: verified.payload.email,
          name: verified.payload.name,
          role: verified.payload.role
        }
      };
    }
    return { authenticated: false, error: "Invalid or expired JWT Bearer token" };
  }
  const session = await getSession();
  if (session && session.id) {
    return {
      authenticated: true,
      authType: "SESSION",
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role
      }
    };
  }
  return {
    authenticated: false,
    error: "Missing authentication credentials. Provide x-api-key header or Authorization: Bearer <jwt> token."
  };
}
export {
  authenticateApiRequest
};
