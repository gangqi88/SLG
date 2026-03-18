import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PreloadScene } from '@/shared/scenes/PreloadScene';
import { CityScene } from '@/features/city/scenes/CityScene';
import { getSceneAssetFeatures } from '@/shared/config/assets/sceneAssetFeatures';
import { useModal } from '@/shared/components/ModalProvider';
import { useNavigate } from 'react-router-dom';
import { openResourceWays } from '@/shared/logic/openResourceWays';
import type { ModalAction } from '@/shared/components/ModalProvider';

interface CityViewProps {
  onExit: () => void;
}

const CityView: React.FC<CityViewProps> = ({ onExit }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const modal = useModal();
  const navigate = useNavigate();

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
      scene: [PreloadScene, CityScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.registry.set('startData', {
      targetScene: 'CityScene',
      assetFeatures: getSceneAssetFeatures('CityScene'),
    });

    game.events.on('exitCity', () => {
      onExit();
    });

    const onToast = (payload: { title: string; message: string }) => {
      modal.openAlert({ title: payload.title, message: payload.message });
    };

    const onResourceLack = (payload: { resourceKey: 'wood' | 'ore' | 'coin' | 'bun' }) => {
      openResourceWays({ modal, navigate, resourceKey: payload.resourceKey, title: '资源不足' });
    };

    const onUpgradeRequest = (payload: {
      buildingId: string;
      buildingType: string;
      nextLevel: number;
      costWood: number;
      costStone: number;
      haveWood: number;
      haveStone: number;
    }) => {
      const needWood = payload.haveWood < payload.costWood;
      const needStone = payload.haveStone < payload.costStone;
      const actions: ModalAction[] = [
        { key: 'cancel', label: '取消', variant: 'secondary', onClick: () => modal.close() },
      ];

      if (needWood) {
        actions.unshift({
          key: 'wood',
          label: '获取木材',
          variant: 'primary',
          onClick: () => {
            modal.close();
            openResourceWays({ modal, navigate, resourceKey: 'wood', title: '木材不足' });
          },
        });
      }
      if (needStone) {
        actions.unshift({
          key: 'ore',
          label: '获取矿石',
          variant: 'primary',
          onClick: () => {
            modal.close();
            openResourceWays({ modal, navigate, resourceKey: 'ore', title: '矿石不足' });
          },
        });
      }
      if (!needWood && !needStone) {
        actions.push({
          key: 'upgrade',
          label: '升级',
          variant: 'primary',
          onClick: () => {
            modal.close();
            game.events.emit('cityUpgradeConfirm', { buildingId: payload.buildingId, cost: payload.costWood });
          },
        });
      }

      modal.openModal({
        title: '建筑升级',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ color: 'var(--game-title)', fontWeight: 900 }}>
              {payload.buildingType} → Lv.{payload.nextLevel}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>木材</span>
                <span style={{ fontFamily: 'var(--game-font-mono)', color: needWood ? 'var(--game-btn-battle)' : 'var(--game-title)' }}>
                  {payload.haveWood}/{payload.costWood}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>矿石</span>
                <span style={{ fontFamily: 'var(--game-font-mono)', color: needStone ? 'var(--game-btn-battle)' : 'var(--game-title)' }}>
                  {payload.haveStone}/{payload.costStone}
                </span>
              </div>
            </div>
            {(needWood || needStone) && (
              <div style={{ color: 'var(--game-text-muted)', fontSize: 12 }}>
                资源不足，点击下方按钮查看获取途径。
              </div>
            )}
          </div>
        ),
        actions,
      });
    };

    game.events.on('toast', onToast);
    game.events.on('resourceLack', onResourceLack);
    game.events.on('cityUpgradeRequest', onUpgradeRequest);

    return () => {
      game.events.off('toast', onToast);
      game.events.off('resourceLack', onResourceLack);
      game.events.off('cityUpgradeRequest', onUpgradeRequest);
      game.destroy(true);
      gameRef.current = null;
    };
  }, [modal, navigate, onExit]);

  return (
    <div style={{ position: 'relative', width: '800px', height: '600px', margin: '0 auto' }}>
      <div id="phaser-city-container" />
    </div>
  );
};

export default CityView;
