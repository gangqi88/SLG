import { Hero, Team, TeamMember, FactionType, FACTION_BONUS } from '../types/slg/hero.types';
import { TeamDataManager, TeamFormationService } from './teams';

export type { RecommendedFormation } from './teams';
export interface PositionBonus {
  position: 'main' | 'sub1' | 'sub2';
  attribute: keyof Hero['attributes'];
  bonus: number;
}

export interface FormationBonus {
  type: string;
  value: number;
  description: string;
}

export class TeamSystem {
  private static instance: TeamSystem;
  
  private dataManager: TeamDataManager;
  private formationService: TeamFormationService;
  
  private constructor() {
    this.dataManager = new TeamDataManager();
    this.formationService = new TeamFormationService();
  }

  static getInstance(): TeamSystem {
    if (!TeamSystem.instance) {
      TeamSystem.instance = new TeamSystem();
    }
    return TeamSystem.instance;
  }

  createTeam(name: string, faction: FactionType): Team | null {
    const team = this.dataManager.createTeam(name);
    if (team) {
      team.faction = faction;
    }
    return team;
  }

  deleteTeam(teamId: string): boolean {
    const team = this.dataManager.getTeam(teamId);
    if (team && team.members.length > 0) {
      console.warn('队伍中还有英雄，无法删除');
      return false;
    }
    return this.dataManager.deleteTeam(teamId);
  }

  addHeroToTeam(teamId: string, hero: Hero, position: 'main' | 'sub1' | 'sub2'): boolean {
    const team = this.dataManager.getTeam(teamId);
    if (!team) {
      console.error('队伍不存在');
      return false;
    }

    if (team.members.length >= 3) {
      console.warn('队伍已满');
      return false;
    }

    const positionMap: Record<string, TeamMember['position']> = {
      'main': 'main',
      'sub1': 'sub',
      'sub2': 'sub'
    };

    const success = this.dataManager.addMember(teamId, hero.id, positionMap[position]);
    if (success) {
      this.updateTeamPower(team);
      this.checkTeamBonds(team);
    }
    return success;
  }

  removeHeroFromTeam(teamId: string, heroId: string): boolean {
    const team = this.dataManager.getTeam(teamId);
    if (!team) return false;

    const success = this.dataManager.removeMember(teamId, heroId);
    if (success) {
      this.updateTeamPower(team);
      this.checkTeamBonds(team);
    }
    return success;
  }

  swapHeroPositions(teamId: string, heroId1: string, heroId2: string): boolean {
    const team = this.dataManager.getTeam(teamId);
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
    return this.dataManager.getTeam(teamId);
  }

  getAllTeams(): Team[] {
    return this.dataManager.getAllTeams();
  }

  getTeamByFaction(faction: FactionType): Team[] {
    return this.dataManager.getAllTeams().filter(t => t.faction === faction);
  }

  getRecommendedFormation(faction: FactionType): { name: string; description: string; mainHero: string; subHeroes: string[]; economyHeroes: string[]; bonuses: { type: string; value: number; description: string }[]; strengths: string[]; weaknesses: string[] } | undefined {
    const formationMap: Record<FactionType, string> = {
      'human': '人族·稳守发育流',
      'angel': '天使·圣光永动流',
      'demon': '恶魔·炼狱爆杀流'
    };

    return this.dataManager.getRecommendedFormations().find(f => f.name === formationMap[faction]);
  }

  getAllRecommendedFormations() {
    return this.dataManager.getRecommendedFormations();
  }

  calculateFormationBonus(formation: { mainHero: string; subHeroes: string[]; bonuses: FormationBonus[] }, team: Team): FormationBonus[] {
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
    const team = this.dataManager.getTeam(teamId);
    if (team) {
      team.morale = Math.max(30, Math.min(100, morale));
    }
  }

  updateTeamMorale(teamId: string, delta: number): void {
    const team = this.dataManager.getTeam(teamId);
    if (team) {
      team.morale = Math.max(30, Math.min(100, team.morale + delta));
    }
  }

  getTeamBattleStats(teamId: string): { won: number; lost: number; winRate: number } | null {
    const team = this.dataManager.getTeam(teamId);
    if (!team) return null;

    return {
      won: team.history.battlesWon,
      lost: team.history.battlesLost,
      winRate: team.history.winRate
    };
  }

  recordBattleResult(teamId: string, won: boolean): void {
    const team = this.dataManager.getTeam(teamId);
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
    const team = this.dataManager.getTeam(teamId);
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

  calculateFactionBonus(team: Team, heroes: Hero[]): number {
    return this.formationService.calculateFactionBonus(team, heroes);
  }

  calculateTotalBonus(team: Team, heroes: Map<string, Hero>) {
    return this.formationService.calculateTotalBonus(team, heroes);
  }

  getBestPosition(hero: Hero): 'main' | 'sub' {
    return this.formationService.getBestPosition(hero);
  }

  isValidFormation(team: Team): { valid: boolean; errors: string[] } {
    return this.formationService.isValidFormation(team);
  }
}

export const teamSystem = TeamSystem.getInstance();
