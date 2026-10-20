import {
  getNpcAlliance,
  getNpcAllianceOrNull,
  NPC_ENEMY_ALLIANCE_ID,
} from '@/features/alliance/config/npcAlliances';

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
const STORAGE_VERSION = 2;

type Persisted = {
  version?: number;
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
    ownerAllianceId: null,
    ownerAllianceName: null,
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
    ownerAllianceId: NPC_ENEMY_ALLIANCE_ID,
    ownerAllianceName: getNpcAlliance(NPC_ENEMY_ALLIANCE_ID).name,
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
    ownerAllianceId: null,
    ownerAllianceName: null,
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
    ownerAllianceId: NPC_ENEMY_ALLIANCE_ID,
    ownerAllianceName: getNpcAlliance(NPC_ENEMY_ALLIANCE_ID).name,
  },
];

const clampInt = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.floor(v)));

/**
 * 全局唯一的「当前秒」口径。
 * 快照 / 单城查询 / 攻城结算三处防御值计算都必须用它，否则会出现
 * 「地图按缓存显示、宣战弹窗按现算显示」的跨页面数值不一致。
 */
const currentSec = () => Math.floor(Date.now() / 1000);

const computeDefenseAt = (s: CityDefenseState, nowMs: number) => {
  if (!s.repairFromMs || !s.repairToMs)
    return { cur: clampInt(s.cur, 0, s.max), repairing: false, remainingMs: 0 };
  if (nowMs >= s.repairToMs) return { cur: s.max, repairing: false, remainingMs: 0 };
  const dur = Math.max(1, s.repairToMs - s.repairFromMs);
  const p = (nowMs - s.repairFromMs) / dur;
  const next = s.cur + (s.max - s.cur) * p;
  return { cur: clampInt(next, 0, s.max), repairing: true, remainingMs: s.repairToMs - nowMs };
};

const normalizeOwner = (ownerAllianceId: string | null, ownerAllianceName: string | null) => {
  if (!ownerAllianceId) return { ownerAllianceId: null, ownerAllianceName: null };
  const npc = getNpcAllianceOrNull(ownerAllianceId);
  if (npc) return { ownerAllianceId: npc.id, ownerAllianceName: npc.name };
  return { ownerAllianceId, ownerAllianceName: ownerAllianceName ?? '未知联盟' };
};

class WorldMapStore {
  private listeners: Set<Listener> = new Set();

  /**
   * 唯一可变状态。对外只暴露只读 getter，使得「忘记失效」变成编译错误：
   * 任何绕过 commit() 直接给 cities 赋值都会触发 TS2540（read-only property），
   * 而 commit() 一定同时递增版本号。
   */
  private _cities: WorldCity[] = baseCities;

  private get cities(): WorldCity[] {
    return this._cities;
  }

  /** 状态变更次数。缓存失效跟着「状态变更」走，不跟着「落盘」走。 */
  private version = 0;

  /**
   * 快照缓存。null 表示「尚未计算」——用一个显式状态表示未初始化，
   * 而不是靠 cachedSec/cachedVersion 的哨兵值（哨兵依赖"必须小于任何合法值"
   * 这种只能靠人记住的约定）。
   */
  private cached: WorldCity[] | null = null;
  private cachedSec = 0;
  private cachedVersion = 0;

  constructor() {
    this.load();
  }

  /** 唯一写入口：赋值 + 递增版本号，一步完成，无法遗漏。 */
  private commit(next: WorldCity[]) {
    this._cities = next;
    this.version += 1;
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
      this.commit(
        baseCities.map((c) => {
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
          const normalized = normalizeOwner(ownerAllianceId, ownerAllianceName);
          return { ...c, ...normalized, defenseState };
        }),
      );

      if ((parsed?.version ?? 1) < STORAGE_VERSION) {
        this.save();
      }
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
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, owners, defense } satisfies Persisted),
    );
  }

  /** 单城的「某秒视图」——所有对外暴露的防御值都经过它，避免多口径分裂。 */
  private computeCity(city: WorldCity, sec: number): WorldCity {
    const computed = computeDefenseAt(city.defenseState, sec * 1000);
    return { ...city, defenseState: { ...city.defenseState, cur: computed.cur } };
  }

  private computeAll(sec: number): WorldCity[] {
    return this.cities.map((c) => this.computeCity(c, sec));
  }

  /**
   * useSyncExternalStore 的契约：状态未变时必须返回同一引用，否则无限重渲
   * （/alliance 曾因此在「创建联盟成功」那一帧整页崩）。
   *
   * 缓存键 = (秒, 版本号)：
   * · 秒负责时间推进（修复中的防御值需要随时间变化）
   * · 版本号负责「同一秒内发生了写」——只按秒会让攻城结算的 before/after
   *   命中同一缓存对象，战报显示「城防伤害 0」。
   *
   * 已知良性行为：跨秒边界可能多触发一次 re-render（render 阶段取到 S 秒快照、
   * layout effect 检查时已到 S+1）。一次即收敛；若观察到 >1 次/秒，那才是回归。
   * computeDefenseAt 内部经 clampInt 取整，1 秒粒度足够，不会让防御值失真。
   */
  getSnapshot(): WorldCity[] {
    const sec = currentSec();
    const cur = this.cached;
    if (cur === null || sec !== this.cachedSec || this.version !== this.cachedVersion) {
      const next = this.computeAll(sec);
      this.cached = next;
      this.cachedSec = sec;
      this.cachedVersion = this.version;
      return next;
    }
    return cur;
  }

  /** 从同一份快照里取，消除第二条计算口径（世界地图与宣战/攻城页必须一致）。 */
  getCityById(cityId: string): WorldCity | null {
    return this.getSnapshot().find((c) => c.id === cityId) ?? null;
  }

  setOwner(cityId: string, ownerAllianceId: string | null, ownerAllianceName: string | null) {
    const idx = this.cities.findIndex((c) => c.id === cityId);
    if (idx < 0) return;
    const prev = this.cities[idx];
    const normalized = normalizeOwner(ownerAllianceId, ownerAllianceName);
    const next: WorldCity = { ...prev, ...normalized };
    this.commit([...this.cities.slice(0, idx), next, ...this.cities.slice(idx + 1)]);
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
    // 与 getSnapshot()/getCityById() 共用同一时间口径与同一计算入口，
    // 否则会出现「结算按现算扣血、地图按缓存显示」的分裂。
    const sec = currentSec();
    const nowMs = sec * 1000;
    const curBefore = this.computeCity(prev, sec).defenseState.cur;
    const max = prev.defenseState.max;
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
      defenseState = { max, cur, repairFromMs: nowMs, repairToMs: nowMs + durMs };
    }

    const normalized = normalizeOwner(ownerAllianceId, ownerAllianceName);
    const next: WorldCity = { ...prev, ...normalized, defenseState };
    this.commit([...this.cities.slice(0, idx), next, ...this.cities.slice(idx + 1)]);
    this.save();
    this.emit();
    return true;
  }

  reset() {
    this.commit(baseCities);
    this.save();
    this.emit();
  }
}

export const WorldMap = new WorldMapStore();
