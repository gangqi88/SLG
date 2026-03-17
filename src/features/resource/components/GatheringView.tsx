import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PreloadScene } from '@/shared/scenes/PreloadScene';
import { GatheringScene } from '@/features/resource/scenes/GatheringScene';
import { getSceneAssetFeatures } from '@/shared/config/assets/sceneAssetFeatures';

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

    game.registry.set('startData', {
      targetScene: 'GatheringScene',
      assetFeatures: getSceneAssetFeatures('GatheringScene'),
    });

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
