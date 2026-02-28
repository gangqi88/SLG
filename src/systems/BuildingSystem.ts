import { Building, BuildingType, ResourceType, Survivor, GameState } from '../types/game.types';
import { GAME_CONSTANTS, BUILDING_TYPE_INFO } from '../utils/constants';
import { generateId, hasEnoughResources, consumeResources } from '../utils/helpers';

export class BuildingSystem {
    private readonly gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    // 创建新建筑
    createBuilding(
        type: BuildingType,
        x: number,
        y: number
    ): { success: boolean; building?: Building; message?: string } {
        // 检查是否有足够的资源
        const cost = this.getBuildingCost(type, 1);
        if (!hasEnoughResources(this.gameState.resources, cost)) {
            return {
                success: false,
                message: '资源不足，无法建造',
            };
        }

        // 消耗资源
        this.gameState.resources = consumeResources(this.gameState.resources, cost);

        // 创建建筑对象
        const building: Building = {
            id: generateId(),
            type,
            level: 1,
            x,
            y,
            maxLevel: this.getMaxLevel(type),
            constructionTime: this.getConstructionTime(type, 1),
            resourceCost: cost,
            resourceProduction: this.getResourceProduction(type, 1),
            resourceConsumption: this.getResourceConsumption(type, 1),
            workerCapacity: this.getWorkerCapacity(type),
            assignedWorkers: 0,
            isConstructing: true,
        };

        // 添加到建筑列表
        this.gameState.buildings.push(building);

        // 更新游戏统计
        this.gameState.gameStats.buildingsConstructed++;

        return {
            success: true,
            building,
        };
    }

    // 升级建筑
    upgradeBuilding(buildingId: string): { success: boolean; message?: string } {
        const building = this.gameState.buildings.find(b => b.id === buildingId);
        if (!building) {
            return { success: false, message: '建筑不存在' };
        }

        if (building.isConstructing) {
            return { success: false, message: '建筑正在建造中' };
        }

        if (building.level >= building.maxLevel) {
            return { success: false, message: '建筑已达到最高等级' };
        }

        // 检查升级资源
        const nextLevel = building.level + 1;
        const cost = this.getBuildingCost(building.type, nextLevel);
        if (!hasEnoughResources(this.gameState.resources, cost)) {
            return { success: false, message: '资源不足，无法升级' };
        }

        // 消耗资源
        this.gameState.resources = consumeResources(this.gameState.resources, cost);

        // 更新建筑属性
        building.level = nextLevel;
        building.constructionTime = this.getConstructionTime(building.type, nextLevel);
        building.resourceCost = cost;
        building.resourceProduction = this.getResourceProduction(building.type, nextLevel);
        building.resourceConsumption = this.getResourceConsumption(building.type, nextLevel);
        building.isConstructing = true;

        return { success: true };
    }

    // 拆除建筑
    demolishBuilding(buildingId: string): { success: boolean; refund?: Partial<Record<ResourceType, number>>; message?: string } {
        const buildingIndex = this.gameState.buildings.findIndex(b => b.id === buildingId);
        if (buildingIndex === -1) {
            return { success: false, message: '建筑不存在' };
        }

        const building = this.gameState.buildings[buildingIndex];

        // 计算资源返还（拆除返还部分资源）
        const refund = this.getDemolitionRefund(building);

        // 移除建筑
        this.gameState.buildings.splice(buildingIndex, 1);

        // 重新分配该建筑中的工人
        this.reassignWorkersFromBuilding(buildingId);

        // 返还资源
        Object.entries(refund).forEach(([resourceType, amount]) => {
            const resource = this.gameState.resources[resourceType as ResourceType];
            if (resource) {
                resource.amount = Math.min(resource.amount + amount, resource.capacity);
            }
        });

        return {
            success: true,
            refund,
        };
    }

    // 更新建筑状态（建造进度）
    updateConstructionProgress(deltaTime: number): void {
        this.gameState.buildings.forEach(building => {
            if (building.isConstructing) {
                building.constructionTime -= deltaTime / 3600; // 转换为小时

                if (building.constructionTime <= 0) {
                    building.isConstructing = false;
                    building.constructionTime = 0;

                    // 建筑完成事件
                    this.onBuildingCompleted(building);
                }
            }
        });
    }

    // 分配工人到建筑
    assignWorker(buildingId: string, survivorId: string): { success: boolean; message?: string } {
        const building = this.gameState.buildings.find(b => b.id === buildingId);
        const survivor = this.gameState.survivors.find(s => s.id === survivorId);

        if (!building || !survivor) {
            return { success: false, message: '建筑或幸存者不存在' };
        }

        if (building.isConstructing) {
            return { success: false, message: '建筑正在建造中' };
        }

        if (building.assignedWorkers >= building.workerCapacity) {
            return { success: false, message: '建筑工人已满' };
        }

        // 如果幸存者已经有工作，先取消
        if (survivor.assignedBuildingId) {
            this.unassignWorker(survivor.assignedBuildingId, survivorId);
        }

        // 分配工作
        survivor.assignedBuildingId = buildingId;
        survivor.jobType = this.getJobTypeForBuilding(building.type);
        building.assignedWorkers++;

        return { success: true };
    }

    // 取消工人分配
    unassignWorker(buildingId: string, survivorId: string): { success: boolean; message?: string } {
        const building = this.gameState.buildings.find(b => b.id === buildingId);
        const survivor = this.gameState.survivors.find(s => s.id === survivorId);

        if (!building || !survivor) {
            return { success: false, message: '建筑或幸存者不存在' };
        }

        if (survivor.assignedBuildingId !== buildingId) {
            return { success: false, message: '幸存者未在该建筑工作' };
        }

        // 取消分配
        survivor.assignedBuildingId = null;
        survivor.jobType = 'idle';
        building.assignedWorkers = Math.max(0, building.assignedWorkers - 1);

        return { success: true };
    }

    // 获取建筑信息
    getBuildingInfo(type: BuildingType, level: number = 1) {
        const buildingConfig = GAME_CONSTANTS.BUILDINGS[type.toUpperCase() as keyof typeof GAME_CONSTANTS.BUILDINGS];
        
        if (!buildingConfig) {
            return null;
        }

        return {
            name: buildingConfig.name,
            maxLevel: buildingConfig.maxLevel,
            workerCapacity: buildingConfig.workerCapacity,
            constructionTime: buildingConfig.constructionTime,
            cost: buildingConfig.resourceCost[level] || {},
            production: buildingConfig.resourceProduction?.[level] || {},
            consumption: buildingConfig.resourceConsumption?.[level] || {},
        };
    }

    // 获取可建造的建筑列表
    getAvailableBuildings(): Array<{
        type: BuildingType;
        name: string;
        description: string;
        category: string;
        canBuild: boolean;
        cost: Partial<Record<ResourceType, number>>;
    }> {
        const buildingTypes: BuildingType[] = ['shelter', 'warehouse', 'farm', 'lumberMill', 'powerPlant'];
        
        return buildingTypes.map(type => {
            const info = this.getBuildingInfo(type);
            const cost = info?.cost || {};
            const canBuild = hasEnoughResources(this.gameState.resources, cost);

            return {
                type,
                name: info?.name || type,
                description: BUILDING_TYPE_INFO[type].description,
                category: BUILDING_TYPE_INFO[type].category,
                canBuild,
                cost,
            };
        });
    }

    // 获取建筑生产效率
    getBuildingEfficiency(buildingId: string): number {
        const building = this.gameState.buildings.find(b => b.id === buildingId);
        if (!building || building.isConstructing) {
            return 0;
        }

        // 基础效率
        let efficiency = 1;

        // 工人数量影响
        if (building.assignedWorkers > 0) {
            const workerRatio = building.assignedWorkers / building.workerCapacity;
            efficiency *= Math.min(1, workerRatio * 1.2); // 工人越多效率越高
        } else {
            efficiency *= 0.3; // 无工人效率降低
        }

        // 资源供应影响
        if (building.resourceConsumption) {
            Object.keys(building.resourceConsumption).forEach(resourceType => {
                const resource = this.gameState.resources[resourceType as ResourceType];
                const required = building.resourceConsumption![resourceType as ResourceType]!;
                
                if (resource.amount < required) {
                    efficiency *= 0.5; // 资源不足效率减半
                }
            });
        }

        return Math.max(0, efficiency);
    }

    // 私有方法
    private getBuildingCost(type: BuildingType, level: number): Partial<Record<ResourceType, number>> {
        const buildingConfig = GAME_CONSTANTS.BUILDINGS[type.toUpperCase() as keyof typeof GAME_CONSTANTS.BUILDINGS];
        return buildingConfig?.resourceCost[level] || {};
    }

    private getMaxLevel(type: BuildingType): number {
        const buildingConfig = GAME_CONSTANTS.BUILDINGS[type.toUpperCase() as keyof typeof GAME_CONSTANTS.BUILDINGS];
        return buildingConfig?.maxLevel || 1;
    }

    private getConstructionTime(type: BuildingType, level: number): number {
        const buildingConfig = GAME_CONSTANTS.BUILDINGS[type.toUpperCase() as keyof typeof GAME_CONSTANTS.BUILDINGS];
        // 建筑时间随等级增加
        return (buildingConfig?.constructionTime || 1) * Math.pow(1.5, level - 1);
    }

    private getResourceProduction(type: BuildingType, level: number): Partial<Record<ResourceType, number>> | undefined {
        const buildingConfig = GAME_CONSTANTS.BUILDINGS[type.toUpperCase() as keyof typeof GAME_CONSTANTS.BUILDINGS];
        return buildingConfig?.resourceProduction?.[level];
    }

    private getResourceConsumption(type: BuildingType, level: number): Partial<Record<ResourceType, number>> | undefined {
        const buildingConfig = GAME_CONSTANTS.BUILDINGS[type.toUpperCase() as keyof typeof GAME_CONSTANTS.BUILDINGS];
        return buildingConfig?.resourceConsumption?.[level];
    }

    private getWorkerCapacity(type: BuildingType): number {
        const buildingConfig = GAME_CONSTANTS.BUILDINGS[type.toUpperCase() as keyof typeof GAME_CONSTANTS.BUILDINGS];
        return buildingConfig?.workerCapacity || 0;
    }

    private getDemolitionRefund(building: Building): Partial<Record<ResourceType, number>> {
        const refund: Partial<Record<ResourceType, number>> = {};
        const refundRate = 0.5; // 拆除返还50%资源

        Object.entries(building.resourceCost).forEach(([resourceType, amount]) => {
            if (amount) {
                refund[resourceType as ResourceType] = Math.floor(amount * refundRate);
            }
        });

        return refund;
    }

    private getJobTypeForBuilding(buildingType: BuildingType): Survivor['jobType'] {
        switch (buildingType) {
            case 'farm':
            case 'lumberMill':
            case 'powerPlant':
            case 'steelMill':
                return 'gathering';
            case 'shelter':
            case 'warehouse':
            case 'hospital':
            case 'kitchen':
                return 'construction';
            case 'researchLab':
                return 'research';
            default:
                return 'idle';
        }
    }

    private reassignWorkersFromBuilding(buildingId: string): void {
        this.gameState.survivors.forEach(survivor => {
            if (survivor.assignedBuildingId === buildingId) {
                survivor.assignedBuildingId = null;
                survivor.jobType = 'idle';
            }
        });
    }

    private onBuildingCompleted(building: Building): void {
        // 这里可以触发建筑完成事件
        // 例如：播放音效、显示通知等
        console.log(`建筑 ${BUILDING_TYPE_INFO[building.type].name} 建造完成！`);
    }
}