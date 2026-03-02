import { Hero, Team } from '../types/slg/hero.types';
import { battleSystem } from './BattleSystem';
import { BattleSimulationService, RealTimeBattleService, type RealTimeBattleState } from './battle';

export interface PredictionConfig {
    simulationCount: number;
    includeVariance: boolean;
    variancePercent: number;
}

export interface PredictedOutcome {
    attackerWinRate: number;
    defenderWinRate: number;
    drawRate: number;
    averageRounds: number;
    expectedDamage: {
        attacker: number;
        defender: number;
    };
    expectedCasualties: {
        attacker: number;
        defender: number;
    };
    confidence: number;
    samples: number;
}

export class BattlePredictionSystem {
    private static instance: BattlePredictionSystem;
    
    private simulationService: BattleSimulationService;
    private realTimeService: RealTimeBattleService;
    
    private config: PredictionConfig = {
        simulationCount: 100,
        includeVariance: true,
        variancePercent: 0.1,
    };

    private constructor() {
        this.simulationService = new BattleSimulationService(
            (context) => battleSystem.calculateDamage(context as Parameters<typeof battleSystem.calculateDamage>[0])
        );
        this.realTimeService = new RealTimeBattleService(
            (context) => battleSystem.calculateDamage(context as Parameters<typeof battleSystem.calculateDamage>[0]),
            (members) => battleSystem.calculateTeamPower(members as Parameters<typeof battleSystem.calculateTeamPower>[0]),
            (team, heroes) => this.simulationService.cloneTeamState(team, heroes)
        );
    }

    static getInstance(): BattlePredictionSystem {
        if (!BattlePredictionSystem.instance) {
            BattlePredictionSystem.instance = new BattlePredictionSystem();
        }
        return BattlePredictionSystem.instance;
    }

    setConfig(config: Partial<PredictionConfig>): void {
        this.config = { ...this.config, ...config };
    }

    predictBattleOutcome(
        attackerTeam: Team,
        defenderTeam: Team,
        attackerHeroes: Map<string, Hero>,
        defenderHeroes: Map<string, Hero>
    ): PredictedOutcome {
        let attackerWins = 0;
        let defenderWins = 0;
        let draws = 0;
        let totalRounds = 0;
        let totalAttackerDamage = 0;
        let totalDefenderDamage = 0;
        let totalAttackerCasualties = 0;
        let totalDefenderCasualties = 0;

        for (let i = 0; i < this.config.simulationCount; i++) {
            const result = this.simulationService.simulateSingleBattle(
                attackerTeam,
                defenderTeam,
                attackerHeroes,
                defenderHeroes
            );

            if (result.winner === 'attacker') attackerWins++;
            else if (result.winner === 'defender') defenderWins++;
            else draws++;

            totalRounds += result.rounds;
            totalAttackerDamage += result.attackerDamage;
            totalDefenderDamage += result.defenderDamage;
            totalAttackerCasualties += result.attackerCasualties;
            totalDefenderCasualties += result.defenderCasualties;
        }

        const samples = this.config.simulationCount;
        const confidence = this.calculateConfidence(samples);

        return {
            attackerWinRate: (attackerWins / samples) * 100,
            defenderWinRate: (defenderWins / samples) * 100,
            drawRate: (draws / samples) * 100,
            averageRounds: totalRounds / samples,
            expectedDamage: {
                attacker: totalAttackerDamage / samples,
                defender: totalDefenderDamage / samples,
            },
            expectedCasualties: {
                attacker: totalAttackerCasualties / samples,
                defender: totalDefenderCasualties / samples,
            },
            confidence,
            samples,
        };
    }

    private calculateConfidence(samples: number): number {
        if (samples >= 1000) return 95;
        if (samples >= 500) return 90;
        if (samples >= 100) return 80;
        if (samples >= 50) return 70;
        return 60;
    }

    startRealTimeBattle(
        battleId: string,
        attackerTeam: Team,
        defenderTeam: Team,
        attackerHeroes: Map<string, Hero>,
        defenderHeroes: Map<string, Hero>,
        onTick?: (state: RealTimeBattleState) => void
    ): void {
        this.realTimeService.startBattle(
            battleId,
            attackerTeam,
            defenderTeam,
            attackerHeroes,
            defenderHeroes,
            onTick
        );
    }

    pauseRealTimeBattle(): void {
        this.realTimeService.pauseBattle();
    }

    resumeRealTimeBattle(): void {
        this.realTimeService.resumeBattle();
    }

    stopRealTimeBattle(): void {
        this.realTimeService.stopBattle();
    }

    getCurrentState(): RealTimeBattleState | null {
        return this.realTimeService.getCurrentState();
    }

    getPredictionSummary(outcome: PredictedOutcome): string {
        const lines: string[] = [];
        lines.push('═'.repeat(40));
        lines.push('🔮 战斗预测');
        lines.push('═'.repeat(40));
        lines.push('');
        lines.push(`胜率预测 (样本数: ${outcome.samples})`);
        lines.push(`  进攻方: ${outcome.attackerWinRate.toFixed(1)}%`);
        lines.push(`  防守方: ${outcome.defenderWinRate.toFixed(1)}%`);
        lines.push(`  平局: ${outcome.drawRate.toFixed(1)}%`);
        lines.push('');
        lines.push(`预计回合数: ${outcome.averageRounds.toFixed(1)}`);
        lines.push(`预测置信度: ${outcome.confidence}%`);
        lines.push('');
        lines.push('═'.repeat(40));

        return lines.join('\n');
    }
}

export const battlePredictionSystem = BattlePredictionSystem.getInstance();
