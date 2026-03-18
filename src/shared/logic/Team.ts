import { allHeroes } from '@/features/hero/data/heroes';
import type { Hero } from '@/features/hero/types/Hero';

export type TeamSnapshot = {
  heroIds: string[];
  maxSize: number;
};

type Listener = () => void;

const STORAGE_KEY = 'slg_team_v1';

class TeamStore {
  private listeners: Set<Listener> = new Set();
  private snapshot: TeamSnapshot = { heroIds: [], maxSize: 5 };

  constructor() {
    this.snapshot = { heroIds: this.load(), maxSize: 5 };
    if (this.snapshot.heroIds.length === 0) {
      this.resetDefault();
    }
  }

  private load() {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((x): x is string => typeof x === 'string').slice(0, 5);
    } catch {
      return [];
    }
  }

  private save(heroIds: string[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(heroIds));
    }
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): TeamSnapshot {
    return this.snapshot;
  }

  setTeam(heroIds: string[]) {
    const uniq: string[] = [];
    heroIds.forEach((id) => {
      if (typeof id !== 'string') return;
      if (uniq.includes(id)) return;
      uniq.push(id);
    });
    const next = uniq.slice(0, this.snapshot.maxSize);
    this.snapshot = { ...this.snapshot, heroIds: next };
    this.save(next);
    this.emit();
  }

  toggleHero(heroId: string) {
    const ids = this.snapshot.heroIds.slice();
    const idx = ids.indexOf(heroId);
    if (idx >= 0) {
      ids.splice(idx, 1);
      this.setTeam(ids);
      return;
    }
    if (ids.length >= this.snapshot.maxSize) return;
    this.setTeam(ids.concat(heroId));
  }

  resetDefault() {
    const ids = allHeroes.slice(0, this.snapshot.maxSize).map((h) => h.id);
    this.setTeam(ids);
  }
}

export const Team = new TeamStore();

export const getTeamHeroes = (heroIds: string[]) => {
  const map = new Map<string, Hero>();
  allHeroes.forEach((h) => map.set(h.id, h));
  return heroIds.map((id) => map.get(id)).filter((h): h is Hero => Boolean(h));
};

