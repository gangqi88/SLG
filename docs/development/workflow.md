# 开发流程

本文档说明当前仓库的日常开发方式，面向需要修改前端代码、样式、测试或文档的开发者。

## 适用范围

- 主前端工程：仓库根目录
- 智能合约子项目：`test/`（独立 Hardhat 子项目，流程单独参考 `test/README.md`）

## 日常开发流程

### 1. 修改前先确认事实来源

按以下顺序核对信息：

1. 实际代码与目录结构
2. 工具配置文件，如 `package.json`、`vite.config.ts`、`tsconfig.json`
3. `docs/` 当前有效文档
4. `.trae/rules/project-rules/` 规则文档
5. `.trae/skills/` skill 文档

### 2. 启动本地开发环境

在仓库根目录执行：

- `npm install`
- `npm run dev`

默认开发地址为 `http://localhost:8080`。

### 3. 以最小范围完成修改

- 优先在对应 feature 内修改业务代码
- 共享能力放入 `src/shared`
- 全局状态接入放入 `src/store`
- 涉及命令、架构、目录或运行方式变化时，同步更新 `docs/`

### 4. 执行最小必要验证

根据改动范围选择验证方式：

| 改动类型 | 最小验证建议 |
| --- | --- |
| 文档改动 | 检查链接、路径、命令与代码事实是否一致 |
| 素材清单/资源改动 | `npm run assets:check`，并本地验证目标场景 |
| 组件/逻辑改动 | 优先运行相关单元测试，再视情况补 `npx vitest run` |
| 路由/页面改动 | 本地手动验证页面入口，必要时补 Cypress |
| 构建相关改动 | `npm run build` |
| 样式改动 | `npm run lint:style` |
| 类型相关改动 | `npx tsc --noEmit` |

## 当前质量门现实情况

质量门的实测状态、失败构成与 CI 现状统一以 [quality-gates.md](quality-gates.md) 为准，**本文档不再重复记录数字**，避免多处副本互相漂移。

提交说明或文档中应避免笼统写「全部检查通过」，应当明确写清：

- 本次实际运行了什么
- 哪些通过
- 哪些仍是仓库现存问题

## 文档同步要求

出现以下变化时，应同步更新文档：

- 新增或删除脚本命令
- 调整目录结构或模块归属
- 修改运行端口、构建产物、路由方式
- 增加新的钱包接入、测试方式或部署约束

推荐优先更新：

- `README.md`
- `docs/README.md`
- `docs/development/game-assets-workflow.md`
- 对应专题文档

## 协作边界

- 稳定规则以 `.trae/rules/project-rules/` 为准
- task / workflow 方法以 `.trae/skills/` 为准
- `docs/` 只记录当前有效做法，不承载历史方案
- `.trae/documents/` 与 `.trae/specs/` 默认视为规划或过程材料

## 需确认事项

- 当前仓库尚未固定 Node 版本，若后续补充 `.nvmrc` 或 `engines`，需同步更新本文件
- 提交信息规范已落在 [Git-commit-guide.md](../Git-commit-guide.md)，并配有 `scripts/git/commit-msg.mjs` 校验脚本；分支与发布流程尚未成文，如后续明确应新增专项文档而不是在此处口头约定
