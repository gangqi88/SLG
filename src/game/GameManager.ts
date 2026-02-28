import { GameState, ResourceType, ProfessionalSkillType, ProfessionalSkill, GameDifficulty } from '../types/game.types';
import { ResourceSystem } from '../systems/ResourceSystem';
import { BuildingSystem } from '../systems/BuildingSystem';
import { SurvivalSystem } from '../systems/SurvivalSystem';
import { TimeSystem } from '../systems/TimeSystem';
import { GAME_CONSTANTS } from '../utils/constants';
import { generateId, checkGameOver, calculatePopulationCapacity } from '../utils/helpers';
import { saveGame, loadGame } from '../utils/storage';

export class GameManager {
    private gameState: GameState;
    private resourceSystem: ResourceSystem;
    private buildingSystem: BuildingSystem;
    private survivalSystem: SurvivalSystem;
    private timeSystem: TimeSystem;
    
    private isRunning: boolean = false;
    private lastUpdateTime: number = 0;
    // private readonly updateInterval: number = 1000; // 1秒更新一次 (unused)
    private gameLoopId: number | null = null;

    constructor() {
        // 尝试加载存档，否则创建新游戏
        const loadedState = loadGame();
        if (loadedState) {
            this.gameState = loadedState;
        } else {
            this.gameState = this.createInitialGameState();
        }

        // 初始化系统
        this.resourceSystem = new ResourceSystem(this.gameState);
        this.buildingSystem = new BuildingSystem(this.gameState);
        this.survivalSystem = new SurvivalSystem(this.gameState);
        this.timeSystem = new TimeSystem(this.gameState);
    }

    // 创建初始游戏状态
    private createInitialGameState(): GameState {
        // 创建初始资源状态
        const resources = {} as GameState['resources'];
        Object.keys(GAME_CONSTANTS.RESOURCES.INITIAL_AMOUNTS).forEach(key => {
            const resourceType = key as ResourceType;
            resources[resourceType] = {
                type: resourceType,
                amount: GAME_CONSTANTS.RESOURCES.INITIAL_AMOUNTS[resourceType],
                capacity: GAME_CONSTANTS.RESOURCES.DEFAULT_CAPACITY[resourceType],
                productionRate: 0,
                consumptionRate: 0,
            };
        });

        // 创建初始幸存者
        const survivors = [];
        for (let i = 0; i < GAME_CONSTANTS.SURVIVORS.INITIAL_COUNT; i++) {
            survivors.push({
                id: generateId(),
                name: `幸存者${i + 1}`,
                health: 100,
                hunger: 100,
                stamina: 100,
                temperature: 36.5,
                skills: {
                    baseSkills: {
                        gathering: Math.floor(Math.random() * 3) + 1,
                        construction: Math.floor(Math.random() * 3) + 1,
                        research: Math.floor(Math.random() * 3) + 1,
                        medical: Math.floor(Math.random() * 3) + 1,
                    },
                    professionalSkills: new Map<ProfessionalSkillType, ProfessionalSkill>(),
                    skillPoints: 0,
                    totalExperience: 0,
                    specialization: undefined
                },
                assignedBuildingId: null,
                jobType: 'idle' as const,
                isSick: false,
                isInjured: false,
            });
        }

        // 初始建筑（一个基础庇护所）
        const buildings = [
            {
                id: generateId(),
                type: 'shelter' as const,
                level: 1,
                x: 100,
                y: 100,
                maxLevel: 5,
                constructionTime: 0,
                resourceCost: { wood: 100 },
                workerCapacity: 10,
                assignedWorkers: 0,
                isConstructing: false,
            },
            {
                id: generateId(),
                type: 'warehouse' as const,
                level: 1,
                x: 200,
                y: 100,
                maxLevel: 3,
                constructionTime: 0,
                resourceCost: { wood: 150 },
                workerCapacity: 5,
                assignedWorkers: 0,
                isConstructing: false,
            },
        ];

        // 创建初始游戏统计
        const totalResourcesCollected = {} as Record<ResourceType, number>;
        Object.keys(resources).forEach(key => {
            totalResourcesCollected[key as ResourceType] = resources[key as ResourceType].amount;
        });

        return {
            resources,
            buildings,
            survivors,
            time: {
                day: 1,
                hour: 8,
                minute: 0,
                season: 'winter' as const, // 从冬季开始，增加挑战性
                temperature: -10,
            },
            gameStats: {
                daysSurvived: 1,
                totalSurvivorsRescued: GAME_CONSTANTS.SURVIVORS.INITIAL_COUNT,
                totalResourcesCollected,
                buildingsConstructed: 2,
            },
            difficulty: 'normal' as const,
        };
    }

    // 开始游戏循环
    startGame(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastUpdateTime = Date.now();
        this.gameLoop();
    }

    // 停止游戏循环
    stopGame(): void {
        this.isRunning = false;
        if (this.gameLoopId !== null) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
    }

    // 游戏主循环
    private gameLoop(): void {
        if (!this.isRunning) return;

        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 转换为秒
        
        if (deltaTime >= 1) { // 至少1秒更新一次
            this.update(deltaTime);
            this.lastUpdateTime = currentTime;
        }

        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }

    // 更新游戏状态
    private update(deltaTime: number): void {
        // 更新时间
        this.timeSystem.updateTime();

        // 更新资源
        this.gameState.resources = this.resourceSystem.updateResources(deltaTime);

        // 更新建筑建造进度
        this.buildingSystem.updateConstructionProgress(deltaTime);

        // 更新幸存者状态
        this.gameState.survivors = this.survivalSystem.updateSurvivors(deltaTime);

        // 检查游戏结束条件
        if (checkGameOver(this.gameState)) {
            this.onGameOver();
            return;
        }

        // 自动保存（每5分钟）
        if (this.gameState.time.minute % 5 === 0 && this.gameState.time.minute < 1) {
            this.saveGame();
        }
    }

    // 保存游戏
    saveGame(): boolean {
        const success = saveGame(this.gameState);
        if (success) {
            console.log('游戏已保存');
        }
        return success;
    }

    // 加载游戏
    loadGame(): boolean {
        const loadedState = loadGame();
        if (loadedState) {
            this.gameState = loadedState;
            
            // 重新初始化系统
            this.resourceSystem = new ResourceSystem(this.gameState);
            this.buildingSystem = new BuildingSystem(this.gameState);
            this.survivalSystem = new SurvivalSystem(this.gameState);
            this.timeSystem = new TimeSystem(this.gameState);
            
            return true;
        }
        return false;
    }

    // 新游戏
    newGame(difficulty: GameDifficulty = 'normal'): void {
        this.stopGame();
        this.gameState = this.createInitialGameState();
        this.gameState.difficulty = difficulty;
        
        // 重新初始化系统
        this.resourceSystem = new ResourceSystem(this.gameState);
        this.buildingSystem = new BuildingSystem(this.gameState);
        this.survivalSystem = new SurvivalSystem(this.gameState);
        this.timeSystem = new TimeSystem(this.gameState);
        
        console.log('新游戏开始，难度:', difficulty);
    }

    // 获取游戏状态
    getGameState(): GameState {
        return { ...this.gameState };
    }

    // 获取系统实例
    getResourceSystem(): ResourceSystem {
        return this.resourceSystem;
    }

    getBuildingSystem(): BuildingSystem {
        return this.buildingSystem;
    }

    getSurvivalSystem(): SurvivalSystem {
        return this.survivalSystem;
    }

    getTimeSystem(): TimeSystem {
        return this.timeSystem;
    }

    // 游戏操作
    createBuilding(type: string, x: number, y: number) {
        return this.buildingSystem.createBuilding(type as any, x, y);
    }

    upgradeBuilding(buildingId: string) {
        return this.buildingSystem.upgradeBuilding(buildingId);
    }

    demolishBuilding(buildingId: string) {
        return this.buildingSystem.demolishBuilding(buildingId);
    }

    assignWorker(buildingId: string, survivorId: string) {
        return this.buildingSystem.assignWorker(buildingId, survivorId);
    }

    unassignWorker(buildingId: string, survivorId: string) {
        return this.buildingSystem.unassignWorker(buildingId, survivorId);
    }

    addSurvivor(skills?: any) {
        return this.survivalSystem.addSurvivor(skills);
    }

    removeSurvivor(survivorId: string) {
        return this.survivalSystem.removeSurvivor(survivorId);
    }

    healSurvivor(survivorId: string, amount: number) {
        return this.survivalSystem.healSurvivor(survivorId, amount);
    }

    feedSurvivor(survivorId: string, amount: number) {
        return this.survivalSystem.feedSurvivor(survivorId, amount);
    }

    makeSurvivorRest(survivorId: string) {
        return this.survivalSystem.makeSurvivorRest(survivorId);
    }

    addResource(resourceType: ResourceType, amount: number) {
        return this.resourceSystem.addResource(resourceType, amount);
    }

    removeResource(resourceType: ResourceType, amount: number) {
        return this.resourceSystem.removeResource(resourceType, amount);
    }

    // 获取游戏信息
    getGameInfo() {
        const populationCapacity = calculatePopulationCapacity(this.gameState.buildings);
        const survivorStats = this.survivalSystem.getSurvivorStatistics();
        const resourceStats = this.resourceSystem.getResourceStatistics();
        const timeInfo = this.timeSystem.getTimeInfo();

        return {
            gameStats: this.gameState.gameStats,
            difficulty: this.gameState.difficulty,
            survivorStats,
            resourceStats,
            timeInfo,
            populationCapacity,
            currentPopulation: this.gameState.survivors.length,
            isOverPopulated: this.gameState.survivors.length > populationCapacity,
            resourceAlerts: this.resourceSystem.getResourceAlerts(),
            survivorsNeedingAttention: this.survivalSystem.getSurvivorsNeedingAttention(),
            availableBuildings: this.buildingSystem.getAvailableBuildings(),
            buildingCount: this.gameState.buildings.length,
            constructingBuildings: this.gameState.buildings.filter(b => b.isConstructing).length,
        };
    }

    // 游戏结束处理
    private onGameOver(): void {
        this.stopGame();
        console.log('游戏结束！');
        
        // 这里可以触发游戏结束事件
        // 例如：显示游戏结束界面、统计分数等
        
        // 发送游戏结束事件
        const event = new CustomEvent('game-over', {
            detail: {
                daysSurvived: this.gameState.gameStats.daysSurvived,
                totalSurvivors: this.gameState.gameStats.totalSurvivorsRescued,
                buildingsConstructed: this.gameState.gameStats.buildingsConstructed,
            }
        });
        globalThis.dispatchEvent(event);
    }

    // 检查游戏是否运行中
    isGameRunning(): boolean {
        return this.isRunning;
    }

    // 获取游戏运行时间
    getPlayTime(): number {
        return Date.now() - this.lastUpdateTime;
    }

    // 设置游戏难度
    setDifficulty(difficulty: GameDifficulty): void {
        this.gameState.difficulty = difficulty;
    }

    // 获取游戏难度
    getDifficulty(): GameDifficulty {
        return this.gameState.difficulty;
    }

    // 快进时间（用于测试）
    fastForwardTime(hours: number): void {
        this.timeSystem.fastForward(hours);
    }

    // 暂停游戏
    pauseGame(): void {
        this.stopGame();
    }

    // 继续游戏
    resumeGame(): void {
        this.startGame();
    }

    // 获取游戏状态快照（用于调试）
    getGameSnapshot(): any {
        return {
            state: this.gameState,
            systems: {
                resourceSystem: this.resourceSystem,
                buildingSystem: this.buildingSystem,
                survivalSystem: this.survivalSystem,
                timeSystem: this.timeSystem,
            },
            isRunning: this.isRunning,
        };
    }

    // ========== Web3 / UniSat 集成方法 ==========

    // Web3 状态
    private web3State = {
        isWeb3Enabled: false,
        lastChainSaveTime: undefined as number | undefined,
        inscriptionId: undefined as string | undefined,
        network: (import.meta.env.VITE_FB_NETWORK === 'mainnet' ? 'fractal_mainnet' : 'fractal_testnet') as 'fractal_mainnet' | 'fractal_testnet',
    };

    // 获取用于铭刻的游戏数据
    getInscriptionData() {
        return {
            version: '1.0.0',
            daysSurvived: this.gameState.gameStats.daysSurvived,
            totalSurvivors: this.gameState.survivors.length,
            buildingsCount: this.gameState.buildings.length,
            resources: this.summarizeResources(),
            timestamp: Date.now(),
        };
    }

    // 资源摘要（减少铭刻数据大小）
    private summarizeResources() {
        const resources = this.gameState.resources;
        return {
            food: Math.floor(resources.food?.amount || 0),
            wood: Math.floor(resources.wood?.amount || 0),
            steel: Math.floor(resources.steel?.amount || 0),
            electricity: Math.floor(resources.electricity?.amount || 0),
            fuel: Math.floor(resources.fuel?.amount || 0),
        };
    }

    // 从铭文恢复游戏
    restoreFromInscription(inscriptionData: any): boolean {
        try {
            if (!inscriptionData.data) {
                throw new Error('无效的铭文数据');
            }

            const data = inscriptionData.data;

            // 验证版本
            if (inscriptionData.v !== '1.0.0') {
                console.warn('铭文版本不兼容:', inscriptionData.v);
            }

            // 恢复游戏状态（简化版）
            console.log('从铭文恢复游戏:', {
                days: data.days,
                survivors: data.survivors,
                buildings: data.buildings,
            });

            this.web3State.lastChainSaveTime = inscriptionData.ts;
            return true;
        } catch (error) {
            console.error('恢复游戏失败:', error);
            return false;
        }
    }

    // 启用 Web3
    enableWeb3(): void {
        this.web3State.isWeb3Enabled = true;
    }

    // 禁用 Web3
    disableWeb3(): void {
        this.web3State.isWeb3Enabled = false;
    }

    // 获取 Web3 状态
    getWeb3State() {
        return { ...this.web3State };
    }

    // 更新铭文 ID
    setInscriptionId(inscriptionId: string): void {
        this.web3State.inscriptionId = inscriptionId;
        this.web3State.lastChainSaveTime = Date.now();
    }

    // 检查是否启用了 Web3
    isWeb3Enabled(): boolean {
        return this.web3State.isWeb3Enabled;
    }
}