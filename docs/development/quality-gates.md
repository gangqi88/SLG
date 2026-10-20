# 质量门说明

## 目的

本文档用于明确当前项目的质量检查命令、判定标准，以及经实际执行确认的仓库状态。

## 推荐检查命令

### ESLint

```bash
npm run lint
```

### TypeScript 类型检查

```bash
npx tsc --noEmit
```

### 单元测试

```bash
npx vitest run
```

### 生产构建

```bash
npm run build
```

### Stylelint

```bash
npm run lint:style
```

## 当前已验证状态

以下结论基于 **2026-10-20** 的实际执行结果：

| 命令 | 结果 | 数量 |
| --- | --- | --- |
| `npm run build` | 通过 | — |
| `npx vitest run` | 通过 | 10 个测试文件 / 31 个用例 |
| `npm run lint` | 通过 | 0 error / 0 warning |
| `npm run typecheck` | 通过 | 0 error（`src` + config/cypress 两个项目） |
| `npm run lint:style` | 通过 | 0 error |
| `npm run format:check` | 通过 | — |
| `npm run verify` | 通过 | 串联上述 6 项，exit 0 |

### 历史失败构成与收敛方式

2026-10-19 技术债清理前，本仓库为：ESLint 238 问题（231 条 `prettier/prettier` + 7 warning）、TypeScript 13 error、Stylelint 13 error。收敛方式：

- **ESLint 231 条**：新增 `.prettierignore` 后执行 `prettier --write`，纯格式化，无逻辑改动。
- **TypeScript 13 条**：随零引用文件删除消掉 5 条（`HeroDetail`、`sceneAssets`、`battleSim`），其余 8 条按「空值收窄 / props 契约 / `.mjs` 声明」逐项修复，并新增 `scripts/git/commit-conventions.d.mts`。
- **Stylelint 13 条**：`stylelint --fix` 修 11 条，另 2 条 keyframes 命名手工改为 kebab-case（定义与 `animation` 引用成对修改）。
- **剩余 7 条 warning（2026-10-20 清零）**：`react-refresh` 5 条通过拆模块解决——`ModalContext.ts`、`LocaleContext.ts`、`shared/logic/resourceWays.ts`、`shared/logic/battleReport.ts` + `shared/components/BattleReportView.tsx`；`exhaustive-deps` 1 条改为真实 `elapsedMs` 状态；失效 `eslint-disable` 1 条直接删除。

> 数字会随代码变化而漂移，变更主流程后请重新实测并同步本表。

## 如何解释当前状态

截至 2026-10-20，全部质量门已收敛到 **0 error / 0 warning**：

- 功能原型可运行，生产构建通过
- ESLint / tsc / Stylelint / Prettier 全部通过
- 单元测试 10 文件 / 31 用例通过

覆盖边界（仍需知情）：

- ESLint 规则只作用于 `**/*.{ts,tsx}`；`scripts/*.mjs` 与 `test/*.js` 不在 ESLint 作用域内，但 `scripts/` 已由 `format:check` 覆盖格式。
- 类型检查分两个项目：`src` 由 `tsconfig.json` 覆盖，`vite.config.ts` / `cypress.config.ts` / `cypress/**` 由 `tsconfig.check.json` 覆盖；`scripts/*.mjs`（纯 JS）仍不参与类型检查。

本文档是质量门结论的唯一真源；其它文档只应引用，不应复制数字。

## 维护建议

- 日常提交前执行 `npm run verify`（lint → stylelint → 格式 → 类型 → 单测 → 构建，任一步失败即中断）。
- 涉及 UI 交互或路由时，额外执行 `npm run test:e2e`（需先 `npx cypress install`，并会占用 8080 端口）。

## 质量门与 CI 现状

- 仓库当前只有 `.github/workflows/commit-message.yml`，**仅校验 commit message**，不运行 ESLint / tsc / Stylelint / 测试。
- 因此质量门目前是**本地约定**，不构成合并阻断。
- 该 workflow **不安装依赖**，直接执行 `node scripts/git/validate-commit-range.mjs`（脚本只依赖 Node 内置模块），因此不依赖 `package-lock.json`。

## 已知事项

- `lint:style` 已通过 `.stylelintrc.json` 的 `ignoreFiles: ["dist/**/*.css"]` 排除构建产物，不会再扫描 `dist/`。
- 同一组质量门结论在 `README.md`、本文档、`docs/deployment/overview.md`、`docs/development/workflow.md` 各写了一份，容易漂移；本文档为真源，其余位置只应引用链接。
- `tsconfig.json` 的 `include` 仅覆盖 `src`；`cypress/` 与两个 config 由 `tsconfig.check.json` 覆盖，`scripts/*.mjs` 仍不参与类型检查。
- 测试通过不代表类型检查通过，二者需要分别验证；`npm run verify` 已串联两者。