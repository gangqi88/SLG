type Listener = () => void;

export type CityDefenseState = {
  max: number;
  cur: number;
  repairFromMs: number | null;
  repairToMs: number | null;
};

export type WorldCity = {
  id: string;
  name: string;
  x: number;
  y: number;
  cityType: 'capital' | 'county' | 'fort';
  level: number;
  defense: number;
  defenseState: CityDefenseState;
  production: { woodPerMin: number; orePerMin: number; coinPerMin: number };
  ownerAllianceId: string | null;
  ownerAllianceName: string | null;
};

const STORAGE_KEY = 'slg_world_map_v1';

type Persisted = {
  owners: Record<string, { ownerAllianceId: string | null; ownerAllianceName: string | null }>;
  defense?: Record<string, Partial<CityDefenseState>>;
};

const baseCities: WorldCity[] = [
  {
    id: 'c1',
    name: '许昌',
    x: 160,
    y: 120,
    cityType: 'capital',
    level: 5,
    defense: 520,
    defenseState: { max: 520, cur: 520, repairFromMs: null, repairToMs: null },
    production: { woodPerMin: 32, orePerMin: 18, coinPerMin: 40 },
    ownerAllianceId: 'a_self',
    ownerAllianceName: '本盟',
  },
  {
    id: 'c2',
    name: '洛阳',
    x: 320,
    y: 200,
    cityType: 'capital',
    level: 7,
    defense: 680,
    defenseState: { max: 680, cur: 680, repairFromMs: null, repairToMs: null },
    production: { woodPerMin: 46, orePerMin: 26, coinPerMin: 60 },
    ownerAllianceId: null,
    ownerAllianceName: null,
  },
  {
    id: 'c3',
    name: '长安',
    x: 520,
    y: 160,
    cityType: 'capital',
    level: 8,
    defense: 760,
    defenseState: { max: 760, cur: 760, repairFromMs: null, repairToMs: null },
    production: { woodPerMin: 54, orePerMin: 30, coinPerMin: 72 },
    ownerAllianceId: 'a_enemy',
    ownerAllianceName: '敌盟',
  },
  {
    id: 'c4',
    name: '襄阳',
    x: 260,
    y: 360,
    cityType: 'fort',
    level: 4,
    defense: 460,
    defenseState: { max: 460, cur: 460, repairFromMs: null, repairToMs: null },
    production: { woodPerMin: 24, orePerMin: 16, coinPerMin: 28 },
    ownerAllianceId: null,
    ownerAllianceName: null,
  },
  {
    id: 'c5',
    name: '建业',
    x: 520,
    y: 360,
    cityType: 'county',
    level: 3,
    defense: 380,
    defenseState: { max: 380, cur: 380, repairFromMs: null, repairToMs: null },
    production: { woodPerMin: 20, orePerMin: 12, coinPerMin: 22 },
    ownerAllianceId: 'a_self',
    ownerAllianceName: '本盟',
  },
  {
    id: 'c6',
    name: '成都',
    x: 120,
    y: 520,
    cityType: 'capital',
    level: 6,
    defense: 620,
    defenseState: { max: 620, cur: 620, repairFromMs: null, repairToMs: null },
    production: { woodPerMin: 40, orePerMin: 24, coinPerMin: 52 },
    ownerAllianceId: 'a_enemy',
    ownerAllianceName: '敌盟',
  },
];

const clampInt = (v: number, min: number, max: number) => Math.max(min, Math.min(max, Math.floor(v)));

const computeDefenseAt = (s: CityDefenseState, nowMs: number) => {
  if (!s.repairFromMs || !s.repairToMs) return { cur: clampInt(s.cur, 0, s.max), repairing: false, remainingMs: 0 };
  if (nowMs >= s.repairToMs) return { cur: s.max, repairing: false, remainingMs: 0 };
  const dur = Math.max(1, s.repairToMs - s.repairFromMs);
  const p = (nowMs - s.repairFromMs) / dur;
  const next = s.cur + (s.max - s.cur) * p;
  return { cur: clampInt(next, 0, s.max), repairing: true, remainingMs: s.repairToMs - nowMs };
};

class WorldMapStore {
  private listeners: Set<Listener> = new Set();
  private cities: WorldCity[] = baseCities;

  constructor() {
    this.load();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  private load() {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Persisted;
      const owners = parsed?.owners ?? {};
      const defense = parsed?.defense ?? {};
      this.cities = baseCities.map((c) => {
        const o = owners[c.id];
        const d = defense[c.id];
        const defenseState: CityDefenseState = {
          max: c.defenseState.max,
          cur: c.defenseState.cur,
          repairFromMs: c.defenseState.repairFromMs,
          repairToMs: c.defenseState.repairToMs,
        };
        if (d) {
          const max = typeof d.max === 'number' ? clampInt(d.max, 1, 999999) : defenseState.max;
          const cur = typeof d.cur === 'number' ? clampInt(d.cur, 0, max) : defenseState.cur;
          defenseState.max = max;
          defenseState.cur = cur;
          defenseState.repairFromMs = typeof d.repairFromMs === 'number' ? d.repairFromMs : null;
          defenseState.repairToMs = typeof d.repairToMs === 'number' ? d.repairToMs : null;
        }
        const ownerAllianceId = o ? (o.ownerAllianceId ?? null) : c.ownerAllianceId;
        const ownerAllianceName = o ? (o.ownerAllianceName ?? null) : c.ownerAllianceName;
        return { ...c, ownerAllianceId, ownerAllianceName, defenseState };
      });
    } catch {
      return;
    }
  }

  private save() {
    if (typeof localStorage === 'undefined') return;
    const owners: Persisted['owners'] = {};
    const defense: NonNullable<Persisted['defense']> = {};
    this.cities.forEach((c) => {
      owners[c.id] = { ownerAllianceId: c.ownerAllianceId, ownerAllianceName: c.ownerAllianceName };
      defense[c.id] = c.defenseState;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ owners, defense } satisfies Persisted));
  }

  getSnapshot() {
    const now = Date.now();
    return this.cities.map((c) => {
      const computed = computeDefenseAt(c.defenseState, now);
      return {
        ...c,
        defenseState: { ...c.defenseState, cur: computed.cur },
      };
    });
  }

  getCityById(cityId: string) {
    const city = this.cities.find((c) => c.id === cityId);
    if (!city) return null;
    const now = Date.now();
    const computed = computeDefenseAt(city.defenseState, now);
    return { ...city, defenseState: { ...city.defenseState, cur: computed.cur } };
  }

  setOwner(cityId: string, ownerAllianceId: string | null, ownerAllianceName: string | null) {
    const idx = this.cities.findIndex((c) => c.id === cityId);
    if (idx < 0) return;
    const prev = this.cities[idx];
    const next: WorldCity = { ...prev, ownerAllianceId, ownerAllianceName };
    this.cities = [...this.cities.slice(0, idx), next, ...this.cities.slice(idx + 1)];
    this.save();
    this.emit();
  }

  applySiegeOutcome(args: {
    cityId: string;
    winner: 'attacker' | 'defender' | 'draw';
    attackerDamage: number;
    attackerAllianceId?: string | null;
    attackerAllianceName?: string | null;
  }) {
    const idx = this.cities.findIndex((c) => c.id === args.cityId);
    if (idx < 0) return false;
    const prev = this.cities[idx];
    const now = Date.now();
    const computed = computeDefenseAt(prev.defenseState, now);
    const max = prev.defenseState.max;
    const curBefore = computed.cur;
    let defenseState: CityDefenseState = { ...prev.defenseState, cur: curBefore };
    let ownerAllianceId = prev.ownerAllianceId;
    let ownerAllianceName = prev.ownerAllianceName;

    if (args.winner === 'attacker' && args.attackerAllianceId) {
      ownerAllianceId = args.attackerAllianceId;
      ownerAllianceName = args.attackerAllianceName ?? '本盟';
      defenseState = { max, cur: max, repairFromMs: null, repairToMs: null };
    } else if (args.winner === 'defender') {
      const raw = Math.floor(args.attackerDamage / 180);
      const base = Math.floor(max * 0.06);
      const dmg = clampInt(base + raw, 1, Math.floor(max * 0.55));
      const minCur = Math.floor(max * 0.1);
      const cur = Math.max(minCur, curBefore - dmg);
      const ratio = (max - cur) / Math.max(1, max);
      const durMs = clampInt(3 * 60 * 1000 + ratio * 17 * 60 * 1000, 2 * 60 * 1000, 30 * 60 * 1000);
      defenseState = { max, cur, repairFromMs: now, repairToMs: now + durMs };
    }

    const next: WorldCity = { ...prev, ownerAllianceId, ownerAllianceName, defenseState };
    this.cities = [...this.cities.slice(0, idx), next, ...this.cities.slice(idx + 1)];
    this.save();
    this.emit();
    return true;
  }

  reset() {
    this.cities = baseCities;
    this.save();
    this.emit();
  }
}

export const WorldMap = new WorldMapStore();
