import { generateId } from '../utils/helpers';

export interface ReplayFrame {
    frameId: string;
    timestamp: number;
    tick: number;
    events: ReplayEvent[];
    teamStates: TeamStateSnapshot[];
    effects: EffectSnapshot[];
}

export interface ReplayEvent {
    eventId: string;
    type: 'attack' | 'skill' | 'buff_apply' | 'buff_remove' | 'heal' | 'damage' | 'death' | 'skill_ready' | 'morale_change';
    sourceId: string;
    sourceName: string;
    targetId?: string;
    targetName?: string;
    value: number;
    isCritical: boolean;
    isDodged: boolean;
    description: string;
    skillId?: string;
    skillName?: string;
    buffId?: string;
    buffType?: string;
}

export interface TeamStateSnapshot {
    teamId: string;
    members: MemberStateSnapshot[];
    morale: number;
    totalHealth: number;
    maxHealth: number;
}

export interface MemberStateSnapshot {
    heroId: string;
    currentHealth: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    buffs: BuffSnapshot[];
    debuffs: DebuffSnapshot[];
    position: { x: number; y: number };
    isAlive: boolean;
    actionTaken: boolean;
}

export interface BuffSnapshot {
    id: string;
    name: string;
    type: string;
    value: number;
    remainingDuration: number;
}

export interface DebuffSnapshot {
    id: string;
    name: string;
    type: string;
    value: number;
    remainingDuration: number;
}

export interface EffectSnapshot {
    effectId: string;
    type: 'damage_number' | 'heal_number' | 'buff_icon' | 'skill_effect' | 'death' | 'critical';
    position: { x: number; y: number };
    value?: number;
    duration?: number;
    color?: string;
}

export interface BattleReplay {
    replayId: string;
    battleId: string;
    startTime: number;
    endTime: number;
    duration: number;
    attackerTeamId: string;
    defenderTeamId: string;
    winner: 'attacker' | 'defender' | 'draw';
    frames: ReplayFrame[];
    summary: BattleSummary;
}

export interface BattleSummary {
    totalRounds: number;
    totalDamage: number;
    totalHealing: number;
    criticalHits: number;
    dodges: number;
    deaths: number;
    skillsUsed: number;
    attackerCasualties: number;
    defenderCasualties: number;
    MVP?: {
        heroId: string;
        heroName: string;
        damage: number;
        healing: number;
    };
}

export interface ReplayPlayerState {
    isPlaying: boolean;
    isPaused: boolean;
    currentFrame: number;
    playbackSpeed: number;
    totalFrames: number;
}

export class BattleReplaySystem {
    private static instance: BattleReplaySystem;
    private currentReplay: BattleReplay | null = null;
    private frameIndex: number = 0;
    private observers: ReplayObserver[] = [];

    private constructor() {}

    static getInstance(): BattleReplaySystem {
        if (!BattleReplaySystem.instance) {
            BattleReplaySystem.instance = new BattleReplaySystem();
        }
        return BattleReplaySystem.instance;
    }

    startRecording(
        battleId: string,
        attackerTeamId: string,
        defenderTeamId: string
    ): void {
        this.currentReplay = {
            replayId: generateId(),
            battleId,
            startTime: Date.now(),
            endTime: 0,
            duration: 0,
            attackerTeamId,
            defenderTeamId,
            winner: 'draw',
            frames: [],
            summary: {
                totalRounds: 0,
                totalDamage: 0,
                totalHealing: 0,
                criticalHits: 0,
                dodges: 0,
                deaths: 0,
                skillsUsed: 0,
                attackerCasualties: 0,
                defenderCasualties: 0,
            },
        };
        this.frameIndex = 0;
    }

    addFrame(
        events: ReplayEvent[],
        teamStates: TeamStateSnapshot[],
        effects: EffectSnapshot[] = []
    ): void {
        if (!this.currentReplay) return;

        const frame: ReplayFrame = {
            frameId: generateId(),
            timestamp: Date.now() - this.currentReplay.startTime,
            tick: this.frameIndex,
            events,
            teamStates,
            effects,
        };

        this.currentReplay.frames.push(frame);
        this.frameIndex++;

        this.notifyObservers(frame);
    }

    addEvent(event: Omit<ReplayEvent, 'eventId'>): ReplayEvent {
        const fullEvent: ReplayEvent = {
            ...event,
            eventId: generateId(),
        };

        if (event.type === 'damage') {
            this.currentReplay!.summary.totalDamage += event.value;
            if (event.isCritical) {
                this.currentReplay!.summary.criticalHits++;
            }
            if (event.isDodged) {
                this.currentReplay!.summary.dodges++;
            }
        } else if (event.type === 'heal') {
            this.currentReplay!.summary.totalHealing += event.value;
        } else if (event.type === 'death') {
            this.currentReplay!.summary.deaths++;
        } else if (event.type === 'skill') {
            this.currentReplay!.summary.skillsUsed++;
        }

        return fullEvent;
    }

    finishRecording(winner: 'attacker' | 'defender' | 'draw'): BattleReplay {
        if (!this.currentReplay) {
            throw new Error('No active recording');
        }

        this.currentReplay.winner = winner;
        this.currentReplay.endTime = Date.now();
        this.currentReplay.duration = this.currentReplay.endTime - this.currentReplay.startTime;
        this.currentReplay.summary.totalRounds = Math.ceil(this.frameIndex / 60);

        const finalFrame = this.currentReplay.frames[this.currentReplay.frames.length - 1];
        if (finalFrame) {
            const attackerState = finalFrame.teamStates.find(
                t => t.teamId === this.currentReplay!.attackerTeamId
            );
            const defenderState = finalFrame.teamStates.find(
                t => t.teamId === this.currentReplay!.defenderTeamId
            );

            if (attackerState) {
                this.currentReplay.summary.attackerCasualties = attackerState.members.filter(m => !m.isAlive).length;
            }
            if (defenderState) {
                this.currentReplay.summary.defenderCasualties = defenderState.members.filter(m => !m.isAlive).length;
            }
        }

        const completedReplay = { ...this.currentReplay };
        this.currentReplay = null;
        this.frameIndex = 0;

        this.saveReplay(completedReplay);

        return completedReplay;
    }

    private saveReplay(replay: BattleReplay): void {
        try {
            const replays = this.getStoredReplays();
            replays.push(replay);

            if (replays.length > 50) {
                replays.shift();
            }

            localStorage.setItem('battle_replays', JSON.stringify(replays));
        } catch (e) {
            console.error('Failed to save replay:', e);
        }
    }

    getStoredReplays(): BattleReplay[] {
        try {
            const stored = localStorage.getItem('battle_replays');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    loadReplay(replayId: string): BattleReplay | null {
        const replays = this.getStoredReplays();
        return replays.find(r => r.replayId === replayId) || null;
    }

    getCurrentReplay(): BattleReplay | null {
        return this.currentReplay;
    }

    getFrameCount(): number {
        return this.currentReplay?.frames.length || 0;
    }

    subscribe(observer: ReplayObserver): () => void {
        this.observers.push(observer);
        return () => {
            this.observers = this.observers.filter(o => o !== observer);
        };
    }

    private notifyObservers(frame: ReplayFrame): void {
        this.observers.forEach(observer => observer.onFrame(frame));
    }

    generateBattleReport(replay: BattleReplay): string {
        const lines: string[] = [];

        lines.push('═'.repeat(50));
        lines.push('⚔️ 战斗战报');
        lines.push('═'.repeat(50));
        lines.push('');
        lines.push(`📅 时间: ${new Date(replay.startTime).toLocaleString()}`);
        lines.push(`⏱️  战斗时长: ${(replay.duration / 1000).toFixed(1)}秒`);
        lines.push(`📊 回合数: ${replay.summary.totalRounds}`);
        lines.push('');

        lines.push('─'.repeat(50));
        lines.push('📈 战斗统计');
        lines.push('─'.repeat(50));
        lines.push(`💥 总伤害: ${replay.summary.totalDamage.toLocaleString()}`);
        lines.push(`💚 总治疗: ${replay.summary.totalHealing.toLocaleString()}`);
        lines.push(`⚡ 暴击次数: ${replay.summary.criticalHits}`);
        lines.push(`🔄 闪避次数: ${replay.summary.dodges}`);
        lines.push(`💀 死亡次数: ${replay.summary.deaths}`);
        lines.push(`✨ 技能使用: ${replay.summary.skillsUsed}`);
        lines.push('');

        lines.push('─'.repeat(50));
        lines.push('🎯 伤亡统计');
        lines.push('─'.repeat(50));
        lines.push(`攻方伤亡: ${replay.summary.attackerCasualties}`);
        lines.push(`守方伤亡: ${replay.summary.defenderCasualties}`);
        lines.push('');

        const winnerText = replay.winner === 'attacker' ? '进攻方' :
            replay.winner === 'defender' ? '防守方' : '平局';
        lines.push('═'.repeat(50));
        lines.push(`🏆 胜利方: ${winnerText}`);
        lines.push('═'.repeat(50));

        return lines.join('\n');
    }

    exportReplay(replay: BattleReplay): string {
        return JSON.stringify(replay, null, 2);
    }

    importReplay(json: string): BattleReplay | null {
        try {
            const replay = JSON.parse(json) as BattleReplay;
            if (replay.replayId && replay.frames) {
                this.saveReplay(replay);
                return replay;
            }
            return null;
        } catch {
            return null;
        }
    }
}

export interface ReplayObserver {
    onFrame: (frame: ReplayFrame) => void;
}

export const battleReplaySystem = BattleReplaySystem.getInstance();
