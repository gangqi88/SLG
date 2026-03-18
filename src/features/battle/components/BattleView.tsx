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
  const [auto, setAuto] = useState(true);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

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

    game.registry.set('battleSettings', { auto, speed });
    game.registry.set('battleCommands', []);

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
  }, [attackerHeroes, auto, battleMode, defenderHeroes, speed]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    game.registry.set('battleSettings', { auto, speed });
  }, [auto, speed]);

  useEffect(() => {
    const t = setInterval(() => {
      const game = gameRef.current;
      if (!game) return;
      const next = (game.registry.get('battleCooldowns') as Record<string, number> | undefined) ?? {};
      setCooldowns(next);
    }, 200);
    return () => clearInterval(t);
  }, []);

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
                    {attackerHeroes.map((h) => {
                      const cd = cooldowns[h.id] ?? 0;
                      const cdText = cd > 0 ? ` · 冷却 ${cd.toFixed(1)}s` : '';
                      const canCast = !auto && cd <= 0;
                      return (
                      <div
                        key={h.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0, 1fr) auto',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 10px',
                          borderRadius: 12,
                          border: '1px solid rgba(58,58,90,0.7)',
                          background: 'rgba(0,0,0,0.16)',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 900 }}>{h.name}</div>
                          <div style={{ color: 'var(--game-text-muted)', fontFamily: 'var(--game-font-mono)', fontSize: 12 }}>
                            {h.activeSkill.name}
                            {h.activeSkill.cooldown ? ` · CD ${h.activeSkill.cooldown}s` : ''}
                            {cdText}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={!canCast}
                          onClick={() => {
                            const game = gameRef.current;
                            if (!game) return;
                            const prev = (game.registry.get('battleCommands') as unknown) as
                              | { type: 'cast'; heroId: string; side: 'attacker' | 'defender' }[]
                              | undefined;
                            const next = (prev ?? []).concat([{ type: 'cast', heroId: h.id, side: 'attacker' }]);
                            game.registry.set('battleCommands', next);
                            modal.close();
                          }}
                          title={auto ? '关闭自动后可手动施放' : cd > 0 ? '冷却中' : '施放技能'}
                          style={{
                            height: 36,
                            borderRadius: 10,
                            border: '1px solid rgba(0,0,0,0.2)',
                            background: canCast ? 'var(--game-btn-info)' : 'rgba(255,255,255,0.06)',
                            color: 'var(--game-text)',
                            fontWeight: 900,
                            padding: '0 10px',
                            opacity: canCast ? 1 : 0.6,
                          }}
                        >
                          施放
                        </button>
                      </div>
                      );
                    })}
                    <div style={{ color: 'var(--game-text-muted)', fontSize: 12 }}>
                      关闭自动后可手动施放（当前仅影响逻辑层技能事件与伤害）。
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
