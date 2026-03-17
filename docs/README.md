# 项目文档索引

本目录用于承载**当前有效**的项目说明文档。所有内容应尽量以代码、配置文件和已验证命令结果为准。

## 阅读顺序

1. [快速开始](quick-start.md)
2. [架构概览](architecture/overview.md)
3. [开发流程](development/workflow.md)
4. [素材接入工作流](development/game-assets-workflow.md)
5. [编码规范](development/coding-standards.md)
6. [测试说明](development/testing.md)
7. [质量门说明](development/quality-gates.md)
8. [部署与运行说明](deployment/overview.md)
9. [UniSat Web3 接入说明](web3/unisat-integration.md)

## 文档分层

### 入口层

- `../README.md`：仓库入口与总览

### 架构层

- `architecture/overview.md`：当前实现结构、模块边界、主要技术选型

### 开发层

- `quick-start.md`：本地启动与常用命令
- `development/workflow.md`：日常开发流程、最小验证与文档同步要求
- `development/game-assets-workflow.md`：游戏素材目录、清单、校验与回退策略
- `development/coding-standards.md`：与实际工具配置对齐的编码规范
- `development/testing.md`：Vitest、Cypress、Hardhat 测试说明
- `development/quality-gates.md`：质量检查命令与当前状态

### 部署与集成层

- `deployment/overview.md`：Vite 静态构建产物、部署方式与运行边界
- `web3/unisat-integration.md`：当前 UniSat 钱包接入能力与限制

### AI / 自动化协作层

- `../AGENTS.md`：AI 协作入口
- `../.trae/rules/project-rules/SKILL.md`：规则真源索引
- `../.trae/skills/SKILL.md`：skill 索引

### 过程与历史文档

- `../.trae/documents/README.md`：规划与专题文档边界说明
- `../.trae/specs/README.md`：过程性 spec / checklist / tasks 文档说明

## 维护原则

- 代码与配置文件优先于叙述性文档
- `docs/` 只保留当前有效内容
- 历史规划、草案、阶段性方案不应与当前标准混写
- 若文档与代码冲突，应优先修正文档，必要时补充“需确认事项”
