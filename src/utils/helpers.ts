import { ResourceType, BuildingType, GameState, Survivor, Building } from '../types/game.types';
import { GAME_CONSTANTS, RESOURCE_TYPE_INFO } from './constants';

// 生成唯一ID
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

// 格式化数字，添加千位分隔符
export const formatNumber = (num: number): string => {
    return num.toLocaleString('zh-CN');
};

// 计算资源总量
export const calculateTotalResource = (
    resourceType: ResourceType,
    buildings: Building[]
): { production: number; consumption: number } => {
    let production = 0;
    let consumption = 0;

    buildings.forEach(building => {
        if (building.resourceProduction?.[resourceType]) {
            production += building.resourceProduction[resourceType];
        }
        if (building.resourceConsumption?.[resourceType]) {
            consumption += building.resourceConsumption[resourceType];
        }
    });

    return { production, consumption };
};

// 检查是否有足够的资源建造建筑
export const hasEnoughResources = (
    resources: GameState['resources'],
    cost: Partial<Record<ResourceType, number>>
): boolean => {
    for (const [resourceType, amount] of Object.entries(cost)) {
        const resource = resources[resourceType as ResourceType];
        if (!resource || resource.amount < (amount)) {
            return false;
        }
    }
    return true;
};

// 消耗资源
export const consumeResources = (
    resources: GameState['resources'],
    cost: Partial<Record<ResourceType, number>>
): GameState['resources'] => {
    const newResources = { ...resources };

    for (const [resourceType, amount] of Object.entries(cost)) {
        const resource = newResources[resourceType as ResourceType];
        if (resource) {
            resource.amount = Math.max(0, resource.amount - (amount));
        }
    }

    return newResources;
};

// 计算幸存者工作效率
export const calculateWorkEfficiency = (survivor: Survivor): number => {
    let efficiency = 1;

    // 健康影响
    if (survivor.health < 30) efficiency *= 0.3;
    else if (survivor.health < 60) efficiency *= 0.6;
    else if (survivor.health < 80) efficiency *= 0.8;

    // 饥饿影响
    if (survivor.hunger < 20) efficiency *= 0.4;
    else if (survivor.hunger < 50) efficiency *= 0.7;

    // 体力影响
    if (survivor.stamina < 20) efficiency *= 0.5;
    else if (survivor.stamina < 50) efficiency *= 0.8;

    // 体温影响（冬季特别重要）
    if (survivor.temperature < 35) efficiency *= 0.3;
    else if (survivor.temperature < 36) efficiency *= 0.6;

    // 伤病影响
    if (survivor.isSick) efficiency *= 0.5;
    if (survivor.isInjured) efficiency *= 0.3;

    return Math.max(0.1, efficiency);
};

// 获取建筑显示名称
export const getBuildingDisplayName = (buildingType: BuildingType): string => {
    const buildingInfo = GAME_CONSTANTS.BUILDINGS[buildingType.toUpperCase() as keyof typeof GAME_CONSTANTS.BUILDINGS];
    return buildingInfo?.name || buildingType;
};

// 获取资源显示信息
export const getResourceDisplayInfo = (resourceType: ResourceType) => {
    return RESOURCE_TYPE_INFO[resourceType];
};

// 计算季节对资源的影响
export const getSeasonMultiplier = (
    season: GameState['time']['season'],
    resourceType: ResourceType
): number => {
    const seasonEffect = GAME_CONSTANTS.SEASON_EFFECTS[season];
    return seasonEffect.resourceMultiplier[resourceType] || 1;
};

// 计算幸存者人口上限
export const calculatePopulationCapacity = (buildings: Building[]): number => {
    let capacity = 0;
    buildings.forEach(building => {
        if (building.type === 'shelter') {
            capacity += building.workerCapacity * building.level;
        }
    });
    return capacity;
};

// 检查游戏是否失败
export const checkGameOver = (gameState: GameState): boolean => {
    // 所有幸存者死亡
    if (gameState.survivors.length === 0) {
        return true;
    }

    // 关键资源耗尽（食物和电力同时为0）
    if (gameState.resources.food.amount <= 0 && gameState.resources.electricity.amount <= 0) {
        return true;
    }

    return false;
};

// 获取游戏进度百分比
export const getGameProgress = (gameState: GameState): number => {
    const maxDays = 365; // 一年生存目标
    const daysProgress = Math.min(gameState.gameStats.daysSurvived / maxDays, 1);
    
    const buildingProgress = Math.min(gameState.gameStats.buildingsConstructed / 20, 1);
    
    const survivorProgress = Math.min(gameState.gameStats.totalSurvivorsRescued / 50, 1);

    return (daysProgress * 0.4 + buildingProgress * 0.3 + survivorProgress * 0.3) * 100;
};

// 格式化时间显示
export const formatGameTime = (time: GameState['time']): string => {
    const seasonNames = {
        spring: '春季',
        summer: '夏季',
        autumn: '秋季',
        winter: '冬季'
    };

    return `第${time.day}天 ${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')} ${seasonNames[time.season]}`;
};

// 随机生成幸存者名字
export const generateSurvivorName = (): string => {
    const firstNames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴'];
    const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return firstName + lastName;
};