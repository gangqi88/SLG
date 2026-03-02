// 队伍阵型服务 - 负责阵型加成计算

import type { Hero, Team } from '../../types/slg/hero.types';

export interface FormationBonus {
    type: string;
    value: number;
    description: string;
}

export interface PositionBonus {
    position: 'main' | 'sub';
    attribute: keyof Hero['attributes'];
    bonus: number;
}

export class TeamFormationService {
    calculateFactionBonus(team: Team, heroes: Hero[]): number {
        if (team.members.length < 2) return 0;
        
        const factions = new Set(heroes.map(h => h.faction));
        
        if (factions.size === 1) {
            return 0.15;
        }
        
        return 0;
    }

    calculateMemberBonus(_hero: Hero, position: 'main' | 'sub'): PositionBonus {
        const isMain = position === 'main';
        
        return {
            position,
            attribute: isMain ? 'command' : 'strength',
            bonus: isMain ? 0.2 : 0.1,
        };
    }

    calculateTotalBonus(
        team: Team,
        heroes: Map<string, Hero>
    ): { attack: number; defense: number; healing: number; resource: number } {
        let attack = 0;
        let defense = 0;
        let healing = 0;
        let resource = 0;
        
        team.members.forEach(member => {
            const hero = heroes.get(member.heroId);
            if (!hero) return;
            
            const positionBonus = this.calculateMemberBonus(hero, member.position);
            
            switch (hero.faction) {
                case 'human':
                    resource += positionBonus.bonus;
                    defense += positionBonus.bonus * 0.5;
                    break;
                case 'angel':
                    healing += positionBonus.bonus;
                    defense += positionBonus.bonus;
                    break;
                case 'demon':
                    attack += positionBonus.bonus;
                    break;
            }
        });
        
        const factionBonus = this.calculateFactionBonus(team, Array.from(heroes.values()));
        
        return {
            attack: attack + factionBonus,
            defense: defense + factionBonus,
            healing: healing + factionBonus,
            resource: resource + factionBonus,
        };
    }

    getBestPosition(hero: Hero): 'main' | 'sub' {
        const { command, strength, strategy, defense } = hero.attributes;
        
        const mainScore = command * 1.0 + strategy * 0.5;
        const subScore = strength * 1.0 + defense * 0.3 + strategy * 0.2;
        
        return mainScore >= subScore ? 'main' : 'sub';
    }

    isValidFormation(team: Team): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (team.members.length === 0) {
            errors.push('队伍不能为空');
        }
        
        if (team.members.length > 3) {
            errors.push('队伍最多3人');
        }
        
        const mainCount = team.members.filter(m => m.position === 'main').length;
        if (mainCount !== 1) {
            errors.push('必须有1个主将');
        }
        
        return { valid: errors.length === 0, errors };
    }
}
