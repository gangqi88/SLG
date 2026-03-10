# 主城（世界中心）开发计划 (Main City Implementation Plan)

> **文档版本**: 2.0.0  
> **修订日期**: 2026-03-10  
> **关联文档**: Web3游戏项目-SLG.md (最终完整版)  
> **状态**: 正式发布

---

## 修订记录 (Revision History)

| 版本 | 日期 | 作者 | 变更内容 |
|------|------|------|----------|
| 1.0.0 | 2026-02-18 | 系统 | 初始版本，仅包含广告、商店、拍卖行 |
| 2.0.0 | 2026-03-10 | AI助手 | 全面升级，新增建筑系统、Web3集成、预言机接口等 |

---

## 术语表 (Glossary)

| 术语 | 定义 | i18n Key |
|------|------|----------|
| Main City | 主城/世界中心，所有玩家共享的枢纽 | mainCity.title |
| Building | 建筑，玩家城内的功能设施 | mainCity.building |
| Upgrade | 升级，建筑等级提升 | mainCity.upgrade |
| Ad Billboard | 广告牌，联盟展示位 | mainCity.ad |
| Official Shop | 官方商店，游戏内购 | mainCity.shop |
| Auction House | 拍卖行，竞价交易系统 | mainCity.auction |
| Building NFT | 建筑NFT，链上确权的建筑资产 | mainCity.nft |
| Oracle | 预言机，链上价格喂价 | mainCity.oracle |

---

## 依赖接口 (Dependency Interfaces)

### 内部接口
- `ResourceManager`: 资源管理（木材、石料、粮食、铜币）
- `HeroManager`: 英雄管理
- `AllianceManager`: 联盟管理
- `InventoryManager`: 道具管理

### 外部接口（Web3）
- `IBuildingNFT`: 建筑NFT合约接口
- `IAuctionContract`: 拍卖行合约接口
- `IPriceOracle`: 预言机价格接口
- `IRandomOracle`: 随机数预言机接口

---

## 风险与合规 (Risk & Compliance)

### 风险识别
| 风险项 | 等级 | 缓解措施 |
|--------|------|----------|
| 拍卖行欺诈 | 高 | 保证金、仲裁机制 |
| 预言机操纵 | 高 | 多源聚合、偏差报警 |
| 建筑NFT漏洞 | 高 | 权限审查、转移限制 |
| 资源价格操纵 | 中 | 日均价格、冷却期 |

### 合规检查清单
- [ ] 虚拟商品购买合规
- [ ] 拍卖竞价合法性
- [ ] NFT交易税务申报
- [ ] 随机数公平性审计
- [ ] 预言机数据源审计

---

## 1. 目标 (Objectives)

### 1.1 业务目标
- 作为全服玩家社交与交易的核心枢纽
- 实现建筑NFT化，支持链上交易
- 建立动态资源价格体系

### 1.2 技术目标
- 建筑数据链上存储（NFT）
- 预言机实时价格喂价
- 随机数公平性保障（VRF）
- 拍卖行智能合约自动化

### 1.3 设计目标
- 对齐Web3游戏项目-SLG.md:10.4建筑系统规范
- 支持城堡、仓库、城墙等核心建筑
- 支持伐木场、采石场、农田、市场资源建筑
- 支持兵营、马厩、靶场、医院军事建筑

---

## 2. 规则 (Rules)

### 2.1 建筑系统规则

#### 2.1.1 核心建筑
| 建筑 | 功能 | 等级上限 | 解锁条件 |
|------|------|----------|----------|
| 城堡 | 主城核心，决定其他建筑等级上限 | 30级 | 初始拥有 |
| 仓库 | 保护资源免被掠夺 | 25级 | 城堡5级 |
| 城墙 | 城防设施，提供守卫位 | 25级 | 城堡3级 |

#### 2.1.2 资源建筑
| 建筑 | 功能 | 等级上限 | 解锁条件 |
|------|------|----------|----------|
| 伐木场 | 木材产出 | 20级 | 初始拥有 |
| 采石场 | 石料产出 | 20级 | 初始拥有 |
| 农田 | 粮食产出 | 20级 | 初始拥有 |
| 市场 | 铜币产出/资源交易 | 15级 | 城堡5级 |

#### 2.1.3 军事建筑
| 建筑 | 功能 | 等级上限 | 解锁条件 |
|------|------|----------|----------|
| 兵营 | 步兵/弓兵招募 | 20级 | 城堡3级 |
| 马厩 | 骑兵招募 | 15级 | 城堡5级 |
| 靶场 | 弓兵训练 | 15级 | 兵营5级 |
| 医院 | 伤兵治疗 | 20级 | 城堡4级 |

#### 2.1.4 功能建筑
| 建筑 | 功能 | 等级上限 | 解锁条件 |
|------|------|----------|----------|
| 联盟大厅 | 联盟功能入口 | 10级 | 城堡8级 |
| 英雄府 | 英雄管理 | 15级 | 初始拥有 |
| 集市 | 道具交易 | 10级 | 城堡6级 |

### 2.2 建筑升级规则
- **升级时间**: 随等级指数增长
- **资源消耗**: 木材+石料+铜币，随等级增长
- **成功率**: 基础100%，可使用保护道具
- **失败惩罚**: 返还50%资源

### 2.3 广告牌规则
- **周期**: 每周结算
- **出价**: 联盟贡献点竞价
- **展示**: 获胜联盟可设置广告语
- **退款**: 未获胜联盟全额退款

### 2.4 官方商店规则
- **货币**: 人民币/加密货币
- **限购**: 部分道具每周限购
- **折扣**: 首次购买/活动折扣
- **发货**: 即时到账

### 2.5 拍卖行规则
- **拍品**: 英雄、珍稀道具、建筑材料
- **出价**: 加价幅度≥5%
- **一口价**: 立即成交价格
- **超时**: 自动延长时间
- **手续费**: 成交价5%

---

## 3. 数值 (Numerical Parameters)

### 3.1 建筑升级成本公式
```
ResourceCost(type, lvl) = base * (growthRate ^ lvl)
TimeCost(lvl) = baseTime * (growthRate ^ lvl) * 60 (秒)
```

### 3.2 核心建筑数值

| 建筑 | 等级 | 木材 | 石料 | 铜币 | 升级时间 |
|------|------|------|------|------|----------|
| 城堡 | 1→2 | 100 | 100 | 50 | 1分钟 |
| 城堡 | 2→3 | 200 | 200 | 100 | 3分钟 |
| 城堡 | 3→4 | 400 | 400 | 200 | 8分钟 |
| 城堡 | 4→5 | 800 | 800 | 400 | 20分钟 |
| 城堡 | 5→6 | 1,600 | 1,600 | 800 | 45分钟 |
| 城堡 | 6→7 | 3,200 | 3,200 | 1,600 | 1.5小时 |
| 城堡 | 7→8 | 6,400 | 6,400 | 3,200 | 3小时 |
| 城堡 | 8→9 | 12,800 | 12,800 | 6,400 | 6小时 |
| 城堡 | 9→10 | 25,600 | 25,600 | 12,800 | 12小时 |
| 仓库 | 1→5 | 100×lvl | - | 50×lvl | 2分钟×lvl |
| 城墙 | 1→5 | 80×lvl | 120×lvl | 30×lvl | 1分钟×lvl |

### 3.3 资源建筑数值

| 建筑 | 等级 | 产出/小时 | 木材 | 石料 | 铜币 | 时间 |
|------|------|-----------|------|------|------|------|
| 伐木场 | 1 | 100 | 50 | - | 25 | 1分钟 |
| 伐木场 | 5 | 200 | 250 | - | 125 | 5分钟 |
| 伐木场 | 10 | 450 | 1,000 | - | 500 | 20分钟 |
| 伐木场 | 15 | 800 | 4,000 | - | 2,000 | 1小时 |
| 伐木场 | 20 | 1,500 | 16,000 | - | 8,000 | 4小时 |
| 采石场 | 同伐木场数值 | | | | | |
| 农田 | 同伐木场数值 | | | | | |

### 3.4 军事建筑数值

| 建筑 | 等级 | 容量/速度 | 木材 | 石料 | 铜币 | 时间 |
|------|------|-----------|------|------|------|------|
| 兵营 | 1 | 100兵 | 100 | 50 | 50 | 2分钟 |
| 兵营 | 5 | 300兵 | 500 | 250 | 250 | 10分钟 |
| 兵营 | 10 | 600兵 | 2,000 | 1,000 | 1,000 | 40分钟 |
| 兵营 | 15 | 1,000兵 | 8,000 | 4,000 | 4,000 | 2小时 |
| 兵营 | 20 | 1,500兵 | 32,000 | 16,000 | 16,000 | 8小时 |

### 3.5 平衡性调整表

#### 低活跃场景（每日登录1次，<30分钟）
| 建筑 | 建议等级 | 日产出 | 升级周期 |
|------|----------|--------|----------|
| 城堡 | 5-6级 | - | 2-3天/级 |
| 伐木场 | 5级 | 200/时 | 3-4天/级 |
| 采石场 | 5级 | 200/时 | 3-4天/级 |
| 农田 | 5级 | 200/时 | 3-4天/级 |
| 兵营 | 3级 | 150兵 | 4-5天/级 |

#### 中活跃场景（每日登录3-4次，1-2小时）
| 建筑 | 建议等级 | 日产出 | 升级周期 |
|------|----------|--------|----------|
| 城堡 | 7-8级 | - | 1-2天/级 |
| 伐木场 | 10级 | 450/时 | 1-2天/级 |
| 采石场 | 10级 | 450/时 | 1-2天/级 |
| 农田 | 10级 | 450/时 | 1-2天/级 |
| 兵营 | 8级 | 800兵 | 1-2天/级 |

#### 高活跃场景（每日登录6+小时，持续在线）
| 建筑 | 建议等级 | 日产出 | 升级周期 |
|------|----------|--------|----------|
| 城堡 | 10级+ | - | 4-6小时/级 |
| 伐木场 | 15级 | 800/时 | 4-8小时/级 |
| 采石场 | 15级 | 800/时 | 4-8小时/级 |
| 农田 | 15级 | 800/时 | 4-8小时/级 |
| 兵营 | 15级 | 1,000兵 | 6-12小时/级 |

---

## 4. 前端交互 (Frontend Interactions)

### 4.1 数据结构

```typescript
// src/types/MainCity.ts

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  maxLevel: number;
  isUpgrading: boolean;
  upgradeStartTime: number;
  upgradeEndTime: number;
  nftTokenId?: string;
  position: { x: number; y: number };
}

export enum BuildingType {
  CASTLE = 'castle',       // 城堡
  WAREHOUSE = 'warehouse', // 仓库
  WALL = 'wall',          // 城墙
  LUMBER_MILL = 'lumber', // 伐木场
  QUARRY = 'quarry',      // 采石场
  FARM = 'farm',          // 农田
  MARKET = 'market',      // 市场
  BARRACKS = 'barracks', // 兵营
  STABLE = 'stable',      // 马厩
  RANGE = 'range',        // 靶场
  HOSPITAL = 'hospital',  // 医院
  ALLIANCE_HALL = 'alliance_hall', // 联盟大厅
  HERO_HALL = 'hero_hall', // 英雄府
  BAZAAR = 'bazaar',     // 集市
}

export interface BuildingUpgradeCost {
  wood: number;
  stone: number;
  gold: number;
  time: number;
}

export interface AdBid {
  allianceId: string;
  allianceName: string;
  amount: number;
  timestamp: number;
  refunded: boolean;
}

export interface AdSpace {
  allianceId: string;
  allianceName: string;
  message: string;
  expiresAt: number;
}

export interface ShopItem {
  id: string;
  nameKey: string;
  descriptionKey: string;
  type: 'skin' | 'item' | 'bundle';
  price: number;
  currency: 'cny' | 'token';
  imageUrl: string;
  weeklyLimit: number;
  soldThisWeek: number;
  discount?: number;
}

export interface AuctionItem {
  id: string;
  sellerId: string;
  itemType: 'hero' | 'material' | 'skin';
  itemId: string;
  currentBid: number;
  highestBidder: string;
  startPrice: number;
  buyoutPrice: number;
  endTime: number;
  status: 'active' | 'ended' | 'cancelled';
}
```

### 4.2 核心API

```typescript
// src/game/logic/MainCityManager.ts

export interface MainCityState {
  buildings: Record<string, Building>;
  adSpace: AdSpace | null;
  pendingBids: AdBid[];
  shopItems: ShopItem[];
  auctionItems: AuctionItem[];
}

class MainCityManager {
  // ============ 建筑系统 ============
  getBuilding(buildingId: string): Building;
  getAllBuildings(): Building[];
  startUpgrade(buildingId: string): Promise<boolean>;
  cancelUpgrade(buildingId: string): Promise<boolean>;
  completeUpgrade(buildingId: string): Promise<Building>;
  getUpgradeCost(type: BuildingType, currentLevel: number): BuildingUpgradeCost;
  
  // ============ 广告系统 ============
  placeAdBid(allianceId: string, amount: number): Promise<AdBid>;
  resolveWeeklyAdWinner(): Promise<AdSpace>;
  getAdInfo(): Promise<AdSpace | null>;
  getBidHistory(): Promise<AdBid[]>;
  
  // ============ 官方商店 ============
  getShopItems(): Promise<ShopItem[]>;
  purchaseItem(itemId: string, quantity: number): Promise<boolean>;
  getPurchaseHistory(): Promise<PurchaseRecord[]>;
  
  // ============ 拍卖行 ============
  getAuctionItems(status?: 'active' | 'ended'): Promise<AuctionItem[]>;
  placeBid(auctionId: string, amount: number): Promise<boolean>;
  buyout(auctionId: string): Promise<boolean>;
  createAuction(item: AuctionItemInput): Promise<AuctionItem>;
  cancelAuction(auctionId: string): Promise<boolean>;
  
  // ============ 资源价格 ============
  getResourcePrices(): Promise<ResourcePrices>;
  getHistoricalPrices(days: number): Promise<PriceHistory[]>;
  
  // ============ 持久化 ============
  save(): Promise<boolean>;
  load(): Promise<boolean>;
}
```

### 4.3 组件结构

```
src/components/MainCity/
├── MainCityView.tsx          # 主城视觉表现
├── BuildingCard.tsx         # 建筑卡片
├── BuildingUpgrade.tsx      # 升级弹窗
├── AdBillboard.tsx          # 广告牌
├── OfficialShop.tsx         # 官方商店
├── ShopItem.tsx              # 商店物品
├── AuctionHouse.tsx          # 拍卖行
├── AuctionItem.tsx          # 拍卖物品
├── AuctionBid.tsx           # 出价弹窗
└── index.ts                  # 统一导出
```

---

## 5. 链上交互 (On-Chain Interactions)

### 5.1 建筑NFT元数据字段

```json
{
  "name": "Castle Lv.10",
  "description": "主城核心建筑，10级",
  "image": "ipfs://QmXXX/castle_10.png",
  "attributes": [
    {
      "trait_type": "BuildingType",
      "value": "CASTLE"
    },
    {
      "trait_type": "Level",
      "value": 10,
      "max_value": 30
    },
    {
      "trait_type": "MaxLevel",
      "value": 30
    },
    {
      "trait_type": "ProductionBonus",
      "value": 25,
      "unit": "%"
    },
    {
      "trait_type": "DefenseBonus",
      "value": 15,
      "unit": "%"
    },
    {
      "trait_type": "MintedAt",
      "value": 1709404800
    },
    {
      "trait_type": "UpgradedAt",
      "value": 1709491200
    }
  ],
  "level": 10,
  "owner": "0x1234...abcd",
  "game_id": "slg-2026"
}
```

### 5.2 链上随机数方案

```solidity
// contracts/RandomOracle.sol

pragma solidity ^0.8.19;

interface IRandomOracle {
    function requestRandomWords(
        uint256 gameId,
        uint256 numWords
    ) external returns (uint256 requestId);
    
    function getRandomWords(
        uint256 requestId
    ) external view returns (uint256[] memory);
    
    function getRequestStatus(
        uint256 requestId
    ) external view returns (
        bool fulfilled,
        uint256[] memory randomWords
    );
}

// Chainlink VRF 使用示例
contract BuildingUpgradeRandom {
    IRandomOracle public randomOracle;
    mapping(uint256 => uint256) public upgradeResults;
    
    function upgradeBuildingWithRandom(
        uint256 buildingTokenId,
        uint256 baseSuccessRate
    ) external returns (bool) {
        uint256 requestId = randomOracle.requestRandomWords(
            buildingTokenId,
            1
        );
        
        // 存储requestId，待回调后处理
        pendingUpgrades[requestId] = UpgradeRequest({
            buildingTokenId: buildingTokenId,
            baseSuccessRate: baseSuccessRate,
            requestTime: block.timestamp
        });
        
        return true;
    }
    
    function fulfillRandomness(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal {
        UpgradeRequest storage req = pendingUpgrades[requestId];
        
        // randomWords[0] % 100 < baseSuccessRate 则成功
        uint256 roll = randomWords[0] % 100;
        bool success = roll < req.baseSuccessRate;
        
        upgradeResults[req.buildingTokenId] = success ? 1 : 0;
    }
}
```

### 5.3 预言机喂价接口

```solidity
// contracts/interfaces/IPriceOracle.sol

pragma solidity ^0.8.19;

interface IPriceOracle {
    struct ResourcePrice {
        uint256 woodPrice;   // 以SATOSHIS计价
        uint256 stonePrice;
        uint256 foodPrice;
        uint256 goldPrice;
        uint256 updatedAt;
    }
    
    function getResourcePrices() external view returns (ResourcePrice memory);
    
    function getHistoricalPrice(
        ResourceType resource,
        uint256 daysAgo
    ) external view returns (uint256);
    
    function getAveragePrice(
        ResourceType resource,
        uint256 duration
    ) external view returns (uint256);
}

enum ResourceType {
    WOOD,
    STONE,
    FOOD,
    GOLD
}

// 聚合多个数据源
contract AggregatedPriceOracle is IPriceOracle {
    address[] public dataSources;
    uint256 public constant HEARTBEAT = 1 hours;
    uint256 public constant DEVIATION_THRESHOLD = 20%; // 20%偏差阈值
    
    function getResourcePrices() public view override returns (ResourcePrice memory) {
        uint256[] memory woodPrices = new uint256[](dataSources.length);
        uint256[] memory stonePrices = new uint256[](dataSources.length);
        
        for (uint i = 0; i < dataSources.length; i++) {
            ResourcePrice memory price = IPriceOracle(dataSources[i]).getResourcePrices();
            woodPrices[i] = price.woodPrice;
            stonePrices[i] = price.stonePrice;
        }
        
        // 计算中位数
        return ResourcePrice({
            woodPrice: _median(woodPrices),
            stonePrice: _median(stonePrices),
            foodPrice: 0,
            goldPrice: 0,
            updatedAt: block.timestamp
        });
    }
    
    function _median(uint256[] memory arr) internal pure returns (uint256) {
        sort(arr);
        uint256 len = arr.length;
        if (len % 2 == 0) {
            return (arr[len / 2 - 1] + arr[len / 2]) / 2;
        } else {
            return arr[len / 2];
        }
    }
    
    function sort(uint256[] memory arr) internal pure {
        // 简单排序实现
    }
}
```

### 5.4 Solidity接口片段

```solidity
// contracts/interfaces/IBuildingNFT.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IBuildingNFT is IERC721 {
    struct Building {
        string name;
        uint8 buildingType;
        uint8 level;
        uint8 maxLevel;
        uint256 productionBonus;
        uint256 defenseBonus;
        uint256 mintedAt;
        uint256 upgradedAt;
    }

    function mintBuilding(
        address to,
        uint8 buildingType,
        uint8 level
    ) external returns (uint256 tokenId);
    
    function upgradeBuilding(
        uint256 tokenId,
        uint8 newLevel
    ) external returns (bool);
    
    function getBuildingData(
        uint256 tokenId
    ) external view returns (Building memory);
    
    function getBuildingsByOwner(
        address owner
    ) external view returns (uint256[] memory);
    
    function burnBuilding(
        uint256 tokenId
    ) external;
}

// contracts/interfaces/IAuctionHouse.sol

interface IAuctionHouse {
    struct Auction {
        uint256 auctionId;
        address seller;
        address highestBidder;
        uint256 highestBid;
        uint256 startPrice;
        uint256 buyoutPrice;
        uint256 startTime;
        uint256 endTime;
        bool cancelled;
        bool settled;
    }

    function createAuction(
        address seller,
        uint256 tokenId,
        uint256 startPrice,
        uint256 buyoutPrice,
        uint256 duration
    ) external returns (uint256 auctionId);
    
    function placeBid(
        uint256 auctionId
    ) external payable returns (bool);
    
    function buyout(
        uint256 auctionId
    ) external payable returns (bool);
    
    function settleAuction(
        uint256 auctionId
    ) external returns (bool);
    
    function getAuction(
        uint256 auctionId
    ) external view returns (Auction memory);
}
```

### 5.5 智能合约事件清单

```solidity
interface IMainCityEvents {
    event BuildingUpgraded(
        uint256 indexed tokenId,
        uint8 newLevel,
        uint256 upgradeCost,
        bool success,
        uint256 timestamp
    );
    
    event AdBidPlaced(
        uint256 indexed allianceId,
        uint256 amount,
        uint256 timestamp
    );
    
    event AdWinnerSelected(
        uint256 indexed allianceId,
        uint256 winningBid,
        uint256 weekStart,
        uint256 weekEnd
    );
    
    event ItemPurchased(
        address indexed buyer,
        uint256 itemId,
        uint256 quantity,
        uint256 totalPaid,
        uint256 timestamp
    );
    
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        uint256 tokenId,
        uint256 startPrice,
        uint256 endTime
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 newBid,
        uint256 timestamp
    );
    
    event AuctionSettled(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 finalPrice,
        uint256 timestamp
    );
    
    event PriceUpdated(
        uint256 woodPrice,
        uint256 stonePrice,
        uint256 foodPrice,
        uint256 goldPrice,
        uint256 timestamp
    );
}
```

### 5.6 Gas估算

| 操作 | 预估Gas | 条件 |
|------|---------|------|
| 建筑升级 | 150,000 | 状态更新+事件 |
| 铸造建筑NFT | 200,000 | ERC721 mint |
| 建筑交易 | 180,000 | 转移NFT |
| 广告出价 | 80,000 | 状态更新 |
| 商店购买 | 100,000 | 库存校验 |
| 创建拍卖 | 250,000 | NFT授权+mint |
| 出价 | 120,000 | 状态+退款 |
| 一口价 | 150,000 | 结算 |
| 预言机更新 | 50,000 | 回调 |

---

## 6. 验收标准 (Acceptance Criteria)

### 6.1 功能验收

| 功能 | 验收条件 | 测试方法 |
|------|----------|----------|
| 建筑升级 | 资源扣除，等级提升，属性生效 | 升级后查询属性 |
| 升级时间 | 倒计时正确，到期可完成 | 等待时间测试 |
| 建筑NFT | 铸造成功，元数据正确 | 链上查询 |
| 广告牌 | 周结算正确，广告展示 | 模拟周期 |
| 商店 | 购买成功，道具到账 | 购买后查询 |
| 拍卖行 | 出价/一口价/结算正确 | 多方测试 |
| 预言机 | 价格更新，数据正确 | 定期检查 |

### 6.2 性能验收

| 指标 | 目标值 | 测试方法 |
|------|--------|----------|
| 升级响应 | <500ms | 计时测试 |
| 商店响应 | <200ms | 性能分析 |
| 拍卖更新 | 实时 | WebSocket测试 |
| 预言机延迟 | <5分钟 | 监控测试 |

### 6.3 安全验收

| 检查项 | 验收条件 |
|--------|----------|
| NFT权限 | 仅所有者可转移 |
| 拍卖保护 | 未付款无法获得NFT |
| 预言机防操纵 | 多源聚合 |
| 随机数公平性 | VRF验证 |

---

## 附录A: 新手引导流程图 (Onboarding Flowchart)

```
[玩家首次进入]
      ↓
[主城界面] → "欢迎来到主城，这里是所有玩家的活动中心！"
      ↓
[建筑引导: 城堡] → "城堡是主城的核心，决定其他建筑等级上限"
      ↓
[资源建筑引导] → "伐木场、采石场、农田产出资源，是发展的基础"
      ↓
[建筑升级引导] → 点击"升级"按钮 → 消耗资源 → 升级成功
      ↓
[建筑引导: 仓库] → "仓库可以保护资源免被掠夺"
      ↓
[功能解锁引导] → "升级城堡可解锁更多建筑和功能"
      ↓
[主城探索] → 可自由探索 广告牌/商店/拍卖行
```

---

## 附录B: i18n 命名规范

```typescript
// i18n/keys/mainCity.ts

export const mainCityKeys = {
  // 标题
  'mainCity.title': '主城',
  'mainCity.welcome': '欢迎来到主城',
  
  // 建筑
  'mainCity.building.castle': '城堡',
  'mainCity.building.warehouse': '仓库',
  'mainCity.building.wall': '城墙',
  'mainCity.building.lumber': '伐木场',
  'mainCity.building.quarry': '采石场',
  'mainCity.building.farm': '农田',
  'mainCity.building.market': '市场',
  'mainCity.building.barracks': '兵营',
  'mainCity.building.stable': '马厩',
  'mainCity.building.hospital': '医院',
  'mainCity.building.allianceHall': '联盟大厅',
  'mainCity.building.heroHall': '英雄府',
  
  // 升级
  'mainCity.upgrade': '升级',
  'mainCity.upgrade.success': '升级成功！{building}已升级到{level}级',
  'mainCity.upgrade.failed': '升级失败，返还{resource}',
  'mainCity.upgrade.ongoing': '升级进行中',
  'mainCity.upgrade.complete': '升级完成',
  'mainCity.upgrade.max': '已满级',
  'mainCity.upgrade.insufficient': '资源不足',
  
  // 资源
  'mainCity.resource.wood': '木材',
  'mainCity.resource.stone': '石料',
  'mainCity.resource.food': '粮食',
  'mainCity.resource.gold': '铜币',
  
  // 广告
  'mainCity.ad.title': '广告牌',
  'mainCity.ad.bid': '参与竞价',
  'mainCity.ad.current': '当前广告',
  'mainCity.ad.yourAlliance': '您的联盟',
  
  // 商店
  'mainCity.shop.title': '官方商店',
  'mainCity.shop.buy': '购买',
  'mainCity.shop.price': '价格',
  'mainCity.shop.soldout': '已售罄',
  'mainCity.shop.discount': '限时折扣',
  
  // 拍卖
  'mainCity.auction.title': '拍卖行',
  'mainCity.auction.bid': '出价',
  'mainCity.auction.buyout': '一口价',
  'mainCity.auction.timeLeft': '剩余时间',
  'mainCity.auction.currentBid': '当前出价',
  'mainCity.auction.myBid': '我的出价',
  'mainCity.auction.won': '恭喜获得拍品',
  'mainCity.auction.outbid': '被超越',
  
  // 合规
  'mainCity.compliance.age': '需年满18岁',
  'mainCity.compliance.purchase': '虚拟商品不支持退款',
};
```

---

## 附录C: 合规检查清单 (Compliance Checklist)

- [ ] **虚拟商品合规**: 明确标注为虚拟商品，不支持退款
- [ ] **随机数审计**: 使用Chainlink VRF等经过审计的随机数方案
- [ ] **价格操纵防护**: 预言机多源聚合，防止单点操纵
- [ ] **NFT交易税务**: 提供交易记录导出功能
- [ ] **拍卖合规**: 竞价过程透明，禁止恶意抬价
- [ ] **消费者保护**: 未成年人消费限制
- [ ] **数据存储合规**: 符合GDPR/CCPA要求

---

*文档结束*
