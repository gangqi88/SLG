# Civilization Spark / 末日生存 SLG 原型

基于 **React 19 + TypeScript 5.7 + Vite 6 + Phaser 3.90** 的前端游戏原型项目，当前已实现城市、英雄、联盟、战斗、采集、抽卡、任务与基础 Web3 钱包接入等模块。

## 项目现状

- 当前源码采用 **feature-based** 结构：`src/features` + `src/shared` + `src/store`
- 前端框架使用 React，局部玩法与场景逻辑使用 Phaser
- 当前钱包接入以 **UniSat / `window.unisat`** 为主
- 项目已配置 **Vitest**、**Cypress**，并包含 `test/` 下独立 Hardhat 子项目文档

## 技术栈

- React 19
- TypeScript 5.7
- Vite 6
- Phaser 3.90
- React Router
- Redux Toolkit
- Vitest
- Cypress
- Stylelint / ESLint / Prettier

## 当前模块

以 `src/router.tsx` 与 `src/features/` 为准，当前可见模块包括：

- Hero / 英雄列表与养成
- City / 主城
- Gathering / 采集
- Tasks / 任务
- Gacha / 抽卡
- LootBox / 宝箱
- Tower Defense / 塔防
- Cooking / 烹饪
- Siege / 攻城
- Battle / 战斗
- Alliance / 联盟相关逻辑与状态
- Style Guide / 样式演示页

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

默认访问地址：`http://localhost:8080`

### 3. 运行单元测试

```bash
npx vitest run
```

### 4. 生产构建

```bash
npm run build
```

### 5. 运行 E2E 测试

```bash
npm run test:e2e
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 执行生产构建，输出到 `dist/` |
| `npm run preview` | 本地预览构建产物 |
| `npx vitest run` | 执行一次性单元测试 |
| `npm run test` | 进入 Vitest watch 模式 |
| `npm run test:e2e` | 启动开发服务器并执行 Cypress |
| `npm run lint` | 运行 ESLint |
| `npm run lint:style` | 运行 Stylelint |
| `npx tsc --noEmit` | 运行 TypeScript 类型检查 |

## 工程状态说明

以下状态已基于仓库实际执行结果验证：

- `npm run build`：通过
- `npx vitest run`：通过
- `npm run lint`：未通过
- `npx tsc --noEmit`：未通过
- `npm run lint:style`：未通过

这意味着当前仓库属于“**可运行、可构建、已有测试，但质量门尚未完全收敛**”的状态。文档与协作流程应以此事实为准。

## 目录概览

- `src/features/`：按业务域划分的核心功能模块
- `src/shared/`：共享组件、场景、工具、样式、Web3 能力等
- `src/store/`：Redux store 与全局状态接入
- `cypress/`：端到端测试
- `test/`：独立 Hardhat 测试子项目
- `.trae/rules/`：项目规则真源
- `.trae/skills/`：任务执行型 skill 文档

## 文档导航

- [文档索引](docs/README.md)
- [快速开始](docs/quick-start.md)
- [架构概览](docs/architecture/overview.md)
- [开发流程](docs/development/workflow.md)
- [编码规范](docs/development/coding-standards.md)
- [测试说明](docs/development/testing.md)
- [质量门说明](docs/development/quality-gates.md)
- [部署与运行说明](docs/deployment/overview.md)
- [UniSat Web3 接入说明](docs/web3/unisat-integration.md)
- [AI 协作文档](AGENTS.md)
- [规则文档索引](.trae/rules/project-rules/SKILL.md)
- [Skill 索引](.trae/skills/SKILL.md)
- [规划文档边界说明](.trae/documents/README.md)
- [Spec 过程文档说明](.trae/specs/README.md)
- [Hardhat 测试说明](test/README.md)

## Web3 说明

- 当前钱包交互主要位于 `src/shared/components/WalletConnect.tsx` 与 `src/shared/utils/web3.ts`
- 现行实现依赖 UniSat 钱包环境，适合桌面浏览器调试
- 历史规划与专题方案请勿直接视为现行标准，应以代码与 `docs/` 文档为准