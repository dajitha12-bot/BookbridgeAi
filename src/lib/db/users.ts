import { db } from './sqliteDb';
import { User, Profile } from '../../types';
import { generateId } from './dbHelper';

export async function getAllUsers(): Promise<User[]> {
  const rows = db.prepare('SELECT id, email, name, phone, password_hash as passwordHash, role, status, created_at as createdAt FROM users').all();
  return rows as User[];
}

export async function getUserById(id: string): Promise<User | null> {
  const row = db.prepare('SELECT id, email, name, phone, password_hash as passwordHash, role, status, created_at as createdAt FROM users WHERE id = ?').get(id);
  return (row as User) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const row = db.prepare('SELECT id, email, name, phone, password_hash as passwordHash, role, status, created_at as createdAt FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  return (row as User) || null;
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const row = db.prepare('SELECT user_id as userId, user_id as id, city, area, address, pincode, latitude, longitude, avatar_url as avatarUrl FROM profiles WHERE user_id = ?').get(userId);
  return (row as Profile) || null;
}

export async function createUser(
  userData: Omit<User, 'id' | 'createdAt' | 'status'>,
  profileData: Omit<Profile, 'userId' | 'id'>
): Promise<User> {
  const id = generateId();
  const createdAt = new Date().toISOString();
  const status = 'ACTIVE';

  db.prepare(`
    INSERT INTO users (id, email, name, phone, password_hash, role, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userData.email, userData.name, userData.phone || '', userData.passwordHash, userData.role || 'USER', status, createdAt);

  db.prepare(`
    INSERT INTO profiles (user_id, city, area, address, pincode, latitude, longitude, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    profileData.city || 'Chennai',
    profileData.area || 'Adyar',
    profileData.address || '',
    profileData.pincode || '600020',
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
    status: 'ACTIVE',
    createdAt,
  };
}

export async function updateUser(
  userId: string,
  userUpdates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>,
  profileUpdates?: Partial<Profile>
): Promise<User | null> {
  const existingUser = await getUserById(userId);
  if (!existingUser) return null;

  if (userUpdates.name !== undefined || userUpdates.phone !== undefined || userUpdates.status !== undefined || userUpdates.role !== undefined) {
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
        profileUpdates.city || 'Chennai',
        profileUpdates.area || 'Adyar',
        profileUpdates.address || '',
        profileUpdates.pincode || '600020',
        profileUpdates.latitude || 13.0827,
        profileUpdates.longitude || 80.2707,
        profileUpdates.avatarUrl || null
      );
    }
  }

  return getUserById(userId);
}
