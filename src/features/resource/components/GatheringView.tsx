import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PreloadScene } from '@/shared/scenes/PreloadScene';
import { GatheringScene } from '@/features/resource/scenes/GatheringScene';
import { getSceneAssetFeatures } from '@/shared/config/assets/sceneAssetFeatures';
import { SceneHUD } from '@/shared/components/SceneHUD';
import { useModal } from '@/shared/components/ModalProvider';

interface GatheringViewProps {
  onExit: () => void;
}

const GatheringView: React.FC<GatheringViewProps> = ({ onExit }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const modal = useModal();

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
      <SceneHUD
        title="资源采集"
        left={[{ label: '队伍', value: '≤5' }]}
        right={[{ label: '进度', value: '—' }]}
        actions={[
          {
            key: 'team',
            label: '队伍',
            variant: 'primary',
            onClick: () => modal.openAlert({ title: '队伍配置', message: '队伍配置面板待接入。' }),
          },
          {
            key: 'offline',
            label: '离线收益',
            onClick: () => modal.openAlert({ title: '离线收益', message: '离线收益结算面板待接入。' }),
          },
        ]}
        onExit={onExit}
      />
    </div>
  );
};

export default GatheringView;
