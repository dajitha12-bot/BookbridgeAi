import { readCollection, writeCollection } from './dbHelper';
import { DonationRequest } from '../../types';

const FILE_NAME = 'donation-requests.json';

export async function getAllDonationRequests(): Promise<DonationRequest[]> {
  return readCollection<DonationRequest>(FILE_NAME);
}

export async function createDonationRequest(data: Omit<DonationRequest, 'id' | 'createdAt' | 'status'>): Promise<DonationRequest> {
  const requests = await getAllDonationRequests();
  
  const newRequest: DonationRequest = {
    ...data,
    id: `don_req_${Math.random().toString(36).substring(2, 11)}`,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  requests.push(newRequest);
  writeCollection(FILE_NAME, requests);
  return newRequest;
}

export async function updateDonationRequest(id: string, data: Partial<Omit<DonationRequest, 'id'>>): Promise<DonationRequest | null> {
  const requests = await getAllDonationRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) return null;

  requests[idx] = {
    ...requests[idx],
    ...data,
  };

  writeCollection(FILE_NAME, requests);
  return requests[idx];
}
