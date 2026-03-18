import React, { useMemo, useState, useEffect, useRef, useSyncExternalStore } from 'react';
import Phaser from 'phaser';
import { SiegeManager, SiegePhase } from '@/features/battle/logic/SiegeManager';
import { SneakAttackScene } from '@/features/battle/scenes/SneakAttackScene';
import { DemolitionScene } from '@/features/battle/scenes/DemolitionScene';
import { SiegeBattleScene } from '@/features/battle/scenes/SiegeBattleScene';
import { Team, getTeamHeroes } from '@/shared/logic/Team';
import { SceneHUD } from '@/shared/components/SceneHUD';
import { useModal } from '@/shared/components/ModalProvider';
import { BattleReportView, createBattleReportFromResult, type BattleReport } from '@/shared/logic/battleReports';
import { applyRewards, formatRewardLines, type Reward } from '@/shared/logic/rewards';
import { hasClaimed, markClaimed, newClaimKey } from '@/shared/logic/claimLedger';
import { computeTeamPower } from '@/shared/logic/teamMetrics';
import { WALL_HERO } from '@/features/hero/data/siegeHeroes';
import type { BattleResult } from '@/shared/logic/battleResult';
import { BattleHistory } from '@/shared/logic/battleHistory';
import { useSearchParams } from 'react-router-dom';
import { WorldMap } from '@/features/alliance/logic/WorldMap';
import { useAlliance } from '@/features/alliance/hooks/useAlliance';
import AllianceManager from '@/features/alliance/logic/AllianceManager';
import { createSiegeDefenderProfile } from '@/features/battle/logic/siegeDefenders';

interface SiegeViewProps {
  onExit: () => void;
}

const siegeManager = new SiegeManager();

const SiegeBattleGame: React.FC<{
  onExit: () => void;
  targetCityId?: string | null;
  targetCityName?: string | null;
  attackerAlliance?: { id: string; name: string } | null;
  activeWar?: { defenderId: string; status: string; targetCityId?: string };
}> = ({ onExit, targetCityId, targetCityName, attackerAlliance, activeWar }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const modal = useModal();
  const battleIdRef = useRef<string>(newClaimKey('siege'));
  const claimKeyRef = useRef<string>('');
  const [auto, setAuto] = useState(true);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const city = useMemo(() => (targetCityId ? WorldMap.getCityById(targetCityId) : null), [targetCityId]);
  const defenderProfile = useMemo(() => (city ? createSiegeDefenderProfile(city) : null), [city]);
  const attackerAllianceRef = useRef(attackerAlliance);
  const activeWarRef = useRef(activeWar);
  const targetCityIdRef = useRef(targetCityId);

  useEffect(() => {
    attackerAllianceRef.current = attackerAlliance;
    activeWarRef.current = activeWar;
    targetCityIdRef.current = targetCityId;
  }, [activeWar, attackerAlliance, targetCityId]);
  const team = useSyncExternalStore(
    (listener) => Team.subscribe(listener),
    () => Team.getSnapshot(),
  );
  const attackerTeam = useMemo(() => getTeamHeroes(team.heroIds).slice(0, 5), [team.heroIds]);

  const attackerPower = useMemo(() => computeTeamPower(attackerTeam), [attackerTeam]);
  const defenderPower = useMemo(() => {
    if (defenderProfile) return computeTeamPower([defenderProfile.wall, ...defenderProfile.defenders]);
    return computeTeamPower([WALL_HERO]);
  }, [defenderProfile]);

  const report = useMemo<BattleReport>(() => {
    if (!battleResult) return { title: '攻城战', entries: [{ label: '状态', value: '战斗进行中', tone: 'normal' }] };
    return createBattleReportFromResult(battleResult);
  }, [battleResult]);

  const rewards = useMemo<Reward[]>(() => {
    const win = battleResult?.winner === 'attacker';
    const coin = Math.max(120, Math.floor((win ? 1 : 0.7) * (600 + attackerPower / 40)));
    const exp = Math.max(30, Math.floor((win ? 1 : 0.8) * (120 + attackerPower / 220)));
    const wood = Math.max(0, Math.floor((win ? 1 : 0.5) * (200 + attackerPower / 120)));
    return [
      { type: 'resource', id: 'coin', amount: coin },
      { type: 'item', id: 'item_hero_exp', amount: exp },
      { type: 'resource', id: 'wood', amount: wood },
    ];
  }, [attackerPower, battleResult?.winner]);

  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-battle-container',
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      scene: [SiegeBattleScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;
    game.registry.set('battleSettings', { auto, speed });
    game.registry.set('battleCommands', []);
    game.registry.set('battleCooldowns', {});
    setBattleResult(null);
    claimKeyRef.current = `siege:${battleIdRef.current}`;

    // Restart scene with data to ensure init receives it
    // Use a slight timeout to ensure scene manager is ready if needed,
    // but usually start() queues it correctly.
    // However, since it's in the 'scene' array, it auto-starts.
    // We can just stop and restart.
    setTimeout(() => {
      if (game.scene.getScene('SiegeBattleScene')) {
        game.scene.start('SiegeBattleScene', {
          attackerHeroes: attackerTeam,
          battleId: battleIdRef.current,
          defenderProfile: defenderProfile ?? undefined,
        });
      }
    }, 100);

    const onBattleEnd = (result: BattleResult) => {
      setBattleResult(result);
      BattleHistory.add(result);
      const cityId = targetCityIdRef.current;
      const aa = attackerAllianceRef.current;
      const war = activeWarRef.current;
      if (cityId) {
        WorldMap.applySiegeOutcome({
          cityId,
          winner: result.winner,
          attackerDamage: result.stats.attacker.damage,
          attackerAllianceId: aa?.id ?? null,
          attackerAllianceName: aa?.name ?? null,
        });
        if (war && war.targetCityId === cityId && war.status !== 'finished') {
          const winnerId =
            result.winner === 'attacker'
              ? aa?.id ?? null
              : result.winner === 'defender'
                ? war.defenderId
                : null;
          AllianceManager.getInstance().finishWarBySiege({ targetCityId: cityId, winnerId });
        }
      }
    };
    game.events.on('battleEnd', onBattleEnd);

    return () => {
      game.events.off('battleEnd', onBattleEnd);
      game.destroy(true);
      gameRef.current = null;
    };
  }, [attackerTeam, defenderProfile]);

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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{ position: 'relative', width: '800px', height: '600px', backgroundColor: '#000' }}
      >
        <div id="phaser-battle-container" />
        <SceneHUD
          title="攻城战"
          left={[
            { label: '队伍', value: `${attackerTeam.length}/${team.maxSize}` },
            { label: '战力', value: String(attackerPower) },
          ]}
          right={[
            { label: '目标', value: defenderProfile?.cityName || targetCityName || '城墙' },
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
                      {attackerTeam.map((h) => {
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
              key: 'report',
              label: '战报',
              onClick: () =>
                modal.openModal({
                  title: '战报',
                  content: <BattleReportView report={report} />,
                  actions: [{ key: 'close', label: '关闭', variant: 'primary', onClick: () => modal.close() }],
                }),
            },
            {
              key: 'result',
              label: '结算',
              variant: 'primary',
              onClick: () => {
                if (!battleResult) {
                  modal.openAlert({ title: '结算', message: '战斗尚未结束。' });
                  return;
                }
                if (hasClaimed(claimKeyRef.current)) {
                  modal.openAlert({ title: '结算', message: '奖励已领取。' });
                  return;
                }
                const lines = formatRewardLines(rewards);
                modal.openModal({
                  title: '攻城结算',
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
    </div>
  );
};

const SneakAttackGame: React.FC<{ onComplete: (score: number) => void; onExit: () => void }> = ({
  onComplete,
  onExit,
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-sneak-container',
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
      scene: [SneakAttackScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on('sneakAttackComplete', (score: number) => {
      // This event is not emitted in scene yet, but should be
      onComplete(score);
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{ position: 'relative', width: '800px', height: '600px', backgroundColor: '#000' }}
      >
        <div id="phaser-sneak-container" />
        <button
          onClick={onExit}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            padding: '5px 10px',
            cursor: 'pointer',
            zIndex: 1001,
          }}
        >
          Exit
        </button>
      </div>
    </div>
  );
};

const DemolitionGame: React.FC<{ onComplete: (score: number) => void; onExit: () => void }> = ({
  onComplete,
  onExit,
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-demolition-container',
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
      scene: [DemolitionScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on('demolitionComplete', (score: number) => {
      onComplete(score);
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{ position: 'relative', width: '800px', height: '600px', backgroundColor: '#000' }}
      >
        <div id="phaser-demolition-container" />
        <button
          onClick={onExit}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            padding: '5px 10px',
            cursor: 'pointer',
            zIndex: 1001,
          }}
        >
          Exit
        </button>
      </div>
    </div>
  );
};

const SiegeView: React.FC<SiegeViewProps> = ({ onExit }) => {
  const [searchParams] = useSearchParams();
  const targetCityId = searchParams.get('cityId');
  const targetCity = useMemo(() => (targetCityId ? WorldMap.getCityById(targetCityId) : null), [targetCityId]);
  const { alliance, activeWar } = useAlliance();
  const [phase, setPhase] = useState<SiegePhase>(SiegePhase.None);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [debugHour, setDebugHour] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [showSneakAttack, setShowSneakAttack] = useState<boolean>(false);
  const [showDemolition, setShowDemolition] = useState<boolean>(false);
  const [showBattle, setShowBattle] = useState<boolean>(false);

  useEffect(() => {
    // Initial update
    updateState();

    const interval = setInterval(() => {
      updateState();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateState = () => {
    setPhase(siegeManager.getCurrentPhase());
    setCurrentTime(siegeManager.getCurrentTime());
  };

  const handleSetDebugTime = () => {
    const hour = parseInt(debugHour);
    if (!isNaN(hour) && hour >= 0 && hour <= 23) {
      siegeManager.setDebugTime(hour);
      updateState();
      setMessage(`Debug time set to ${hour}:30`);
    } else {
      setMessage('Invalid hour (0-23)');
    }
  };

  const handleClearDebugTime = () => {
    siegeManager.clearDebugTime();
    setDebugHour('');
    updateState();
    setMessage('Debug time cleared');
  };

  const handleDeclareWar = () => {
    if (phase === SiegePhase.Declaration) {
      setMessage('War Declared! Prepare your troops.');
    }
  };

  const handleAttack = () => {
    if (phase === SiegePhase.Attack) {
      if (
        targetCityId &&
        activeWar &&
        activeWar.targetCityId === targetCityId &&
        activeWar.status !== 'active'
      ) {
        setMessage('宣战倒计时未结束，无法开始攻城。');
        return;
      }
      setShowBattle(true);
      setMessage('Attack Launched! Glory to the alliance!');
    }
  };

  return (
    <div
      style={{ padding: '20px', color: '#ecf0f1', backgroundColor: '#2c3e50', minHeight: '100vh' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2>Siege Warfare</h2>
        {targetCity && (
          <div style={{ color: '#f1c40f', fontWeight: 700 }}>
            目标城池：{targetCity.name}（{targetCity.ownerAllianceName || '无主'}）
          </div>
        )}
        <button onClick={onExit} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Back to City
        </button>
      </div>

      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#34495e',
          borderRadius: '8px',
        }}
      >
        <h3>Debug Time Controls</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="number"
            placeholder="Hour (0-23)"
            value={debugHour}
            onChange={(e) => setDebugHour(e.target.value)}
            style={{ padding: '5px', width: '100px' }}
          />
          <button onClick={handleSetDebugTime} style={{ padding: '5px 10px' }}>
            Set Time
          </button>
          <button onClick={handleClearDebugTime} style={{ padding: '5px 10px' }}>
            Reset to Real Time
          </button>
        </div>
        <div>
          <p>
            <strong>Current System Time:</strong> {currentTime.toLocaleTimeString()}
          </p>
          <p>
            <strong>Current Phase:</strong>{' '}
            <span style={{ color: phase !== SiegePhase.None ? '#e74c3c' : '#95a5a6' }}>
              {phase}
            </span>
          </p>
        </div>
        {message && <div style={{ marginTop: '10px', color: '#f1c40f' }}>{message}</div>}
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Declaration Phase */}
        <div
          style={{
            flex: 1,
            minWidth: '300px',
            border: '2px solid #e67e22',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#d35400',
            opacity: phase === SiegePhase.Declaration ? 1 : 0.4,
            transition: 'opacity 0.3s',
          }}
        >
          <h3>Declaration Phase</h3>
          <p>Time: 12:00 - 13:00</p>
          <p>Declare war on enemy cities to prepare for the evening attack.</p>
          <button
            disabled={phase !== SiegePhase.Declaration}
            onClick={handleDeclareWar}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: phase === SiegePhase.Declaration ? '#f39c12' : '#7f8c8d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: phase === SiegePhase.Declaration ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
            }}
          >
            Declare War
          </button>
        </div>

        {/* Attack Phase */}
        <div
          style={{
            flex: 1,
            minWidth: '300px',
            border: '2px solid #c0392b',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#c0392b',
            opacity: phase === SiegePhase.Attack ? 1 : 0.4,
            transition: 'opacity 0.3s',
          }}
        >
          <h3>Attack Phase</h3>
          <p>Time: 20:00 - 21:00</p>
          <p>Launch the siege attack on the declared cities.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              disabled={phase !== SiegePhase.Attack}
              onClick={handleAttack}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: phase === SiegePhase.Attack ? '#e74c3c' : '#7f8c8d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: phase === SiegePhase.Attack ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
              }}
            >
              Launch Attack
            </button>
            <button
              disabled={phase !== SiegePhase.Attack}
              onClick={() => setShowSneakAttack(true)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: phase === SiegePhase.Attack ? '#8e44ad' : '#7f8c8d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: phase === SiegePhase.Attack ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
              }}
            >
              Sneak Attack (Mini-game)
            </button>
            <button
              disabled={phase !== SiegePhase.Attack}
              onClick={() => setShowDemolition(true)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: phase === SiegePhase.Attack ? '#27ae60' : '#7f8c8d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: phase === SiegePhase.Attack ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
              }}
            >
              Demolition Squad (Mini-game)
            </button>
          </div>
        </div>
      </div>

      {showSneakAttack && (
        <SneakAttackGame
          onExit={() => setShowSneakAttack(false)}
          onComplete={(score) => {
            setShowSneakAttack(false);
            setMessage(`Sneak Attack Complete! You dealt ${score} damage to the enemy defenses!`);
          }}
        />
      )}

      {showDemolition && (
        <DemolitionGame
          onExit={() => setShowDemolition(false)}
          onComplete={(score) => {
            setShowDemolition(false);
            setMessage(`Demolition Complete! You dealt ${score} structural damage to the wall!`);
          }}
        />
      )}

      {showBattle && (
        <SiegeBattleGame
          onExit={() => setShowBattle(false)}
          targetCityId={targetCityId}
          targetCityName={targetCity?.name ?? null}
          attackerAlliance={alliance ? { id: alliance.id, name: alliance.name } : null}
          activeWar={activeWar ? { defenderId: activeWar.defenderId, status: activeWar.status, targetCityId: activeWar.targetCityId } : undefined}
        />
      )}
    </div>
  );
};

export default SiegeView;
