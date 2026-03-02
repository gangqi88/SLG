// 队伍数据管理器 - 负责队伍数据基本操作

import type { Team, TeamMember, TeamPosition } from '../../types/slg/hero.types';
import { generateId } from '../../utils/helpers';

export interface RecommendedFormation {
    name: string;
    description: string;
    mainHero: string;
    subHeroes: string[];
    economyHeroes: string[];
    bonuses: { type: string; value: number; description: string }[];
    strengths: string[];
    weaknesses: string[];
}

export class TeamDataManager {
    private teams: Map<string, Team> = new Map();
    private maxTeams: number = 5;
    
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

    constructor() {
        this.initializeDefaultTeams();
    }

    private initializeDefaultTeams(): void {
        for (let i = 0; i < this.maxTeams; i++) {
            const team: Team = {
                id: generateId(),
                name: `队伍 ${i + 1}`,
                owner: 'player',
                members: [],
                faction: 'human',
                power: 0,
                morale: 100,
                bonuses: {
                    factionBonus: 0,
                    bondBonus: 0,
                    equipmentBonus: 0,
                },
                status: 'idle',
                history: {
                    battlesWon: 0,
                    battlesLost: 0,
                    winRate: 0,
                },
            };
            this.teams.set(team.id, team);
        }
    }

    createTeam(name: string, owner: string = 'player'): Team | null {
        if (this.teams.size >= this.maxTeams) {
            console.warn('已达到最大队伍数量');
            return null;
        }

        const team: Team = {
            id: generateId(),
            name,
            owner,
            members: [],
            faction: 'human',
            power: 0,
            morale: 100,
            bonuses: {
                factionBonus: 0,
                bondBonus: 0,
                equipmentBonus: 0,
            },
            status: 'idle',
            history: {
                battlesWon: 0,
                battlesLost: 0,
                winRate: 0,
            },
        };

        this.teams.set(team.id, team);
        return team;
    }

    deleteTeam(teamId: string): boolean {
        return this.teams.delete(teamId);
    }

    getTeam(teamId: string): Team | undefined {
        return this.teams.get(teamId);
    }

    getAllTeams(): Team[] {
        return Array.from(this.teams.values());
    }

    addMember(teamId: string, heroId: string, position: TeamPosition): boolean {
        const team = this.teams.get(teamId);
        if (!team) return false;

        if (team.members.length >= 3) {
            console.warn('队伍已满');
            return false;
        }

        const member: TeamMember = {
            heroId,
            position,
            isActive: true,
            currentHealth: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 100,
            buffs: [],
            debuffs: [],
        };

        team.members.push(member);
        
        return true;
    }

    removeMember(teamId: string, heroId: string): boolean {
        const team = this.teams.get(teamId);
        if (!team) return false;

        const index = team.members.findIndex(m => m.heroId === heroId);
        if (index === -1) return false;

        team.members.splice(index, 1);
        
        return true;
    }

    updateMemberPosition(teamId: string, heroId: string, position: TeamPosition): boolean {
        const team = this.teams.get(teamId);
        if (!team) return false;

        const member = team.members.find(m => m.heroId === heroId);
        if (!member) return false;

        member.position = position;
        
        return true;
    }

    getRecommendedFormations(): RecommendedFormation[] {
        return this.recommendedFormations;
    }

    getMaxTeams(): number {
        return this.maxTeams;
    }
}
