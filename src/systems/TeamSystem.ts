import { Hero, Team, TeamMember, FactionType, FACTION_BONUS } from '../types/slg/hero.types';
import { generateId } from '../utils/helpers';

export interface FormationBonus {
  type: string;
  value: number;
  description: string;
}

export interface RecommendedFormation {
  name: string;
  description: string;
  mainHero: string;
  subHeroes: string[];
  economyHeroes: string[];
  bonuses: FormationBonus[];
  strengths: string[];
  weaknesses: string[];
}

export interface PositionBonus {
  position: 'main' | 'sub1' | 'sub2';
  attribute: keyof Hero['attributes'];
  bonus: number;
}

export class TeamSystem {
  private static instance: TeamSystem;
  
  private teams: Map<string, Team> = new Map();
  private maxTeams: number = 5;
  private maxTeamSize: number = 3;
  
  private recommendedFormations: RecommendedFormation[] = [
    {
      name: '人族·稳守发育流',
      description: '资源爆炸、守城极强、续航无解',
      mainHero: 'zhong-li-ye',
      subHeroes: ['qin-lie', 'su-wan-qing'],
      economyHeroes: ['su-mo', 'liang-shi'],
      bonuses: [
        { type: 'resource', value: 50, description: '资源产量+50%' },
        { type: 'defense', value: 40, description: '守城防御+40%' },
        { type: 'heal', value: 25, description: '治疗效果+25%' }
      ],
      strengths: ['资源获取', '城防', '续航'],
      weaknesses: ['爆发']
    },
    {
      name: '天使·圣光永动流',
      description: '治疗拉满、防御无敌、克制恶魔',
      mainHero: 'mi-jia-er',
      subHeroes: ['luo-xi', 'jia-nan'],
      economyHeroes: ['ai-lin-na', 'wu-lie'],
      bonuses: [
        { type: 'heal', value: 45, description: '治疗+45%' },
        { type: 'defense', value: 60, description: '防御+60%' },
        { type: 'demon_killer', value: 30, description: '对恶魔伤害+30%' }
      ],
      strengths: ['治疗', '防御', '克制恶魔'],
      weaknesses: ['爆发']
    },
    {
      name: '恶魔·炼狱爆杀流',
      description: '爆发秒杀、掠夺攻城、压制极强',
      mainHero: 'ba-er',
      subHeroes: ['mo-luo-ke', 'ka-long'],
      economyHeroes: ['a-jia-lei-si', 'ma-men'],
      bonuses: [
        { type: 'damage', value: 65, description: '伤害+65%' },
        { type: 'aoe', value: 55, description: 'AOE+55%' },
        { type: 'plunder', value: 40, description: '掠夺+40%' }
      ],
      strengths: ['爆发', '掠夺', '攻城'],
      weaknesses: ['防御', '续航']
    }
  ];

  private constructor() {
    this.initializeDefaultTeams();
  }

  static getInstance(): TeamSystem {
    if (!TeamSystem.instance) {
      TeamSystem.instance = new TeamSystem();
    }
    return TeamSystem.instance;
  }

  private initializeDefaultTeams(): void {
    for (let i = 1; i <= 3; i++) {
      const teamId = `team_${i}`;
      const team: Team = {
        id: teamId,
        name: `队伍 ${i}`,
        owner: 'player',
        members: [],
        faction: 'human',
        power: 0,
        morale: 100,
        bonuses: {
          factionBonus: 0,
          bondBonus: 0,
          equipmentBonus: 0
        },
        status: 'idle',
        history: {
          battlesWon: 0,
          battlesLost: 0,
          winRate: 0
        }
      };
      this.teams.set(teamId, team);
    }
  }

  createTeam(name: string, faction: FactionType): Team | null {
    if (this.teams.size >= this.maxTeams) {
      console.warn('已达到最大队伍数量');
      return null;
    }

    const teamId = `team_${generateId()}`;
    const team: Team = {
      id: teamId,
      name,
      owner: 'player',
      members: [],
      faction,
      power: 0,
      morale: 100,
      bonuses: {
        factionBonus: 0,
        bondBonus: 0,
        equipmentBonus: 0
      },
      status: 'idle',
      history: {
        battlesWon: 0,
        battlesLost: 0,
        winRate: 0
      }
    };

    this.teams.set(teamId, team);
    return team;
  }

  deleteTeam(teamId: string): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    if (team.members.length > 0) {
      console.warn('队伍中还有英雄，无法删除');
      return false;
    }

    return this.teams.delete(teamId);
  }

  addHeroToTeam(teamId: string, hero: Hero, position: 'main' | 'sub1' | 'sub2'): boolean {
    const team = this.teams.get(teamId);
    if (!team) {
      console.error('队伍不存在');
      return false;
    }

    if (team.members.length >= this.maxTeamSize) {
      console.warn('队伍已满');
      return false;
    }

    const positionMap: Record<string, TeamMember['position']> = {
      'main': 'main',
      'sub1': 'sub',
      'sub2': 'sub'
    };

    const teamMember: TeamMember = {
      heroId: hero.id,
      position: positionMap[position],
      isActive: true,
      currentHealth: 100,
      maxHealth: 100,
      mana: 0,
      maxMana: 100,
      buffs: [],
      debuffs: []
    };

    team.members.push(teamMember);
    this.updateTeamPower(team);
    this.checkTeamBonds(team);

    return true;
  }

  removeHeroFromTeam(teamId: string, heroId: string): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    const index = team.members.findIndex(m => m.heroId === heroId);
    if (index === -1) return false;

    team.members.splice(index, 1);
    this.updateTeamPower(team);
    this.checkTeamBonds(team);

    return true;
  }

  swapHeroPositions(teamId: string, heroId1: string, heroId2: string): boolean {
    const team = this.teams.get(teamId);
    if (!team) return false;

    const member1 = team.members.find(m => m.heroId === heroId1);
    const member2 = team.members.find(m => m.heroId === heroId2);

    if (!member1 || !member2) return false;

    const tempPosition = member1.position;
    member1.position = member2.position;
    member2.position = tempPosition;

    return true;
  }

  private updateTeamPower(team: Team): void {
    let totalPower = 0;
    team.members.forEach(member => {
      totalPower += this.calculateMemberPower(member);
    });
    team.power = totalPower;
  }

  private calculateMemberPower(member: TeamMember): number {
    return member.maxHealth * 0.1 + member.maxMana * 2;
  }

  private checkTeamBonds(team: Team): void {
    const heroIds = team.members.map(m => m.heroId);
    let bondBonus = 0;

    const bondGroups: Record<string, string[]> = {
      'fan-shi-xian-liang': ['su-mo', 'wen-zhu', 'liang-shi'],
      'tie-xue-shu-cheng': ['qin-lie', 'zhong-li-ye', 'zhao-cheng-yan'],
      'zhi-ji-lian-huan': ['wen-zhu', 'liu-qing-yan', 'nan-gong-wang'],
      'sheng-guang-shou-hu': ['luo-xi', 'jia-nan', 'ai-lin-na'],
      'lian-yu-zhu-zai': ['mo-luo-ke', 'sa-luo-si', 'ba-er'],
    };

    Object.values(bondGroups).forEach(group => {
      const matchCount = group.filter(id => heroIds.includes(id)).length;
      if (matchCount >= 3) {
        bondBonus += 20;
      }
    });

    team.bonuses.bondBonus = bondBonus;
  }

  getTeam(teamId: string): Team | undefined {
    return this.teams.get(teamId);
  }

  getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  getTeamByFaction(faction: FactionType): Team[] {
    return Array.from(this.teams.values()).filter(t => t.faction === faction);
  }

  getRecommendedFormation(faction: FactionType): RecommendedFormation | undefined {
    const formationMap: Record<FactionType, string> = {
      'human': '人族·稳守发育流',
      'angel': '天使·圣光永动流',
      'demon': '恶魔·炼狱爆杀流'
    };

    return this.recommendedFormations.find(f => f.name === formationMap[faction]);
  }

  getAllRecommendedFormations(): RecommendedFormation[] {
    return this.recommendedFormations;
  }

  calculateFormationBonus(formation: RecommendedFormation, team: Team): FormationBonus[] {
    const bonuses: FormationBonus[] = [];
    const heroIds = team.members.map(m => m.heroId);

    formation.bonuses.forEach(bonus => {
      let matchCount = 0;
      
      if (formation.mainHero && heroIds.includes(formation.mainHero)) matchCount++;
      formation.subHeroes.forEach(h => {
        if (heroIds.includes(h)) matchCount++;
      });

      if (matchCount > 0) {
        bonuses.push({
          ...bonus,
          value: Math.round(bonus.value * (matchCount / (formation.subHeroes.length + 1)))
        });
      }
    });

    return bonuses;
  }

  calculateTeamFactionBonus(attackerTeam: Team, defenderTeam: Team): number {
    const key = `${attackerTeam.faction}->${defenderTeam.faction}` as keyof typeof FACTION_BONUS;
    return FACTION_BONUS[key] || 0;
  }

  setTeamMorale(teamId: string, morale: number): void {
    const team = this.teams.get(teamId);
    if (team) {
      team.morale = Math.max(30, Math.min(100, morale));
    }
  }

  updateTeamMorale(teamId: string, delta: number): void {
    const team = this.teams.get(teamId);
    if (team) {
      team.morale = Math.max(30, Math.min(100, team.morale + delta));
    }
  }

  getTeamBattleStats(teamId: string): { won: number; lost: number; winRate: number } | null {
    const team = this.teams.get(teamId);
    if (!team) return null;

    return {
      won: team.history.battlesWon,
      lost: team.history.battlesLost,
      winRate: team.history.winRate
    };
  }

  recordBattleResult(teamId: string, won: boolean): void {
    const team = this.teams.get(teamId);
    if (!team) return;

    if (won) {
      team.history.battlesWon++;
    } else {
      team.history.battlesLost++;
    }

    const total = team.history.battlesWon + team.history.battlesLost;
    team.history.winRate = total > 0 ? Math.round((team.history.battlesWon / total) * 100) : 0;
  }

  getPositionBonuses(): PositionBonus[] {
    return [
      { position: 'main', attribute: 'command', bonus: 15 },
      { position: 'sub1', attribute: 'strength', bonus: 10 },
      { position: 'sub2', attribute: 'defense', bonus: 10 }
    ];
  }

  calculateTeamStats(team: Team, heroes: Map<string, Hero>): {
    totalPower: number;
    avgLevel: number;
    avgQuality: number;
    bondActiveCount: number;
  } {
    let totalPower = 0;
    let totalLevel = 0;
    let qualitySum = 0;
    let bondCount = 0;

    team.members.forEach(member => {
      const hero = heroes.get(member.heroId);
      if (hero) {
        totalPower += this.calculateHeroPower(hero);
        totalLevel += hero.level;
        qualitySum += hero.quality === 'red' ? 3 : hero.quality === 'orange' ? 2 : 1;
        if (hero.bondActive) bondCount++;
      }
    });

    const count = team.members.length || 1;

    return {
      totalPower,
      avgLevel: Math.round(totalLevel / count),
      avgQuality: qualitySum / count,
      bondActiveCount: bondCount
    };
  }

  private calculateHeroPower(hero: Hero): number {
    const basePower = 
      hero.attributes.command * 1.2 +
      hero.attributes.strength * 1.5 +
      hero.attributes.strategy * 1.3 +
      hero.attributes.defense * 1.0;

    const qualityMultiplier = hero.quality === 'red' ? 2.0 : hero.quality === 'orange' ? 1.5 : 1.0;
    const starMultiplier = 1 + (hero.stars - 1) * 0.1;
    const levelMultiplier = 1 + (hero.level - 1) * 0.02;
    const bondMultiplier = hero.bondActive ? 1.2 : 1.0;

    return Math.floor(basePower * qualityMultiplier * starMultiplier * levelMultiplier * bondMultiplier);
  }

  optimizeTeamComposition(teamId: string, availableHeroes: Hero[]): { bestHeroes: Hero[]; score: number } {
    const team = this.teams.get(teamId);
    if (!team || availableHeroes.length < 3) {
      return { bestHeroes: [], score: 0 };
    }

    const sortedHeroes = [...availableHeroes].sort((a, b) => {
      return this.calculateHeroPower(b) - this.calculateHeroPower(a);
    });

    const bestHeroes = sortedHeroes.slice(0, 3);
    const score = bestHeroes.reduce((sum, h) => sum + this.calculateHeroPower(h), 0);

    return { bestHeroes, score };
  }
}

export const teamSystem = TeamSystem.getInstance();
