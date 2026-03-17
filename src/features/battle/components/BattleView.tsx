import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PreloadScene } from '@/shared/scenes/PreloadScene';
import { BattleScene } from '@/features/battle/scenes/BattleScene';
import { Hero } from '@/features/hero/types/Hero';
import { getBattleSceneAssetFeatures } from '@/shared/config/assets/sceneAssetFeatures';
import { BattleMode } from '@/features/battle/types/battleMode';

interface BattleViewProps {
  attackerHeroes: Hero[];
  defenderHeroes: Hero[];
  battleMode: BattleMode;
  onExit: () => void;
}

const BattleView: React.FC<BattleViewProps> = ({
  attackerHeroes,
  defenderHeroes,
  battleMode,
  onExit,
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false,
        },
      },
      scene: [PreloadScene, BattleScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    const assetFeatures = getBattleSceneAssetFeatures(battleMode);
    const sceneData = { attackerHeroes, defenderHeroes, battleMode };
    game.registry.set('startData', { targetScene: 'BattleScene', sceneData, assetFeatures });

    game.events.once('ready', () => {
      const scene = game.scene.getScene('PreloadScene');
      if (scene) {
        scene.scene.restart({ targetScene: 'BattleScene', sceneData, assetFeatures });
      }
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [attackerHeroes, battleMode, defenderHeroes]);

  return (
    <div style={{ position: 'relative', width: '800px', height: '600px', margin: '0 auto' }}>
      <div id="phaser-container" />
      <button onClick={onExit} style={{ position: 'absolute', top: 10, right: 10, zIndex: 100 }}>
        Exit Battle
      </button>
    </div>
  );
};

export default BattleView;
