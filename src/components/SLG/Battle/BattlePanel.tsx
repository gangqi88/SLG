import React, { useState } from 'react';
import { Hero, Team, FactionType } from '../../../types/slg/hero.types';
import { battleSystem, DamageResult, BattleContext } from '../../../systems/BattleSystem';
import { factionSystem } from '../../../systems/FactionSystem';
import './BattlePanel.css';

interface BattlePanelProps {
  teams: Team[];
  heroes: Hero[];
  onClose?: () => void;
  onBattleEnd?: (result: DamageResult) => void;
}

export const BattlePanel: React.FC<BattlePanelProps> = ({
  teams,
  heroes,
  onClose,
  onBattleEnd
}) => {
  const [attackerTeamId, setAttackerTeamId] = useState<string>('');
  const [defenderTeamId, setDefenderTeamId] = useState<string>('');
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [battleResult, setBattleResult] = useState<DamageResult | null>(null);
  const [isBattling, setIsBattling] = useState(false);
  const [battleProgress, setBattleProgress] = useState(0);

  const attackerTeam = teams.find(t => t.id === attackerTeamId);
  const defenderTeam = teams.find(t => t.id === defenderTeamId);

  const getHeroById = (heroId: string): Hero | undefined => {
    return heroes.find(h => h.id === heroId);
  };

  const getFactionName = (faction: FactionType): string => {
    switch (faction) {
      case 'human': return '人族';
      case 'angel': return '天使';
      case 'demon': return '恶魔';
      default: return '未知';
    }
  };

  const getQualityColor = (quality: string): string => {
    switch (quality) {
      case 'purple': return '#9b59b6';
      case 'orange': return '#e67e22';
      case 'red': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const calculateTeamPower = (team: Team): number => {
    return battleSystem.calculateTeamPower(team.members);
  };

  const getFactionAdvantage = (attacker: FactionType, defender: FactionType): number => {
    return factionSystem.getFactionAdvantage(attacker, defender);
  };

  const startBattle = async () => {
    if (!attackerTeam || !defenderTeam) return;

    setIsBattling(true);
    setBattleLog([]);
    setBattleResult(null);
    setBattleProgress(0);

    const log: string[] = [];
    log.push(`⚔️ 战斗开始！`);
    log.push(`${attackerTeam.name} vs ${defenderTeam.name}`);

    const attackerPower = calculateTeamPower(attackerTeam);
    const defenderPower = calculateTeamPower(defenderTeam);
    log.push(`💪 攻击力: ${attackerPower} vs ${defenderPower}`);

    const attackerFaction = attackerTeam.faction;
    const defenderFaction = defenderTeam.faction;
    const factionAdvantage = getFactionAdvantage(attackerFaction, defenderFaction);

    if (factionAdvantage > 1) {
      log.push(`✨ 阵营克制生效: ${getFactionName(attackerFaction)} 对 ${getFactionName(defenderFaction)} 造成 +${Math.round((factionAdvantage - 1) * 100)}% 伤害`);
    }

    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setBattleProgress((i + 1) * 20);
      
      const attackerMember = attackerTeam.members[i % attackerTeam.members.length];
      const defenderMember = defenderTeam.members[i % defenderTeam.members.length];
      
      const attackerHero = getHeroById(attackerMember.heroId);
      const defenderHero = getHeroById(defenderMember.heroId);

      if (!attackerHero || !defenderHero) continue;

      const context: BattleContext = {
        attackerFaction: attackerHero.faction,
        defenderFaction: defenderHero.faction,
        attackerAttributes: attackerHero.attributes,
        defenderAttributes: defenderHero.attributes,
        attackerLevel: attackerHero.level,
        defenderLevel: defenderHero.level,
        skillMultiplier: 1.2,
        isPhysical: true,
        attackerBuffs: attackerMember.buffs,
        attackerDebuffs: attackerMember.debuffs,
        defenderBuffs: defenderMember.buffs,
        defenderDebuffs: defenderMember.debuffs,
      };

      const damage = battleSystem.calculateDamage(context);
      
      if (damage.isDodged) {
        log.push(`🔄 ${attackerHero.name} 的攻击被 ${defenderHero.name} 闪避！`);
      } else {
        let attackLog = `⚔️ ${attackerHero.name} 攻击 ${defenderHero.name}`;
        if (damage.isCritical) {
          attackLog += ` [暴击!]`;
        }
        attackLog += ` 造成 ${damage.finalDamage} 伤害`;
        log.push(attackLog);
      }
    }

    const { winner, winProbability } = battleSystem.calculateBattleOutcome(
      attackerPower,
      defenderPower,
      attackerTeam.morale,
      defenderTeam.morale
    );

    log.push('');
    if (winner === 'attacker') {
      log.push(`🏆 战斗胜利！胜率: ${winProbability}%`);
    } else {
      log.push(`💀 战斗失败！胜率: ${winProbability}%`);
    }

    setBattleLog(log);
    setBattleProgress(100);
    setIsBattling(false);

    const finalResult: DamageResult = {
      baseDamage: attackerPower,
      finalDamage: winner === 'attacker' ? defenderPower : attackerPower,
      isCritical: false,
      isDodged: false,
      damageType: 'physical',
      breakdown: {
        attributeDamage: attackerPower,
        factionBonus: Math.round((factionAdvantage - 1) * 100),
        skillMultiplier: 1.2,
        criticalBonus: 0,
        buffDebuffBonus: 0,
        defenseReduction: 0,
      }
    };
    setBattleResult(finalResult);
    onBattleEnd?.(finalResult);
  };

  const renderTeamCard = (team: Team | undefined, type: 'attacker' | 'defender') => {
    if (!team) {
      return (
        <div className={`team-card empty ${type}`}>
          <p>选择队伍</p>
        </div>
      );
    }

    const power = calculateTeamPower(team);
    const advantage = type === 'attacker' && defenderTeam 
      ? getFactionAdvantage(team.faction, defenderTeam.faction)
      : type === 'defender' && attackerTeam
      ? getFactionAdvantage(attackerTeam.faction, team.faction)
      : 1;

    return (
      <div className={`team-card ${type}`}>
        <div className="team-header">
          <h3>{team.name}</h3>
          <span className={`faction-badge faction-${team.faction}`}>
            {getFactionName(team.faction)}
          </span>
        </div>
        
        <div className="team-power">
          <span className="power-label">战斗力</span>
          <span className="power-value">{power}</span>
        </div>

        {advantage > 1 && (
          <div className="faction-advantage">
            阵营克制: +{Math.round((advantage - 1) * 100)}%
          </div>
        )}

        <div className="team-members">
          {team.members.map((member, idx) => {
            const hero = getHeroById(member.heroId);
            if (!hero) return null;
            
            return (
              <div key={idx} className="member-card">
                <img src={hero.avatar} alt={hero.name} className="member-avatar" />
                <div className="member-info">
                  <span className="member-name">{hero.name}</span>
                  <span 
                    className="member-quality"
                    style={{ color: getQualityColor(hero.quality) }}
                  >
                    {hero.quality === 'purple' ? '紫' : hero.quality === 'orange' ? '橙' : '红'}
                  </span>
                </div>
                <div className="member-health">
                  <div 
                    className="health-bar"
                    style={{ width: `${(member.currentHealth / member.maxHealth) * 100}%` }}
                  />
                  <span className="health-text">
                    {member.currentHealth}/{member.maxHealth}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="battle-panel-overlay" onClick={onClose}>
      <div className="battle-panel" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="battle-header">
          <h2>战斗演练</h2>
          <p>选择两支队伍进行战斗模拟</p>
        </div>

        <div className="team-selection">
          <div className="selection-group">
            <h3>进攻方</h3>
            <select 
              value={attackerTeamId}
              onChange={e => setAttackerTeamId(e.target.value)}
              disabled={isBattling}
            >
              <option value="">选择队伍</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} (战力: {calculateTeamPower(team)})
                </option>
              ))}
            </select>
            {renderTeamCard(attackerTeam, 'attacker')}
          </div>

          <div className="vs-divider">VS</div>

          <div className="selection-group">
            <h3>防守方</h3>
            <select 
              value={defenderTeamId}
              onChange={e => setDefenderTeamId(e.target.value)}
              disabled={isBattling}
            >
              <option value="">选择队伍</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} (战力: {calculateTeamPower(team)})
                </option>
              ))}
            </select>
            {renderTeamCard(defenderTeam, 'defender')}
          </div>
        </div>

        <div className="battle-controls">
          <button 
            className="battle-btn"
            onClick={startBattle}
            disabled={!attackerTeamId || !defenderTeamId || isBattling}
          >
            {isBattling ? '战斗中...' : '开始战斗'}
          </button>
        </div>

        {isBattling && (
          <div className="battle-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${battleProgress}%` }}
              />
            </div>
          </div>
        )}

        {battleLog.length > 0 && (
          <div className="battle-log">
            <h3>战斗日志</h3>
            <div className="log-content">
              {battleLog.map((log, idx) => (
                <p key={idx} className="log-entry">{log}</p>
              ))}
            </div>
          </div>
        )}

        {battleResult && (
          <div className="battle-result">
            <h3>战斗结果</h3>
            <div className="result-details">
              <div className="result-item">
                <span className="result-label">基础伤害</span>
                <span className="result-value">{battleResult.baseDamage}</span>
              </div>
              <div className="result-item">
                <span className="result-label">最终伤害</span>
                <span className="result-value">{battleResult.finalDamage}</span>
              </div>
              <div className="result-item">
                <span className="result-label">阵营加成</span>
                <span className="result-value">+{battleResult.breakdown.factionBonus}%</span>
              </div>
              <div className="result-item">
                <span className="result-label">技能倍率</span>
                <span className="result-value">x{battleResult.breakdown.skillMultiplier}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattlePanel;
