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

以下结论基于 **2026-10-19** 的实际执行结果：

| 命令 | 结果 | 数量 |
| --- | --- | --- |
| `npm run build` | 通过 | — |
| `npx vitest run` | 通过 | 10 个测试文件 / 31 个用例 |
| `npm run lint` | 通过（含告警） | 0 error / 7 warning |
| `npx tsc --noEmit` | 通过 | 0 error |
| `npm run lint:style` | 通过 | 0 error |
| `npx prettier --check "src/**/*.{ts,tsx,css}"` | 通过 | — |

### 历史失败构成与收敛方式

2026-10-19 技术债清理前，本仓库为：ESLint 238 问题（231 条 `prettier/prettier` + 7 warning）、TypeScript 13 error、Stylelint 13 error。收敛方式：

- **ESLint 231 条**：新增 `.prettierignore` 后执行 `prettier --write`，纯格式化，无逻辑改动。
- **TypeScript 13 条**：随零引用文件删除消掉 5 条（`HeroDetail`、`sceneAssets`、`battleSim`），其余 8 条按「空值收窄 / props 契约 / `.mjs` 声明」逐项修复，并新增 `scripts/git/commit-conventions.d.mts`。
- **Stylelint 13 条**：`stylelint --fix` 修 11 条，另 2 条 keyframes 命名手工改为 kebab-case（定义与 `animation` 引用成对修改）。

### 保留的 7 条告警

`react-refresh/only-export-components`（5）、`react-hooks/exhaustive-deps`（1）、失效 `eslint-disable` 指令（1）。前两类属于「同文件同时导出组件与 hook/常量」的结构选择，清零需要拆分模块，未纳入本次清理。

> 数字会随代码变化而漂移，变更主流程后请重新实测并同步本表。

## 如何解释当前状态

截至 2026-10-19，三条质量门已收敛到 **0 error**：

- 功能原型可运行，生产构建通过
- ESLint / tsc / Stylelint 均无 error，仅保留 7 条结构性 warning
- 单元测试 10 文件 / 31 用例通过

但仍需注意覆盖边界：ESLint 规则只作用于 `**/*.{ts,tsx}`，`scripts/*.mjs` 与 `test/*.js` 不在规则范围内；`tsconfig.json` 的 `include` 只覆盖 `src`。因此「全绿」不等于「全部代码都被检查」。

本文档是质量门结论的唯一真源；其它文档只应引用，不应复制数字。

## 维护建议

- 变更主流程代码后，至少执行：
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npx vitest run`
- 发布前建议补充：
  - `npm run build`
  - `npm run test:e2e`

## 质量门与 CI 现状

- 仓库当前只有 `.github/workflows/commit-message.yml`，**仅校验 commit message**，不运行 ESLint / tsc / Stylelint / 测试。
- 因此质量门目前是**本地约定**，不构成合并阻断。
- 该 workflow **不安装依赖**，直接执行 `node scripts/git/validate-commit-range.mjs`（脚本只依赖 Node 内置模块），因此不依赖 `package-lock.json`。

## 已知事项

- `lint:style` 已通过 `.stylelintrc.json` 的 `ignoreFiles: ["dist/**/*.css"]` 排除构建产物，不会再扫描 `dist/`。
- 同一组质量门结论在 `README.md`、本文档、`docs/deployment/overview.md`、`docs/development/workflow.md` 各写了一份，容易漂移；本文档为真源，其余位置只应引用链接。
- `tsconfig.json` 的 `include` 仅覆盖 `src`，`cypress/`、`scripts/`、`test/` 不在类型检查范围内。
- 测试通过不代表类型检查通过，二者需要分别验证。