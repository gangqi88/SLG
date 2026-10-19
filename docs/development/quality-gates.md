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
| `npx vitest run` | 通过 | — |
| `npm run lint` | 失败 | 238 问题（231 error / 7 warning），涉及 34 个文件（33 个 `.ts/.tsx` + 1 个 `.mjs` 仅有指令告警） |
| `npx tsc --noEmit` | 失败 | 13 个错误，涉及 8 个文件 |
| `npm run lint:style` | 失败 | 13 个错误，涉及 5 个文件，其中 11 条可 `--fix` |

### 失败构成

- **ESLint**：231 条 error 中 231 条为 `prettier/prettier` 格式问题，且集中在 3 个文件（`HeroDevelopmentView.tsx` 92、`BattleView.tsx` 56、`ModalProvider.tsx` 31）；其余 7 条 warning 为 `react-refresh/only-export-components`（5）与 `react-hooks/exhaustive-deps`（1）+ 1 条失效的 `eslint-disable` 指令。
- **TypeScript**：集中在四类 —— 组件 props 契约不匹配（TS2322）、访问可能为 `null`/`undefined`（TS18047 / TS18048）、类型谓词与资源键类型不匹配（TS2322 / TS2677）、以及 `.mjs` 导入缺少声明文件（TS7016）。
- **Stylelint**：13 条全部为样式规范细节（`color-hex-length`、`custom-property-empty-line-before`、`media-feature-range-notation`、`keyframes-name-pattern`），无功能性风险。

> 数字会随代码变化而漂移，变更主流程后请重新实测并同步本表。

## 如何解释当前状态

当前仓库并不是“全绿质量状态”，而是：

- 功能原型可运行
- 生产构建可成功
- 已配置并运行单元测试
- 但 lint / typecheck / stylelint 仍有待收敛

因此，任何项目文档都不应再写成“当前 ESLint / TypeScript 全部通过”，除非重新验证并更新本文档。

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
- 该 workflow 使用 `npm ci`，而 `.gitignore` 忽略了 `package-lock.json`。在没有 lockfile 的干净检出上 `npm ci` 会失败，CI 实际不可用。修复需二选一：将 `package-lock.json` 纳入版本控制，或把 workflow 改为 `npm install`。**本次未改动 CI**。

## 已知事项

- `lint:style` 已通过 `.stylelintrc.json` 的 `ignoreFiles: ["dist/**/*.css"]` 排除构建产物，不会再扫描 `dist/`。
- 同一组质量门结论在 `README.md`、本文档、`docs/deployment/overview.md`、`docs/development/workflow.md` 各写了一份，容易漂移；本文档为真源，其余位置只应引用链接。
- `tsconfig.json` 的 `include` 仅覆盖 `src`，`cypress/`、`scripts/`、`test/` 不在类型检查范围内。
- 测试通过不代表类型检查通过，二者需要分别验证。