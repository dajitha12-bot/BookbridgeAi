import { readCollection, writeCollection, generateId } from './dbHelper';
import { User, Profile } from '../../types';

const USERS_FILE = 'users.json';
const PROFILES_FILE = 'profiles.json'; // We will store profiles in profiles.json or inline in users.json. 
// Storing them separately mirrors SQL tables exactly!

export async function getAllUsers(): Promise<User[]> {
  return readCollection<User>(USERS_FILE);
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find(u => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const profiles = readCollection<Profile>(PROFILES_FILE);
  return profiles.find(p => p.userId === userId) || null;
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'status'>, profileData: Omit<Profile, 'userId'>): Promise<User> {
  const users = await getAllUsers();
  const profiles = readCollection<Profile>(PROFILES_FILE);

  const newUser: User = {
    ...userData,
    id: generateId(),
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  const newProfile: Profile = {
    ...profileData,
    userId: newUser.id,
  };

  users.push(newUser);
  profiles.push(newProfile);

  writeCollection(USERS_FILE, users);
  writeCollection(PROFILES_FILE, profiles);

  return newUser;
}

export async function updateUser(
  userId: string, 
  userUpdates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>, 
  profileUpdates?: Partial<Profile>
): Promise<User | null> {
  const users = await getAllUsers();
  const userIdx = users.findIndex(u => u.id === userId);
  if (userIdx === -1) return null;

  users[userIdx] = {
    ...users[userIdx],
    ...userUpdates,
  };

  writeCollection(USERS_FILE, users);

  if (profileUpdates) {
    const profiles = readCollection<Profile>(PROFILES_FILE);
    const profIdx = profiles.findIndex(p => p.userId === userId);
    if (profIdx !== -1) {
      profiles[profIdx] = {
        ...profiles[profIdx],
        ...profileUpdates,
      };
    } else {
      profiles.push({
        userId,
        city: 'Chennai',
        area: '',
        address: '',
        pincode: '',
        latitude: 13.0827,
        longitude: 80.2707,
        ...profileUpdates,
      } as Profile);
    }
    writeCollection(PROFILES_FILE, profiles);
  }

  return users[userIdx];
}
