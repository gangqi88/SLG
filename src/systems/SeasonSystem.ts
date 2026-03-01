import {
  Season,
  SeasonReward,
  SEASON_DURATION,
} from '../types/slg/multiplayer.types';
import { generateId } from '../utils/helpers';

export class SeasonSystem {
  private static instance: SeasonSystem;
  
  private seasons: Map<string, Season> = new Map();
  private currentSeasonId: string | null = null;

  private constructor() {
    this.initializeSeasons();
  }

  static getInstance(): SeasonSystem {
    if (!SeasonSystem.instance) {
      SeasonSystem.instance = new SeasonSystem();
    }
    return SeasonSystem.instance;
  }

  private initializeSeasons(): void {
    const now = Date.now();
    
    const currentSeason: Season = {
      id: generateId(),
      number: 1,
      name: 'S1：凛冬之战',
      startTime: now - SEASON_DURATION / 2,
      endTime: now + SEASON_DURATION / 2,
      status: 'active',
      rewards: this.generateSeasonRewards(),
    };

    this.seasons.set(currentSeason.id, currentSeason);
    this.currentSeasonId = currentSeason.id;
  }

  private generateSeasonRewards(): SeasonReward[] {
    return [
      { tier: 'bronze', rankMin: 1, rankMax: 100, rewards: { gold: 1000 } },
      { tier: 'silver', rankMin: 101, rankMax: 500, rewards: { gold: 3000 } },
      { tier: 'gold', rankMin: 501, rankMax: 1000, rewards: { gold: 5000, diamonds: 100 } },
      { tier: 'platinum', rankMin: 1001, rankMax: 2000, rewards: { gold: 10000, diamonds: 300 } },
      { tier: 'diamond', rankMin: 2001, rankMax: 5000, rewards: { gold: 20000, diamonds: 500 } },
      { tier: 'master', rankMin: 5001, rankMax: 10000, rewards: { gold: 50000, diamonds: 1000 } },
      { tier: 'king', rankMin: 10001, rankMax: 20000, rewards: { gold: 100000, diamonds: 2000 } },
      { tier: 'legend', rankMin: 20001, rankMax: 999999, rewards: { gold: 200000, diamonds: 5000 } },
    ];
  }

  getCurrentSeason(): Season | null {
    return this.currentSeasonId ? this.seasons.get(this.currentSeasonId) || null : null;
  }

  getSeason(seasonId: string): Season | undefined {
    return this.seasons.get(seasonId);
  }

  getSeasonProgress(seasonId: string): { progress: number; daysRemaining: number } | null {
    const season = this.seasons.get(seasonId);
    if (!season) return null;

    const now = Date.now();
    const totalDuration = season.endTime - season.startTime;
    const elapsed = now - season.startTime;
    const progress = Math.min(100, (elapsed / totalDuration) * 100);
    const daysRemaining = Math.max(0, Math.ceil((season.endTime - now) / (24 * 60 * 60 * 1000)));

    return { progress, daysRemaining };
  }

  isSeasonActive(): boolean {
    const season = this.getCurrentSeason();
    return season?.status === 'active';
  }

  getSeasonRewards(rank: number): SeasonReward | null {
    const season = this.getCurrentSeason();
    if (!season) return null;

    return season.rewards.find(r => rank >= r.rankMin && rank <= r.rankMax) || null;
  }

  calculateSeasonPoints(wins: number, rank: number): number {
    return Math.floor(wins * 10 + (10000 - rank) * 0.5);
  }

  startNewSeason(): Season {
    const currentSeason = this.getCurrentSeason();
    if (currentSeason) {
      currentSeason.status = 'completed';
    }

    const nextNumber = (currentSeason?.number || 0) + 1;
    const now = Date.now();

    const newSeason: Season = {
      id: generateId(),
      number: nextNumber,
      name: `S${nextNumber}：王者对决`,
      startTime: now,
      endTime: now + SEASON_DURATION,
      status: 'active',
      rewards: this.generateSeasonRewards(),
    };

    this.seasons.set(newSeason.id, newSeason);
    this.currentSeasonId = newSeason.id;

    return newSeason;
  }

  getAllSeasons(): Season[] {
    return Array.from(this.seasons.values());
  }

  getSeasonLeaderboard(_seasonId: string): { playerId: string; points: number; rank: number }[] {
    return [];
  }
}

export const seasonSystem = SeasonSystem.getInstance();
