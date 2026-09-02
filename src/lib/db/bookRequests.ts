import { readCollection, writeCollection, generateId } from './dbHelper';
import { BookRequest } from '../../types';

const REQUESTS_FILE = 'book-requests.json';

export async function getAllBookRequests(): Promise<BookRequest[]> {
  return readCollection<BookRequest>(REQUESTS_FILE);
}

export async function getRequestsByUser(userId: string): Promise<BookRequest[]> {
  const requests = await getAllBookRequests();
  return requests.filter(r => r.requesterId === userId);
}

export async function createBookRequest(requestData: Omit<BookRequest, 'id' | 'createdAt' | 'status'>): Promise<BookRequest> {
  const requests = await getAllBookRequests();

  const newRequest: BookRequest = {
    ...requestData,
    id: generateId(),
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  requests.push(newRequest);
  writeCollection(REQUESTS_FILE, requests);

  return newRequest;
}

export async function updateBookRequest(id: string, updates: Partial<Omit<BookRequest, 'id' | 'createdAt'>>): Promise<BookRequest | null> {
  const requests = await getAllBookRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) return null;

  requests[idx] = {
    ...requests[idx],
    ...updates,
  };

  writeCollection(REQUESTS_FILE, requests);
  return requests[idx];
}

export async function deleteBookRequest(id: string): Promise<boolean> {
  const requests = await getAllBookRequests();
  const filtered = requests.filter(r => r.id !== id);
  if (requests.length === filtered.length) return false;

  writeCollection(REQUESTS_FILE, filtered);
  return true;
}
