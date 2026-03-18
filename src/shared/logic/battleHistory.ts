import type { BattleResult } from '@/shared/logic/battleResult';

type Listener = () => void;

const STORAGE_KEY = 'slg_battle_history_v1';
const MAX_ITEMS = 50;

class BattleHistoryStore {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  private load(): BattleResult[] {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as BattleResult[];
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  }

  private save(items: BattleResult[]) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  getSnapshot(): BattleResult[] {
    return this.load().sort((a, b) => (b.endedAtMs ?? 0) - (a.endedAtMs ?? 0));
  }

  add(result: BattleResult) {
    const items = this.load();
    const exists = items.some((i) => i.battleId === result.battleId);
    if (exists) return;
    const next = [result, ...items].slice(0, MAX_ITEMS);
    this.save(next);
    this.emit();
  }

  clear() {
    this.save([]);
    this.emit();
  }
}

export const BattleHistory = new BattleHistoryStore();

