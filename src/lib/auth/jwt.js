import crypto from "crypto";
const JWT_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || "bookbridge-ai-super-secure-jwt-secret-key-32b";
function base64UrlEncode(str) {
  const buf = typeof str === "string" ? Buffer.from(str) : str;
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf8");
}
function signJwt(payload, expiresInSeconds = 7 * 24 * 3600) {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  const now = Math.floor(Date.now() / 1e3);
  const fullPayload = {
    ...payload,
    iss: "bookbridge-ai",
    aud: "bookbridge-client",
    iat: now,
    exp: now + expiresInSeconds
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest();
  const encodedSignature = base64UrlEncode(signature);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}
function verifyJwt(token) {
  try {
    if (!token || typeof token !== "string") {
      return { valid: false, error: "Token missing or invalid" };
    }
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Malformed JWT structure" };
    }
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const expectedSignature = base64UrlEncode(
      crypto.createHmac("sha256", JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest()
    );
    if (encodedSignature !== expectedSignature) {
      return { valid: false, error: "Invalid JWT signature" };
    }
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1e3);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: "JWT token has expired", payload };
    }
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: err.message || "JWT verification failed" };
  }
}
function decodeJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}
export {
  decodeJwt,
  signJwt,
  verifyJwt
};
