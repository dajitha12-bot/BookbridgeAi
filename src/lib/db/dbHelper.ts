import fs from 'fs';
import path from 'path';
import os from 'os';

// Memory cache store for serverless environment resilience
const memoryStore = new Map<string, any>();

function getWritableDir(): string {
  try {
    const tmpDir = path.join(os.tmpdir(), 'bookbridge-data');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
  } catch (e) {
    return os.tmpdir();
  }
}

const SEED_DIR = path.join(process.cwd(), 'data');

/**
 * Reads a JSON collection with memory caching and Vercel serverless /tmp fallback
 */
export function readCollection<T>(filename: string): T[] {
  // 1. Check in-memory store first
  if (memoryStore.has(filename)) {
    return memoryStore.get(filename) as T[];
  }

  // 2. Try reading from writable tmp directory
  try {
    const writableDir = getWritableDir();
    const tmpFilePath = path.join(writableDir, filename);
    if (fs.existsSync(tmpFilePath)) {
      const data = fs.readFileSync(tmpFilePath, 'utf-8');
      const parsed = JSON.parse(data || '[]');
      memoryStore.set(filename, parsed);
      return parsed;
    }
  } catch (e) {
    // Ignore error and fall back to seed
  }

  // 3. Fallback to reading seed file from process.cwd()/data
  try {
    const seedFilePath = path.join(SEED_DIR, filename);
    if (fs.existsSync(seedFilePath)) {
      const data = fs.readFileSync(seedFilePath, 'utf-8');
      const parsed = JSON.parse(data || '[]');
      memoryStore.set(filename, parsed);
      return parsed;
    }
  } catch (e) {
    console.error(`Error reading seed database file: ${filename}`, e);
  }

  memoryStore.set(filename, []);
  return [];
}

/**
 * Writes a list to memory store and attempts disk write to writable /tmp
 */
export function writeCollection<T>(filename: string, data: T[]): boolean {
  // 1. Always update memory store immediately
  memoryStore.set(filename, data);

  // 2. Try saving to writable tmp directory for serverless environments
  try {
    const writableDir = getWritableDir();
    const tmpFilePath = path.join(writableDir, filename);
    fs.writeFileSync(tmpFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.warn(`Using in-memory store for ${filename} on serverless environment.`);
    return true;
  }
}

/**
 * Generates a standard random unique ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
