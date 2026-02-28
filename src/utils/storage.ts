import { GameState } from '../types/game.types';

const SAVE_KEY = 'endless_winter_save';
const SETTINGS_KEY = 'endless_winter_settings';

export interface GameSettings {
    musicVolume: number;
    soundVolume: number;
    language: 'zh' | 'en';
    autosave: boolean;
    autosaveInterval: number; // 分钟
}

const defaultSettings: GameSettings = {
    musicVolume: 0.7,
    soundVolume: 0.8,
    language: 'zh',
    autosave: true,
    autosaveInterval: 5,
};

// 保存游戏状态
export const saveGame = (gameState: GameState): boolean => {
    try {
        const saveData = {
            state: gameState,
            timestamp: Date.now(),
            version: '1.0.0',
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        return true;
    } catch (error) {
        console.error('保存游戏失败:', error);
        return false;
    }
};

// 加载游戏状态
export const loadGame = (): GameState | null => {
    try {
        const saveData = localStorage.getItem(SAVE_KEY);
        if (!saveData) {
            return null;
        }

        const parsed = JSON.parse(saveData);
        
        // 检查版本兼容性
        if (parsed.version !== '1.0.0') {
            console.warn('存档版本不兼容，可能需要迁移');
            // 这里可以添加版本迁移逻辑
        }

        return parsed.state as GameState;
    } catch (error) {
        console.error('加载游戏失败:', error);
        return null;
    }
};

// 删除存档
export const deleteSave = (): void => {
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch (error) {
        console.error('删除存档失败:', error);
    }
};

// 检查是否有存档
export const hasSave = (): boolean => {
    return localStorage.getItem(SAVE_KEY) !== null;
};

// 获取存档信息
export const getSaveInfo = (): { timestamp: number; daysSurvived: number } | null => {
    try {
        const saveData = localStorage.getItem(SAVE_KEY);
        if (!saveData) {
            return null;
        }

        const parsed = JSON.parse(saveData);
        return {
            timestamp: parsed.timestamp,
            daysSurvived: parsed.state?.gameStats?.daysSurvived || 0,
        };
    } catch (error) {
        console.error('获取存档信息失败:', error);
        return null;
    }
};

// 保存设置
export const saveSettings = (settings: GameSettings): boolean => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('保存设置失败:', error);
        return false;
    }
};

// 加载设置
export const loadSettings = (): GameSettings => {
    try {
        const settingsData = localStorage.getItem(SETTINGS_KEY);
        if (!settingsData) {
            return defaultSettings;
        }

        const parsed = JSON.parse(settingsData);
        return { ...defaultSettings, ...parsed };
    } catch (error) {
        console.error('加载设置失败:', error);
        return defaultSettings;
    }
};

// 导出存档
export const exportSave = (): string => {
    try {
        const saveData = localStorage.getItem(SAVE_KEY);
        if (!saveData) {
            throw new Error('没有存档可导出');
        }
        
        const data = JSON.parse(saveData);
        const exportData = {
            ...data,
            exportTimestamp: Date.now(),
        };
        
        return JSON.stringify(exportData, null, 2);
    } catch (error) {
        console.error('导出存档失败:', error);
        throw error;
    }
};

// 导入存档
export const importSave = (saveString: string): boolean => {
    try {
        const importData = JSON.parse(saveString);
        
        // 验证导入数据
        if (!importData.state || !importData.timestamp) {
            throw new Error('无效的存档格式');
        }
        
        localStorage.setItem(SAVE_KEY, JSON.stringify(importData));
        return true;
    } catch (error) {
        console.error('导入存档失败:', error);
        return false;
    }
};

// 清除所有游戏数据
export const clearAllGameData = (): void => {
    try {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
        console.error('清除游戏数据失败:', error);
    }
};

// 获取存档统计
export const getSaveStatistics = () => {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) {
        return null;
    }

    try {
        const parsed = JSON.parse(saveData);
        const state = parsed.state as GameState;
        
        return {
            daysSurvived: state.gameStats.daysSurvived,
            totalSurvivorsRescued: state.gameStats.totalSurvivorsRescued,
            buildingsConstructed: state.gameStats.buildingsConstructed,
            totalPlayTime: Date.now() - parsed.timestamp,
            difficulty: state.difficulty,
        };
    } catch (error) {
        console.error('获取存档统计失败:', error);
        return null;
    }
};