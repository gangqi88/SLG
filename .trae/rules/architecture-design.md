---
alwaysApply: false
description: 基于编码标准规范的前置条件，本规范在检测到架构设计相关代码时智能生效，确保统一的架构设计实践。
---
# 架构设计规范

## 1. 前后端系统分离

### 前端职责 (React + Phaser)
- **UI 渲染**: React 组件负责游戏界面 UI
- **游戏渲染**: Phaser 3 负责画面绘制和动画
- **本地逻辑**: 客户端计算、状态管理、输入处理
- **数据缓存**: localStorage 缓存、游戏数据持久化

### 后端预留 (为联机同步做技术储备)
- **数据校验**: 所有前端计算结果需在后端校验
- **状态同步**: 战斗结果、資源变化需服务器确认
- **防作弊**: 关键数值在后端计算，前端仅做展示

### 分离原则
```typescript
// 前端：本地计算 + 预测
const battleResult = battleSystem.calculateDamage(context);
// 发送至服务器校验
api.verifyBattleResult(battleResult);

// 后端：权威计算
function verifyBattle(ctx) {
  // 重新计算，验证前端结果
  const serverResult = calculateDamage(ctx);
  return serverResult === clientResult;
}
```

## 2. TypeScript 性能规范

### 类型安全与性能的平衡
- **严格类型**: 使用 `strict: true`，避免 `any`
- **类型推导**: 优先使用类型推导，减少显式类型标注
- **泛型约束**: 使用泛型避免代码重复

### 运行性能优化
- **避免热路径装箱**: 减少基础类型与包装类型转换
```typescript
// 不推荐
const values: (number | string)[] = [1, 2, '3'];
values.map(v => Number(v) * 2);

// 推荐
const values: number[] = [1, 2, 3];
values.map(v => v * 2);
```

- **对象池模式**: 频繁创建的对象使用对象池
```typescript
class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void) {
    this.factory = factory;
    this.reset = reset;
  }

  acquire(): T {
    return this.pool.pop() ?? this.factory();
  }

  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }
}
```

- **避免深度嵌套**: 扁平化数据结构，减少内存访问层级

### 编译性能优化
- **模块化导入**: 仅导入需要的类型和函数
```typescript
// 不推荐
import { HeroSystem } from './systems';

// 推荐
import { HeroSystem } from './systems/HeroSystem';
```
- **启用项目引用**: 大型项目使用 TypeScript project references

## 3. 联机同步技术储备

### 状态同步策略
- **乐观更新**: 本地先执行，后与服务器同步
- **状态回滚**: 服务器校验失败时回滚本地状态
- **增量同步**: 仅同步变化的状态数据

### 战斗同步方案
```typescript
interface BattleFrame {
  frameId: number;
  timestamp: number;
  actions: BattleAction[];
  serverHash?: string;
}

interface BattleState {
  version: number;
  frame: BattleFrame;
  entities: EntityState[];
}

// 帧同步：每个操作都是确定性的
function applyBattleAction(state: BattleState, action: BattleAction): BattleState {
  // 本地计算
  const newState = calculateNextFrame(state, action);
  // 发送给服务器
  syncToServer(newState);
  return newState;
}
```

### 网络延迟处理
- **预测插值**: 本地预测移动，服务器确认后修正
- **延迟补偿**: 客户端显示延迟补偿效果
- **断线重连**: 缓存关键帧，支持断线重连

### 数据结构预留
```typescript
// 预留联机标识
interface Syncable {
  id: string;
  version: number;
  lastSyncTime: number;
  checksum: string;
}

// 预留玩家标识
interface Player {
  id: string;
  isLocal: boolean;
  syncState: 'synced' | 'pending' | 'conflict';
}
```

## 4. 性能监控与瓶颈识别

### 关键指标监控
- **FPS**: 游戏帧率，目标 60fps
- **内存**: 堆内存使用，避免频繁 GC
- **网络延迟**: RTT 延迟监控
- **渲染耗时**: 每帧渲染时间

### 性能瓶颈定位
- **React 渲染**: 使用 React DevTools Profiler
- **Phaser 性能**: 使用 Phaser WebGL 统计
- **网络请求**: 合并请求，减少 HTTP 开销

### 优化优先级
1. 首屏加载 < 3秒
2. 交互响应 < 100ms
3. 战斗计算 < 16ms (60fps)
4. 网络同步 < 200ms

## 5. 模块化架构

### 目录结构规范
```
src/
├── components/     # React UI（纯展示层）
├── systems/        # 游戏逻辑（可复用）
├── services/       # 外部服务封装
├── hooks/          # React Hooks
├── types/         # 类型定义
├── utils/         # 工具函数
└── api/          # 后端 API 接口（预留）
```

### 依赖方向
- systems → types ← components
- components → hooks → services
- api → services → systems
