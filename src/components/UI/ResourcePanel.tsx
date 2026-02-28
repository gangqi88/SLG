import React from 'react';
import type { ResourceType } from '../../types/game.types';
import { RESOURCE_TYPE_INFO } from '../../utils/constants';
import { formatNumber } from '../../utils/helpers';

interface ResourcePanelProps {
    resources: Record<ResourceType, {
        amount: number;
        capacity: number;
        production: number;
        consumption: number;
        netChange: number;
    }>;
}

const ResourcePanel: React.FC<ResourcePanelProps> = ({ resources }) => {
    const resourceTypes: ResourceType[] = ['food', 'wood', 'steel', 'electricity', 'fuel'];

    const getResourceColor = (resourceType: ResourceType) => {
        return RESOURCE_TYPE_INFO[resourceType].color;
    };

    const getResourceIcon = (resourceType: ResourceType) => {
        return RESOURCE_TYPE_INFO[resourceType].icon;
    };

    const getResourceName = (resourceType: ResourceType) => {
        return RESOURCE_TYPE_INFO[resourceType].name;
    };

    const getResourceUnit = (resourceType: ResourceType) => {
        return RESOURCE_TYPE_INFO[resourceType].unit;
    };

    const getPercentage = (amount: number, capacity: number) => {
        return capacity > 0 ? (amount / capacity) * 100 : 0;
    };

    const getNetChangeDisplay = (netChange: number) => {
        if (netChange > 0) {
            return <span style={{ color: '#4CAF50' }}>+{netChange.toFixed(1)}/h</span>;
        } else if (netChange < 0) {
            return <span style={{ color: '#F44336' }}>{netChange.toFixed(1)}/h</span>;
        } else {
            return <span style={{ color: '#9E9E9E' }}>0/h</span>;
        }
    };

    return (
        <div className="resource-panel">
            <h3 className="resource-panel-title">资源</h3>
            <div className="resource-list">
                {resourceTypes.map(resourceType => {
                    const resource = resources[resourceType];
                    const percentage = getPercentage(resource.amount, resource.capacity);
                    const isLow = percentage < 20;
                    const isCritical = percentage < 5;

                    let additionalClass = '';
                    if (isCritical) {
                        additionalClass = 'critical';
                    } else if (isLow) {
                        additionalClass = 'low';
                    }

                    return (
                        <div 
                            key={resourceType} 
                            className={`resource-item ${additionalClass}`}
                            style={{ borderLeftColor: getResourceColor(resourceType) }}
                        >
                            <div className="resource-header">
                                <span className="resource-icon">{getResourceIcon(resourceType)}</span>
                                <span className="resource-name">{getResourceName(resourceType)}</span>
                                <span className="resource-net-change">
                                    {getNetChangeDisplay(resource.netChange)}
                                </span>
                            </div>
                            
                            <div className="resource-details">
                                <div className="resource-amount">
                                    {formatNumber(Math.floor(resource.amount))} / {formatNumber(resource.capacity)} {getResourceUnit(resourceType)}
                                </div>
                                <div className="resource-production-consumption">
                                    <span className="production">产出: {resource.production.toFixed(1)}/h</span>
                                    <span className="consumption">消耗: {resource.consumption.toFixed(1)}/h</span>
                                </div>
                            </div>

                            <div className="resource-progress-bar">
                                <div 
                                    className="resource-progress-fill"
                                    style={{ 
                                        width: `${percentage}%`,
                                        backgroundColor: getResourceColor(resourceType)
                                    }}
                                />
                                <div className="resource-progress-label">
                                    {percentage.toFixed(1)}%
                                </div>
                            </div>

                            {isCritical && (
                                <div className="resource-warning">
                                    ⚠️ 资源严重不足！
                                </div>
                            )}
                            {isLow && !isCritical && (
                                <div className="resource-warning">
                                    ⚠️ 资源不足
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                .resource-panel {
                    background: rgba(0, 0, 0, 0.8);
                    border: 1px solid #444;
                    border-radius: 8px;
                    padding: 16px;
                    color: white;
                    font-family: 'Arial', sans-serif;
                    min-width: 300px;
                }

                .resource-panel-title {
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                    color: #fff;
                    border-bottom: 1px solid #444;
                    padding-bottom: 8px;
                }

                .resource-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .resource-item {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    padding: 12px;
                    border-left: 4px solid;
                    transition: all 0.3s ease;
                }

                .resource-item:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateY(-2px);
                }

                .resource-item.critical {
                    animation: pulse 1s infinite;
                    background: rgba(244, 67, 54, 0.2);
                }

                .resource-item.low {
                    background: rgba(255, 152, 0, 0.2);
                }

                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }

                .resource-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;
                    gap: 8px;
                }

                .resource-icon {
                    font-size: 20px;
                }

                .resource-name {
                    font-weight: bold;
                    flex-grow: 1;
                }

                .resource-net-change {
                    font-size: 12px;
                    font-weight: bold;
                }

                .resource-details {
                    margin-bottom: 8px;
                    font-size: 14px;
                }

                .resource-amount {
                    margin-bottom: 4px;
                    color: #ddd;
                }

                .resource-production-consumption {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #aaa;
                }

                .production {
                    color: #4CAF50;
                }

                .consumption {
                    color: #F44336;
                }

                .resource-progress-bar {
                    height: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    position: relative;
                    overflow: hidden;
                    margin-top: 8px;
                }

                .resource-progress-fill {
                    height: 100%;
                    border-radius: 10px;
                    transition: width 0.3s ease;
                }

                .resource-progress-label {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    color: white;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
                }

                .resource-warning {
                    margin-top: 8px;
                    padding: 4px 8px;
                    background: rgba(255, 152, 0, 0.3);
                    border-radius: 4px;
                    font-size: 12px;
                    text-align: center;
                    color: #FFC107;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ResourcePanel;
