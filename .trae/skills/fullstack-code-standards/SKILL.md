# 全栈开发代码规范技能

> 本技能定义React + TypeScript + Phaser全栈开发项目的代码编写规范、质量标准和最佳实践。

## 技能概述

- **职责**: 代码规范制定与执行 - 编码标准、质量管控、性能优化
- **适用场景**: Web3 SLG游戏全栈开发
- **技术栈**: React 19 + TypeScript 5.7 + Phaser 3.90 + Web3

## 代码质量原则

### 核心价值观

**可读性优先**：代码首先是写给人看的，其次才是给机器执行的。清晰的命名、合理的结构、适当的注释能够让团队成员快速理解代码意图，降低维护成本。

**简洁性追求**：优秀的代码往往简洁而不简单。每实现一个功能，应当问自己是否存在更简单的实现方式。避免过度设计和不必要的抽象。

**一致性维护**：在整个代码库中保持一致的编码风格。一致的命名规范、代码结构、错误处理方式能够让团队成员快速定位问题。

**性能意识**：开发者应当具备性能意识，了解代码的性能特征。在关键路径上避免不必要的对象创建、重复计算和阻塞操作。

## 统一治理落地

### 最小化变更

- 单次提交或合并请求只处理一类目标
- 修复问题不夹带重构，功能开发不顺带清理无关代码
- 优先增量改造，避免无边界重写

### 发布与开关

- 中高风险功能必须使用特性开关，实现部署与发布解耦
- 上线前必须给出灰度放量路径与关键观测指标
- 无观测项或无回滚路径的改动不得进入发布流程

### 兼容迁移策略

- 接口与数据结构调整必须同时满足读兼容与写兼容
- 数据库迁移遵循 Add -> Backfill -> Deploy -> Use -> Drop
- 删除字段或协议必须在全量迁移完成后执行

## TypeScript 编码规范

### 类型系统原则

TypeScript的静态类型系统是代码质量的重要保障。所有的函数参数、返回值、变量都应当有明确的类型声明。避免使用any类型。

接口和类型别名应当准确描述数据的结构。接口的命名应当使用PascalCase。类型断言应当谨慎使用，尽量依靠TypeScript的类型推断能力。

泛型是TypeScript强大的类型抽象工具。通过泛型可以创建可复用的组件和函数，同时保持类型安全。

```typescript
interface Hero {
  id: string;
  name: string;
  quality: 'purple' | 'orange' | 'red';
  faction: 'human' | 'angel' | 'demon';
  attributes: HeroAttributes;
  skills: Skill[];
}

function calculateHeroPower(hero: Hero, starLevel: number): number {
  const baseMultiplier = 1 + (starLevel - 1) * 0.1;
  const attributeSum = Object.values(hero.attributes).reduce((a, b) => a + b, 0);
  return Math.floor(attributeSum * baseMultiplier);
}
```

### 严格模式配置

项目的tsconfig.json必须启用严格模式。noUnusedLocals和noUnusedParameters应当设置为true。strictNullChecks应当启用。

可选链（?.）和空值合并（??）是处理可能为空值的利器。应当优先使用这些操作符。

## React 开发规范

### 组件设计原则

React组件应当遵循单一职责原则，每个组件只负责一个明确的功能。组件的命名应当使用PascalCase。组件文件应当保持较小的规模（建议不超过300行）。

函数组件配合Hooks是现代React开发的标准方式。Hooks应当在组件顶部声明。相关的状态逻辑可以使用自定义Hooks进行封装。自定义Hooks的命名应当以use为前缀。

### Hooks 使用规范

创建自定义Hooks时，应当遵循React的Hooks规则：只在顶层调用Hooks，不要在循环、条件或嵌套函数中调用。

useEffect Hook应当谨慎使用其依赖数组。依赖数组应当包含effect中使用的所有响应式值。

useMemo和useCallback是性能优化的重要工具，但不应滥用。只有在确实存在性能问题时才有必要使用。

```typescript
export function HeroCard({ hero, onSelect, isSelected = false }: HeroCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const power = useMemo(() => calculateHeroPower(hero, hero.starLevel), [hero]);

  useEffect(() => {
    return () => { /* 清理副作用 */ };
  }, [hero.id]);

  const handleClick = () => onSelect(hero.id);

  return (
    <div className={`hero-card ${isSelected ? 'selected' : ''}`} onClick={handleClick}>
      <h3>{hero.name}</h3>
      <p>战力: {power}</p>
    </div>
  );
}
```

## Phaser 游戏开发规范

### 游戏架构原则

Phaser游戏应当采用清晰的分层架构。游戏逻辑应当与渲染逻辑分离，数据层应当与表现层分离。游戏场景（Scene）应当保持简洁。

游戏对象（GameObject）应当采用组件化的设计模式。每个游戏对象由多个组件构成，每个组件负责特定的功能。

资源管理是Phaser游戏开发的重要环节。游戏资源应当在预加载阶段（preload）统一加载。纹理图集（Texture Atlas）应当合理规划。对于大量使用的资源，应当使用对象池（Object Pool）来复用对象。

### 性能优化要点

游戏性能优化的核心是减少每帧的计算量和渲染量。避免在update函数中进行复杂的计算和对象创建。

渲染优化包括减少Draw Call、优化纹理尺寸、使用遮挡剔除等技术。游戏应当设置目标帧率（通常是60fps）。

## Web3 开发规范

### 钱包集成标准

Web3钱包集成应当遵循统一的钱包抽象接口，便于支持多种钱包。钱包状态的变更应当通过事件或状态管理库进行传播。钱包操作的错误应当进行友好处理。

钱包签名操作应当明确告知用户将要签名的内容，避免产生安全风险。敏感操作应当有确认机制。

钱包API的调用应当处理好异步操作，包括连接、签名、交易等。加载状态、错误状态、成功状态应当清晰区分。

### 资产安全规范

链上资产的操作应当遵循最小权限原则，只请求必要的权限。资产转移等敏感操作应当要求用户确认。交易签名应当显示完整的信息摘要。

私钥应当始终保存在客户端本地，绝不应发送到服务器。

智能合约交互应当设置合理的Gas限制，避免因为Gas不足导致交易失败。

## 命名规范

### 通用命名规则

标识符的命名应当清晰、准确、具有描述性。布尔变量或函数应当使用is、has、can、should等前缀。

常量应当使用UPPER_SNAKE_CASE命名。文件的命名应当与文件内容对应。组件文件应当使用PascalCase，如HeroCard.tsx。工具函数文件应当使用camelCase，如formatDate.ts。

```typescript
const MAX_HERO_LEVEL = 80;
const isHeroMaxLevel = hero.level >= MAX_HERO_LEVEL;
const canUpgradeStar = hero.starLevel < 5;

interface HeroData {
  id: string;
  name: string;
}
export function HeroDetailPanel() {}
function formatResourceAmount() {}
```

## 代码组织规范

### 目录结构原则

项目目录结构应当清晰反映代码的模块划分。相关的代码应当组织在同一个目录下。目录的嵌套层级应当控制在合理范围内（通常不超过4层）。

导出索引（index.ts）应当在每个目录中使用，提供统一的导出入口。

配置数据和静态资源应当与代码分离。游戏配置、英雄数据、技能数据等应当放在独立的配置目录中。

### Import 排序规则

Import语句应当按照固定的顺序组织：

1. React相关导入
2. 第三方库导入
3. 项目绝对路径导入（如 @/components）
4. 相对路径导入

类型导入应当与值导入分离，使用import type语法。

## 错误处理规范

### 防御性编程

函数应当对输入参数进行验证，在参数不符合预期时抛出明确的错误或返回安全的默认值。

边界情况的处理是防御性编程的重要组成部分。数组访问应当检查索引有效性，对象属性访问应当使用可选链或空值合并。

错误消息应当清晰、准确，能够帮助开发者或用户理解发生了什么问题。

```typescript
function getHeroById(heroes: Hero[], id: string): Hero {
  const hero = heroes.find((h) => h.id === id);
  if (!hero) {
    throw new Error(`Hero with id "${id}" not found`);
  }
  return hero;
}

async function fetchHeroData(heroId: string): Promise<Hero> {
  try {
    const response = await fetch(`/api/heroes/${heroId}`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('网络连接失败，请检查网络设置');
    }
    throw error;
  }
}
```

## 性能优化规范

### 前端性能原则

性能优化应当基于实际性能数据进行，而不是凭猜测。首屏加载性能是关键指标，目标加载时间应当小于3秒。

交互响应性能同样重要，用户操作应当在100ms内得到响应。对于耗时较长的操作，应当提供加载状态反馈。动画应当保持流畅，帧率应当达到60fps。

### 游戏性能指标

游戏性能的核心指标包括帧率、内存占用和加载时间。目标帧率应当稳定在60fps，每帧的计算时间应当控制在16ms以内。

对象池技术是游戏性能优化的重要手段。纹理应当合理规划尺寸和格式。

## 注释与文档

### 注释使用原则

代码注释应当解释「为什么」而不是「是什么」。注释应当用于解释复杂的业务逻辑、重要的决策理由、可能令人困惑的解决方案。

TODO和FIXME注释应当包含足够的信息，便于后续处理。

对于公共API应当编写清晰的文档注释，说明函数的用途、参数、返回值和可能的异常。

---

_技能版本: 1.1.0_
_最后更新: 2026-03-17_
_相关文档: game-tester/SKILL.md, task-scheduler/SKILL.md, .trae/rules/project-rules/R6-change-safety.md_
_遵守规范: .trae/rules/project-rules/SKILL.md_
