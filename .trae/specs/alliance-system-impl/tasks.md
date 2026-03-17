# 联盟系统实现任务清单

> **当前归类**: 任务过程文档（部分结果已落地，部分 Web3 / 测试验收项未完成）  
> **使用边界**: 勾选状态反映的是当时任务拆解与推进过程，不等于当前仓库的完整交付或质量结论。  
> **现行真源**: 实际代码、`docs/README.md`

## 任务总览

本任务清单将联盟系统开发分解为可执行的具体任务，每个任务都有明确的交付成果和验收标准。

## 阶段一：基础设施（第1周）

### 任务1.1：类型定义与配置

- [x] 1.1.1 创建 `src/types/Alliance.ts`，定义 Alliance、AllianceMember、AllianceRole、AllianceTech、AdSpace、AdBid、ChatMessage、TradeRequest、AllianceWar 等接口
- [x] 1.1.2 创建 `src/config/alliance.ts`，定义联盟等级配置、科技配置、商店物品配置
- [x] 1.1.3 验证 TypeScript 编译无错误

### 任务1.2：AllianceManager 单例框架

- [x] 1.2.1 创建 `src/game/logic/AllianceManager.ts` 单例类框架
- [x] 1.2.2 实现状态管理与 localStorage 持久化
- [x] 1.2.3 实现事件订阅机制

### 任务1.3：React Hook

- [x] 1.3.1 创建 `src/hooks/useAlliance.ts` Hook
- [x] 1.3.2 实现基础状态管理

## 阶段二：核心功能（第2-3周）

### 任务2.1：联盟管理

- [x] 2.1.1 实现 createAlliance 方法 - 创建联盟
- [x] 2.1.2 实现 joinAlliance 方法 - 加入联盟
- [x] 2.1.3 实现 leaveAlliance 方法 - 离开联盟
- [x] 2.1.4 实现 updateAnnouncement 方法 - 更新公告
- [x] 2.1.5 实现 upgradeAlliance 方法 - 联盟升级

### 任务2.2：签到系统

- [x] 2.2.1 实现 checkIn 方法 - 签到
- [x] 2.2.2 实现 getCheckInStatus 方法 - 获取签到状态
- [x] 2.2.3 实现连续签到奖励计算

### 任务2.3：聊天系统

- [x] 2.3.1 实现 sendChatMessage 方法 - 发送消息
- [x] 2.3.2 实现 getChatHistory 方法 - 获取历史消息
- [x] 2.3.3 实现消息类型处理（普通/系统/公告）

## 阶段三：经济系统（第4周）

### 任务3.1：商店系统

- [x] 3.1.1 实现 getShopItems 方法 - 获取商店物品
- [x] 3.1.2 实现 buyShopItem 方法 - 购买物品
- [x] 3.1.3 实现每周限购逻辑

### 任务3.2：交易系统

- [x] 3.2.1 实现 createTradeRequest 方法 - 创建交易
- [x] 3.2.2 实现 acceptTradeRequest 方法 - 接受交易
- [x] 3.2.3 实现 cancelTradeRequest 方法 - 取消交易

### 任务3.3：广告系统

- [x] 3.3.1 实现 placeAdBid 方法 - 出价
- [x] 3.3.2 实现 getAdInfo 方法 - 获取广告信息
- [x] 3.3.3 实现每周广告位结算

## 阶段四：高级功能（第5-6周）

### 任务4.1：科技系统

- [x] 4.1.1 实现 getTechInfo 方法 - 获取科技信息
- [x] 4.1.2 实现 upgradeTech 方法 - 升级科技
- [x] 4.1.3 实现科技属性加成计算

### 任务4.2：联盟战

- [x] 4.2.1 实现 declareWar 方法 - 宣战
- [x] 4.2.2 实现 getWarInfo 方法 - 获取战争信息
- [x] 4.2.3 实现 submitWarScore 方法 - 提交战绩
- [x] 4.2.4 实现战争结算与奖励发放

## 阶段五：Web3集成（第7周）

### 任务5.1：智能合约接口

- [ ] 5.1.1 创建联盟NFT合约接口
- [ ] 5.1.2 创建国库合约接口
- [ ] 5.1.3 实现事件监听 Hook

### 任务5.2：链上交互

- [ ] 5.2.1 实现链上联盟创建
- [ ] 5.2.2 实现链上贡献点同步
- [ ] 5.2.3 实现国库存取功能

## 阶段六：组件开发（第8周）

### 任务6.1：React组件

- [x] 6.1.1 创建 AllianceDashboard 组件
- [x] 6.1.2 创建 AllianceInfoPanel 组件
- [x] 6.1.3 创建 AllianceMemberList 组件
- [x] 6.1.4 创建 AllianceCheckIn 组件
- [x] 6.1.5 创建 AllianceChat 组件
- [x] 6.1.6 创建 AllianceShop 组件
- [x] 6.1.7 创建 AllianceTrade 组件
- [x] 6.1.8 创建 AllianceTech 组件
- [x] 6.1.9 创建 AllianceWar 组件
- [x] 6.1.10 创建 AllianceAd 组件

## 阶段七：测试与验收（第9周）

### 任务7.1：单元测试

- [ ] 7.1.1 为 AllianceManager 核心方法编写单元测试
- [ ] 7.1.2 为业务逻辑编写集成测试

### 任务7.2：验收测试

- [ ] 7.2.1 验证所有功能符合 spec.md 规范
- [ ] 7.2.2 性能测试 - 响应时间验证
- [ ] 7.2.3 安全测试 - 权限控制验证

## 任务依赖

- [任务1.1] 必须在 [任务1.2] 之前完成
- [任务1.2] 必须在 [任务2.1] 之前完成
- [任务1.2] 必须在 [任务2.2] 之前完成
- [任务1.3] 必须在 [任务6.1] 之前完成
- [任务2.1] 必须在 [任务4.2] 之前完成
- [任务3.1] 必须在 [任务3.3] 之前完成
