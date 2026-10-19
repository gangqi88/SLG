# 架构概览

## 总体说明

当前项目是一个以 **React 页面层 + Phaser 局部玩法场景 + Redux 局部状态管理** 组成的前端游戏原型。

它并不是旧模板式的 `src/game + EventBus + 单一 Phaser 容器` 架构，而是已经演化为以业务模块为中心的 **feature-based** 组织方式。

## 当前目录结构

### 核心入口

- `src/main.tsx`：React 应用入口
- `src/App.tsx`：应用壳层
- `src/router.tsx`：路由注册与页面懒加载
- `src/store/index.ts`：Redux store 配置

### 业务模块

- `src/features/alliance/`
- `src/features/battle/`
- `src/features/city/`
- `src/features/gacha/`
- `src/features/hero/`
- `src/features/main/`
- `src/features/resource/`
- `src/features/task/`

### 共享层

- `src/shared/components/`：共享 UI 组件
- `src/shared/scenes/`：共享 Phaser 场景
- `src/shared/utils/`：工具函数
- `src/shared/styles/`：共享样式与 token
- `src/shared/visuals/`：Phaser 可视化对象
- `src/shared/web3/` / `src/shared/utils/web3.ts`：Web3 与钱包能力

## 路由与页面

以 `src/router.tsx` 为准，当前共 15 条路由：

| 路由 | 页面组件 | 说明 |
| --- | --- | --- |
| `/` | `GameMain` | 主界面入口宫格（不是英雄列表） |
| `/heroes` | `HeroList` | 英雄列表 |
| `/city` | `CityView` | 主城 Phaser 场景 |
| `/main-city` | `MainCityView` | 主城经营（建筑 / 商店 / 拍卖） |
| `/gathering` | `GatheringView` | 资源采集 |
| `/tasks` | `TaskView` | 任务 |
| `/gacha` | `GachaView` | 抽卡 |
| `/lootbox` | `LootBoxView` | 宝箱 |
| `/tower-defense` | `TowerDefenseView` | 塔防 |
| `/cooking` | `CookingView` | 烹饪 |
| `/siege` | `SiegeView` | 攻城 |
| `/battle` | `BattleRoute` | 战斗 |
| `/reports` | `BattleReportsView` | 战斗战报 |
| `/alliance` | `AllianceDashboard` | 联盟 |
| `/style-guide` | `StyleGuide` | 样式演示 |

> 主界面配置中的 `world`（`/world`）入口标记为 `locked`，且尚未注册对应路由，当前不可进入。

## 状态管理

当前 Redux store 已确认接入：

- `alliance`
- `city`

这说明项目现状是**Redux 与本地逻辑类并存**，而不是所有功能都已统一到单一状态管理模式。

## Phaser 集成方式

- Phaser 不再只存在于单独 `src/game/` 目录中
- 各玩法模块下存在自己的 scene / logic / component 组合
- `src/shared/scenes/PreloadScene.ts` 等共享场景承载公共启动能力

## Web3 集成现状

- 当前代码主要通过 `window.unisat` 进行钱包接入
- 钱包连接入口可见于 `src/shared/components/WalletConnect.tsx`
- 基础能力封装位于 `src/shared/utils/web3.ts`
- `src/shared/web3/NFTManager.ts` 目前是**演示实现**：`heroToMetadata()` 可用，`mintHero()` 仅 `setTimeout` 后返回 `true`，不发起任何链上调用
- `test/contracts/` 下的 `AllianceNFT.sol`、`BuildingNFT.sol` 是独立的 Hardhat 子项目，**与 `src/` 没有运行时连接**

因此，Web3 文档应以 **UniSat 当前实现 + NFT 为 mock** 为准，而不是以历史规划中的其他方案为准。

## 设计取向

当前实现更接近以下模式：

- React 负责页面路由、布局、状态接入、交互 UI
- Phaser 负责局部游戏场景与可视化玩法
- 共享逻辑沉淀在 `shared`，业务逻辑按 feature 拆分

## 阅读建议

- 先看 `src/router.tsx` 理解页面组织
- 再看 `src/features/` 理解业务域拆分
- 最后看 `src/shared/` 理解跨模块复用能力