import { ResourceType, ResourceState, GameState } from '../types/game.types';
import { GAME_CONSTANTS, RESOURCE_TYPE_INFO } from '../utils/constants';
import { calculateTotalResource, getSeasonMultiplier } from '../utils/helpers';

export class ResourceSystem {
    private readonly gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    // 更新所有资源
    updateResources(deltaTime: number): ResourceState {
        const newResources = { ...this.gameState.resources };

        // 计算生产和消耗
        Object.keys(newResources).forEach(resourceType => {
            const type = resourceType as ResourceType;
            const resource = newResources[type];
            
            const { production, consumption } = this.calculateResourceFlow(type);
            const netChange = production - consumption;

            // 应用季节影响
            const seasonMultiplier = getSeasonMultiplier(this.gameState.time.season, type);
            const finalChange = netChange * seasonMultiplier * (deltaTime / 3600); // 转换为小时

            // 应用难度影响
            const difficultyMultiplier = GAME_CONSTANTS.DIFFICULTY[this.gameState.difficulty].resourceMultiplier;
            resource.amount = Math.max(0, resource.amount + finalChange * difficultyMultiplier);

            // 确保不超过容量
            resource.amount = Math.min(resource.amount, resource.capacity);
        });

        return newResources;
    }

    // 计算资源的产生和消耗
    private calculateResourceFlow(resourceType: ResourceType): { production: number; consumption: number } {
        let production = 0;
        let consumption = 0;

        // 建筑生产/消耗
        this.gameState.buildings.forEach(building => {
            if (!building.isConstructing) {
                if (building.resourceProduction?.[resourceType]) {
                    production += building.resourceProduction[resourceType] * building.level;
                }
                if (building.resourceConsumption?.[resourceType]) {
                    consumption += building.resourceConsumption[resourceType] * building.level;
                }
            }
        });

        // 幸存者消耗（食物）
        if (resourceType === 'food') {
            consumption += this.calculateFoodConsumption();
        }

        // 取暖消耗（燃料，冬季）
        if (resourceType === 'fuel' && this.gameState.time.season === 'winter') {
            consumption += this.calculateHeatingConsumption();
        }

        return { production, consumption };
    }

    // 计算食物消耗
    private calculateFoodConsumption(): number {
        let totalConsumption = 0;
        
        this.gameState.survivors.forEach(survivor => {
            // 基础消耗
            let consumption = GAME_CONSTANTS.SURVIVORS.BASE_HUNGER_RATE;
            
            // 工作消耗更多
            if (survivor.jobType !== 'idle' && survivor.jobType !== 'resting') {
                consumption *= 1.5;
            }

            // 伤病消耗更多
            if (survivor.isSick || survivor.isInjured) {
                consumption *= 1.2;
            }

            // 冬季消耗更多
            if (this.gameState.time.season === 'winter') {
                consumption *= 1.3;
            }

            totalConsumption += consumption;
        });

        return totalConsumption;
    }

    // 计算取暖消耗
    private calculateHeatingConsumption(): number {
        let totalConsumption = 0;
        const survivorCount = this.gameState.survivors.length;
        
        // 基础取暖消耗
        totalConsumption = survivorCount * 2;
        
        // 建筑保温效果
        const insulatedBuildings = this.gameState.buildings.filter(
            building => building.type === 'shelter' && building.level >= 3
        );
        
        // 高级庇护所减少取暖消耗
        totalConsumption *= Math.max(0.5, 1 - (insulatedBuildings.length * 0.1));

        return totalConsumption;
    }

    // 检查资源是否充足
    checkResourceSufficiency(): Record<ResourceType, boolean> {
        const result = {} as Record<ResourceType, boolean>;

        Object.keys(this.gameState.resources).forEach(resourceType => {
            const type = resourceType as ResourceType;
            const resource = this.gameState.resources[type];
            
            // 如果资源量低于容量的10%，则认为不足
            result[type] = resource.amount > resource.capacity * 0.1;
        });

        return result;
    }

    // 获取资源警报
    getResourceAlerts(): { type: ResourceType; severity: 'low' | 'critical'; message: string }[] {
        const alerts: { type: ResourceType; severity: 'low' | 'critical'; message: string }[] = [];
        const sufficiency = this.checkResourceSufficiency();

        Object.keys(sufficiency).forEach(resourceType => {
            const type = resourceType as ResourceType;
            const resource = this.gameState.resources[type];
            
            if (!sufficiency[type]) {
                const percentage = (resource.amount / resource.capacity) * 100;
                const severity = percentage < 5 ? 'critical' : 'low';
                
                alerts.push({
                    type,
                    severity,
                    message: `${RESOURCE_TYPE_INFO[type].name}不足！仅剩${Math.round(percentage)}%`,
                });
            }
        });

        return alerts;
    }

    // 获取资源统计
    getResourceStatistics(): Record<ResourceType, {
        amount: number;
        capacity: number;
        production: number;
        consumption: number;
        netChange: number;
    }> {
        const stats = {} as Record<ResourceType, any>;

        Object.keys(this.gameState.resources).forEach(resourceType => {
            const type = resourceType as ResourceType;
            const resource = this.gameState.resources[type];
            const { production, consumption } = calculateTotalResource(type, this.gameState.buildings);

            stats[type] = {
                amount: resource.amount,
                capacity: resource.capacity,
                production,
                consumption,
                netChange: production - consumption,
            };
        });

        return stats;
    }

    // 增加资源容量（升级仓库时调用）
    increaseCapacity(resourceType: ResourceType, amount: number): void {
        const resource = this.gameState.resources[resourceType];
        if (resource) {
            resource.capacity += amount;
        }
    }

    // 直接添加资源（事件、采集等）
    addResource(resourceType: ResourceType, amount: number): void {
        const resource = this.gameState.resources[resourceType];
        if (resource) {
            resource.amount = Math.min(resource.amount + amount, resource.capacity);
            
            // 更新游戏统计
            this.gameState.gameStats.totalResourcesCollected[resourceType] += amount;
        }
    }

    // 直接移除资源
    removeResource(resourceType: ResourceType, amount: number): boolean {
        const resource = this.gameState.resources[resourceType];
        if (resource && resource.amount >= amount) {
            resource.amount -= amount;
            return true;
        }
        return false;
    }

    // 获取资源平衡状态
    getResourceBalanceStatus(): 'surplus' | 'balanced' | 'deficit' {
        let totalNetChange = 0;
        
        Object.keys(this.gameState.resources).forEach(resourceType => {
            const type = resourceType as ResourceType;
            const { production, consumption } = calculateTotalResource(type, this.gameState.buildings);
            totalNetChange += production - consumption;
        });

        if (totalNetChange > 10) return 'surplus';
        if (totalNetChange < -10) return 'deficit';
        return 'balanced';
    }
}