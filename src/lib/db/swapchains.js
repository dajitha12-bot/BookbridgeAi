import { db } from "./sqliteDb";
import { generateId } from "./dbHelper";
function mapRowToChain(row) {
  let parsed = {};
  try {
    parsed = JSON.parse(row.chain_data_json || "{}");
  } catch (e) {
    parsed = {};
  }
  return {
    id: row.id,
    title: row.title,
    status: row.status || "ACTIVE",
    chainData: parsed,
    createdAt: row.created_at
  };
}
async function getAllSwapChains() {
  const rows = db.prepare("SELECT * FROM swap_chains ORDER BY created_at DESC").all();
  return rows.map(mapRowToChain);
}
async function getSwapChainById(id) {
  const row = db.prepare("SELECT * FROM swap_chains WHERE id = ?").get(id);
  return row ? mapRowToChain(row) : null;
}
async function createSwapChain(title, chainData) {
  const id = `chain-${generateId()}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  db.prepare(`
    INSERT INTO swap_chains (id, title, status, chain_data_json, created_at)
    VALUES (?, ?, 'ACTIVE', ?, ?)
  `).run(id, title, JSON.stringify(chainData), createdAt);
  return await getSwapChainById(id);
}
async function updateSwapChain(id, updates) {
  db.prepare(`
    UPDATE swap_chains
    SET status = COALESCE(?, status),
        chain_data_json = COALESCE(?, chain_data_json),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(updates.status ?? null, updates.chainData ? JSON.stringify(updates.chainData) : null, id);
  return getSwapChainById(id);
}
async function updateSwapChainStatus(id, status) {
  const result = db.prepare("UPDATE swap_chains SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, id);
  return result.changes > 0;
}
export {
  createSwapChain,
  getAllSwapChains,
  getSwapChainById,
  updateSwapChain,
  updateSwapChainStatus
};
