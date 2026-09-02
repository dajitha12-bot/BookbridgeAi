import { readCollection, writeCollection, generateId } from './dbHelper';
import { SwapChain } from '../../types';

const SWAPCHAINS_FILE = 'swapchains.json';

export async function getAllSwapChains(): Promise<SwapChain[]> {
  return readCollection<SwapChain>(SWAPCHAINS_FILE);
}

export async function getSwapChainById(id: string): Promise<SwapChain | null> {
  const chains = await getAllSwapChains();
  return chains.find(c => c.id === id) || null;
}

export async function getSwapChainsByUser(userId: string): Promise<SwapChain[]> {
  const chains = await getAllSwapChains();
  return chains.filter(c => c.members.some(m => m.userId === userId));
}

export async function createSwapChain(swapChainData: Omit<SwapChain, 'id' | 'createdAt'>): Promise<SwapChain> {
  const chains = await getAllSwapChains();

  const newChain: SwapChain = {
    ...swapChainData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  chains.push(newChain);
  writeCollection(SWAPCHAINS_FILE, chains);

  return newChain;
}

export async function updateSwapChain(id: string, updates: Partial<Omit<SwapChain, 'id' | 'createdAt'>>): Promise<SwapChain | null> {
  const chains = await getAllSwapChains();
  const idx = chains.findIndex(c => c.id === id);
  if (idx === -1) return null;

  chains[idx] = {
    ...chains[idx],
    ...updates,
  };

  writeCollection(SWAPCHAINS_FILE, chains);
  return chains[idx];
}
