import React, { useEffect, useMemo, useRef, useState } from 'react';
import Phaser from 'phaser';
import { PreloadScene } from '@/shared/scenes/PreloadScene';
import { BattleScene } from '@/features/battle/scenes/BattleScene';
import { Hero } from '@/features/hero/types/Hero';
import { getBattleSceneAssetFeatures } from '@/shared/config/assets/sceneAssetFeatures';
import { BattleMode } from '@/features/battle/types/battleMode';
import { SceneHUD } from '@/shared/components/SceneHUD';
import { useModal } from '@/shared/components/ModalProvider';
import { BattleReportView, type BattleReport } from '@/shared/logic/battleReports';
import { applyRewards, formatRewardLines, type Reward } from '@/shared/logic/rewards';
import { hasClaimed, markClaimed, newClaimKey } from '@/shared/logic/claimLedger';
import { computeTeamPower } from '@/shared/logic/teamMetrics';
import { simulateBattle } from '@/shared/logic/battleSim';

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
  const [auto, setAuto] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);

  const sim = useMemo(() => simulateBattle(attackerHeroes, defenderHeroes), [attackerHeroes, defenderHeroes]);
  const attackerPower = useMemo(() => computeTeamPower(attackerHeroes), [attackerHeroes]);
  const defenderPower = useMemo(() => computeTeamPower(defenderHeroes), [defenderHeroes]);

  const report = useMemo<BattleReport>(() => {
    const win = sim.winner === 'attacker';
    return {
      title: battleMode,
      entries: [
        { label: '我方', value: `我方(${attackerHeroes.length})` },
        { label: '敌方', value: `敌方(${defenderHeroes.length})` },
        { label: '结果', value: win ? '胜利' : sim.winner === 'defender' ? '失败' : '平局', tone: win ? 'good' : sim.winner === 'defender' ? 'bad' : 'normal' },
        { label: '耗时', value: `${sim.durationSec}s` },
        { label: '我方伤害', value: `${sim.damage.attacker}`, tone: 'good' },
        { label: '敌方伤害', value: `${sim.damage.defender}`, tone: 'bad' },
      ],
    };
  }, [attackerHeroes.length, battleMode, defenderHeroes.length, sim.damage.attacker, sim.damage.defender, sim.durationSec, sim.winner]);

  const rewards = useMemo<Reward[]>(() => {
    const win = sim.winner === 'attacker';
    const coin = Math.max(50, Math.floor((win ? 1 : 0.6) * (250 + attackerPower / 60)));
    const exp = Math.max(10, Math.floor((win ? 1 : 0.7) * (60 + attackerPower / 500)));
    const frag = win ? 2 : 1;
    return [
      { type: 'resource', id: 'coin', amount: coin },
      { type: 'item', id: 'item_hero_exp', amount: exp },
      { type: 'fragment', id: 'item_hero_fragment', amount: frag },
    ];
  }, [attackerPower, sim.winner]);

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
          { label: '战力', value: String(attackerPower) },
        ]}
        right={[
          { label: '敌方', value: String(defenderHeroes.length) },
          { label: '战力', value: String(defenderPower) },
        ]}
        actions={[
          {
            key: 'auto',
            label: auto ? '自动:开' : '自动:关',
            onClick: () => setAuto((v) => !v),
          },
          {
            key: 'speed',
            label: speed === 1 ? '加速:1x' : '加速:2x',
            onClick: () => setSpeed((v) => (v === 1 ? 2 : 1)),
          },
          {
            key: 'skills',
            label: '技能',
            variant: 'primary',
            onClick: () =>
              modal.openModal({
                title: '技能',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {attackerHeroes.map((h) => (
                      <div
                        key={h.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: 12,
                          border: '1px solid rgba(58,58,90,0.7)',
                          background: 'rgba(0,0,0,0.16)',
                        }}
                      >
                        <span>{h.name}</span>
                        <span style={{ color: 'var(--game-text-muted)', fontFamily: 'var(--game-font-mono)' }}>
                          {h.activeSkill.name}
                          {h.activeSkill.cooldown ? ` · CD ${h.activeSkill.cooldown}s` : ''}
                        </span>
                      </div>
                    ))}
                    <div style={{ color: 'var(--game-text-muted)', fontSize: 12 }}>
                      自动/加速/冷却与施放逻辑待与 Phaser 场景联动。
                    </div>
                  </div>
                ),
                actions: [{ key: 'close', label: '关闭', variant: 'primary', onClick: () => modal.close() }],
              }),
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
