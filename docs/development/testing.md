# 测试说明

## 测试体系概览

当前仓库包含三类测试能力：

1. **Vitest 单元测试**
2. **Cypress E2E 测试**
3. **`test/` 目录下的 Hardhat 合约测试子项目**

因此，“项目未配置测试框架”这一说法已经不准确。

## 1. Vitest 单元测试

主工程通过 `package.json` 中的以下脚本启用 Vitest：

- `npm run test`：watch 模式
- `npx vitest run`：一次性执行，更适合 CI 或手动校验

当前已存在测试示例包括：

- `src/features/alliance/tests/allianceSlice.test.ts`
- `src/features/battle/tests/BattleSystem.test.ts`
- `src/features/gacha/tests/GachaManager.test.ts`
- `src/features/task/tests/TaskManager.test.ts`

## 2. Cypress E2E 测试

- 配置文件：`cypress.config.ts`
- 基础用例目录：`cypress/e2e/`
- 当前基础地址：`http://localhost:8080`

运行方式：

```bash
npm run test:e2e
```

该命令会启动开发服务器并执行 Cypress。

## 3. Hardhat 测试子项目

仓库中的 `test/` 目录是一个**独立子项目**，包含自己的 `package.json` 和 README。

阅读入口：

- `../../test/README.md`

在撰写文档或执行验证时，应将它与前端主工程区分开。

## 当前测试现状

经验证：

- `npx vitest run`：通过
- `npm run test:e2e`：未在本轮执行中验证

> 说明：本轮文档整理重点验证了主工程的可构建性、单测能力与质量门状态。

## 编写与维护建议

- 新增业务逻辑时，优先补充 feature 目录下的单元测试
- 影响关键用户路径时，再补充 Cypress 用例
- 合约能力变更时，优先更新 `test/` 子项目中的测试与说明