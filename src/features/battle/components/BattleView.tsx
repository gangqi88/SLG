import React, { useEffect, useMemo, useRef } from 'react';
import Phaser from 'phaser';
import { PreloadScene } from '@/shared/scenes/PreloadScene';
import { BattleScene } from '@/features/battle/scenes/BattleScene';
import { Hero } from '@/features/hero/types/Hero';
import { getBattleSceneAssetFeatures } from '@/shared/config/assets/sceneAssetFeatures';
import { BattleMode } from '@/features/battle/types/battleMode';
import { SceneHUD } from '@/shared/components/SceneHUD';
import { useModal } from '@/shared/components/ModalProvider';
import { BattleReportView, createMockBattleReport } from '@/shared/logic/battleReports';
import { applyRewards, formatRewardLines, type Reward } from '@/shared/logic/rewards';
import { hasClaimed, markClaimed, newClaimKey } from '@/shared/logic/claimLedger';

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
  const modal = useModal();
  const claimKeyRef = useRef<string>(newClaimKey('battle'));

  const report = useMemo(
    () =>
      createMockBattleReport({
        title: battleMode,
        attacker: `我方(${attackerHeroes.length})`,
        defender: `敌方(${defenderHeroes.length})`,
      }),
    [attackerHeroes.length, battleMode, defenderHeroes.length],
  );

  const rewards = useMemo<Reward[]>(() => {
    const rewardCoin = 300 + Math.floor(Math.random() * 400);
    const rewardExp = 80 + Math.floor(Math.random() * 120);
    const rewardFrag = Math.random() > 0.7 ? 3 : 0;
    return [
      { type: 'resource', id: 'coin', amount: rewardCoin },
      { type: 'item', id: 'item_hero_exp', amount: rewardExp },
      ...(rewardFrag > 0 ? ([{ type: 'fragment', id: 'item_hero_fragment', amount: rewardFrag }] as const) : []),
    ];
  }, []);

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
      <SceneHUD
        title="战斗"
        left={[
          { label: '我方', value: String(attackerHeroes.length) },
          { label: '战力', value: String(attackerHeroes.length * 1000) },
        ]}
        right={[
          { label: '敌方', value: String(defenderHeroes.length) },
          { label: '战力', value: String(defenderHeroes.length * 1000) },
        ]}
        actions={[
          {
            key: 'auto',
            label: '自动',
            onClick: () => modal.openAlert({ title: '自动战斗', message: '自动战斗开关待接入。' }),
          },
          {
            key: 'speed',
            label: '加速',
            onClick: () => modal.openAlert({ title: '战斗加速', message: '加速功能待接入。' }),
          },
          {
            key: 'skills',
            label: '技能',
            variant: 'primary',
            onClick: () => modal.openAlert({ title: '技能', message: '技能按钮与冷却待接入。' }),
          },
          {
            key: 'result',
            label: '结算',
            onClick: () => {
              if (hasClaimed(claimKeyRef.current)) {
                modal.openAlert({ title: '战报', message: '奖励已领取。' });
                return;
              }

              const lines = formatRewardLines(rewards);
              modal.openModal({
                title: '战报',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <BattleReportView report={report} />
                    <div>
                      <div style={{ color: 'var(--game-title)', fontWeight: 900, marginBottom: 8 }}>
                        奖励
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {lines.map((l, idx) => (
                          <div key={`${l.label}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{l.label}</span>
                            <span style={{ fontFamily: 'var(--game-font-mono)', color: 'var(--game-title)' }}>
                              +{l.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ),
                actions: [
                  { key: 'close', label: '关闭', variant: 'secondary', onClick: () => modal.close() },
                  {
                    key: 'claim',
                    label: '领取奖励',
                    variant: 'primary',
                    onClick: () => {
                      applyRewards(rewards);
                      markClaimed(claimKeyRef.current);
                      modal.close();
                      modal.openAlert({ title: '获得奖励', message: '奖励已发放。' });
                    },
                  },
                ],
              });
            },
          },
        ]}
        onExit={onExit}
      />
    </div>
  );
};

export default BattleView;
