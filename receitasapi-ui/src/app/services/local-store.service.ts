import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStoreService {
  private prefix = 'receitasapi_';

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw ? JSON.parse(raw) as T : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }

  remove(key: string): void {
    try { localStorage.removeItem(this.prefix + key); } catch {}
  }

  generateId(): number {
    const now = Date.now();
    return Math.floor(now / 1000) + Math.floor(Math.random() * 1000);
  }
}
