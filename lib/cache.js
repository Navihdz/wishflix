const memory = new Map();

export function readCache(key) {
  const value = memory.get(key);
  if (!value) return null;
  if (Date.now() > value.expiresAt) {
    memory.delete(key);
    return null;
  }
  return value.payload;
}

export function writeCache(key, payload, ttlMs = 1000 * 60 * 10) {
  memory.set(key, { payload, expiresAt: Date.now() + ttlMs });
}
