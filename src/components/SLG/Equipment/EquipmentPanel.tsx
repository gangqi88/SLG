import React, { useState, useCallback } from 'react';
import type { Hero, Equipment } from '../../../types/slg/hero.types';
import { 
    equipmentSystem, 
    EquipmentEnhanceResult,
    EQUIPMENT_CONSTANTS 
} from '../../../systems/EquipmentSystem';
import './EquipmentPanel.css';

interface PlayerResources {
    gold: number;
    enhancementStone: number;
    refineStone: number;
    heroSoul: number;
}

interface EquipmentPanelProps {
    hero: Hero;
    playerResources: PlayerResources;
    onHeroUpdate?: (hero: Hero) => void;
    onClose?: () => void;
}

export const EquipmentPanel: React.FC<EquipmentPanelProps> = ({
    hero,
    playerResources,
    onHeroUpdate,
    onClose,
}) => {
    const [selectedSlot, setSelectedSlot] = useState<'weapon' | 'armor' | 'accessory' | null>(null);
    const [enhanceResult, setEnhanceResult] = useState<EquipmentEnhanceResult | null>(null);
    const [isEnhancing, setIsEnhancing] = useState(false);

    const equippedEquipment = hero.equipment || {};
    
    const slots: Array<{ key: 'weapon' | 'armor' | 'accessory'; label: string; icon: string }> = [
        { key: 'weapon', label: '武器', icon: '⚔️' },
        { key: 'armor', label: '护甲', icon: '🛡️' },
        { key: 'accessory', label: '饰品', icon: '💍' },
    ];

    const getEquipment = (slot: 'weapon' | 'armor' | 'accessory'): Equipment | undefined => {
        return equippedEquipment[slot];
    };

    const getEquipmentBonus = useCallback((equipment: Equipment) => {
        return equipmentSystem.getEquipmentBonus(equipment);
    }, []);

    const handleEnhance = useCallback(() => {
        if (!selectedSlot) return;

        const equipment = getEquipment(selectedSlot);
        if (!equipment) {
            alert('该装备槽位没有装备');
            return;
        }

        setIsEnhancing(true);
        setEnhanceResult(null);

        setTimeout(() => {
            const result = equipmentSystem.enhanceEquipment(
                equipment,
                playerResources.gold,
                playerResources.enhancementStone
            );

            setEnhanceResult(result);
            setIsEnhancing(false);

            if (result.success && result.newLevel) {
                const updatedEquipment: Equipment = {
                    ...equipment,
                    level: result.newLevel,
                    enhancements: result.newEnhancements || equipment.enhancements,
                };

                const updatedHero: Hero = {
                    ...hero,
                    equipment: {
                        ...hero.equipment,
                        [selectedSlot]: updatedEquipment,
                    },
                };

                onHeroUpdate?.(updatedHero);
            }
        }, 500);
    }, [selectedSlot, hero, playerResources, onHeroUpdate]);

    const getEnhanceCost = () => {
        if (!selectedSlot) return null;
        const equipment = getEquipment(selectedSlot);
        if (!equipment) return null;
        
        return equipmentSystem.calculateEnhanceCost(equipment.level, equipment.quality);
    };

    const getSuccessRate = () => {
        if (!selectedSlot) return null;
        const equipment = getEquipment(selectedSlot);
        if (!equipment) return null;
        
        return equipmentSystem.calculateSuccessRate(equipment.level);
    };

    const qualityColors: Record<string, string> = {
        common: '#9ca3af',
        rare: '#22c55e',
        epic: '#a855f7',
        legendary: '#f59e0b',
    };

    return (
        <div className="equipment-panel-overlay" onClick={onClose}>
            <div className="equipment-panel" onClick={e => e.stopPropagation()}>
                <div className="equipment-panel-header">
                    <h2>装备强化</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="hero-info">
                    <span className="hero-name">{hero.name}</span>
                    <span className="hero-quality">{hero.quality}</span>
                </div>

                <div className="equipment-slots">
                    {slots.map(slot => {
                        const equipment = getEquipment(slot.key);
                        const isSelected = selectedSlot === slot.key;

                        return (
                            <div
                                key={slot.key}
                                className={`equipment-slot ${isSelected ? 'selected' : ''} ${equipment ? 'has-equipment' : ''}`}
                                onClick={() => setSelectedSlot(slot.key)}
                            >
                                <span className="slot-icon">{slot.icon}</span>
                                <span className="slot-label">{slot.label}</span>
                                {equipment && (
                                    <div className="slot-equipment">
                                        <span className="equipment-name">{equipment.name}</span>
                                        <span 
                                            className="equipment-quality"
                                            style={{ color: qualityColors[equipment.quality] }}
                                        >
                                            +{equipment.level}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {selectedSlot && getEquipment(selectedSlot) && (
                    <div className="equipment-details">
                        <h3>装备详情</h3>
                        {(() => {
                            const equipment = getEquipment(selectedSlot)!;
                            const bonus = getEquipmentBonus(equipment);

                            return (
                                <>
                                    <div className="detail-row">
                                        <span>装备名称</span>
                                        <span>{equipment.name}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>品质</span>
                                        <span style={{ color: qualityColors[equipment.quality] }}>
                                            {equipment.quality.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span>强化等级</span>
                                        <span>+{equipment.level} / {EQUIPMENT_CONSTANTS.MAX_ENHANCE_LEVEL}</span>
                                    </div>

                                    <div className="attribute-bonus">
                                        <h4>属性加成</h4>
                                        <div className="bonus-grid">
                                            <div className="bonus-item">
                                                <span>统御</span>
                                                <span>+{bonus.command}</span>
                                            </div>
                                            <div className="bonus-item">
                                                <span>武力</span>
                                                <span>+{bonus.strength}</span>
                                            </div>
                                            <div className="bonus-item">
                                                <span>谋略</span>
                                                <span>+{bonus.strategy}</span>
                                            </div>
                                            <div className="bonus-item">
                                                <span>防御</span>
                                                <span>+{bonus.defense}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}

                {selectedSlot && getEquipment(selectedSlot) && (
                    <div className="enhance-section">
                        <h3>强化</h3>
                        {enhanceResult && (
                            <div className={`enhance-result ${enhanceResult.success ? 'success' : 'failed'}`}>
                                {enhanceResult.success 
                                    ? `强化成功！等级 +${enhanceResult.newLevel}` 
                                    : `强化失败：${enhanceResult.error}`}
                            </div>
                        )}

                        <div className="enhance-cost">
                            {(() => {
                                const costs = getEnhanceCost();
                                if (!costs) return null;

                                const canAfford = playerResources.gold >= costs.gold && 
                                    playerResources.enhancementStone >= costs.enhancementStone;
                                const successRate = getSuccessRate();

                                return (
                                    <>
                                        <div className="cost-item">
                                            <span>消耗金币</span>
                                            <span className={playerResources.gold >= costs.gold ? 'affordable' : 'insufficient'}>
                                                {costs.gold.toLocaleString()} / {playerResources.gold.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="cost-item">
                                            <span>强化石</span>
                                            <span className={playerResources.enhancementStone >= costs.enhancementStone ? 'affordable' : 'insufficient'}>
                                                {costs.enhancementStone} / {playerResources.enhancementStone}
                                            </span>
                                        </div>
                                        <div className="cost-item">
                                            <span>成功率</span>
                                            <span>{Math.round((successRate || 0) * 100)}%</span>
                                        </div>

                                        <button 
                                            className="enhance-btn"
                                            onClick={handleEnhance}
                                            disabled={!canAfford || isEnhancing || (getEquipment(selectedSlot)?.level || 0) >= EQUIPMENT_CONSTANTS.MAX_ENHANCE_LEVEL}
                                        >
                                            {isEnhancing ? '强化中...' : '开始强化'}
                                        </button>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {!selectedSlot && (
                    <div className="no-selection">
                        <p>选择一个装备槽位进行强化</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EquipmentPanel;
