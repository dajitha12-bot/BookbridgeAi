import { readCollection, writeCollection, generateId } from './dbHelper';
import { Exchange } from '../../types';

const EXCHANGES_FILE = 'exchanges.json';

export async function getAllExchanges(): Promise<Exchange[]> {
  return readCollection<Exchange>(EXCHANGES_FILE);
}

export async function getExchangeById(id: string): Promise<Exchange | null> {
  const exchanges = await getAllExchanges();
  return exchanges.find(e => e.id === id) || null;
}

export async function getExchangesByUser(userId: string): Promise<Exchange[]> {
  const exchanges = await getAllExchanges();
  return exchanges.filter(e => e.senderId === userId || e.receiverId === userId);
}

export async function createExchange(exchangeData: Omit<Exchange, 'id' | 'createdAt'>): Promise<Exchange> {
  const exchanges = await getAllExchanges();

  const newExchange: Exchange = {
    ...exchangeData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  exchanges.push(newExchange);
  writeCollection(EXCHANGES_FILE, exchanges);

  return newExchange;
}

export async function updateExchange(id: string, updates: Partial<Omit<Exchange, 'id' | 'createdAt'>>): Promise<Exchange | null> {
  const exchanges = await getAllExchanges();
  const idx = exchanges.findIndex(e => e.id === id);
  if (idx === -1) return null;

  exchanges[idx] = {
    ...exchanges[idx],
    ...updates,
  };

  writeCollection(EXCHANGES_FILE, exchanges);
  return exchanges[idx];
}
