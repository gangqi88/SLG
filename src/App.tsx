import { useState, useEffect, useRef } from 'react';
import { GameManager } from './game/GameManager';
import ResourcePanel from './components/UI/ResourcePanel';
import { PhaserGame } from './PhaserGame';
import { IRefPhaserGame } from './PhaserGame';

// UniSat Web3 组件导入
import { UniSatConnectButton } from './web3/components/UniSatConnectButton';
import { UniSatBRC20List } from './web3/components/UniSatBRC20List';
import { UniSatInscribePanel } from './web3/components/UniSatInscribePanel';
import { useUniSatWallet } from './web3/hooks/useUniSatWallet';

function App() {
    const [gameManager] = useState(() => new GameManager());
    const [gameInfo, setGameInfo] = useState<any>(null);
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [showGameUI, setShowGameUI] = useState(true);
    const [activeTab, setActiveTab] = useState<'local' | 'unisat'>('local');

    // UniSat 钱包状态
    const { isConnected, address } = useUniSatWallet();

    const phaserRef = useRef<IRefPhaserGame | null>(null);

    useEffect(() => {
        // 初始化游戏信息
        updateGameInfo();
        
        // 开始游戏循环
        gameManager.startGame();
        setIsGameRunning(true);
        
        // 设置更新间隔
        const intervalId = setInterval(() => {
            updateGameInfo();
        }, 1000); // 每秒更新一次

        // 游戏结束监听
        const handleGameOver = (event: CustomEvent) => {
            alert(`游戏结束！\n生存天数: ${event.detail.daysSurvived}\n幸存者总数: ${event.detail.totalSurvivors}\n建筑数量: ${event.detail.buildingsConstructed}`);
        };

        window.addEventListener('game-over', handleGameOver as EventListener);

        return () => {
            clearInterval(intervalId);
            gameManager.stopGame();
            window.removeEventListener('game-over', handleGameOver as EventListener);
        };
    }, [gameManager]);

    const updateGameInfo = () => {
        setGameInfo(gameManager.getGameInfo());
    };

    const handleNewGame = () => {
        if (window.confirm('开始新游戏会丢失当前进度，确定吗？')) {
            gameManager.newGame('normal');
            updateGameInfo();
            gameManager.startGame();
            setIsGameRunning(true);
        }
    };

    const handleSaveGame = () => {
        const success = gameManager.saveGame();
        if (success) {
            alert('游戏已保存！');
        } else {
            alert('保存失败！');
        }
    };

    const handleLoadGame = () => {
        const success = gameManager.loadGame();
        if (success) {
            updateGameInfo();
            alert('游戏已加载！');
        } else {
            alert('没有找到存档！');
        }
    };

    const handlePauseGame = () => {
        if (isGameRunning) {
            gameManager.pauseGame();
            setIsGameRunning(false);
        } else {
            gameManager.resumeGame();
            setIsGameRunning(true);
        }
    };

    const handleAddResource = (resourceType: string, amount: number) => {
        gameManager.addResource(resourceType as any, amount);
        updateGameInfo();
    };

    const handleAddSurvivor = () => {
        gameManager.addSurvivor();
        updateGameInfo();
    };

    if (!gameInfo) {
        return <div>加载中...</div>;
    }

    return (
        <div className="app">
            <header className="app-header">
                <h1>无尽冬日</h1>
                <div className="game-controls">
                    <UniSatConnectButton />
                    <button onClick={handleNewGame}>新游戏</button>
                    <button onClick={handleSaveGame}>保存</button>
                    <button onClick={handleLoadGame}>加载</button>
                    <button onClick={handlePauseGame}>
                        {isGameRunning ? '暂停' : '继续'}
                    </button>
                    <button onClick={() => setShowGameUI(!showGameUI)}>
                        {showGameUI ? '隐藏UI' : '显示UI'}
                    </button>
                    <div className="game-status">
                        <span className="status-indicator running"></span>
                        {isGameRunning ? '游戏运行中' : '游戏已暂停'}
                    </div>
                </div>
            </header>

            <div className="game-container">
                <div className="phaser-game">
                    <PhaserGame ref={phaserRef} />
                </div>

                {showGameUI && (
                    <div className="game-ui">
                        <div className="ui-left">
                            <ResourcePanel resources={gameInfo.resourceStats} />
                            
                            <div className="game-info-panel">
                                <h3>游戏信息</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">生存天数:</span>
                                        <span className="info-value">{gameInfo.gameStats.daysSurvived}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">季节:</span>
                                        <span className="info-value">{gameInfo.timeInfo.seasonName}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">时间:</span>
                                        <span className="info-value">{gameInfo.timeInfo.hour}:{String(gameInfo.timeInfo.minute).padStart(2, '0')}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">温度:</span>
                                        <span className="info-value">{gameInfo.timeInfo.temperatureWithUnit}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">幸存者:</span>
                                        <span className="info-value">{gameInfo.currentPopulation}/{gameInfo.populationCapacity}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">建筑:</span>
                                        <span className="info-value">{gameInfo.buildingCount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="survivor-info-panel">
                                <h3>幸存者状态</h3>
                                <div className="survivor-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">总数:</span>
                                        <span className="stat-value">{gameInfo.survivorStats.total}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">健康:</span>
                                        <span className="stat-value">{gameInfo.survivorStats.healthy}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">生病:</span>
                                        <span className="stat-value">{gameInfo.survivorStats.sick}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">受伤:</span>
                                        <span className="stat-value">{gameInfo.survivorStats.injured}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">工作中:</span>
                                        <span className="stat-value">{gameInfo.survivorStats.working}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">平均健康:</span>
                                        <span className="stat-value">{gameInfo.survivorStats.averageHealth}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ui-right">
                            <div className="action-panel">
                                <h3>快速操作</h3>
                                <div className="action-buttons">
                                    <button onClick={() => handleAddResource('food', 100)}>
                                        添加100食物
                                    </button>
                                    <button onClick={() => handleAddResource('wood', 100)}>
                                        添加100木材
                                    </button>
                                    <button onClick={() => handleAddResource('electricity', 50)}>
                                        添加50电力
                                    </button>
                                    <button onClick={handleAddSurvivor}>
                                        添加幸存者
                                    </button>
                                </div>
                            </div>

                            <div className="alerts-panel">
                                <h3>警报</h3>
                                {gameInfo.resourceAlerts.length > 0 ? (
                                    <div className="alerts-list">
                                        {gameInfo.resourceAlerts.map((alert: any, index: number) => (
                                            <div key={index} className={`alert-item ${alert.severity}`}>
                                                {alert.message}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-alerts">一切正常</div>
                                )}

                                {gameInfo.survivorsNeedingAttention.length > 0 && (
                                    <div className="survivor-alerts">
                                        <h4>需要关注的幸存者</h4>
                                        {gameInfo.survivorsNeedingAttention.slice(0, 3).map((item: any, index: number) => (
                                            <div key={index} className="survivor-alert-item">
                                                <span className="survivor-name">{item.survivor.name}</span>
                                                <span className="survivor-issues">
                                                    {item.issues.join(', ')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="buildings-panel">
                                <h3>可建造建筑</h3>
                                <div className="buildings-list">
                                    {gameInfo.availableBuildings.map((building: any, index: number) => (
                                        <div key={index} className={`building-item ${building.canBuild ? '' : 'disabled'}`}>
                                            <div className="building-name">{building.name}</div>
                                            <div className="building-description">{building.description}</div>
                                            <div className="building-cost">
                                                {Object.entries(building.cost).map(([resource, amount]) => (
                                                    <span key={resource} className="cost-item">
                                                        {resource}: {amount as number}
                                                    </span>
                                                ))}
                                            </div>
                                            <button
                                                className="build-button"
                                                disabled={!building.canBuild}
                                            >
                                                建造
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* UniSat Web3 面板 */}
                            <div className="unisat-panel">
                                <div className="unisat-tabs">
                                    <button
                                        className={activeTab === 'local' ? 'active' : ''}
                                        onClick={() => setActiveTab('local')}
                                    >
                                        本地
                                    </button>
                                    <button
                                        className={activeTab === 'unisat' ? 'active' : ''}
                                        onClick={() => setActiveTab('unisat')}
                                    >
                                        UniSat
                                    </button>
                                </div>

                                {activeTab === 'unisat' && (
                                    <div className="unisat-content">
                                        {!isConnected ? (
                                            <div className="unisat-connect-prompt">
                                                <h4>连接 UniSat 钱包</h4>
                                                <p>使用 UniSat 钱包进行 BRC-20 代币管理和链上存档</p>
                                                <UniSatConnectButton />
                                                <div className="unisat-links">
                                                    <a href="https://unisat.io/download" target="_blank" rel="noopener noreferrer">
                                                        下载 UniSat 钱包
                                                    </a>
                                                    <a href="https://docs.unisat.io" target="_blank" rel="noopener noreferrer">
                                                        查看文档
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <UniSatBRC20List address={address} />
                                                <UniSatInscribePanel gameState={gameManager.getInscriptionData()} />
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                body {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    color: white;
                    font-family: 'Arial', sans-serif;
                    min-height: 100vh;
                    overflow-x: hidden;
                }

                .app {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                }

                .app-header {
                    background: rgba(0, 0, 0, 0.8);
                    padding: 16px 24px;
                    border-bottom: 2px solid #00b4d8;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                }

                .app-header h1 {
                    font-size: 28px;
                    font-weight: bold;
                    background: linear-gradient(90deg, #00b4d8, #90e0ef);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }

                .game-controls {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .game-controls button {
                    background: linear-gradient(135deg, #0077b6, #0096c7);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(0, 119, 182, 0.3);
                }

                .game-controls button:hover {
                    background: linear-gradient(135deg, #0096c7, #00b4d8);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 150, 199, 0.4);
                }

                .game-controls button:active {
                    transform: translateY(0);
                }

                .game-controls button:disabled {
                    background: #666;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .game-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    font-size: 14px;
                }

                .status-indicator {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #4CAF50;
                    animation: pulse 2s infinite;
                }

                .status-indicator.running {
                    background: #4CAF50;
                }

                .status-indicator.paused {
                    background: #FFC107;
                }

                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }

                .game-container {
                    flex: 1;
                    display: flex;
                    position: relative;
                    overflow: hidden;
                }

                .phaser-game {
                    flex: 1;
                    position: relative;
                    background: #000;
                }

                .phaser-game #game-container {
                    width: 100%;
                    height: 100%;
                }

                .game-ui {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    padding: 20px;
                    gap: 20px;
                    pointer-events: none;
                }

                .game-ui > * {
                    pointer-events: auto;
                }

                .ui-left {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    width: 350px;
                }

                .ui-right {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    width: 350px;
                    margin-left: auto;
                }

                .game-info-panel,
                .survivor-info-panel,
                .action-panel,
                .alerts-panel,
                .buildings-panel {
                    background: rgba(0, 0, 0, 0.8);
                    border: 1px solid #444;
                    border-radius: 8px;
                    padding: 16px;
                    color: white;
                }

                .game-info-panel h3,
                .survivor-info-panel h3,
                .action-panel h3,
                .alerts-panel h3,
                .buildings-panel h3 {
                    margin: 0 0 16px 0;
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                    color: #00b4d8;
                    border-bottom: 1px solid #444;
                    padding-bottom: 8px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .info-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }

                .info-label {
                    font-weight: bold;
                    color: #90e0ef;
                }

                .info-value {
                    font-weight: bold;
                    color: white;
                }

                .survivor-stats {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }

                .stat-label {
                    color: #aaa;
                }

                .stat-value {
                    font-weight: bold;
                    color: white;
                }

                .action-buttons {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .action-buttons button {
                    background: linear-gradient(135deg, #2d6a4f, #40916c);
                    color: white;
                    border: none;
                    padding: 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }

                .action-buttons button:hover {
                    background: linear-gradient(135deg, #40916c, #52b788);
                    transform: translateY(-2px);
                }

                .alerts-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .alert-item {
                    padding: 8px 12px;
                    border-radius: 4px;
                    font-size: 14px;
                    animation: fadeIn 0.3s ease;
                }

                .alert-item.low {
                    background: rgba(255, 152, 0, 0.2);
                    border-left: 4px solid #FF9800;
                    color: #FFC107;
                }

                .alert-item.critical {
                    background: rgba(244, 67, 54, 0.2);
                    border-left: 4px solid #F44336;
                    color: #FF5252;
                    animation: pulse 1s infinite;
                }

                .no-alerts {
                    text-align: center;
                    color: #4CAF50;
                    padding: 20px;
                    font-style: italic;
                }

                .survivor-alerts {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #444;
                }

                .survivor-alerts h4 {
                    margin: 0 0 8px 0;
                    color: #FF9800;
                    font-size: 14px;
                }

                .survivor-alert-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px;
                    background: rgba(255, 152, 0, 0.1);
                    border-radius: 4px;
                    margin-bottom: 8px;
                    font-size: 12px;
                }

                .survivor-name {
                    font-weight: bold;
                    color: white;
                }

                .survivor-issues {
                    color: #FFC107;
                }

                .buildings-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .building-item {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 6px;
                    padding: 12px;
                    border: 1px solid #444;
                    transition: all 0.3s ease;
                }

                .building-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: #00b4d8;
                }

                .building-item.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                .building-name {
                    font-weight: bold;
                    color: #00b4d8;
                    margin-bottom: 4px;
                }

                .building-description {
                    font-size: 12px;
                    color: #aaa;
                    margin-bottom: 8px;
                }

                .building-cost {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .cost-item {
                    background: rgba(0, 180, 216, 0.2);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    color: #90e0ef;
                }

                .build-button {
                    width: 100%;
                    background: linear-gradient(135deg, #0077b6, #0096c7);
                    color: white;
                    border: none;
                    padding: 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }

                .build-button:hover:not(:disabled) {
                    background: linear-gradient(135deg, #0096c7, #00b4d8);
                    transform: translateY(-2px);
                }

                .build-button:disabled {
                    background: #666;
                    cursor: not-allowed;
                }

                @media (max-width: 1200px) {
                    .ui-left,
                    .ui-right {
                        width: 300px;
                    }
                }

                @media (max-width: 1024px) {
                    .game-ui {
                        flex-direction: column;
                    }
                    
                    .ui-left,
                    .ui-right {
                        width: 100%;
                        max-width: 400px;
                    }
                }

                /* UniSat 面板样式 */
                .unisat-panel {
                    background: rgba(0, 0, 0, 0.8);
                    border: 1px solid #444;
                    border-radius: 8px;
                    padding: 16px;
                    color: white;
                    margin-top: 20px;
                }

                .unisat-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                    border-bottom: 1px solid #444;
                    padding-bottom: 8px;
                }

                .unisat-tabs button {
                    background: transparent;
                    border: none;
                    color: #aaa;
                    padding: 8px 16px;
                    cursor: pointer;
                    font-weight: bold;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }

                .unisat-tabs button:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.1);
                }

                .unisat-tabs button.active {
                    color: #00b4d8;
                    background: rgba(0, 180, 216, 0.1);
                }

                .unisat-content {
                    max-height: 400px;
                    overflow-y: auto;
                }

                .unisat-connect-prompt {
                    text-align: center;
                    padding: 20px;
                }

                .unisat-connect-prompt h4 {
                    margin: 0 0 8px 0;
                    color: #00b4d8;
                }

                .unisat-connect-prompt p {
                    color: #aaa;
                    font-size: 14px;
                    margin-bottom: 16px;
                }

                .unisat-links {
                    margin-top: 16px;
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }

                .unisat-links a {
                    color: #00b4d8;
                    text-decoration: none;
                    font-size: 12px;
                }

                .unisat-links a:hover {
                    text-decoration: underline;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default App;