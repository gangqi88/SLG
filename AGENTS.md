# AGENTS.md

本文件用于说明 **AI / 自动化代理在本仓库中的工作方式**。它不是项目完整开发手册；项目说明、开发规范与架构信息请优先查看 `README.md` 与 `docs/`。

## 信息优先级

当多个信息源冲突时，按以下优先级判断：

1. 实际代码与目录结构
2. 工具配置文件（`package.json`、`tsconfig.json`、`eslint.config.mjs`、`.editorconfig`、`.prettierrc` 等）
3. `docs/` 下当前有效文档
4. `.trae/rules/project-rules/` 规则文档
5. `.trae/skills/` skill 文档
6. `.trae/documents/` 与 `.trae/specs/` 中的历史规划或过程文档

## AI 协作目标

AI 在本仓库中的职责是：

- 基于代码事实分析问题
- 在修改前核对真实实现与配置
- 优先复用现有结构与约定
- 修改后执行最小必要验证
- 避免将历史规划误写成当前事实

## 主要入口

- `README.md`：项目入口与总览
- `docs/README.md`：当前有效文档索引
- `.trae/rules/project-rules/SKILL.md`：规则真源索引
- `.trae/skills/SKILL.md`：skill 索引
- `test/README.md`：Hardhat 子项目说明

## 当前项目事实（高层）

- 前端主栈：React 19 + TypeScript 5.7 + Vite 6 + Phaser 3.90
- 源码结构：`src/features` + `src/shared` + `src/store`
- 当前已配置 Vitest、Cypress；`test/` 为独立 Hardhat 子项目
- 当前 Web3 接入以 UniSat / `window.unisat` 为主

## 与 rules / skills 的边界

### rules

`.trae/rules/project-rules/` 用于定义稳定规则，例如：

- 语言与输出约定
- 代码格式与规范
- 协作与评审要求

AI 应引用这些规则，而不是在多个文档中重复复制它们。

### skills

`.trae/skills/` 用于定义“如何完成某类任务”，例如：

- 任务调度
- 架构设计
- 文档审查
- 测试执行
- Web3 开发

skill 是任务方法，不是规则真源。

## 工作流程建议

1. 先读相关代码与配置
2. 再读 `docs/` 与 `.trae/rules/`
3. 如涉及专项任务，再进入对应 skill / spec / planning 文档
4. 修改后运行最小必要验证
5. 输出中明确：
   - 改了什么
   - 为什么改
   - 验证了什么
   - 仍有哪些风险或待确认事项

## 推荐验证命令

- `npm run lint`
- `npx tsc --noEmit`
- `npx vitest run`
- `npm run build`
- `npm run lint:style`

> 注意：是否“通过”必须以实际执行结果为准，不要沿用旧文档中的静态状态描述。

## 文档维护原则

- `README.md` 负责入口，不负责承载全部规范
- `docs/` 负责当前有效的人类可读文档
- `.trae/rules/` 负责规则真源
- `.trae/skills/` 负责任务执行说明
- `.trae/documents/` 与 `.trae/specs/` 默认视为规划/过程文档

## 禁止事项

- 不要把旧模板结构写成当前结构
- 不要引用不存在的脚本、目录或 skill
- 不要把历史方案写成现行实现
- 不要在未验证的情况下声称 lint / typecheck / tests 已全部通过