import { readCollection, writeCollection, generateId } from './dbHelper';
import { Rental } from '../../types';

const FILE_NAME = 'rentals.json';

export async function getAllRentals(): Promise<Rental[]> {
  return readCollection<Rental>(FILE_NAME);
}

export async function createRental(data: Omit<Rental, 'id' | 'startDate' | 'endDate' | 'status'>): Promise<Rental> {
  const rentals = await getAllRentals();
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + data.durationDays);

  const newRental: Rental = {
    ...data,
    id: `rent_${generateId()}`,
    status: 'ACTIVE',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };

  rentals.push(newRental);
  writeCollection(FILE_NAME, rentals);
  return newRental;
}

export async function updateRental(id: string, updates: Partial<Omit<Rental, 'id'>>): Promise<Rental | null> {
  const rentals = await getAllRentals();
  const idx = rentals.findIndex(r => r.id === id);
  if (idx === -1) return null;

  rentals[idx] = {
    ...rentals[idx],
    ...updates,
  };

  writeCollection(FILE_NAME, rentals);
  return rentals[idx];
}
