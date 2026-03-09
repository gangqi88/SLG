# 架构设计规范技能

> 本技能定义Web3 SLG游戏项目的系统架构、技术选型、性能规划和数据结构设计规范。

## 技能概述

- **职责**: 架构设计 - 系统架构、技术选型、性能规划、数据结构设计
- **适用场景**: 游戏系统架构设计、技术方案评估、性能优化
- **技术栈**: React 19 + TypeScript 5.7 + Phaser 3.90 + Web3

## 技能职责

### 核心职责

架构设计技能负责以下工作：

- 设计游戏系统整体架构
- 评估和选择技术方案
- 制定性能优化策略
- 设计数据结构和数据流
- 定义模块接口和边界
- 制定技术规范和标准

### 职责边界

| 包含 | 不包含 |
|------|--------|
| 系统架构设计 | 具体代码实现 |
| 技术选型决策 | 美术资源制作 |
| 性能规划 | 测试用例编写 |
| 数据结构设计 | 项目日常管理 |

## 系统架构设计

### 整体架构

游戏采用分层架构设计：

```
┌─────────────────────────────────────────────┐
│              Presentation Layer              │  ← React UI组件
│         (UI渲染、用户交互、状态管理)         │
├─────────────────────────────────────────────┤
│              Game Engine Layer              │  ← Phaser游戏引擎
│         (游戏场景、渲染、物理、动画)          │
├─────────────────────────────────────────────┤
│              Business Logic Layer           │  ← 游戏系统服务
│      (英雄系统、战斗系统、资源系统)          │
├─────────────────────────────────────────────┤
│                Data Layer                   │  ← 数据管理
│         (数据持久化、本地存储、缓存)          │
├─────────────────────────────────────────────┤
│               Web3 Layer                   │  ← Web3集成
│        (钱包连接、NFT、链上交互)            │
└─────────────────────────────────────────────┘
```

### 模块划分

| 模块 | 职责 | 依赖 |
|------|------|------|
| UI模块 | React组件渲染 | 游戏状态 |
| 游戏引擎 | Phaser场景管理 | 渲染资源 |
| 业务系统 | 游戏逻辑处理 | 数据层 |
| 数据层 | 状态持久化 | Web3层 |
| Web3层 | 区块链交互 | 无 |

## 技术选型规范

### 技术选型原则

- **适用性**：选择适合项目需求的技术
- **成熟度**：选择社区活跃、稳定可靠的技术
- **性能**：考虑性能表现和优化空间
- **生态**：考虑生态完善度和学习成本
- **团队**：考虑团队技术储备

### 技术栈选择

| 层级 | 技术 | 选择理由 |
|------|------|----------|
| 前端框架 | React 19 | 组件化、生态完善 |
| 游戏引擎 | Phaser 3.90 | 2D游戏首选 |
| 语言 | TypeScript 5.7 | 类型安全、生态完善 |
| 构建工具 | Vite 6 | 快速构建、热更新 |
| 状态管理 | 组件状态 + Context | 轻量级需求 |
| Web3 | UniSat API | Fractal Bitcoin首选 |

### 技术评估流程

```
需求分析 → 技术调研 → 方案对比 → 团队评审 → 技术选型 → 实践验证
```

## 性能规划

### 性能目标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 首屏加载 | < 3秒 | 首次访问完整加载 |
| 交互响应 | < 100ms | 用户操作响应时间 |
| 战斗计算 | < 16ms | 每帧计算时间（60fps） |
| 内存占用 | < 500MB | 正常运行内存 |

### 性能优化策略

#### 加载优化

- 资源按需加载
- 代码分割
- 资源压缩
- CDN加速

#### 运行时优化

- 对象池复用
- 避免每帧创建对象
- 合理使用缓存
- 减少重绘重排

#### 内存优化

- 及时释放资源
- 合理数据结构
- 内存泄漏检测

### 性能监控

```typescript
// 性能监控示例
class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  
  startMeasure(name: string) {
    performance.mark(`${name}-start`);
  }
  
  endMeasure(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    const measure = performance.getEntriesByName(name)[0];
    this.metrics.set(name, measure.duration);
    
    if (measure.duration > 16) {
      console.warn(`Performance warning: ${name} took ${measure.duration}ms`);
    }
  }
  
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}
```

## 数据结构设计

### 数据设计原则

- **范式化**：减少数据冗余
- **可扩展**：便于功能扩展
- **类型安全**：使用TypeScript强类型
- **可序列化**：便于持久化

### 核心数据结构

#### 英雄数据

```typescript
// 英雄基础数据
interface Hero {
  id: string;
  name: string;
  quality: HeroQuality;
  faction: Faction;
  level: number;
  starLevel: number;
  attributes: HeroAttributes;
  skills: Skill[];
  equipment: Equipment[];
  createdAt: number;
  updatedAt: number;
}

type HeroQuality = 'purple' | 'orange' | 'red';
type Faction = 'human' | 'angel' | 'demon';

interface HeroAttributes {
  command: number;    // 统御
  strength: number;   // 武力
  intelligence: number; // 谋略
  defense: number;   // 防御
}
```

#### 战斗数据

```typescript
// 战斗数据结构
interface BattleState {
  id: string;
  type: BattleType;
  teams: BattleTeam[];
  round: number;
  status: BattleStatus;
  startTime: number;
  endTime?: number;
}

type BattleType = 'pve' | 'pvp' | 'guild';
type BattleStatus = 'preparing' | 'fighting' | 'finished';
```

### 状态管理设计

```typescript
// 状态管理模式
interface GameState {
  resources: ResourceState;
  heroes: HeroState;
  battle: BattleState;
  ui: UIState;
}

interface ResourceState {
  wood: number;
  stone: number;
  food: number;
  gold: number;
}

interface UIState {
  currentScene: string;
  panels: Record<string, boolean>;
  notifications: Notification[];
}
```

## 模块接口设计

### 接口设计原则

- **单一职责**：接口职责明确
- **最小化**：接口尽量小
- **可扩展**：便于功能扩展
- **类型安全**：参数返回类型明确

### 模块交互示例

```typescript
// 英雄系统接口
interface IHeroSystem {
  getHero(id: string): Hero | undefined;
  getAllHeroes(): Hero[];
  createHero(config: CreateHeroConfig): Hero;
  upgradeHero(id: string, type: 'level' | 'star'): boolean;
  deleteHero(id: string): boolean;
}

// 战斗系统接口
interface IBattleSystem {
  startBattle(config: BattleConfig): BattleState;
  executeAction(action: BattleAction): BattleResult;
  endBattle(battleId: string): BattleResult;
}
```

## 技术规范

### 代码组织规范

```
src/
├── components/       # React UI组件
├── game/            # Phaser游戏引擎
│   ├── scenes/     # 游戏场景
│   ├── objects/   # 游戏对象
│   └── systems/   # 游戏系统
├── systems/         # 业务系统
│   ├── heroes/    # 英雄系统
│   ├── battle/    # 战斗系统
│   └── resources/ # 资源系统
├── types/           # TypeScript类型
├── hooks/           # 自定义Hooks
├── utils/           # 工具函数
├── config/          # 配置文件
└── web3/           # Web3集成
```

### 依赖管理

- 避免循环依赖
- 使用依赖注入
- 接口解耦
- 模块按需导入

## 与其他技能的协作

### 与代码规范技能协作

```markdown
协作点：
- 架构设计需要通过代码规范落地
- 代码实现需要遵循架构设计

引用：fullstack-code-standards/SKILL.md
```

### 与测试规范技能协作

```markdown
协作点：
- 架构设计需要考虑可测试性
- 性能测试验证架构效果

引用：game-tester/SKILL.md
```

### 与自动化工作流技能协作

```markdown
协作点：
- 构建流程需要适配架构设计
- 部署策略需要考虑系统结构

引用：automation-workflow/SKILL.md
```

---

*技能版本: 1.0.0*
*创建日期: 2026-03-06*
*相关文档: 
  - fullstack-code-standards/SKILL.md
  - game-tester/SKILL.md
  - automation-workflow/SKILL.md*
*遵守规范: .trae/rules/project-rules/SKILL.md*
