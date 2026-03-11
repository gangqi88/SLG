import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PreloadScene } from '@/shared/scenes/PreloadScene';
import { GatheringScene } from '@/features/resource/scenes/GatheringScene';

interface GatheringViewProps {
  onExit: () => void;
}

const GatheringView: React.FC<GatheringViewProps> = ({ onExit }) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-gathering-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 500, x: 0 },
          debug: false,
        },
      },
      scene: [PreloadScene, GatheringScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Tell PreloadScene to start GatheringScene
    game.registry.set('startData', { targetScene: 'GatheringScene' });

    // Listen for exit event from scene
    game.events.on('exitGathering', () => {
      onExit();
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [onExit]);

  return (
    <div style={{ position: 'relative', width: '800px', height: '600px', margin: '0 auto' }}>
      <div id="phaser-gathering-container" />
    </div>
  );
};

export default GatheringView;
