import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
async function getAllUsers() {
  const rows = db.prepare("SELECT id, email, name, phone, password_hash as passwordHash, role, status, created_at as createdAt FROM users").all();
  return rows;
}
async function getUserById(id) {
  const row = db.prepare("SELECT id, email, name, phone, password_hash as passwordHash, role, status, created_at as createdAt FROM users WHERE id = ?").get(id);
  return row || null;
}
async function getUserByEmail(email) {
  const row = db.prepare("SELECT id, email, name, phone, password_hash as passwordHash, role, status, created_at as createdAt FROM users WHERE LOWER(email) = LOWER(?)").get(email);
  return row || null;
}
async function getProfileByUserId(userId) {
  const row = db.prepare("SELECT user_id as userId, user_id as id, city, area, address, pincode, latitude, longitude, avatar_url as avatarUrl FROM profiles WHERE user_id = ?").get(userId);
  return row || null;
}
async function createUser(userData, profileData) {
  const id = generateId();
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const status = "ACTIVE";
  db.prepare(`
    INSERT INTO users (id, email, name, phone, password_hash, role, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userData.email, userData.name, userData.phone || "", userData.passwordHash, userData.role || "USER", status, createdAt);
  db.prepare(`
    INSERT INTO profiles (user_id, city, area, address, pincode, latitude, longitude, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    profileData.city || "Chennai",
    profileData.area || "Adyar",
    profileData.address || "",
    profileData.pincode || "600020",
    profileData.latitude || 13.0827,
    profileData.longitude || 80.2707,
    profileData.avatarUrl || null
  );
  return {
    id,
    email: userData.email,
    name: userData.name,
    phone: userData.phone,
    passwordHash: userData.passwordHash,
    role: userData.role,
    status: "ACTIVE",
    createdAt
  };
}
async function updateUser(userId, userUpdates, profileUpdates) {
  const existingUser = await getUserById(userId);
  if (!existingUser) return null;
  if (userUpdates.name !== void 0 || userUpdates.phone !== void 0 || userUpdates.status !== void 0 || userUpdates.role !== void 0) {
    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          status = COALESCE(?, status),
          role = COALESCE(?, role),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(userUpdates.name ?? null, userUpdates.phone ?? null, userUpdates.status ?? null, userUpdates.role ?? null, userId);
  }
  if (profileUpdates) {
    const existingProf = await getProfileByUserId(userId);
    if (existingProf) {
      db.prepare(`
        UPDATE profiles
        SET city = COALESCE(?, city),
            area = COALESCE(?, area),
            address = COALESCE(?, address),
            pincode = COALESCE(?, pincode),
            latitude = COALESCE(?, latitude),
            longitude = COALESCE(?, longitude),
            avatar_url = COALESCE(?, avatar_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        profileUpdates.city ?? null,
        profileUpdates.area ?? null,
        profileUpdates.address ?? null,
        profileUpdates.pincode ?? null,
        profileUpdates.latitude ?? null,
        profileUpdates.longitude ?? null,
        profileUpdates.avatarUrl ?? null,
        userId
      );
    } else {
      db.prepare(`
        INSERT INTO profiles (user_id, city, area, address, pincode, latitude, longitude, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        profileUpdates.city || "Chennai",
        profileUpdates.area || "Adyar",
        profileUpdates.address || "",
        profileUpdates.pincode || "600020",
        profileUpdates.latitude || 13.0827,
        profileUpdates.longitude || 80.2707,
        profileUpdates.avatarUrl || null
      );
    }
  }
  return getUserById(userId);
}
async function saveUserLocation(location) {
  const id = `loc_${generateId()}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  db.prepare(`
    INSERT INTO user_locations (id, user_id, latitude, longitude, accuracy, address, city, state, pincode, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    location.userId,
    location.latitude,
    location.longitude,
    location.accuracy || 0,
    location.address || "",
    location.city || "",
    location.state || "",
    location.pincode || "",
    now,
    now
  );
  try {
    db.prepare(`
      UPDATE profiles
      SET latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(location.latitude, location.longitude, location.userId);
  } catch (e) {
  }
  return {
    id,
    userId: location.userId,
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    address: location.address,
    city: location.city,
    state: location.state,
    pincode: location.pincode,
    createdAt: now,
    updatedAt: now
  };
}
async function getLatestUserLocation(userId) {
  try {
    const row = db.prepare(`
      SELECT * FROM user_locations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(userId);
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      latitude: row.latitude,
      longitude: row.longitude,
      accuracy: row.accuracy,
      address: row.address,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } catch (e) {
    return null;
  }
}
export {
  createUser,
  getAllUsers,
  getLatestUserLocation,
  getProfileByUserId,
  getUserByEmail,
  getUserById,
  saveUserLocation,
  updateUser
};
