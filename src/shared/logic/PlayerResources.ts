export type PlayerResourceKey = 'coin' | 'gem' | 'food' | 'wood' | 'ore' | 'bun';

export type PlayerResourcesSnapshot = Record<PlayerResourceKey, number>;

type Listener = () => void;

const STORAGE_KEY = 'slg_player_resources_v1';

class PlayerResourcesStore {
  private resources: PlayerResourcesSnapshot = {
    coin: 1000,
    gem: 200,
    food: 800,
    wood: 600,
    ore: 300,
    bun: 120,
  };
  private readonly listeners: Set<Listener> = new Set();

  constructor() {
    this.load();
    this.syncFromInventory();
  }

  private syncFromInventory() {
    import('@/features/resource/logic/InventoryManager').then(({ default: inventory }) => {
      inventory.subscribe(() => {
        const items = inventory.getItems();
        const bun = items.find((i) => i.item.id === 'item_hero_exp')?.quantity ?? 0;
        const wood =
          items.find((i) => i.item.id === 'resource_wood')?.quantity ?? this.resources.wood;
        const ore =
          items.find((i) => i.item.id === 'resource_stone')?.quantity ?? this.resources.ore;
        const next = {
          ...this.resources,
          bun,
          wood,
          ore,
        };
        if (
          next.bun === this.resources.bun &&
          next.wood === this.resources.wood &&
          next.ore === this.resources.ore
        ) {
          return;
        }
        this.resources = next;
        this.emit();
      });

      const items = inventory.getItems();
      const bun = items.find((i) => i.item.id === 'item_hero_exp')?.quantity ?? 0;
      const wood =
        items.find((i) => i.item.id === 'resource_wood')?.quantity ?? this.resources.wood;
      const ore = items.find((i) => i.item.id === 'resource_stone')?.quantity ?? this.resources.ore;
      this.resources = { ...this.resources, bun, wood, ore };
      this.emit();
    });
  }

  private load() {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<PlayerResourcesSnapshot> | null;
      if (!parsed) return;
      this.resources = { ...this.resources, ...parsed };
    } catch {
      return;
    }
  }

  private save() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.resources));
    }
    this.emit();
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): PlayerResourcesSnapshot {
    return this.resources;
  }

  set(key: PlayerResourceKey, value: number) {
    const next = Math.max(0, Math.floor(value));
    if (this.resources[key] === next) return;
    this.resources = { ...this.resources, [key]: next };
    this.save();
  }

  add(key: PlayerResourceKey, delta: number) {
    this.set(key, this.resources[key] + delta);
  }

  spend(key: PlayerResourceKey, amount: number) {
    const cost = Math.max(0, Math.floor(amount));
    if (this.resources[key] < cost) return false;
    this.set(key, this.resources[key] - cost);
    return true;
  }
}

export const PlayerResources = new PlayerResourcesStore();
