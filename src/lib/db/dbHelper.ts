import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Get absolute path of a JSON database file
 */
export function getFilePath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

/**
 * Reads a JSON file list, returning empty array if file does not exist
 */
export function readCollection<T>(filename: string): T[] {
  const filePath = getFilePath(filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error(`Error reading database file: ${filename}`, error);
    return [];
  }
}

/**
 * Writes a list to a JSON file atomically (via temporary file swap)
 */
export function writeCollection<T>(filename: string, data: T[]): boolean {
  const filePath = getFilePath(filename);
  const tempPath = `${filePath}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (error) {
    console.error(`Error writing database file: ${filename}`, error);
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch {}
    }
    return false;
  }
}

/**
 * Generates a standard random unique ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
