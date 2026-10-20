import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * #5 P0 回归守卫 —— WorldMap 快照引用稳定性 + 跨页面数值一致性
 *
 * 背景：已拥有联盟时进入 /alliance 即崩（Maximum update depth exceeded）。
 * 根因：getSnapshot() 每次 map 出新数组 + 新对象（还夹带 Date.now() 现算），
 *       交给 useSyncExternalStore 后快照永不相等 → 无限重渲。
 *
 * 修复要点（v8）：
 *   · commit() 单一写入口 + cities 只读 getter → 漏失效 = TS2540 编译错误
 *   · cached: WorldCity[] | null 表示未初始化（不用 -1 哨兵）
 *   · 缓存键 = (秒, 版本号)；失效跟着「状态变更」走（load/save 都走 commit）
 *
 * 断言成对存在（互为反向对照）：
 *   A  同刻两次 → Object.is 相等     抓「引用不稳」（当前 P0）
 *   B* 写入后   → 不相等             抓「缓存永不失效」
 * 单条绿都可以被某种退化解满足，只有成对绿才夹住不变量。
 *
 * 单例隔离：WorldMap 是「模块加载即构造」，且构造器内会 load()。
 * 因此一律用 vi.resetModules() + 用例内动态 import 取全新实例；
 * 不用 reset()（它自己走 commit 会 bump version，可能掩盖失效缺失）。
 */

const STORAGE_KEY = 'slg_world_map_v1';
const FROZEN_NOW = new Date('2026-01-01T00:00:00.000Z');

const loadWorldMap = async () => (await import('@/features/alliance/logic/WorldMap')).WorldMap;

const loadTestBridge = async () =>
  (await import('@/features/alliance/tests/TestOnlyWorldMap')).TestOnlyWorldMap;

describe('WorldMap.getSnapshot 契约', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_NOW);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    localStorage.clear();
  });

  // ── A：引用稳定性（当前未修复代码上必红） ──────────────────────────────
  it('A: 同一时刻连续两次 getSnapshot() 必须 Object.is 相等', async () => {
    const WorldMap = await loadWorldMap();

    const first = WorldMap.getSnapshot();
    const second = WorldMap.getSnapshot();

    expect(Object.is(first, second)).toBe(true);
  });

  // ── B1：写路径 1（setOwner）必须使快照失效 ─────────────────────────────
  it('B1: setOwner() 之后 getSnapshot() 必须返回不同快照', async () => {
    const WorldMap = await loadWorldMap();
    const before = WorldMap.getSnapshot();

    WorldMap.setOwner('c5', 'a9', 'A9');

    const after = WorldMap.getSnapshot();
    expect(after).not.toBe(before);
    expect(after.find((c) => c.id === 'c5')?.ownerAllianceId).toBe('a9');
  });

  // ── B2：写路径 2（applySiegeOutcome）必须使快照失效 ────────────────────
  // 与 B1 分开：setOwner 不碰 defenseState，applySiegeOutcome 会重写它。
  // 失效逻辑若有分支差异，只有 B2 能抓到。
  it('B2: applySiegeOutcome() 之后 getSnapshot() 必须返回不同快照', async () => {
    const WorldMap = await loadWorldMap();
    const before = WorldMap.getSnapshot();

    const ok = WorldMap.applySiegeOutcome({
      cityId: 'c5',
      winner: 'defender',
      attackerDamage: 1_800,
      defenseBeforeCur: WorldMap.getCityById('c5')?.defenseState.cur ?? 0,
    });

    expect(ok).toBe(true);
    const after = WorldMap.getSnapshot();
    expect(after).not.toBe(before);
  });

  // ── B3：失效不得依赖「落盘」 ───────────────────────────────────────────
  // localStorage 不可用时 save() 会早退。若失效点挂在 save() 的写盘分支上，
  // 这条必红。它是「失效跟着状态变更走、不跟着落盘走」的机检形式。
  it('B3: localStorage 不可用时，写操作仍必须使快照失效', async () => {
    const WorldMap = await loadWorldMap();
    const before = WorldMap.getSnapshot();

    vi.stubGlobal('localStorage', undefined);

    expect(() => WorldMap.setOwner('c5', 'a9', 'A9')).not.toThrow();

    const after = WorldMap.getSnapshot();
    expect(after).not.toBe(before);
    expect(after.find((c) => c.id === 'c5')?.ownerAllianceId).toBe('a9');
  });

  // ── C：值语义 + 时间推进 ──────────────────────────────────────────────
  it('C: 跨秒后防御值随修复进度变化，且同一秒内只算一次', async () => {
    const WorldMap = await loadWorldMap();
    WorldMap.applySiegeOutcome({
      cityId: 'c5',
      winner: 'defender',
      attackerDamage: 1_800,
      defenseBeforeCur: WorldMap.getCityById('c5')?.defenseState.cur ?? 0,
    });

    const t0 = WorldMap.getCityById('c5');
    const t0Again = WorldMap.getCityById('c5');
    // 同一秒内两次取值必须一致（否则等于「永远重算」，A 也就没意义）
    expect(t0Again?.defenseState.cur).toBe(t0?.defenseState.cur);

    vi.setSystemTime(new Date(FROZEN_NOW.getTime() + 10_000));
    const t10 = WorldMap.getCityById('c5');

    // 修复进度推进后，cur 必须变了（且只允许由时间推进引起一次变化）
    expect(t10?.defenseState.cur).not.toBe(t0?.defenseState.cur);

    const t10Again = WorldMap.getCityById('c5');
    expect(t10Again?.defenseState.cur).toBe(t10?.defenseState.cur);
  });

  // ── D：单城查询与全量快照必须同一口径（V-3 的单元级守卫） ──────────────
  it('D: getCityById() 与 getSnapshot() 中同一城池的防御值必须一致', async () => {
    const WorldMap = await loadWorldMap();
    WorldMap.applySiegeOutcome({
      cityId: 'c5',
      winner: 'defender',
      attackerDamage: 1_800,
      defenseBeforeCur: WorldMap.getCityById('c5')?.defenseState.cur ?? 0,
    });
    vi.setSystemTime(new Date(FROZEN_NOW.getTime() + 30_000));

    const fromSnapshot = WorldMap.getSnapshot().find((c) => c.id === 'c5');
    const fromGetter = WorldMap.getCityById('c5');

    expect(fromGetter?.defenseState.cur).toBe(fromSnapshot?.defenseState.cur);
  });

  // ── E：load() 路径必须失效，且不依赖 save() ────────────────────────────
  // 承重设计（勿简化）：
  //   1. import 必须早于 setItem —— 让首次 load() 落在空存储上（:160 早退）。
  //      若把 setItem 提到 import 之前，构造器内 load 已吃到数据，本条会恒绿。
  //   2. 第 1 条断言双重职责：建立缓存 + 夹具校准（证明「load 失效则下一条必红」）。
  //   3. version: 2 == STORAGE_VERSION → :188 的 save() 不触发，
  //      从而隔离出 load() 这一条失效路径。改成 1 测试仍绿，但会同时验 save()。
  it('E: 强制 load() 后快照必须反映新存档（即使 save() 未被触发）', async () => {
    const WorldMap = await loadWorldMap();
    const TestOnlyWorldMap = await loadTestBridge();

    // 承重断言①：建立缓存 + 夹具校准
    expect(WorldMap.getCityById('c5')?.ownerAllianceId).not.toBe('a9');

    // 承重夹具：version 2 使 save() 不触发，隔离出 load() 路径
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        owners: { c5: { ownerAllianceId: 'a9', ownerAllianceName: 'A9' } },
      }),
    );

    TestOnlyWorldMap.ensureMigrated();

    // 承重断言②：若 load() 未失效，仍命中上一个缓存，这里必红
    expect(WorldMap.getCityById('c5')?.ownerAllianceId).toBe('a9');
  });

  // ── G：V-8 的 store 层哨兵（UI 层未验证） ──────────────────────────────
  // 锁两件事：① 写操作之后**数值真的变了**（不是只换了个对象）
  //           ② 同一秒内再读**仍是同一对象**（引用稳定）
  // 与 D 的区别：D 锁「两条读路径一致」= 对象身份；G 锁「写后数值变化」。
  // 「对象不同但数值没变」是完全可能的（M2 变异即如此），D 抓不到那种情况。
  // 时间必须冻结：这是坑 2 成立的条件（同秒 → cachedSec 不变 → 只剩 version 能区分）。
  it('G: 攻城结算后同一秒内，防御数值必须随写操作变小', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        owners: {},
        defense: {
          c3: {
            max: 760,
            cur: 100,
            repairFromMs: FROZEN_NOW.getTime() - 5_000,
            repairToMs: FROZEN_NOW.getTime() + 55_000,
          },
        },
      }),
    );

    const WorldMap = await loadWorldMap();
    const before = WorldMap.getCityById('c3');
    const beforeCur = before?.defenseState.cur ?? -1;
    // 修复中：5s / 60s 的进度 → 已回到 100 以上
    expect(beforeCur).toBeGreaterThan(100);

    WorldMap.applySiegeOutcome({
      cityId: 'c3',
      winner: 'defender',
      attackerDamage: 500,
      defenseBeforeCur: WorldMap.getCityById('c3')?.defenseState.cur ?? 0,
    });

    const after = WorldMap.getCityById('c3');
    const afterCur = after?.defenseState.cur ?? -1;

    // a) 数值确实变小（守方胜 → 扣血）。同秒命中旧缓存时这里会相等而失败。
    expect(afterCur).toBeLessThan(beforeCur);
    // b) 对象身份也变了
    expect(Object.is(before, after)).toBe(false);
    // c) 同一秒内再读仍是同一对象（引用稳定）
    expect(Object.is(WorldMap.getCityById('c3'), after)).toBe(true);
  });
});
