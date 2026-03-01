# AGENTS.md - 项目开发指南

> **AI 助手技能体系**: 本项目采用职责分离的技能配置，请根据需要查看对应的技能文件：
> 
> | 技能文件 | 职责 | 使用场景 |
> |---------|------|----------|
> | `.trae/skills/endless-winter-game-developer/SKILL.md` | **代码实现** | 编写组件、Hooks、游戏功能、Web3 集成 |
> | `.trae/skills/endless-winter-project-manager/SKILL.md` | **项目管理** | 任务规划、进度跟踪、风险管理 |
> | `.trae/skills/endless-winter-code-reviewer/SKILL.md` | **代码审查** | 审查代码质量、提出改进建议 |
> | `.trae/skills/endless-winter-architect/SKILL.md` | **架构设计** | 系统架构、技术选型、性能规划 |

## 项目概述
基于 **React 19 + TypeScript 5.7 + Phaser 3.90** 的末日生存模拟经营游戏。Vite 构建，React 负责 UI，Phaser 3 负责游戏渲染。

## Build Commands

| Command | Description |
|---------|-------------|
| `npm install` | 安装项目依赖 |
| `npm run dev` | 启动开发服务器 localhost:8080 |
| `npm run build` | 生产构建，输出到 `dist/` |
| `npm run dev-nolog` | 启动开发服务器（无匿名日志） |
| `npm run build-nolog` | 生产构建（无匿名日志） |

### 代码检查
- **检查**: `npx eslint src/`
- **修复**: `npx eslint src/ --fix`
- **TypeScript**: `npx tsc --noEmit`（项目未配置自动检查）

### 测试
- **状态**: 当前未配置测试框架
- 如有测试: `npm test` 或 `npx vitest run`（如使用 vitest）

## 代码风格指南

### TypeScript 配置
- Target: ES2020 | Strict mode | No unused locals/parameters

### 命名规范
| 类型 | 规则 | 示例 |
|------|------|------|
| 组件/类 | PascalCase | `ResourcePanel`, `GameManager` |
| 接口/类型 | PascalCase | `ResourceType`, `IProps` |
| 函数/变量 | camelCase | `handleSaveGame`, `gameState` |
| 常量 | UPPER_SNAKE_CASE | `GAME_CONSTANTS` |
| 文件 | PascalCase（组件）, camelCase（工具） | `ResourcePanel.ts`, `formatDate.ts` |

### Import 顺序
```typescript
// 1. React
import React, { useState, useEffect } from 'react';
// 2. 第三方库
import { Game } from 'phaser';
// 3. 绝对路径项目导入
import { GameManager } from './game/GameManager';
import type { ResourceType } from './types/game.types';
// 4. 相对路径
import ResourcePanel from './components/UI/ResourcePanel';
```

### Formatting Rules
- **Braces**: Same line (K&R)
- **Indentation**: 4 spaces
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Line endings**: LF

### React Patterns
- Functional components with hooks
- Use `forwardRef` for ref forwarding
- Destructure props in parameters
- CSS-in-JS via inline `<style>` tags
- Event handlers: `handle` prefix

### Error Handling
- Use TypeScript strict types
- Validate game state before operations
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Return boolean for save/load operations

### ESLint 规则
- Extends: eslint:recommended, @typescript-eslint/recommended, react-hooks/recommended
- Plugins: react-refresh

## 文件组织
```
src/
├── components/UI/     # React UI 组件
├── game/              # Phaser 游戏逻辑
│   ├── scenes/        # Phaser 场景
│   ├── EventBus.ts    # 事件总线
│   ├── GameManager.ts # 游戏管理器
│   └── main.ts        # 游戏初始化
├── systems/           # 游戏系统（资源、建筑等）
├── types/             # TypeScript 类型定义
├── hooks/             # 自定义 React Hooks
└── utils/             # 工具函数和常量
```

## 开发注意事项
- 开发服务器: localhost:8080
- Phaser 配置: `src/game/main.ts`
- 游戏状态: localStorage 持久化
- 热重载: Vite 自动处理

## 架构设计（前后端分离 + 性能优化 + 联机储备）

详见 `.trae/rules/architecture-design.md`

### 前后端分离原则
- **前端**: 本地计算、状态管理、UI渲染
- **后端预留**: 数据校验、状态同步、防作弊
- 关键战斗计算需支持服务器校验

### 性能优化
- 避免热路径装箱，使用对象池
- 严格类型，避免 `any`
- 模块化导入，只导入需要的部分

### 联机同步储备
- 帧同步结构预留 (`BattleFrame`)
- 乐观更新 + 状态回滚
- 断线重连支持 (`Syncable` 接口)

### 性能指标
- 首屏加载 < 3秒
- 交互响应 < 100ms
- 战斗计算 < 16ms (60fps)

## Web3 集成（UniSat - Fractal Bitcoin）
详见完整版 AGENTS.md 或 `WEB3_FB_INTEGRATION_PLAN.md`

### 核心原则
- Hook 命名: `useUniSat` 前缀
- 优先使用 `window.unisat` API
- BRC-20 / Runes 资产标准
- 地址格式: Taproot（bc1p...）

### 环境变量
```env
VITE_UNISAT_API_KEY=your_api_key
VITE_FB_NETWORK=mainnet  # 或 testnet
```

### UniSat 资源
- 钱包: https://unisat.io/download
- 文档: https://docs.unisat.io
- API: https://api.unisat.io/query-v4
