# 文明火种 / Civilization Spark（末日生存 SLG 原型）

基于 **React 19 + TypeScript 5.7 + Vite 6 + Phaser 3.90** 的前端游戏原型项目，当前已实现城市、英雄、联盟、战斗、采集、抽卡、任务与基础 Web3 钱包接入等模块。

> 命名约定：包名与仓库代号为 `civilization-spark`，中文产品名为「文明火种」，英文产品名为 `Civilization Spark`。代码中的包名属于技术标识，不随产品名调整。

## 项目现状

- 当前源码采用 **feature-based** 结构：`src/features` + `src/shared`
- 前端框架使用 React，局部玩法与场景逻辑使用 Phaser
- 当前钱包接入以 **UniSat / `window.unisat`** 为主
- 项目已配置 **Vitest**、**Cypress**，并包含 `test/` 下独立 Hardhat 子项目文档

## 技术栈

- React 19
- TypeScript 5.7
- Vite 6
- Phaser 3.90
- React Router
- Vitest
- Cypress
- Stylelint / ESLint / Prettier

## 当前模块

以 `src/router.tsx` 与 `src/features/` 为准：

- Main / 主界面入口宫格（`/`）
- Hero / 英雄列表与养成（`/heroes`）
- City / 主城场景（`/city`）与主城经营（`/main-city`）
- Gathering / 采集（`/gathering`）
- Tasks / 任务（`/tasks`）
- Gacha / 抽卡（`/gacha`）与宝箱（`/lootbox`）
- Tower Defense / 塔防（`/tower-defense`）
- Cooking / 烹饪（`/cooking`）
- Siege / 攻城（`/siege`）
- Battle / 战斗（`/battle`）与战报（`/reports`）
- Alliance / 联盟（`/alliance`）
- Style Guide / 样式演示（`/style-guide`）

> 已知缺口：主界面配置了 `world`（`/world`）入口且标记为 `locked`，但该路由尚未注册，当前不可进入。

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
npx cypress install   # 首次需要，下载约 100MB 二进制
npm run test:e2e
```

> 当前本机受安全策略限制（`reg.exe` 被列入程序黑名单），Cypress 无法初始化，该命令尚未跑通；详见 [测试说明](docs/development/testing.md)。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 执行生产构建，输出到 `dist/` |
| `npm run preview` | 本地预览构建产物 |
| `npx vitest run` | 执行一次性单元测试 |
| `npm run test` | 进入 Vitest watch 模式 |
| `npm run test:e2e` | 启动开发服务器并执行 Cypress |
| `npm run cy:run` | 仅执行 Cypress（不启动开发服务器） |
| `npm run lint` | 运行 ESLint |
| `npm run lint:style` | 运行 Stylelint |
| `npm run format` | 用 Prettier 格式化全仓（受 `.prettierignore` 约束） |
| `npm run format:check` | 校验格式，不改文件 |
| `npm run typecheck` | 类型检查（`src` + config/cypress 两个项目） |
| `npm run verify` | 一键质量门：lint → stylelint → 格式 → 类型 → 单测 → 构建 |
| `npm run assets:check` | 校验游戏素材清单 |
| `npm run assets:check:strict` | 严格模式校验素材清单 |
| `npm run hooks:install` | 安装本地 git hooks |
| `npm run commit:template` | 生成提交信息模板 |

## 工程状态说明

当前质量门已全部通过（0 error / 0 warning）。实测数字、命令与覆盖边界统一记录在 [质量门说明](docs/development/quality-gates.md)，本文档不再复制第二份数字——避免代码一变就要改多处。

日常提交前建议执行 `npm run verify`；`npm run test:e2e` 需要先 `npx cypress install` 且会占用 8080 端口，未纳入 `verify`。

## 目录概览

- `src/features/`：按业务域划分的核心功能模块
- `src/shared/`：共享组件、场景、工具、样式、Web3 能力等
- `cypress/`：端到端测试
- `test/`：独立 Hardhat 测试子项目
- `.trae/rules/`：项目规则真源
- `.trae/skills/`：任务执行型 skill 文档

## 文档导航

- [文档索引](docs/README.md)
- [快速开始](docs/quick-start.md)
- [架构概览](docs/architecture/overview.md)
- [联盟 ID 命名策略](docs/architecture/alliance-id-policy.md)
- [开发流程](docs/development/workflow.md)
- [编码规范](docs/development/coding-standards.md)
- [提交信息指南](docs/Git-commit-guide.md)
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