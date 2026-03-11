import React, { useState, useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { SiegeManager, SiegePhase } from '@/features/battle/logic/SiegeManager';
import { SneakAttackScene } from '@/features/battle/scenes/SneakAttackScene';
import { DemolitionScene } from '@/features/battle/scenes/DemolitionScene';
import { SiegeBattleScene } from '@/features/battle/scenes/SiegeBattleScene';
import { HUMAN_HEROES } from '@/features/hero/data/humanHeroes';

interface SiegeViewProps {
  onExit: () => void;
}

const siegeManager = new SiegeManager();

const SiegeBattleGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  
  useEffect(() => {
    if (gameRef.current) return;
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-battle-container',
      physics: {
        default: 'arcade',
        arcade: { debug: false }
      },
      scene: [SiegeBattleScene]
    };
    
    const game = new Phaser.Game(config);
    gameRef.current = game;
    
    // Restart scene with data to ensure init receives it
    // Use a slight timeout to ensure scene manager is ready if needed, 
    // but usually start() queues it correctly.
    // However, since it's in the 'scene' array, it auto-starts.
    // We can just stop and restart.
    setTimeout(() => {
        if (game.scene.getScene('SiegeBattleScene')) {
            game.scene.start('SiegeBattleScene', { attackerHeroes: HUMAN_HEROES });
        }
    }, 100);
    
    return () => {
        game.destroy(true);
        gameRef.current = null;
    }
  }, []);

  return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '800px', height: '600px', backgroundColor: '#000' }}>
            <div id="phaser-battle-container" />
            <button onClick={onExit} style={{ position: 'absolute', top: 10, right: 10, padding: '5px 10px', cursor: 'pointer', zIndex: 1001 }}>Exit</button>
          </div>
      </div>
  );
}

const SneakAttackGame: React.FC<{ onComplete: (score: number) => void, onExit: () => void }> = ({ onComplete, onExit }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  
  useEffect(() => {
    if (gameRef.current) return;
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-sneak-container',
      physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
      },
      scene: [SneakAttackScene]
    };
    
    const game = new Phaser.Game(config);
    gameRef.current = game;
    
    game.events.on('sneakAttackComplete', (score: number) => { // This event is not emitted in scene yet, but should be
        onComplete(score);
    });
    
    return () => {
        game.destroy(true);
        gameRef.current = null;
    }
  }, [onComplete]);

  return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '800px', height: '600px', backgroundColor: '#000' }}>
            <div id="phaser-sneak-container" />
            <button onClick={onExit} style={{ position: 'absolute', top: 10, right: 10, padding: '5px 10px', cursor: 'pointer', zIndex: 1001 }}>Exit</button>
          </div>
      </div>
  );
}

const DemolitionGame: React.FC<{ onComplete: (score: number) => void, onExit: () => void }> = ({ onComplete, onExit }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  
  useEffect(() => {
    if (gameRef.current) return;
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-demolition-container',
      physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
      },
      scene: [DemolitionScene]
    };
    
    const game = new Phaser.Game(config);
    gameRef.current = game;
    
    game.events.on('demolitionComplete', (score: number) => {
        onComplete(score);
    });
    
    return () => {
        game.destroy(true);
        gameRef.current = null;
    }
  }, [onComplete]);

  return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '800px', height: '600px', backgroundColor: '#000' }}>
            <div id="phaser-demolition-container" />
            <button onClick={onExit} style={{ position: 'absolute', top: 10, right: 10, padding: '5px 10px', cursor: 'pointer', zIndex: 1001 }}>Exit</button>
          </div>
      </div>
  );
}

const SiegeView: React.FC<SiegeViewProps> = ({ onExit }) => {
  const [phase, setPhase] = useState<SiegePhase>(SiegePhase.None);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [debugHour, setDebugHour] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [showSneakAttack, setShowSneakAttack] = useState<boolean>(false);
  const [showDemolition, setShowDemolition] = useState<boolean>(false);
  const [showBattle, setShowBattle] = useState<boolean>(false);

  useEffect(() => {
    // Initial update
    updateState();

    const interval = setInterval(() => {
      updateState();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateState = () => {
    setPhase(siegeManager.getCurrentPhase());
    setCurrentTime(siegeManager.getCurrentTime());
  };

  const handleSetDebugTime = () => {
    const hour = parseInt(debugHour);
    if (!isNaN(hour) && hour >= 0 && hour <= 23) {
      siegeManager.setDebugTime(hour);
      updateState();
      setMessage(`Debug time set to ${hour}:30`);
    } else {
      setMessage('Invalid hour (0-23)');
    }
  };

  const handleClearDebugTime = () => {
    siegeManager.clearDebugTime();
    setDebugHour('');
    updateState();
    setMessage('Debug time cleared');
  };

  const handleDeclareWar = () => {
    if (phase === SiegePhase.Declaration) {
      setMessage('War Declared! Prepare your troops.');
    }
  };

  const handleAttack = () => {
    if (phase === SiegePhase.Attack) {
      setShowBattle(true);
      setMessage('Attack Launched! Glory to the alliance!');
    }
  };

  return (
    <div style={{ padding: '20px', color: '#ecf0f1', backgroundColor: '#2c3e50', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Siege Warfare</h2>
        <button onClick={onExit} style={{ padding: '8px 16px', cursor: 'pointer' }}>Back to City</button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#34495e', borderRadius: '8px' }}>
        <h3>Debug Time Controls</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
          <input 
            type="number" 
            placeholder="Hour (0-23)"
            value={debugHour} 
            onChange={(e) => setDebugHour(e.target.value)}
            style={{ padding: '5px', width: '100px' }}
          />
          <button onClick={handleSetDebugTime} style={{ padding: '5px 10px' }}>Set Time</button>
          <button onClick={handleClearDebugTime} style={{ padding: '5px 10px' }}>Reset to Real Time</button>
        </div>
        <div>
          <p><strong>Current System Time:</strong> {currentTime.toLocaleTimeString()}</p>
          <p><strong>Current Phase:</strong> <span style={{ color: phase !== SiegePhase.None ? '#e74c3c' : '#95a5a6' }}>{phase}</span></p>
        </div>
        {message && <div style={{ marginTop: '10px', color: '#f1c40f' }}>{message}</div>}
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Declaration Phase */}
        <div style={{ 
          flex: 1, 
          minWidth: '300px',
          border: '2px solid #e67e22', 
          padding: '20px', 
          borderRadius: '8px', 
          backgroundColor: '#d35400',
          opacity: phase === SiegePhase.Declaration ? 1 : 0.4,
          transition: 'opacity 0.3s'
        }}>
          <h3>Declaration Phase</h3>
          <p>Time: 12:00 - 13:00</p>
          <p>Declare war on enemy cities to prepare for the evening attack.</p>
          <button 
            disabled={phase !== SiegePhase.Declaration}
            onClick={handleDeclareWar}
            style={{ 
              width: '100%',
              padding: '10px',
              backgroundColor: phase === SiegePhase.Declaration ? '#f39c12' : '#7f8c8d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: phase === SiegePhase.Declaration ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            Declare War
          </button>
        </div>

        {/* Attack Phase */}
        <div style={{ 
          flex: 1, 
          minWidth: '300px',
          border: '2px solid #c0392b', 
          padding: '20px', 
          borderRadius: '8px', 
          backgroundColor: '#c0392b',
          opacity: phase === SiegePhase.Attack ? 1 : 0.4,
          transition: 'opacity 0.3s'
        }}>
          <h3>Attack Phase</h3>
          <p>Time: 20:00 - 21:00</p>
          <p>Launch the siege attack on the declared cities.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
                disabled={phase !== SiegePhase.Attack}
                onClick={handleAttack}
                style={{ 
                flex: 1,
                padding: '10px',
                backgroundColor: phase === SiegePhase.Attack ? '#e74c3c' : '#7f8c8d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: phase === SiegePhase.Attack ? 'pointer' : 'not-allowed',
                fontWeight: 'bold'
                }}
            >
                Launch Attack
            </button>
            <button 
                disabled={phase !== SiegePhase.Attack}
                onClick={() => setShowSneakAttack(true)}
                style={{ 
                flex: 1,
                padding: '10px',
                backgroundColor: phase === SiegePhase.Attack ? '#8e44ad' : '#7f8c8d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: phase === SiegePhase.Attack ? 'pointer' : 'not-allowed',
                fontWeight: 'bold'
                }}
            >
                Sneak Attack (Mini-game)
            </button>
            <button 
                disabled={phase !== SiegePhase.Attack}
                onClick={() => setShowDemolition(true)}
                style={{ 
                flex: 1,
                padding: '10px',
                backgroundColor: phase === SiegePhase.Attack ? '#27ae60' : '#7f8c8d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: phase === SiegePhase.Attack ? 'pointer' : 'not-allowed',
                fontWeight: 'bold'
                }}
            >
                Demolition Squad (Mini-game)
            </button>
          </div>
        </div>
      </div>

      {showSneakAttack && (
        <SneakAttackGame 
            onExit={() => setShowSneakAttack(false)}
            onComplete={(score) => {
                setShowSneakAttack(false);
                setMessage(`Sneak Attack Complete! You dealt ${score} damage to the enemy defenses!`);
            }}
        />
      )}

      {showDemolition && (
        <DemolitionGame 
            onExit={() => setShowDemolition(false)}
            onComplete={(score) => {
                setShowDemolition(false);
                setMessage(`Demolition Complete! You dealt ${score} structural damage to the wall!`);
            }}
        />
      )}

      {showBattle && (
        <SiegeBattleGame 
            onExit={() => setShowBattle(false)}
        />
      )}
    </div>
  );
};

export default SiegeView;
