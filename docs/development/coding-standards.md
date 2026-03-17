# 编码规范

## 规范来源优先级

当文档与工具配置冲突时，优先级如下：

1. 实际代码约束
2. 工具配置文件（如 `.editorconfig`、`.prettierrc`、`eslint.config.mjs`、`tsconfig.json`）
3. `.trae/rules/project-rules/`
4. 本文档

## 基础格式

以当前仓库配置为准：

- 缩进：`2 spaces`
- 引号：`single quotes`
- 分号：必须保留
- 行宽：`100`
- trailing commas：`all`

## TypeScript 约束

- 开启 `strict`
- 开启 `noUnusedLocals`
- 开启 `noUnusedParameters`
- 避免使用 `any`
- 修改类型定义前，优先确认实际调用点与使用范围

## ESLint 约束

当前重要规则包括：

- `@typescript-eslint/no-explicit-any: error`
- `@typescript-eslint/no-unused-vars`
- `no-debugger: error`
- `no-console: warn`（仅允许 `warn` / `error`）
- `eqeqeq: error`
- `curly: error`

## 目录与导入建议

- 优先使用路径别名 `@/` 指向 `src/*`
- 新功能优先落在对应 `feature` 下
- 跨模块共享能力优先沉淀到 `src/shared/`
- 不要继续按旧版 `systems / constants / game` 假设组织新代码

## 命名建议

- 组件/类：PascalCase
- 函数/变量：camelCase
- 常量：UPPER_SNAKE_CASE
- 类型/接口：PascalCase

## 文档与代码的一致性要求

- 文档必须基于已存在代码与配置
- 不要在文档中声明未验证的“全绿质量状态”
- 涉及命令、脚本、路径时，先核对 `package.json` 与实际目录

## 相关文档

- `../../.trae/rules/project-rules/SKILL.md`
- `testing.md`
- `quality-gates.md`