import { db } from './sqliteDb';
import { generateId } from './dbHelper';

export interface SwapChain {
  id: string;
  title: string;
  status: 'ACTIVE' | 'EXECUTED' | 'CANCELLED';
  chainData: any;
  createdAt: string;
}

function mapRowToChain(row: any): SwapChain {
  let parsed = {};
  try {
    parsed = JSON.parse(row.chain_data_json || '{}');
  } catch (e) {
    parsed = {};
  }
  return {
    id: row.id,
    title: row.title,
    status: row.status || 'ACTIVE',
    chainData: parsed,
    createdAt: row.created_at,
  };
}

export async function getAllSwapChains(): Promise<SwapChain[]> {
  const rows = db.prepare('SELECT * FROM swap_chains ORDER BY created_at DESC').all();
  return rows.map(mapRowToChain);
}

export async function getSwapChainById(id: string): Promise<SwapChain | null> {
  const row = db.prepare('SELECT * FROM swap_chains WHERE id = ?').get(id);
  return row ? mapRowToChain(row) : null;
}

export async function createSwapChain(title: string, chainData: any): Promise<SwapChain> {
  const id = `chain-${generateId()}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO swap_chains (id, title, status, chain_data_json, created_at)
    VALUES (?, ?, 'ACTIVE', ?, ?)
  `).run(id, title, JSON.stringify(chainData), createdAt);

  return (await getSwapChainById(id))!;
}

export async function updateSwapChain(id: string, updates: any): Promise<SwapChain | null> {
  db.prepare(`
    UPDATE swap_chains
    SET status = COALESCE(?, status),
        chain_data_json = COALESCE(?, chain_data_json),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(updates.status ?? null, updates.chainData ? JSON.stringify(updates.chainData) : null, id);

  return getSwapChainById(id);
}

export async function updateSwapChainStatus(id: string, status: 'ACTIVE' | 'EXECUTED' | 'CANCELLED'): Promise<boolean> {
  const result = db.prepare('UPDATE swap_chains SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
  return result.changes > 0;
}
