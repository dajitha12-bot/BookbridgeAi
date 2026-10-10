import fs from "fs";
import path from "path";
import os from "os";
const memoryStore = /* @__PURE__ */ new Map();
function getWritableDir() {
  try {
    const tmpDir = path.join(os.tmpdir(), "bookbridge-data");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
  } catch (e) {
    return os.tmpdir();
  }
}
const SEED_DIR = path.join(process.cwd(), "data");
function readCollection(filename) {
  if (memoryStore.has(filename)) {
    return memoryStore.get(filename);
  }
  try {
    const writableDir = getWritableDir();
    const tmpFilePath = path.join(writableDir, filename);
    if (fs.existsSync(tmpFilePath)) {
      const data = fs.readFileSync(tmpFilePath, "utf-8");
      const parsed = JSON.parse(data || "[]");
      memoryStore.set(filename, parsed);
      return parsed;
    }
  } catch (e) {
  }
  try {
    const seedFilePath = path.join(SEED_DIR, filename);
    if (fs.existsSync(seedFilePath)) {
      const data = fs.readFileSync(seedFilePath, "utf-8");
      const parsed = JSON.parse(data || "[]");
      memoryStore.set(filename, parsed);
      return parsed;
    }
  } catch (e) {
    console.error(`Error reading seed database file: ${filename}`, e);
  }
  memoryStore.set(filename, []);
  return [];
}
function writeCollection(filename, data) {
  memoryStore.set(filename, data);
  try {
    const writableDir = getWritableDir();
    const tmpFilePath = path.join(writableDir, filename);
    fs.writeFileSync(tmpFilePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.warn(`Using in-memory store for ${filename} on serverless environment.`);
    return true;
  }
}
function generateId() {
  return Math.random().toString(36).substring(2, 11);
}
export {
  generateId,
  readCollection,
  writeCollection
};
