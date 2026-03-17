# 联盟系统开发计划 (Alliance System Implementation Plan)

> **当前归类**: 规划方案（非现行实现真源）  
> **使用边界**: 用于理解联盟系统设计目标、功能范围与专题方案，不可直接视为当前代码已全部实现。  
> **现行真源**: 实际代码、`docs/README.md`、`docs/architecture/overview.md`

> **文档版本**: 2.0.0  
> **修订日期**: 2026-03-10  
> **关联文档**: Web3游戏项目-SLG.md (最终完整版)  
> **状态**: 正式发布（指该规划文档版本已发布，不代表代码已全部落地）

---

## 修订记录 (Revision History)

| 版本  | 日期       | 作者   | 变更内容                                                            |
| ----- | ---------- | ------ | ------------------------------------------------------------------- |
| 1.0.0 | 2026-02-18 | 系统   | 初始版本，仅包含签到、交易、议事厅、联盟商店                        |
| 2.0.0 | 2026-03-10 | AI助手 | 全面升级，对齐Web3游戏项目-SLG.md，新增联盟科技、联盟战、Web3集成等 |

---

## 术语表 (Glossary)

| 术语          | 定义                          | i18n Key              |
| ------------- | ----------------------------- | --------------------- |
| Alliance      | 联盟，玩家组成的社交团体      | alliance.title        |
| Contribution  | 贡献点，联盟内流通的积分货币  | alliance.contribution |
| Alliance Tech | 联盟科技，全员属性增益系统    | alliance.tech         |
| Alliance War  | 联盟战，联盟间的PVP战斗系统   | alliance.war          |
| Treasury      | 联盟国库，链上资金/资产存储   | alliance.treasury     |
| Check-in      | 签到，每日福利领取            | alliance.checkin      |
| Chat Hall     | 议事厅，联盟内即时通讯        | alliance.chat         |
| Shop          | 联盟商店，贡献点兑换系统      | alliance.shop         |
| Trade         | 联盟交易，成员间资源/英雄互换 | alliance.trade        |

---

## 依赖接口 (Dependency Interfaces)

### 内部接口

- `ResourceManager`: 资源管理（木材、石料、粮食、铜币）
- `HeroManager`: 英雄管理（获取、养成、阵容）
- `BattleManager`: 战斗系统（战斗计算、战报生成）
- `GameManager`: 游戏主控（状态同步、事件总线）

### 外部接口（Web3）

- `IAllianceNFT`: 联盟NFT合约接口
- `ITreasuryContract`: 国库合约接口
- `IRandomOracle`: 随机数预言机接口

---

## 风险与合规 (Risk & Compliance)

### 风险识别

| 风险项         | 等级 | 缓解措施                     |
| -------------- | ---- | ---------------------------- |
| 联盟资金被盗   | 高   | 多签机制、冷却期、额度限制   |
| 联盟战恶意宣战 | 中   | 宣战CD、保证金制度           |
| Web3钱包兼容   | 中   | 多钱包支持（UniSat/Fractal） |

### 合规检查清单

- [ ] KYC/AML合规（玩家身份验证）
- [ ] 数据隐私（GDPR/CCPA）
- [ ] 智能合约审计
- [ ] 反洗钱监控
- [ ] 地区限制（禁止地区名单）

---

## 1. 目标 (Objectives)

### 1.1 业务目标

- 构建玩家社交核心载体，提升留存与付费
- 实现联盟NFT化，支持链上确权与交易
- 建立联盟贡献循环，促进生态活跃

### 1.2 技术目标

- 链上联盟数据存储（国库、智能合约）
- 前端实时同步（WebSocket/轮询）
- 智能合约Gas优化（<500K per tx）

### 1.3 设计目标

- 对齐Web3游戏项目-SLG.md:10.5联盟系统规范
- 支持30名英雄、3族阵营的联盟加成
- 赛季制联盟战（S1/S2/S3）

---

## 2. 规则 (Rules)

### 2.1 联盟创建与加入

- **创建条件**: 消耗 `10,000` 铜币，无联盟可创建
- **加入条件**: 联盟人数 < 上限，盟主/官员审批
- **退出条件**: 提前24小时申请，离盟扣除50%贡献点
- **解散条件**: 盟主手动解散，7天无成员自动解散

### 2.2 联盟等级与规模

| 等级 | 成员上限 | 升级成本(铜币) | 解锁功能    |
| ---- | -------- | -------------- | ----------- |
| 1    | 10       | 0              | 基础聊天    |
| 2    | 15       | 50,000         | 签到、交易  |
| 3    | 20       | 150,000        | 联盟商店    |
| 4    | 30       | 400,000        | 联盟科技Lv1 |
| 5    | 50       | 1,000,000      | 联盟战      |
| 6    | 80       | 2,500,000      | 联盟科技Lv2 |
| 7    | 100      | 5,000,000      | 联盟科技Lv3 |
| 8    | 150      | 10,000,000     | 联盟战高级  |

### 2.3 联盟贡献度

- **获取途径**:
  - 资源捐赠: 1资源 = 1贡献点（基础）
  - 英雄捐赠: 紫将=500, 橙将=2000, 红将=10000
  - 联盟战参与: 参与=100, 胜利=500, 指挥=1000
  - 每日签到: 50贡献点
  - 活动奖励: 节日活动、赛季奖励
- **消耗途径**:
  - 联盟商店购物
  - 联盟科技升级
  - 解锁联盟建筑

### 2.4 联盟科技

| 科技名称 | 效果            | 满级 | 每级成本(贡献点) | 升级时间 |
| -------- | --------------- | ---- | ---------------- | -------- |
| 资源增产 | 全资源+5%/级    | 5级  | 500              | 1小时    |
| 训练加速 | 征兵速度+8%/级  | 5级  | 800              | 2小时    |
| 防御强化 | 城防+10%/级     | 5级  | 1000             | 3小时    |
| 攻击强化 | 野战伤害+8%/级  | 5级  | 1000             | 3小时    |
| 采集增益 | 采集速度+15%/级 | 3级  | 1500             | 6小时    |

### 2.5 联盟战规则

- **宣战条件**: 联盟等级≥5，宣战令×1
- **宣战CD**: 48小时冷却
- **保证金**: 双方各押50,000铜币
- **战斗时间**: 宣战后的24小时内
- **结算**: 结束时占领分高者胜
- **奖励**: 胜方获得战利品（失败方资源的20%）

---

## 3. 数值 (Numerical Parameters)

### 3.1 联盟升级成本（铜币）

```
LevelCost(lvl) = base * (growthRate ^ (lvl - 1))
- base = 50000
- growthRate = 1.8
```

| 等级 | 升级成本  | 累计成本  |
| ---- | --------- | --------- |
| 1→2  | 50,000    | 50,000    |
| 2→3  | 90,000    | 140,000   |
| 3→4  | 162,000   | 302,000   |
| 3→5  | 291,600   | 593,600   |
| 5→6  | 524,880   | 1,118,480 |
| 6→7  | 944,784   | 2,063,264 |
| 7→8  | 1,700,611 | 3,763,875 |

### 3.2 签到奖励池（每日释放）

- **总池**: 100,000贡献点/日
- **分配规则**: 按联盟活跃度加权
- **个人上限**: 200贡献点/日

### 3.3 联盟商店物品

| 物品ID         | 名称         | 价格(贡献点) | 库存/周 |
| -------------- | ------------ | ------------ | ------- |
| hero_purple    | 将魂(紫)×100 | 500          | 20      |
| hero_orange    | 将魂(橙)×100 | 2000         | 5       |
| resource_wood  | 木材×10,000  | 100          | 100     |
| resource_stone | 石料×10,000  | 100          | 100     |
| resource_food  | 粮食×10,000  | 100          | 100     |
| resource_gold  | 铜币×1,000   | 200          | 50      |
| speedup_1h     | 加速×1小时   | 300          | 30      |
| speedup_24h    | 加速×24小时  | 5000         | 5       |

---

## 4. 前端交互 (Frontend Interactions)

### 4.1 数据结构

```typescript
// src/types/Alliance.ts

export enum AllianceRole {
  LEADER = 'leader', // 盟主
  OFFICER = 'officer', // 官员
  MEMBER = 'member', // 成员
}

export interface Alliance {
  id: string;
  name: string;
  level: number;
  announcement: string;
  leaderId: string;
  memberCount: number;
  maxMembers: number;
  createdAt: number;
  adSpace: AdSpace | null;
  techLevel: Record<string, number>;
}

export interface AllianceMember {
  id: string;
  address: string;
  name: string;
  role: AllianceRole;
  contribution: number;
  lastCheckIn: number;
  joinedAt: number;
  weeklyContribution: number;
}

export interface AllianceTech {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  currentLevel: number;
  costPerLevel: number;
  upgradeTime: number;
}

export interface AdSpace {
  allianceId: string;
  message: string;
  expiresAt: number;
}

export interface AdBid {
  allianceId: string;
  amount: number;
  timestamp: number;
  refunded: boolean;
}

export interface ShopItem {
  id: string;
  nameKey: string;
  descriptionKey: string;
  price: number;
  currency: 'contribution' | 'token';
  weeklyLimit: number;
  soldThisWeek: number;
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'normal' | 'system' | 'announcement';
}

export interface TradeRequest {
  id: string;
  creatorId: string;
  offerType: 'resource' | 'hero';
  offerAmount: number;
  requestType: 'resource' | 'hero';
  requestAmount: number;
  status: 'open' | 'accepted' | 'cancelled';
  createdAt: number;
}

export interface AllianceWar {
  id: string;
  attackerId: string;
  defenderId: string;
  startTime: number;
  endTime: number;
  attackerScore: number;
  defenderScore: number;
  status: 'preparing' | 'active' | 'finished';
  winnerId: string | null;
}
```

### 4.2 核心API

```typescript
// src/game/logic/AllianceManager.ts

export interface AllianceManagerState {
  currentAlliance: Alliance | null;
  members: AllianceMember[];
  chatMessages: ChatMessage[];
  tradeRequests: TradeRequest[];
  shopItems: ShopItem[];
  pendingBids: AdBid[];
  activeWar: AllianceWar | null;
}

class AllianceManager {
  // ============ 联盟管理 ============
  createAlliance(name: string): Promise<Alliance>;
  joinAlliance(id: string): Promise<void>;
  leaveAlliance(): Promise<void>;
  updateAnnouncement(content: string): Promise<void>;

  // ============ 签到系统 ============
  checkIn(): Promise<{ contribution: number; resources: ResourceAmount }>;
  getCheckInStatus(): { available: boolean; streak: number };

  // ============ 聊天系统 ============
  sendChatMessage(content: string): Promise<ChatMessage>;
  getChatHistory(offset?: number, limit?: number): Promise<ChatMessage[]>;

  // ============ 商店系统 ============
  getShopItems(): Promise<ShopItem[]>;
  buyShopItem(itemId: string, quantity: number): Promise<boolean>;

  // ============ 交易系统 ============
  createTradeRequest(offer: TradeOffer, request: TradeRequest): Promise<TradeRequest>;
  acceptTradeRequest(tradeId: string): Promise<boolean>;
  cancelTradeRequest(tradeId: string): Promise<void>;

  // ============ 广告系统 ============
  placeAdBid(amount: number): Promise<AdBid>;
  getAdInfo(): Promise<AdSpace | null>;

  // ============ 科技系统 ============
  upgradeTech(techId: string): Promise<boolean>;
  getTechInfo(): Promise<AllianceTech[]>;

  // ============ 联盟战 ============
  declareWar(targetAllianceId: string): Promise<AllianceWar>;
  getWarInfo(): Promise<AllianceWar | null>;
  submitWarScore(score: number): Promise<void>;

  // ============ 持久化 ============
  save(): Promise<boolean>;
  load(): Promise<boolean>;
}
```

### 4.3 组件结构

```
src/components/Alliance/
├── AllianceDashboard.tsx      # 联盟主界面
├── AllianceInfoPanel.tsx      # 联盟信息展示
├── AllianceMemberList.tsx     # 成员列表
├── AllianceCheckIn.tsx       # 签到界面
├── AllianceChat.tsx           # 议事厅聊天
├── AllianceShop.tsx          # 联盟商店
├── AllianceTrade.tsx         # 交易界面
├── AllianceTech.tsx           # 联盟科技
├── AllianceWar.tsx           # 联盟战
├── AllianceAd.tsx             # 广告牌
└── index.ts                   # 统一导出
```

---

## 5. 链上交互 (On-Chain Interactions)

### 5.1 智能合约事件清单

```solidity
// contracts/Alliance.sol

pragma solidity ^0.8.19;

interface IAllianceEvents {
    event AllianceCreated(
        uint256 indexed allianceId,
        string name,
        address indexed creator,
        uint256 timestamp
    );

    event MemberJoined(
        uint256 indexed allianceId,
        address indexed member,
        uint256 timestamp
    );

    event MemberLeft(
        uint256 indexed allianceId,
        address indexed member,
        uint256 timestamp
    );

    event ContributionReceived(
        uint256 indexed allianceId,
        address indexed member,
        uint256 amount,
        uint256 totalContribution,
        uint256 timestamp
    );

    event ShopPurchase(
        uint256 indexed allianceId,
        address indexed buyer,
        uint256 itemId,
        uint256 quantity,
        uint256 totalPaid,
        uint256 timestamp
    );

    event TechUpgraded(
        uint256 indexed allianceId,
        string techName,
        uint8 newLevel,
        uint256 upgradeCost,
        uint256 timestamp
    );

    event WarDeclared(
        uint256 indexed attackerId,
        uint256 indexed defenderId,
        uint256 startTime,
        uint256 endTime,
        uint256 attackerDeposit,
        uint256 defenderDeposit
    );

    event WarEnded(
        uint256 indexed warId,
        uint256 indexed winnerId,
        uint256 loserReward,
        uint256 timestamp
    );

    event TreasuryDeposit(
        uint256 indexed allianceId,
        address indexed depositor,
        uint256 amount,
        uint256 newBalance,
        uint256 timestamp
    );

    event TreasuryWithdraw(
        uint256 indexed allianceId,
        address indexed recipient,
        uint256 amount,
        uint256 remainingBalance,
        uint256 timestamp
    );
}
```

### 5.2 Gas估算

| 操作     | 预估Gas | 条件         |
| -------- | ------- | ------------ |
| 创建联盟 | 350,000 | 首次部署NFT  |
| 加入联盟 | 80,000  | 状态更新     |
| 签到     | 60,000  | 贡献点写入   |
| 捐赠资源 | 100,000 | 链上记录     |
| 科技升级 | 200,000 | 状态+事件    |
| 商店购买 | 120,000 | 库存校验     |
| 宣战     | 180,000 | 保证金锁定   |
| 国库存款 | 50,000  | ETH transfer |
| 国库取款 | 80,000  | 多签验证     |

### 5.3 前端事件监听示例

```typescript
// src/hooks/useAllianceEvents.ts

import { useEffect, useCallback } from 'react';
import { useWeb3Provider } from './useWeb3Provider';

interface AllianceEvent {
  allianceId: string;
  member?: string;
  amount?: number;
  timestamp: number;
}

export const useAllianceEvents = (allianceId: string) => {
  const { provider, contracts } = useWeb3Provider();

  const handleContribution = useCallback((event: AllianceEvent) => {
    console.log('New contribution:', event);
    // 刷新贡献排行榜
    // 显示飘字动画
  }, []);

  const handleShopPurchase = useCallback((event: AllianceEvent & { itemId: string }) => {
    console.log('Shop purchase:', event);
    // 刷新商店库存
    // 显示购买成功提示
  }, []);

  const handleTechUpgrade = useCallback(
    (event: AllianceEvent & { techName: string; newLevel: number }) => {
      console.log('Tech upgraded:', event);
      // 刷新科技界面
      // 显示升级成功动画
    },
    [],
  );

  useEffect(() => {
    if (!provider || !contracts.alliance) return;

    const filter = { allianceId: allianceId };

    const contributionSub = contracts.alliance.on('ContributionReceived', handleContribution);
    const purchaseSub = contracts.alliance.on('ShopPurchase', handleShopPurchase);
    const techSub = contracts.alliance.on('TechUpgraded', handleTechUpgrade);

    return () => {
      contributionSub.unsubscribe();
      purchaseSub.unsubscribe();
      techSub.unsubscribe();
    };
  }, [provider, contracts.alliance, allianceId]);
};
```

### 5.4 Solidity接口片段

```solidity
// contracts/interfaces/IAlliance.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IAlliance is IERC721 {
    struct AllianceData {
        string name;
        uint8 level;
        uint256 contributionPool;
        uint256 treasuryBalance;
        uint256 createdAt;
        bool exists;
    }

    struct MemberData {
        address memberAddress;
        uint256 contribution;
        uint256 lastCheckIn;
        bool isActive;
    }

    function createAlliance(string calldata name) external returns (uint256);
    function joinAlliance(uint256 allianceId) external;
    function leaveAlliance(uint256 allianceId) external;

    function contribute(uint256 allianceId, uint256 amount) external;
    function checkIn(uint256 allianceId) external returns (uint256 reward);

    function purchaseShopItem(
        uint256 allianceId,
        uint256 itemId,
        uint256 quantity
    ) external returns (bool);

    function upgradeTech(
        uint256 allianceId,
        string calldata techName
    ) external returns (bool);

    function declareWar(
        uint256 attackerId,
        uint256 defenderId
    ) external payable returns (uint256 warId);

    function resolveWar(uint256 warId) external;

    // 国库功能
    function depositToTreasury(uint256 allianceId) external payable;
    function withdrawFromTreasury(
        uint256 allianceId,
        uint256 amount,
        address recipient
    ) external;

    // 查询
    function getAllianceData(uint256 allianceId) external view returns (AllianceData memory);
    function getMemberData(uint256 allianceId, address member) external view returns (MemberData memory);
    function getAllianceMembers(uint256 allianceId) external view returns (address[] memory);
}
```

---

## 6. 验收标准 (Acceptance Criteria)

### 6.1 功能验收

| 功能      | 验收条件                           | 测试方法           |
| --------- | ---------------------------------- | ------------------ |
| 创建联盟  | 铜币扣除，NFT minted，盟主权限正确 | 创建后查询链上数据 |
| 加入/离开 | 成员列表更新，贡献点正确处理       | 多账号测试         |
| 签到      | 贡献点增加，冷却时间正确           | 连续签到测试       |
| 商店购买  | 库存减少，贡献点扣除，物品发放     | 购买后查询         |
| 科技升级  | 等级提升，属性加成生效             | 战斗测试验证       |
| 联盟战    | 宣战、战斗、结算流程完整           | 模拟对战           |
| 国库      | 存取款正确，多签生效               | 存取测试           |

### 6.2 性能验收

| 指标         | 目标值          | 测试方法 |
| ------------ | --------------- | -------- |
| 链上交易确认 | <30秒           | 计时测试 |
| 前端响应     | <200ms          | 性能分析 |
| 内存占用     | <100MB          | 内存分析 |
| 离线同步     | 7天内数据不丢失 | 模拟离线 |

### 6.3 安全验收

| 检查项   | 验收条件                        |
| -------- | ------------------------------- |
| 权限控制 | 非盟主无法执行管理操作          |
| 金额限制 | 单次操作不超过上限              |
| 重入保护 | 遵循Checks-Effects-Interactions |
| 整数溢出 | 使用SafeMath或Solidity 0.8+     |

---

## 附录A: 新手引导流程图 (Onboarding Flowchart)

```
[玩家首次进入]
      ↓
[引导弹窗] → "加入联盟可以获得更多资源与帮助！"
      ↓
[选项] → [创建联盟] ─→ [输入名称] ─→ [确认] ─→ [完成]
      │
      ↓
[选项] → [加入联盟] ─→ [联盟列表] ─→ [申请] ─→ [等待审批] ─→ [加入成功]
      │
      ↓
[选项] → [暂不加入] ─→ [引导结束，后续可通过主城入口加入]
```

---

## 附录B: i18n 命名规范

```typescript
// i18n/keys/alliance.ts

export const allianceKeys = {
  // 标题
  'alliance.title': '联盟',
  'alliance.create': '创建联盟',
  'alliance.join': '加入联盟',
  'alliance.leave': '离开联盟',

  // 功能
  'alliance.checkin': '签到',
  'alliance.checkin.success': '签到成功，获得 {amount} 贡献点',
  'alliance.checkin.already': '今日已签到',
  'alliance.chat': '议事厅',
  'alliance.shop': '联盟商店',
  'alliance.trade': '交易',
  'alliance.tech': '联盟科技',
  'alliance.war': '联盟战',

  // 贡献
  'alliance.contribution': '贡献点',
  'alliance.contribution.total': '总贡献',
  'alliance.contribution.weekly': '本周贡献',

  // 商店
  'alliance.shop.buy': '购买',
  'alliance.shop.soldout': '已售罄',
  'alliance.shop.insufficient': '贡献点不足',

  // 科技
  'alliance.tech.upgrade': '升级',
  'alliance.tech.max': '已满级',
  'alliance.tech.unlock': '解锁条件：联盟等级 {level}',

  // 联盟战
  'alliance.war.declare': '宣战',
  'alliance.war.join': '参战',
  'alliance.war.victory': '胜利',
  'alliance.war.defeat': '战败',

  // 合规
  'alliance.compliance.kyc': 'KYC验证',
  'alliance.compliance.restricted': '您所在的地区无法使用联盟功能',
};
```

---

## 附录C: 合规检查清单 (Compliance Checklist)

- [ ] **KYC验证**: 联盟创建者需完成身份验证
- [ ] **AML监控**: 大额交易自动上报
- [ ] **地区限制**: 根据IP/钱包地区限制功能
- [ ] **数据存储**: 符合GDPR/CCPA要求
- [ ] **智能合约审计**: 部署前通过安全审计
- [ ] **代币合规**: 如发行联盟代币需符合证券法
- [ ] **税收申报**: 提供交易记录导出功能
- [ ] **年龄验证**: 需年满18岁

---

_文档结束_
