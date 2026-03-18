# 《指尖无双》手游 · 界面整合规格说明（V1.0 落地版）

> **目标读者**：UI 开发、交互实现、视觉验收、联调测试  
> **使用边界**：本文用于把“需求说明书”落到本项目现有代码结构中，作为实现与验收的共同依据，不替代最终代码与视觉稿。  
> **现行真源**：以代码为准（路由、页面壳层、各 feature 组件）。核心入口：`src/router.tsx`、`src/components/Layout.tsx`、`src/features/**`  

## 1. 背景

本仓库当前为 Web 技术栈（React + CSS Modules + Phaser 场景）实现的 SLG/卡牌玩法原型，已具备主界面、武将、主城、联盟、战斗、采集、抽卡/宝箱等模块的基础页面或场景：

- 主界面：`src/features/main/components/GameMain.tsx`
- 武将：`src/features/hero/components/HeroList.tsx`、`HeroDetail.tsx`、`HeroDevelopmentView.tsx`
- 主城：`src/features/city/components/MainCityView.tsx` + 建筑/广告/竞拍相关组件
- 联盟：`src/features/alliance/components/AllianceDashboard.tsx` + 多 Tab 子模块
- 战斗/采集（Phaser）：`src/features/battle/components/*`、`src/features/resource/components/*`
- 抽卡/宝箱：`src/features/gacha/components/*`

当前界面风格与交互存在“原型态/开发态”特征（例如 Layout 顶部开发导航、按钮/弹窗样式不统一、缺少资源 HUD、缺少红点/锁定/统一弹窗体系等）。本 spec 的目的，是把你提供的《界面需求说明书（完整版）》整合为“可在本项目中逐步实现的统一界面体系”。

## 2. 目标与非目标

### 2.1 目标

- 建立统一的全局视觉规范（色值、字体、间距、按钮尺寸、安全区）并在页面级落地。
- 实现通用“游戏壳层”（顶部导航栏 + 资源栏 + 底部快捷栏）以覆盖主界面与主要模块。
- 将主界面固化为 12 个功能入口（2×6），支持：点击动效、未解锁置灰提示、红点/角标。
- 将武将界面收敛为“左列表 + 右详情”的标准信息架构，并对升级/升星/进阶给出一致的反馈与资源消耗路径。
- 将主城界面收敛为“建筑列表 + 右侧广告/竞拍面板”的标准结构。
- 将联盟界面收敛为“联盟信息 + 功能入口 + 世界城池地图（可先占位）”结构。
- 统一弹窗与红点规则，并提供可配置文本/多语言接入点。

### 2.2 非目标（本轮不做）

- 不要求一次性补齐所有玩法完整内容（例如真正可玩的世界地图、完整攻城流程、完整战斗 UI/技能系统等可分阶段实现）。
- 不引入新的 UI 框架（沿用 React + CSS Modules + 现有全局 CSS）。
- 不改动 Phaser 场景核心玩法逻辑（仅在外层增加 HUD/交互壳层与通信事件约定）。

## 3. 现状梳理（与代码对齐）

### 3.1 路由与模块入口

路由当前已基本按模块拆分并以 `/` 主界面作为默认落点：

- `/`：GameMain（主界面）
- `/heroes`：HeroList（武将）
- `/main-city`：MainCityView（主城）
- `/city`：CityView（Phaser 城市场景）
- `/gathering`：GatheringView（采集）
- `/tasks`：TaskView（任务）
- `/gacha`：GachaView（招募）
- `/lootbox`：LootBoxView（宝箱/背包）
- `/tower-defense`：TowerDefenseView（守桥类）
- `/cooking`：CookingView（厨神大赛）
- `/siege`：SiegeView（攻城战）
- `/battle`：BattleRoute（战斗入口/测试）
- `/alliance`：AllianceDashboard（联盟）

对应代码：[router.tsx](file:///d:/testProject/SLG/src/router.tsx)

### 3.2 页面壳层

Layout 目前包含钱包连接区与开发态 NavLink 导航，不符合“游戏 HUD”要求。后续应将“游戏壳层”与“开发导航”解耦：

- 游戏壳层：顶部导航栏 + 资源栏 + 底部快捷栏
- 开发工具：Style Guide、调试入口可保留在独立页面或隐藏入口

对应代码：[Layout.tsx](file:///d:/testProject/SLG/src/components/Layout.tsx)

### 3.3 全局样式与动效基础

项目已有暗色底与基础按钮样式、fade/slide 动画类：

对应代码：[index.css](file:///d:/testProject/SLG/src/index.css)

## 4. 全局视觉规范（代码落地口径）

本节把“需求说明书”的全局规范转换为项目可实现的 Design Tokens 与组件约束。

### 4.1 颜色 Token（必须）

在现有 CSS 变量基础上，补齐并以游戏需求为准（示例命名，最终以实现为准）：

- 背景
  - 主背景：`#1A1A2A`
  - 面板背景：`#25253A`
  - 边框/分割线：`#3A3A5A`
- 文本
  - 金色标题：`#D4B87E`
  - 白色正文：`#FFFFFF`
  - 灰色辅助：`#9999AA`
- 语义按钮色
  - 确认/升级：`#4CAF50`
  - 奖励/活动：`#FFC107`
  - 攻城/战斗：`#F44336`
  - 武将/信息：`#2196F3`
- 品质色
  - 绿：`#8BC34A`，蓝：`#2196F3`，紫：`#9C27B0`，橙：`#FF9800`，红：`#F44336`

落地建议：

- 在 `src/index.css` 或 `src/shared/styles/tokens.css` 中新增一套 `--game-*` 变量，避免破坏现有原型变量。
- 更新 `StyleGuide` 展示游戏 token，作为视觉验收参照页。

### 4.2 字体与字号（必须）

移动端优先，字号以“sp 对应 px”在 Web 侧用 `rem`/`px`表达，形成固定档位：

- 大标题：26–32（加粗）
- 模块标题：22
- 正文：18–20
- 辅助小字：14–16
- 数字属性：等宽字体（可用系统 monospace）

### 4.3 控件尺寸与间距（必须）

- 功能图标：64×64
- 武将头像：128×128
- 按钮最小点击区域：88×88
- 列表间距：16
- 面板圆角：12

落地建议：

- 为按钮/入口卡片统一定义最小 `min-height`、`min-width` 与 padding。
- 使用 `env(safe-area-inset-*)` 适配刘海/底部手势条。

## 5. 通用交互与动效规范（必做）

### 5.1 基础动效（必须）

- 按钮点击：`scale(0.95) -> scale(1)`，并提升亮度
- 界面切换：淡入淡出 0.25s（路由切换容器级动效）
- 弹窗：从中心缩放弹出
- 列表：惯性滚动 + 边界回弹（Web 侧通过滚动容器 + overscroll 行为尽量模拟）

落地建议：

- 复用现有 `.animate-fade-in`、`.animate-slide-in`，补齐 `scale-in` 与 `press` 动效类。
- Phaser 场景外层 HUD 不参与 Canvas 缩放抖动，动效仅在 React 层完成。

### 5.2 反馈一致性（必须）

- 未解锁模块：置灰不可点，点击弹“解锁条件”提示
- 有红点：右上角红点 + 数字角标（当数量 > 0）
- 已读/已领：红点消失

## 6. 公共组件规格（建议按组件库方式实现）

### 6.1 GameShell（全局壳层）

覆盖范围：主界面、武将、主城、联盟、活动等 React 页面；Phaser 场景页可选择“壳层内嵌”或“场景全屏 + HUD 覆盖”。

#### 6.1.1 顶部导航栏（TopBar）

- 左侧：返回 / 主页（根据路由栈或指定返回目的地）
- 中间：当前界面名称（来自路由元信息）
- 右侧：设置、邮件、福利、头像、充值（可先占位按钮）

#### 6.1.2 资源栏（ResourceBar）

固定在 TopBar 下方，展示：金币、元宝、粮食、木材、矿石、包子。

- 点击资源：跳转到对应产出界面（短期可弹“前往产出”提示或路由占位）
- 数据来源：短期可用本地管理器（ResourceManager/InventoryManager），中长期迁移到 store

#### 6.1.3 底部快捷栏（BottomBar）

固定 5 个入口：背包、邮件、好友、福利、活动。

- 支持红点/角标
- 未实现模块可“置灰 + 提示”

### 6.2 模块入口卡片（ModuleEntry）

用于主界面 12 宫格与其他入口按钮。

- 视觉：图标 64×64 + 标题 + 红点/锁定态
- 交互：点击动效（0.95→1.0）、淡入跳转

### 6.3 通用弹窗（Modal System）

必须实现的弹窗类型（统一样式、统一动画、统一遮罩层）：

1. 奖励获得弹窗
2. 资源不足弹窗
3. 二次确认弹窗
4. 奖励预览弹窗
5. 战报弹窗
6. 竞拍结果弹窗

落地建议：

- React 侧统一 `ModalHost`，由全局状态或事件总线触发。
- 现有页面中散落的 overlay/modal（例如英雄详情、宝箱开箱）逐步迁移到统一体系。

## 7. 页面级规格

### 7.1 主界面（Game Main）

对应代码：[GameMain.tsx](file:///d:/testProject/SLG/src/features/main/components/GameMain.tsx)

#### 7.1.1 结构（必须）

1. 顶部导航栏（TopBar）
2. 资源栏（ResourceBar）
3. 中部功能入口网格：固定 12 个入口，2×6
   1) 武将（/heroes）
   2) 主城（/main-city）
   3) 世界地图（占位/锁定）
   4) 资源采集（/gathering）
   5) 任务（/tasks）
   6) 招募（/gacha）
   7) 宝箱（/lootbox）
   8) 守桥（/tower-defense）
   9) 厨神大赛（/cooking）
   10) 攻城战（/siege）
   11) 试炼/战斗（/battle）
   12) 联盟（/alliance）
4. 底部快捷栏（BottomBar）

#### 7.1.2 交互（必须）

- 入口点击：缩放回弹 + 0.25s 淡入切换
- 未解锁：置灰 + 点击提示解锁条件
- 红点：支持数值角标

### 7.2 武将界面（Heroes）

对应代码：[HeroList.tsx](file:///d:/testProject/SLG/src/features/hero/components/HeroList.tsx)、[HeroDetail.tsx](file:///d:/testProject/SLG/src/features/hero/components/HeroDetail.tsx)、[HeroDevelopmentView.tsx](file:///d:/testProject/SLG/src/features/hero/components/HeroDevelopmentView.tsx)

#### 7.2.1 结构（必须）

- 左侧：武将列表
  - 筛选：阵营（蜀/魏/吴/群）、品质、职业
  - 搜索：名称关键字
  - 卡片：头像、名称、等级、星级、战力、品质边框
- 右侧：武将详情
  - 基础信息：头像、名称、等级、星级、阵营、职业
  - 属性：攻击、防御、生命、速度（数字等宽）
  - 技能：主动（CD/效果）、被动、追击/连招
  - 养成按钮：升级、升星、进阶、装备

#### 7.2.2 养成规则（必须）

- 升级：消耗包子（现有实现为经验道具，需映射/替换）
- 升星：消耗碎片（现有实现已具备碎片消耗）
- 进阶：每 10 级一次，触发品质颜色变化（现有 HeroLogic 需补齐）

#### 7.2.3 反馈动效（必须）

- 成功：闪光 + 飘字 + 属性跳变动画
- 失败：资源不足弹窗（替换 alert）

### 7.3 主城界面（Main City）

对应代码：[MainCityView.tsx](file:///d:/testProject/SLG/src/features/city/components/MainCityView.tsx)、建筑组件与竞拍组件（`src/features/city/components/*`）

#### 7.3.1 建筑列表（必须）

- 建筑卡片：图标、名称、当前等级/上限、产出描述、升级按钮
- 升级判断：资源足够 → 执行；不足 → 资源不足弹窗（提供获取途径入口）

#### 7.3.2 右侧广告/竞拍面板（必须）

- 显示当前竞拍物品
- 出价记录
- 出价按钮
- 结束倒计时
- 归属：联盟贡献竞拍（数据可先 mock，UI 先完整）

落地建议：

- 现有 `AdBillboard` 可升级为“广告+竞拍”聚合面板，或用 `AuctionHouse/AuctionBid` 组合替换侧栏内容。

### 7.4 联盟界面（Alliance）

对应代码：[AllianceDashboard.tsx](file:///d:/testProject/SLG/src/features/alliance/components/AllianceDashboard.tsx)

#### 7.4.1 联盟信息（必须）

- 名称、等级、人数、盟主、贡献、战力总和

#### 7.4.2 功能入口（必须）

- 成员管理、联盟公告、联盟科技、联盟商店、攻城战、退出/解散

落地建议：

- 现有 tab 结构可映射为入口区或保留 tab 但视觉/文案对齐；“退出/解散”补齐到 header 的更多菜单。

#### 7.4.3 世界城池地图（阶段性交付）

- 城池状态颜色：己方绿、可宣战黄、敌方红
- 点击城池：查看信息、宣战、协防、战报

说明：

- 本项目暂未实现真实世界地图模块，可先实现“可滚动/缩放的地图面板 + 城池列表/点位 + 弹窗交互”占位，后续与攻城战逻辑对接。

### 7.5 战斗/攻城/采集通用界面

对应代码：`src/features/battle/components/*`、`src/features/resource/components/*`

#### 7.5.1 战斗界面（阶段性交付）

- 顶部：双方头像、血量、战力
- 中部：战斗表现（Phaser/像素动作）
- 底部：技能按钮、自动战斗、加速
- 结算：胜负、奖励、战功、经验（统一奖励弹窗）

说明：

- 当前 BattleView 仅提供“Exit”按钮；本轮先定义 HUD 外层结构与事件接口（如 `onAutoToggle`、`onSpeedChange`、`onSkillClick`），Phaser 内部可延后接入。

#### 7.5.2 资源采集（阶段性交付）

- 横版卷轴场景（已具备 GatheringScene）
- 队伍配置：最多 5 人（需新增配置面板）
- 采集进度条
- 离线收益结算面板

#### 7.5.3 攻城战（阶段性交付）

- 宣战倒计时
- 集结队伍
- 战报实时展示
- 占领后城池归属变更（后续与联盟地图联动）

## 8. 状态与数据（建议约束）

### 8.1 红点/角标数据模型

建议将红点从“组件内部判断”收敛到一个统一的 UI 通知模型（可先本地实现，后续接入 store）：

- `canClaimRewards`：可领取（红点）
- `hasNewMessages`：新信息（红点）
- `count`：数量角标（>0 显示数字）

入口（主界面/底栏/页面按钮）均从同一来源读取红点状态，避免重复逻辑。

### 8.2 文本可配置与多语言

当前代码中文/英文混用。后续落地要求：

- 所有 UI 文案通过一个集中配置层读取（短期可用 `const strings = {}` + context，后续替换为 i18n 库）
- 页面标题与入口名也走同一套配置

## 9. 验收标准（与需求书一致）

- 所有界面结构与需求一致，无缺失模块（允许阶段性“锁定/占位”但必须可见且可解释）
- 色值、字体、图标、间距统一（以 Style Guide 页与 token 为准）
- 点击/跳转/弹窗无明显交互缺陷
- 红点、数字角标逻辑正确
- 养成、升级、攻城、竞拍流程 UI 链路完整（逻辑可先 mock，交互与弹窗必须完整）
- 支持竖屏安全区；按钮最小 88×88；720P/1080P/2K 自适应
- 所有文字可配置（至少预留多语言接入点）

