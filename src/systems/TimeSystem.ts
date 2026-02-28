import { GameState } from '../types/game.types';
import { GAME_CONSTANTS } from '../utils/constants';

export class TimeSystem {
    private readonly gameState: GameState;
    private lastUpdateTime: number;

    constructor(gameState: GameState) {
        this.gameState = gameState;
        this.lastUpdateTime = Date.now();
    }

    // 更新时间
    updateTime(): void {
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 转换为秒
        this.lastUpdateTime = currentTime;

        // 更新游戏时间
        this.updateGameTime(deltaTime);

        // 检查季节变化
        this.checkSeasonChange();
    }

    // 获取当前时间信息
    getTimeInfo() {
        return {
            ...this.gameState.time,
            isDay: this.isDayTime(),
            isNight: this.isNightTime(),
            seasonName: this.getSeasonName(),
            temperatureWithUnit: `${this.gameState.time.temperature}°C`,
        };
    }

    // 检查是否是白天
    isDayTime(): boolean {
        return this.gameState.time.hour >= 6 && this.gameState.time.hour < 18;
    }

    // 检查是否是夜晚
    isNightTime(): boolean {
        return !this.isDayTime();
    }

    // 获取季节名称
    getSeasonName(): string {
        const seasonNames = {
            spring: '春季',
            summer: '夏季',
            autumn: '秋季',
            winter: '冬季',
        };
        return seasonNames[this.gameState.time.season];
    }

    // 获取时间流逝速度（用于UI显示）
    getTimeSpeed(): number {
        return GAME_CONSTANTS.TIME.REAL_TIME_PER_GAME_MINUTE;
    }

    // 设置时间流逝速度（加速/减速）
    setTimeSpeed(): void {
        // 这里可以实现在游戏设置中调整时间速度
        // 目前使用固定速度
    }

    // 快进时间（用于测试或特殊事件）
    fastForward(hours: number): void {
        const deltaTime = hours * 3600; // 转换为秒
        this.updateGameTime(deltaTime);
    }

    // 获取下一个季节还有多少天
    getDaysUntilNextSeason(): number {
        const daysInSeason = GAME_CONSTANTS.TIME.DAYS_PER_SEASON;
        const daysInCurrentSeason = this.gameState.time.day % daysInSeason;
        return daysInSeason - daysInCurrentSeason;
    }

    // 获取季节进度百分比
    getSeasonProgress(): number {
        const daysInSeason = GAME_CONSTANTS.TIME.DAYS_PER_SEASON;
        const daysInCurrentSeason = this.gameState.time.day % daysInSeason;
        return (daysInCurrentSeason / daysInSeason) * 100;
    }

    // 获取时间格式化的字符串
    getFormattedTime(): string {
        const hour = String(this.gameState.time.hour).padStart(2, '0');
        const minute = String(this.gameState.time.minute).padStart(2, '0');
        return `${hour}:${minute}`;
    }

    // 获取日期字符串
    getFormattedDate(): string {
        return `第${this.gameState.time.day}天 ${this.getSeasonName()}`;
    }

    // 获取完整的时间字符串
    getFullTimeString(): string {
        return `${this.getFormattedDate()} ${this.getFormattedTime()}`;
    }

    // 私有方法
    private updateGameTime(deltaTime: number): void {
        // 计算游戏时间流逝
        const gameMinutesPerRealSecond = 60 / GAME_CONSTANTS.TIME.REAL_TIME_PER_GAME_MINUTE;
        const gameMinutesPassed = deltaTime * gameMinutesPerRealSecond;

        // 更新分钟
        this.gameState.time.minute += gameMinutesPassed;

        // 处理分钟进位到小时
        while (this.gameState.time.minute >= 60) {
            this.gameState.time.minute -= 60;
            this.gameState.time.hour += 1;
        }

        // 处理小时进位到天
        while (this.gameState.time.hour >= 24) {
            this.gameState.time.hour -= 24;
            this.gameState.time.day += 1;
            this.gameState.gameStats.daysSurvived += 1;

            // 每天触发的事件
            this.onNewDay();
        }

        // 更新温度（基于季节和时间）
        this.updateTemperature();
    }

    private updateTemperature(): void {
        const seasonTemp = GAME_CONSTANTS.SEASON_EFFECTS[this.gameState.time.season].temperature;
        
        // 昼夜温差
        const dayNightVariation = this.isDayTime() ? 5 : -5;
        
        // 随机波动
        const randomVariation = (Math.random() - 0.5) * 3;

        // 计算最终温度
        this.gameState.time.temperature = seasonTemp + dayNightVariation + randomVariation;
    }

    private checkSeasonChange(): void {
        const daysInSeason = GAME_CONSTANTS.TIME.DAYS_PER_SEASON;
        
        if (this.gameState.time.day % daysInSeason === 0 && this.gameState.time.hour === 0 && this.gameState.time.minute < 1) {
            this.changeSeason();
        }
    }

    private changeSeason(): void {
        const seasons = GAME_CONSTANTS.TIME.SEASONS;
        const currentIndex = seasons.indexOf(this.gameState.time.season);
        const nextIndex = (currentIndex + 1) % seasons.length;
        
        const oldSeason = this.gameState.time.season;
        this.gameState.time.season = seasons[nextIndex];
        
        // 季节变化事件
        this.onSeasonChange(oldSeason, this.gameState.time.season);
    }

    private onNewDay(): void {
        // 每天触发的事件
        // 例如：更新统计、检查事件等
        
        // 更新游戏统计
        this.gameState.gameStats.daysSurvived = this.gameState.time.day;
        
        // 这里可以添加每天触发的事件逻辑
        console.log(`新的一天开始了！第${this.gameState.time.day}天`);
    }

    private onSeasonChange(oldSeason: string, newSeason: string): void {
        const seasonNames = {
            spring: '春季',
            summer: '夏季',
            autumn: '秋季',
            winter: '冬季',
        };

        console.log(`季节变化：${seasonNames[oldSeason as keyof typeof seasonNames]} → ${seasonNames[newSeason as keyof typeof seasonNames]}`);
        
        // 这里可以触发季节变化事件
        // 例如：显示通知、调整资源产出等
        
        if (newSeason === 'winter') {
            console.log('警告：冬季来临，请确保有足够的燃料和保暖措施！');
        } else if (newSeason === 'spring') {
            console.log('好消息：春季来临，资源产出将恢复正常！');
        }
    }

    // 获取当前时间段（早晨、中午、傍晚、夜晚）
    getTimeOfDay(): string {
        const hour = this.gameState.time.hour;
        
        if (hour >= 5 && hour < 8) return '清晨';
        if (hour >= 8 && hour < 12) return '上午';
        if (hour >= 12 && hour < 14) return '中午';
        if (hour >= 14 && hour < 17) return '下午';
        if (hour >= 17 && hour < 19) return '傍晚';
        if (hour >= 19 && hour < 22) return '晚上';
        return '深夜';
    }

    // 获取时间段对工作效率的影响
    getTimeOfDayEfficiencyMultiplier(): number {
        const timeOfDay = this.getTimeOfDay();
        
        switch (timeOfDay) {
            case '清晨':
                return 0.8;
            case '上午':
                return 1.1;
            case '中午':
                return 1;
            case '下午':
                return 1;
            case '傍晚':
                return 0.9;
            case '晚上':
                return 0.7;
            case '深夜':
                return 0.5;
            default:
                return 1;
        }
    }

    // 获取光照等级（用于渲染）
    getLightLevel(): number {
        if (this.isDayTime()) {
            const hour = this.gameState.time.hour;
            
            // 正午光照最强
            const noonDistance = Math.abs(hour - 12);
            return Math.max(0.3, 1 - (noonDistance / 12));
        } else {
            // 夜晚有月光
            const hour = this.gameState.time.hour;
            
            if (hour >= 18 && hour < 20) return 0.3; // 黄昏
            if (hour >= 20 && hour < 22) return 0.2; // 夜晚初期
            if (hour >= 22 && hour < 4) return 0.1;  // 深夜
            if (hour >= 4 && hour < 6) return 0.2;   // 黎明前
            
            return 0.15; // 默认夜晚光照
        }
    }
}