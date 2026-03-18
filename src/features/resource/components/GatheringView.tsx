import React, { useEffect, useMemo, useRef, useState } from 'react';
import Phaser from 'phaser';
import { PreloadScene } from '@/shared/scenes/PreloadScene';
import { GatheringScene } from '@/features/resource/scenes/GatheringScene';
import { getSceneAssetFeatures } from '@/shared/config/assets/sceneAssetFeatures';
import { SceneHUD } from '@/shared/components/SceneHUD';
import { useModal } from '@/shared/components/ModalProvider';
import { formatRemaining } from '@/shared/logic/time';
import { applyRewards, type Reward } from '@/shared/logic/rewards';

interface GatheringViewProps {
  onExit: () => void;
}

const GatheringView: React.FC<GatheringViewProps> = ({ onExit }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const modal = useModal();
  const startRef = useRef<number>(Date.now());
  const [tick, setTick] = useState(0);
  const [progress, setProgress] = useState(0);

  const sessionLabel = useMemo(() => {
    const elapsed = Date.now() - startRef.current;
    return formatRemaining(elapsed);
  }, [tick]);

  useEffect(() => {
    const key = 'slg_gathering_last_exit_v1';
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (raw) {
      const last = Number(raw);
      if (!Number.isNaN(last) && last > 0) {
        const offlineMs = Date.now() - last;
        const minutes = Math.min(240, Math.floor(offlineMs / 60000));
        const wood = minutes * 20;
        const ore = minutes * 12;
        if (minutes > 0) {
          const rewards: Reward[] = [
            { type: 'resource', id: 'wood', amount: wood },
            { type: 'resource', id: 'ore', amount: ore },
          ];
          applyRewards(rewards);
          modal.openModal({
            title: '离线收益',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ color: 'var(--game-text-muted)' }}>离线时长：{minutes} 分钟</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>木材</span>
                  <span style={{ fontFamily: 'var(--game-font-mono)', color: 'var(--game-title)' }}>
                    +{wood}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>矿石</span>
                  <span style={{ fontFamily: 'var(--game-font-mono)', color: 'var(--game-title)' }}>
                    +{ore}
                  </span>
                </div>
              </div>
            ),
          });
        }
      }
      localStorage.removeItem(key);
    }
  }, [modal]);

  useEffect(() => {
    const t = setInterval(() => {
      setTick((v) => v + 1);
      setProgress((p) => {
        const next = p + 3;
        return next >= 100 ? 0 : next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('slg_gathering_last_exit_v1', String(Date.now()));
      }
      game.destroy(true);
      gameRef.current = null;
    };
  }, [onExit]);

  return (
    <div style={{ position: 'relative', width: '800px', height: '600px', margin: '0 auto' }}>
      <div id="phaser-gathering-container" />
      <SceneHUD
        title="资源采集"
        left={[
          { label: '队伍', value: '≤5' },
          { label: '时长', value: sessionLabel },
        ]}
        right={[{ label: '进度', value: `${progress}%` }]}
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
            onClick: () =>
              modal.openModal({
                title: '离线收益',
                content: (
                  <div style={{ color: 'var(--game-text-muted)' }}>
                    离线收益会在下次进入采集时自动结算。
                  </div>
                ),
              }),
          },
        ]}
        onExit={onExit}
      />
    </div>
  );
};

export default GatheringView;
