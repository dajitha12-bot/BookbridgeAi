export type Role = 'USER' | 'DELIVERY_STAFF' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  city: string;
  area: string;
  address: string;
  pincode: string;
  latitude: number;
  longitude: number;
  avatarUrl?: string | null;
}
