import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PreloadScene } from '@/shared/scenes/PreloadScene';
import { CityScene } from '@/features/city/scenes/CityScene';
import { BattleScene } from '@/features/battle/scenes/BattleScene';

interface CityViewProps {
  onExit: () => void;
}

const CityView: React.FC<CityViewProps> = ({ onExit }) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-city-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false,
        },
      },
      scene: [PreloadScene, CityScene, BattleScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Set initial data to tell PreloadScene to go to CityScene
    game.registry.set('startData', { targetScene: 'CityScene' });

    // Listen for exit event from scene
    game.events.on('exitCity', () => {
      onExit();
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [onExit]);

  return (
    <div style={{ position: 'relative', width: '800px', height: '600px', margin: '0 auto' }}>
      <div id="phaser-city-container" />
    </div>
  );
};

export default CityView;
