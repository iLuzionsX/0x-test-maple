export interface PersistentStorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

declare global {
  interface Window {
    persistentStorage?: PersistentStorageLike;
  }
}

const fallback: PersistentStorageLike = {
  async getItem(key) { return localStorage.getItem(key); },
  async setItem(key, value) { localStorage.setItem(key, value); },
  async removeItem(key) { localStorage.removeItem(key); },
};

export const storage: PersistentStorageLike = {
  async getItem(key) {
    try { return await (window.persistentStorage ?? fallback).getItem(key); }
    catch { return fallback.getItem(key); }
  },
  async setItem(key, value) {
    try { await (window.persistentStorage ?? fallback).setItem(key, value); }
    catch { await fallback.setItem(key, value); }
  },
  async removeItem(key) {
    try { await (window.persistentStorage ?? fallback).removeItem(key); }
    catch { await fallback.removeItem(key); }
  },
};
