---
alwaysApply: false
description: 基于编码标准规范的前置条件，本规范在检测到游戏设计相关代码时智能生效，确保统一的游戏设计实践。
---
# 游戏设计规范

## 1. 游戏类型定义

### 1.1 《无尽冬日》扩展模式
本项目为《无尽冬日》末日生存模拟经营游戏的扩展，新增SLG英雄策略系统。保留原有生存模拟核心，同时融入英雄收集、阵营对抗、战斗策略等SLG元素。

### 1.2 核心玩法融合
- **生存模拟**：资源管理、建筑建造、幸存者管理（保留）
- **英雄SLG**：英雄收集、阵营克制、战斗策略（新增）
- **Web3经济**：NFT英雄、链上资产、代币经济（扩展）

## 2. 核心规则体系

### 2.1 阵营与克制规则

#### 阵营特点
- **人族**：均衡、内政、发育、守城
  - 主城风格：中式古典、青砖黛瓦、农田工坊、旌旗林立
  - 兵种：步兵、弓兵、轻骑兵、工程器械
  - 色调：青、灰、金、红

- **天使**：治疗、护盾、净化、防御
  - 主城风格：圣光神殿、云中城堡、水晶尖塔、天使雕像
  - 兵种：圣光使徒、守护天使、审判骑士、圣歌祭司
  - 色调：金、白、蓝、银

- **恶魔**：爆发、吸血、破甲、掠夺、攻城
  - 主城风格：黑曜石、暗焰、血纹、狰狞雕像
  - 兵种：魔化战士、暗翼恶魔、炎魔、噬魂者
  - 色调：黑、红、紫、暗金

#### 伤害克制规则
```typescript
// 阵营克制加成
const FACTION_BONUS = {
  'demon->human': 0.25,   // 恶魔 → 人族 +25%
  'human->angel': 0.20,   // 人族 → 天使 +20%
  'angel->demon': 0.30,   // 天使 → 恶魔 +30%
}
```

### 2.2 英雄品质体系

#### 品质等级
- **紫将**：精英品质，基础英雄
- **橙将**：史诗品质，稀有英雄
- **红将**：传说品质，最高品质

#### 星级成长规则
```typescript
// 星级属性成长倍数
const STAR_MULTIPLIERS = {
  1: 1.00,    // 1星：基础100%
  2: 1.10,    // 2星：属性+10%
  3: 1.20,    // 3星：属性+20%
  4: 1.35,    // 4星：属性+35%
  5: 1.50,    // 5星：属性+50%
}

// 红将满星额外加成
const RED_STAR_5_BONUS = 1.20;  // 主动技能效果额外+20%
```

### 2.3 英雄属性系统

#### 基础属性
- **统御**：带兵上限，影响出兵力
- **武力**：物理伤害能力
- **谋略**：技能伤害/治疗效果
- **防御**：伤害减免能力

#### 属性范围
```typescript
interface HeroAttributes {
  command: number;  // 统御：20-100
  strength: number; // 武力：20-100
  strategy: number; // 谋略：20-100
  defense: number;  // 防御：20-100
}
```

### 2.4 战斗配置规则

#### 队伍构成
- **单队配置**：主将1名 + 副将2名
- **最大出征**：最多3队同时出征
- **兵力限制**：基于主将统御值计算

#### 战斗流程
1. 阵营克制检查（计算伤害加成）
2. 技能冷却判定
3. 伤害计算
4. 治疗计算
5. 士气影响
6. 战斗结果结算

### 2.5 技能冷却标准

#### 冷却时间规则
```typescript
// 技能冷却时间（秒）
const SKILL_COOLDOWNS = {
  purple: { min: 15, max: 20 },    // 紫将：15-20秒
  orange: { min: 12, max: 18 },    // 橙将：12-18秒
  red: { min: 8, max: 15 },        // 红将：8-15秒
}

// 特殊技能限制
const SPECIAL_SKILL_LIMITS = {
  revive: 'once_per_battle',       // 复活类：全场仅限1次
  invincible: 'once_per_battle',   // 无敌类：全场仅限1次
}
```

### 2.6 数值平衡公式

#### 伤害计算
```typescript
// 普攻伤害计算
function calculateNormalDamage(strength: number, targetDefense: number): number {
  return strength * 0.8 * (1 - getDefenseReduction(targetDefense));
}

// 技能伤害计算
function calculateSkillDamage(strategy: number, skillMultiplier: number): number {
  return strategy * skillMultiplier;
}

// 治疗量计算
function calculateHealing(strategy: number): number {
  return strategy * 1.2;
}

// 防御减免计算
function getDefenseReduction(defense: number): number {
  return defense / (defense + 200);
}
```

#### 暴击规则
```typescript
// 暴击基础数值
const CRITICAL_BASE = 0.05;          // 基础暴击率：5%
const CRITICAL_DAMAGE = 1.50;         // 暴击伤害：150%

// 暴击上限
const CRITICAL_RATE_MAX = 0.60;      // 暴击率上限：60%
const CRITICAL_DAMAGE_MAX = 3.00;    // 暴击伤害上限：300%
```

#### 士气系统
```typescript
// 士气系统规则
const MORALE_MIN = 0.30;             // 士气最低保留：30%
const MORALE_EFFECTS = {
  high: { attack: 1.15, defense: 1.10 },  // 高士气：攻击+15%，防御+10%
  medium: { attack: 1.00, defense: 1.00 }, // 中士气：无加成
  low: { attack: 0.85, defense: 0.90 },    // 低士气：攻击-15%，防御-10%
}
```

## 3. 英雄数据结构规范

### 3.1 英雄基础数据
```typescript
interface Hero {
  id: string;                // 唯一标识
  name: string;              // 英雄名称
  faction: 'human' | 'angel' | 'demon';  // 阵营
  quality: 'purple' | 'orange' | 'red';  // 品质
  rarity: number;            // 稀有度 1-100
  stars: number;             // 星级 1-5
  
  // 基础属性
  attributes: HeroAttributes;
  
  // 成长属性
  growthRates: {
    command: number;         // 统御成长率
    strength: number;        // 武力成长率
    strategy: number;        // 谋略成长率
    defense: number;         // 防御成长率
  };
  
  // 满级属性（80级）
  maxLevelAttributes: HeroAttributes;
  
  // 技能系统
  activeSkill: Skill;        // 主动技能
  passiveSkill: Skill;       // 被动技能
  talent: Skill;             // 天赋技能
  
  // 羁绊系统
  bonds: Bond[];             // 羁绊关系
  bondActive: boolean;       // 羁绊是否激活
  
  // 装备系统
  equipment: {
    weapon?: Equipment;      // 武器
    armor?: Equipment;       // 护甲
    accessory?: Equipment;   // 饰品
  };
  
  // NFT属性
  nftId?: string;            // NFT ID（如果为NFT英雄）
  tokenId?: string;          // 代币ID
  isNFT: boolean;            // 是否为NFT英雄
  
  // 游戏状态
  level: number;             // 当前等级（1-80）
  experience: number;       // 经验值
  assignedTeam?: string;     // 分配的队伍ID
  position?: 'main' | 'sub'; // 主将或副将位置
  status: 'idle' | 'deployed' | 'injured'; // 状态
}
```

### 3.2 技能系统数据结构
```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'active' | 'passive' | 'talent';
  
  // 技能效果
  effects: SkillEffect[];
  
  // 技能属性
  cooldown?: number;         // 冷却时间（秒）
  manaCost?: number;         // 魔力消耗
  range?: number;            // 施法范围
  duration?: number;         // 持续时间
  
  // 升级效果
  levels: SkillLevel[];
  
  // 特殊标签
  tags: string[];            // 技能标签
}

interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'special';
  value: number;             // 效果数值
  target: 'self' | 'ally' | 'enemy' | 'all';
  condition?: string;        // 触发条件
}

interface SkillLevel {
  level: number;
  effect: string;
  description: string;
  cooldown?: number;
}
```

### 3.3 阵营羁绊系统
```typescript
interface Bond {
  id: string;
  name: string;
  description: string;
  
  // 羁绊成员
  heroes: string[];          // 英雄ID列表
  
  // 羁绊效果
  effects: BondEffect[];
  
  // 激活条件
  activationCondition: {
    requiredStars: number;   // 所需总星级
    requiredLevel: number;   // 所需最低等级
  };
}

interface BondEffect {
  attribute: keyof HeroAttributes;
  bonus: number;             // 加成百分比
  condition?: string;        // 触发条件
}
```

## 4. 战斗系统设计规范

### 4.1 战斗流程
```typescript
interface BattleSystem {
  // 战斗初始化
  initializeBattle(attackerTeam: Team, defenderTeam: Team): Battle;
  
  // 战斗执行
  executeBattle(battle: Battle): BattleResult;
  
  // 技能释放判定
  checkSkillRelease(hero: Hero, battle: Battle): boolean;
  
  // 伤害计算
  calculateDamage(attacker: Hero, defender: Hero): DamageResult;
  
  // 治疗计算
  calculateHealing(healer: Hero, target: Hero): number;
  
  // 战斗结果
  settleBattle(battle: Battle): BattleResult;
}
```

### 4.2 队伍配置
```typescript
interface Team {
  id: string;
  name: string;
  owner: string;              // 所有者ID
  
  // 队伍成员（最多3人）
  members: TeamMember[];
  
  // 队伍属性
  faction: 'human' | 'angel' | 'demon';
  power: number;              // 战斗力
  morale: number;             // 士气值
  
  // 队伍加成
  bonuses: {
    factionBonus: number;     // 阵营加成
    bondBonus: number;        // 羁绊加成
    equipmentBonus: number;   // 装备加成
  };
}

interface TeamMember {
  heroId: string;
  position: 'main' | 'sub';  // 主将或副将
  isActive: boolean;         // 是否出战
  currentHealth: number;     // 当前生命值
  buffs: Buff[];              // 增益效果
  debuffs: Debuff[];          // 减益效果
}
```

## 5. 商业化与养成体系

### 5.1 英雄获取途径
```typescript
const HERO_ACQUISITION = {
  purple: {
    sources: ['任务', '普通商店', '普通招募'],
    probability: 0.60,       // 60%概率
  },
  orange: {
    sources: ['高级招募', '联盟兑换', '限时活动'],
    probability: 0.35,       // 35%概率
  },
  red: {
    sources: ['限定卡池', '赛季奖励', '巅峰竞技场'],
    probability: 0.05,        // 5%概率
  }
}
```

### 5.2 进阶材料
```typescript
const EVOLUTION_MATERIALS = {
  'purple_to_orange': {
    heroSoul: 800,           // 将魂×800
  },
  'orange_to_red': {
    heroSoul: 2000,          // 将魂×2000
    factionCore: 100,        // 种族核心×100
  },
  'max_stars': {
    duplicateCard: 5,        // 同名卡×5
  }
}
```

### 5.3 赛季节奏
```typescript
const SEASON_SCHEDULE = {
  season1: {
    name: '人族赛季',
    theme: '开荒发育',
    duration: 30,            // 30天
    bonuses: ['资源产量+20%', '建造速度+15%'],
  },
  season2: {
    name: '天使赛季',
    theme: '团战对抗',
    duration: 30,
    bonuses: ['治疗效果+25%', '防御+15%'],
  },
  season3: {
    name: '恶魔赛季',
    theme: '掠夺攻城',
    duration: 30,
    bonuses: ['攻击力+20%', '掠夺收益+30%'],
  },
}
```

## 6. 美术与特效规范

### 6.1 三族视觉风格
```typescript
const FACTION_VISUAL_STYLES = {
  human: {
    colors: ['青', '灰', '金', '红'],
    effects: ['土', '木', '金', '军令', '医疗绿光'],
    style: '写实、厚重、中式军阵',
  },
  angel: {
    colors: ['金', '白', '浅蓝'],
    effects: ['圣光', '翅膀', '护盾', '治愈', '雷电'],
    style: '神圣、庄严、华丽',
  },
  demon: {
    colors: ['黑', '红', '紫', '暗金'],
    effects: ['火焰', '暗影', '血光', '恐惧', '爆破'],
    style: '狰狞、狂暴、暗黑',
  }
}
```

### 6.2 技能特效规范
```typescript
interface SkillEffectSpec {
  id: string;
  name: string;
  
  // 视觉效果
  visualEffects: {
    particles: ParticleEffect[];
    lighting: LightingEffect[];
    animation: AnimationEffect[];
  };
  
  // 音效
  soundEffects: {
    cast: string;             // 施法音效
    impact: string;           // 命中音效
    loop?: string;            // 循环音效
  };
  
  // 性能优化
  performance: {
    maxParticles: number;     // 最大粒子数
    lodLevels: number;        // LOD级别
    batchable: boolean;       // 是否可批处理
  };
}
```

## 7. Web3集成规范

### 7.1 NFT英雄标准
```typescript
interface NFTHero {
  tokenId: string;            // 代币ID
  contractAddress: string;   // 合约地址
  chain: 'fractal_mainnet' | 'fractal_testnet';
  
  // NFT元数据
  metadata: {
    name: string;
    description: string;
    image: string;            // 英雄图片URL
    attributes: NFTAttribute[];
  };
  
  // 游戏属性映射
  gameHeroId: string;         // 对应游戏内英雄ID
  mintDate: Date;             // 铸造日期
  lastTransfer: Date;         // 最后转移时间
}

interface NFTAttribute {
  trait_type: string;         // 属性类型
  value: string | number;     // 属性值
  rarity: number;             // 稀有度 1-100
}
```

### 7.2 英雄NFT铸造规范
```typescript
const HERO_NFT_MINTING = {
  // 铸造费用（FB聪）
  mintingCost: {
    purple: 1000,             // 紫将：1000聪
    orange: 5000,             // 橙将：5000聪
    red: 20000,               // 红将：20000聪
  },
  
  // 铸造限制
  mintingLimits: {
    daily: 10,                // 每日限制10次
    weekly: 50,               // 每周限制50次
    monthly: 200,             // 每月限制200次
  },
  
  // 铸造概率
  mintingProbability: {
    purple: 0.70,             // 70%概率紫将
    orange: 0.25,             // 25%概率橙将
    red: 0.05,               // 5%概率红将
  },
}
```

## 8. 性能优化规范

### 8.1 英雄系统性能优化
```typescript
// 英雄数据缓存策略
const HERO_CACHE_STRATEGY = {
  // 本地缓存
  localStorage: {
    maxSize: 100,            // 最大缓存英雄数
    ttl: 3600000,            // 缓存时间：1小时
  },
  
  // 内存缓存
  memoryCache: {
    maxSize: 50,             // 内存最大缓存数
    strategy: 'LRU',         // 缓存策略：最近最少使用
  },
  
  // 服务器缓存
  serverCache: {
    ttl: 300000,             // 服务器缓存：5分钟
    strategy: 'CDN',         // CDN分发
  },
}
```

### 8.2 战斗系统性能优化
```typescript
// 战斗计算优化
const BATTLE_PERFORMANCE = {
  // 战斗模拟优化
  simulation: {
    maxBattlesPerFrame: 5,   // 每帧最大战斗数
    batchSize: 10,           // 批处理大小
    useWebWorkers: true,     // 使用Web Workers
  },
  
  // 技能效果优化
  skillEffects: {
    poolSize: 100,           // 对象池大小
    maxParticles: 50,        // 最大粒子数
    lodDistance: 1000,       // LOD距离
  },
  
  // UI更新优化
  uiUpdate: {
    throttleMs: 100,         // UI更新节流：100ms
    batchUpdates: true,      // 批量更新
    useVirtualList: true,    // 使用虚拟列表
  },
}
```

## 9. 安全规范

### 9.1 英雄数据安全
```typescript
// 英雄数据验证
const HERO_DATA_VALIDATION = {
  // 客户端验证
  clientSide: {
    attributeRanges: {
      command: { min: 20, max: 100 },
      strength: { min: 20, max: 100 },
      strategy: { min: 20, max: 100 },
      defense: { min: 20, max: 100 },
    },
    levelRange: { min: 1, max: 80 },
    starRange: { min: 1, max: 5 },
  },
  
  // 服务器验证
  serverSide: {
    checksumValidation: true,
    timestampValidation: true,
    signatureValidation: true,
  },
}
```

### 9.2 Web3安全规范
```typescript
// NFT交易安全
const NFT_SECURITY = {
  // 交易验证
  transactionValidation: {
    checkOwnership: true,    // 检查所有权
    checkApproval: true,     // 检查授权
    checkBalance: true,      // 检查余额
    checkGasLimit: true,     // 检查Gas限制
  },
  
  // 合约交互安全
  contractInteraction: {
    useMultiSig: true,       // 使用多签钱包
    timeLock: 86400,         // 24小时时间锁
    emergencyPause: true,    // 紧急暂停功能
  },
}
```

## 10. 测试规范

### 10.1 英雄系统测试
```typescript
// 单元测试覆盖率要求
const HERO_TEST_COVERAGE = {
  unitTests: 0.90,           // 单元测试覆盖率：90%
  integrationTests: 0.80,    // 集成测试覆盖率：80%
  e2eTests: 0.70,           // 端到端测试覆盖率：70%
}

// 关键测试场景
const HERO_TEST_SCENARIOS = {
  // 英雄升级
  heroLevelUp: [
    'normal_level_up',
    'max_level_reached',
    'insufficient_exp',
  ],
  
  // 英雄进化
  heroEvolution: [
    'purple_to_orange',
    'orange_to_red',
    'insufficient_materials',
  ],
  
  // 羁绊系统
  bondSystem: [
    'bond_activation',
    'bond_deactivation',
    'multiple_bonds',
  ],
}
```

### 10.2 战斗系统测试
```typescript
// 战斗系统测试场景
const BATTLE_TEST_SCENARIOS = {
  // 基础战斗
  basicBattle: [
    'normal_damage_calculation',
    'skill_damage_calculation',
    'healing_calculation',
  ],
  
  // 阵营克制
  factionAdvantage: [
    'demon_vs_human',
    'human_vs_angel',
    'angel_vs_demon',
  ],
  
  // 特殊情况
  specialCases: [
    'critical_hit',
    'skill_dodge',
    'battle_timeout',
  ],
}
```

---
*文档版本: 1.0.0*  
*最后更新: 2026年2月*  
*适用游戏: 《无尽冬日》扩展模式*