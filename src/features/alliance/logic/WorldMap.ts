type Listener = () => void;

export type WorldCity = {
  id: string;
  name: string;
  x: number;
  y: number;
  ownerAllianceId: string | null;
  ownerAllianceName: string | null;
};

const STORAGE_KEY = 'slg_world_map_v1';

type Persisted = {
  owners: Record<string, { ownerAllianceId: string | null; ownerAllianceName: string | null }>;
};

const baseCities: WorldCity[] = [
  { id: 'c1', name: '许昌', x: 160, y: 120, ownerAllianceId: 'a_self', ownerAllianceName: '本盟' },
  { id: 'c2', name: '洛阳', x: 320, y: 200, ownerAllianceId: null, ownerAllianceName: null },
  { id: 'c3', name: '长安', x: 520, y: 160, ownerAllianceId: 'a_enemy', ownerAllianceName: '敌盟' },
  { id: 'c4', name: '襄阳', x: 260, y: 360, ownerAllianceId: null, ownerAllianceName: null },
  { id: 'c5', name: '建业', x: 520, y: 360, ownerAllianceId: 'a_self', ownerAllianceName: '本盟' },
  { id: 'c6', name: '成都', x: 120, y: 520, ownerAllianceId: 'a_enemy', ownerAllianceName: '敌盟' },
];

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
      this.cities = baseCities.map((c) => {
        const o = owners[c.id];
        if (!o) return c;
        return { ...c, ownerAllianceId: o.ownerAllianceId ?? null, ownerAllianceName: o.ownerAllianceName ?? null };
      });
    } catch {
      return;
    }
  }

  private save() {
    if (typeof localStorage === 'undefined') return;
    const owners: Persisted['owners'] = {};
    this.cities.forEach((c) => {
      owners[c.id] = { ownerAllianceId: c.ownerAllianceId, ownerAllianceName: c.ownerAllianceName };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ owners } satisfies Persisted));
  }

  getSnapshot() {
    return this.cities;
  }

  getCityById(cityId: string) {
    return this.cities.find((c) => c.id === cityId) ?? null;
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

  reset() {
    this.cities = baseCities;
    this.save();
    this.emit();
  }
}

export const WorldMap = new WorldMapStore();

