import type { BattleResult } from '@/shared/logic/battleResult';

type Listener = () => void;

const STORAGE_KEY = 'slg_battle_history_v1';
const MAX_ITEMS = 50;

const sortByRecent = (items: BattleResult[]) =>
  items.slice().sort((a, b) => (b.endedAtMs ?? 0) - (a.endedAtMs ?? 0));

class BattleHistoryStore {
  private listeners: Set<Listener> = new Set();

  /**
   * 快照缓存：useSyncExternalStore 要求 getSnapshot() 在状态未变时返回同一引用，
   * 否则每次渲染都判定「快照变了」→ 无限重渲（/reports 曾因此整页崩）。
   * 该字段只在构造与写操作时替换，getSnapshot() 只读它。
   */
  private items: BattleResult[] = [];

  constructor() {
    this.items = sortByRecent(this.load());
  }

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

  /** 只读缓存字段，不做任何解析 —— 引用稳定是 uSES 的硬要求。 */
  getSnapshot(): BattleResult[] {
    return this.items;
  }

  getLatestByCityId(cityId: string): BattleResult | null {
    const list = this.getSnapshot();
    return list.find((r) => r.targetCityId === cityId) ?? null;
  }

  add(result: BattleResult) {
    const exists = this.items.some((i) => i.battleId === result.battleId);
    if (exists) return;
    const next = sortByRecent([result, ...this.items].slice(0, MAX_ITEMS));
    this.items = next;
    this.save(next);
    this.emit();
  }

  clear() {
    this.items = [];
    this.save([]);
    this.emit();
  }
}

export const BattleHistory = new BattleHistoryStore();
