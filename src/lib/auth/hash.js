import crypto from "crypto";
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, storedHash) {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
  return hash === verifyHash;
}
export {
  hashPassword,
  verifyPassword
};
