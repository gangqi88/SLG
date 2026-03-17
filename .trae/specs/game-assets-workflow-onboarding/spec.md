# 游戏素材接入工作流 Spec

> **当前归类**: 待实施规格文档  
> **使用边界**: 本文档定义“如何把游戏素材稳定接入当前 React + Phaser + Vite 工程”的目标、约束与落地范围。  
> **现行真源**: `src/shared/scenes/PreloadScene.ts`、`src/shared/config/sceneAssets.ts`、`vite.config.ts`、`package.json`

## Why

当前仓库仅有少量背景图通过 `sceneAssets.ts` + `PreloadScene` 进行可选加载，尚未形成可扩展的“批量素材接入—校验—构建—回归”闭环。  
随着玩法扩展，素材数量将显著增加；若没有统一流程，容易出现：

- 素材路径不一致，导致运行时 404 或白屏；
- 同一素材被重复命名或重复打包，增加包体；
- 素材缺失回退策略不统一，导致场景不可用；
- 提交流程里缺少素材校验，问题在联调阶段才暴露。

因此需要建立一套明确、可执行、可验收的素材接入工作流。

## Goals

- 建立统一目录规范，明确“原始素材、可发布素材、配置清单”边界。
- 建立统一素材注册方式，避免在业务场景中散落硬编码路径。
- 在开发与构建阶段提供最小自动校验，提前暴露缺失、重名、格式异常。
- 保持与现有 `PreloadScene` 回退机制兼容，保障素材未到位时仍可运行。
- 在文档层沉淀团队协作流程，使策划、美术、前端接入路径一致。

## Non-Goals

- 不在本次直接引入纹理压缩服务或 CDN 发布系统。
- 不改造现有业务玩法逻辑，仅定义素材接入层与流程。
- 不强制一次性迁移所有历史素材，仅要求新接入素材遵循新规范。

## Current Baseline

- Vite 构建产物 `assetsDir` 为 `assets`，开发端口为 `8080`。
- 现有可选背景图路径位于 `/assets/*.png`，通过 HEAD 请求探测后按需加载。
- `PreloadScene` 已有纹理兜底逻辑（找不到图片时生成纯色纹理）。
- 当前仓库存在 `build/test/lint` 基础脚本，但没有素材专项校验脚本。

## Proposed Workflow

### 1) 素材目录分层

新增并约定以下目录职责：

- `public/game-assets/`：可直接被运行时访问的发布素材；
- `src/shared/config/assets/`：素材清单配置（按玩法或场景拆分）；
- `docs/development/game-assets-workflow.md`：团队接入说明与操作步骤；
- `scripts/assets/`：素材校验脚本（路径、命名、重复与清单一致性）。

### 2) 素材清单化注册

将素材引用从“业务代码硬编码路径”升级为“清单配置 + 类型约束”：

- 为每类素材定义 key（如背景、角色图、UI 图标、音效）；
- 清单中包含 `key`、`url`、`type`、`feature`、`optional` 等字段；
- 场景加载只消费清单，不直接拼接字符串路径；
- 保留 `optional` 语义，沿用现有回退机制，避免阻塞联调。

### 3) 加载策略标准化

- 启动阶段：先加载必需素材，再按特性延迟加载可选素材；
- 失败策略：必需素材加载失败触发显式告警，可选素材走回退纹理/默认资源；
- 统一日志：在开发环境输出可读错误信息，生产环境避免噪声日志。

### 4) 提交前自动校验

通过 `npm` 脚本增加素材门禁（建议命名 `assets:check`）：

- 校验清单中的 URL 是否存在对应文件；
- 校验 key 是否重复；
- 校验扩展名是否在允许列表（png/jpg/webp/mp3/ogg 等）；
- 校验可选素材是否标注 `optional=true`；
- 将校验接入本地最小检查流程（与 build 前检查并行）。

### 5) 团队协作流

定义“美术交付到代码入库”的最小流程：

1. 美术提交素材包并按命名规范整理；
2. 前端放置至 `public/game-assets/` 对应子目录；
3. 更新素材清单配置并通过 `assets:check`；
4. 在对应场景进行本地预览验证；
5. 更新工作流文档中变更记录。

## Naming & Constraints

- 文件命名：`<feature>_<category>_<name>_<variant>`，统一小写下划线；
- 禁止空格与中文文件名；
- key 命名与文件名语义保持一致；
- 单文件体积建议上限（示例）：图片 500KB、音频 2MB；
- 超限素材应在接入前处理为压缩版本。

## Impact

- **受影响模块**:
  - `src/shared/config/`（新增素材清单配置）
  - `src/shared/scenes/PreloadScene.ts`（按清单加载与失败策略统一）
  - `package.json`（新增素材校验脚本）
  - `docs/development/`（新增流程文档）
- **风险**:
  - 清单字段设计不完整导致后续扩展困难；
  - 严格校验初期可能暴露较多历史问题；
  - 素材体积约束可能与短期上线节奏冲突。
- **缓解**:
  - 先以“新素材必须遵循”为底线，历史素材分阶段治理；
  - 为校验脚本提供 `warn` 模式用于过渡期；
  - 保留 `optional + fallback` 保证运行稳定性。

## ADDED Requirements

### Requirement: 统一素材目录

系统 SHALL 提供可发布素材目录与清单目录的职责分离。

- **Scenario: 新增一批场景背景图**
  - **WHEN** 前端接收新的背景图
  - **THEN** 文件放置在 `public/game-assets/` 规范目录
  - **THEN** 在 `src/shared/config/assets/` 中登记清单条目

### Requirement: 清单驱动加载

系统 SHALL 通过清单配置驱动场景素材加载，不依赖业务硬编码路径。

- **Scenario: 场景启动加载素材**
  - **WHEN** 场景初始化
  - **THEN** 加载器根据清单批量注册素材
  - **THEN** 对 `optional=true` 的素材允许失败并回退

### Requirement: 提交前素材校验

系统 SHALL 在本地执行素材一致性校验脚本。

- **Scenario: 开发者提交前执行检查**
  - **WHEN** 运行 `assets:check`
  - **THEN** 报告缺失文件、重复 key、非法扩展名
  - **THEN** 存在错误时返回非零状态码

### Requirement: 文档化协作流程

系统 SHALL 提供团队可复用的素材接入步骤文档。

- **Scenario: 新成员接入素材**
  - **WHEN** 阅读流程文档
  - **THEN** 能按步骤完成放置、配置、校验、预览、提交流程

## MODIFIED Requirements

- 调整现有“背景图可选加载”能力为“通用素材清单可选加载能力”，并保持回退行为不变。

## REMOVED Requirements

- 无。
