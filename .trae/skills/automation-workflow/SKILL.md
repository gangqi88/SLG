# 自动化工作流规范技能

> 本技能定义Web3 SLG游戏项目的自动化工作流、CI/CD流程、脚本规范和质量保障机制。

## 技能概述

- **职责**: 自动化流程 - CI/CD配置、脚本开发、工作流自动化
- **适用场景**: Web3 SLG游戏开发、测试、部署全流程自动化
- **技术栈**: React 19 + TypeScript 5.7 + Phaser 3.90 + Web3 + Vite

## 自动化流程架构

### 流程体系

现代软件开发需要建立完整的自动化流程体系。自动化流程的核心目标是提高开发效率、保证代码质量、降低人为错误。

本项目的自动化流程分为四级：
1. **快速检查**：语法检查、类型检查
2. **质量检查**：代码规范、单元测试、覆盖率检查
3. **构建测试**：打包验证、集成测试
4. **部署准备**：版本产物生成

### 设计原则

- **快速反馈**：代码提交后应当在最短时间内返回检查结果
- **职责分离**：不同阶段的工作流应当独立运行
- **可追溯**：每次构建和部署都应当记录完整的执行日志
- **高效率**：充分利用并行执行能力和缓存机制

## Git 工作流

### 分支策略

项目采用Git Flow分支模型：

| 分支 | 用途 | 合并来源 |
|------|------|----------|
| main | 生产分支 | release, hotfix |
| develop | 开发分支 | feature, release |
| feature/* | 功能开发 | - |
| release/* | 发布准备 | develop |
| fix/* | Bug修复 | - |
| hotfix/* | 紧急修复 | main |

功能分支命名：`feature/功能名称`，如 `feature/hero-system`

### 提交规范

提交信息遵循Conventional Commits规范：
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
```

示例：
```
feat(hero): 添加英雄升级功能
fix(battle): 修复伤害计算错误
docs: 更新API文档
```

### Pull Request流程

1. 从develop创建feature分支
2. 开发完成后提交PR到develop
3. PR必须通过代码审查
4. PR必须通过所有自动化检查
5. 合并后删除源分支

## 持续集成配置

### GitHub Actions工作流

配置文件位置：`.github/workflows/`

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: ESLint check
        run: npx eslint src/
      - name: TypeScript check
        run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build production
        run: npm run build
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

## 代码质量检查

### 检查流程

```
开发 → ESLint检查 → TypeScript检查 → 代码审查 → 合并
```

### 检查命令

```bash
# ESLint 全量检查
npx eslint src/

# ESLint 修复
npx eslint src/ --fix

# TypeScript 类型检查
npx tsc --noEmit

# 单文件检查
npx eslint src/systems/HeroSystem.ts
```

### 质量标准

- ESLint: 0 errors (warnings < 15)
- TypeScript: 0 errors
- 单元测试覆盖率 > 70%

## 构建流程

### 构建脚本

```bash
# 开发构建
npm run dev

# 生产构建
npm run build

# 构建配置
# 开发: vite/config.dev.mjs
# 生产: vite/config.prod.mjs
```

### 构建优化

- 代码分割：Phaser单独打包
- 动态导入：路由和大型组件按需加载
- Source Map：生产环境可选

## 部署流程

### 部署配置

支持多种部署方式：
- 静态部署：Nginx、Apache、Netlify、Vercel
- 容器化：Docker + Kubernetes

```bash
#!/bin/bash
# deploy.sh
DEPLOY_ENV=${1:-staging}
ssh $USER@$HOST "cd $PATH && npm run build && cp -r dist/* /var/www/app/"
```

### 版本管理

采用语义化版本号（Semantic Versioning）：
- MAJOR：不兼容的API变更
- MINOR：向后兼容的功能新增
- PATCH：向后兼容的Bug修复

发布流程：
1. 从develop创建release分支
2. 完成发布准备
3. 合并到main和develop
4. 创建版本标签（v1.0.0）

## 监控与告警

### 构建监控

- 构建状态通知：邮件/Slack/企业微信
- 构建历史：长期保存
- 失败分析：识别根因

### 运行时监控

- 请求响应时间
- 错误率
- 资源使用情况

错误追踪系统收集前端JavaScript错误。

---

*技能版本: 1.0.1*
*最后更新: 2026-03-06*
*相关文档: web3-slg-project-manager/SKILL.md, fullstack-code-standards/SKILL.md*
*遵守规范: .trae/rules/project-rules/SKILL.md*
