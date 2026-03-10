import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { TowerDefenseScene } from '../game/scenes/TowerDefenseScene';

interface TowerDefenseViewProps {
  onExit: () => void;
}

const TowerDefenseView: React.FC<TowerDefenseViewProps> = ({ onExit }) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-td-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false
        }
      },
      scene: [TowerDefenseScene]
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '800px', height: '600px', margin: '0 auto' }}>
      <div id="phaser-td-container" />
      <div style={{ position: 'absolute', top: 10, left: 10, color: '#fff', pointerEvents: 'none' }}>
        <p>Arrows to Move, Space to Shoot</p>
        <p>Protect Qiao Sisters in the center!</p>
      </div>
      <button 
        onClick={onExit} 
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 100 }}
      >
        Exit Game
      </button>
    </div>
  );
};

export default TowerDefenseView;
