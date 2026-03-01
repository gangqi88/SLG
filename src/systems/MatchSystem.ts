import {
  Match,
  MatchRequest,
  Player,
  PVPRating,
  LeaderboardEntry,
  BattleMode,
  RankTier,
  RANK_TIERS,
} from '../types/slg/multiplayer.types';
import { generateId } from '../utils/helpers';

export class MatchSystem {
  private static instance: MatchSystem;
  
  private players: Map<string, Player> = new Map();
  private ratings: Map<string, PVPRating> = new Map();
  private matchRequests: Map<string, MatchRequest> = new Map();
  private matches: Map<string, Match> = new Map();
  private leaderboard: LeaderboardEntry[] = [];
  
  private matchmakingQueue: MatchRequest[] = [];
  private readonly RATING_RANGE = 500;

  private constructor() {}

  static getInstance(): MatchSystem {
    if (!MatchSystem.instance) {
      MatchSystem.instance = new MatchSystem();
    }
    return MatchSystem.instance;
  }

  registerPlayer(player: Player): void {
    this.players.set(player.id, player);
    if (!this.ratings.has(player.id)) {
      this.ratings.set(player.id, {
        playerId: player.id,
        rating: 1000,
        rank: 0,
        tier: 'bronze',
        stars: 0,
        winStreak: 0,
        maxWinStreak: 0,
        seasonWins: 0,
        seasonLosses: 0,
      });
    }
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  createMatchRequest(playerId: string, mode: BattleMode): MatchRequest | null {
    const player = this.players.get(playerId);
    if (!player) return null;

    const existingRequest = Array.from(this.matchRequests.values())
      .find(r => r.playerId === playerId && r.status === 'searching');
    if (existingRequest) return existingRequest;

    const request: MatchRequest = {
      id: generateId(),
      playerId,
      mode,
      requestedAt: Date.now(),
      status: 'searching',
    };

    this.matchRequests.set(request.id, request);
    this.matchmakingQueue.push(request);
    this.processMatchmaking();
    
    return request;
  }

  cancelMatchRequest(playerId: string): boolean {
    const request = Array.from(this.matchRequests.values())
      .find(r => r.playerId === playerId && r.status === 'searching');
    
    if (!request) return false;

    request.status = 'cancelled';
    this.matchRequests.delete(request.id);
    const queueIndex = this.matchmakingQueue.findIndex(r => r.id === request.id);
    if (queueIndex !== -1) {
      this.matchmakingQueue.splice(queueIndex, 1);
    }
    return true;
  }

  private processMatchmaking(): void {
    while (this.matchmakingQueue.length >= 2) {
      const request1 = this.matchmakingQueue[0];
      const request2 = this.findBestMatch(request1);
      
      if (!request2) break;

      this.matchmakingQueue.splice(0, 2);
      this.matchRequests.delete(request1.id);
      this.matchRequests.delete(request2.id);

      const player1 = this.players.get(request1.playerId);
      const player2 = this.players.get(request2.playerId);
      
      if (!player1 || !player2) continue;

      const match = this.createMatch(request1, request2, player1, player2);
      this.matches.set(match.id, match);
    }
  }

  private findBestMatch(request: MatchRequest): MatchRequest | null {
    const player = this.players.get(request.playerId);
    if (!player) return null;

    const rating = this.ratings.get(request.playerId)?.rating || 1000;
    const minRating = rating - this.RATING_RANGE;
    const maxRating = rating + this.RATING_RANGE;

    let bestMatch: MatchRequest | null = null;
    let bestScore = -Infinity;

    for (const other of this.matchmakingQueue) {
      if (other.id === request.id) continue;
      if (other.mode !== request.mode) continue;

      const otherRating = this.ratings.get(other.playerId)?.rating || 1000;
      if (otherRating < minRating || otherRating > maxRating) continue;

      const score = this.calculateMatchScore(request, other, rating, otherRating);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = other;
      }
    }

    return bestMatch;
  }

  private calculateMatchScore(
    req1: MatchRequest, 
    req2: MatchRequest, 
    rating1: number, 
    rating2: number
  ): number {
    const ratingDiff = Math.abs(rating1 - rating2);
    const timeDiff = Date.now() - Math.min(req1.requestedAt, req2.requestedAt);
    
    let score = 1000 - ratingDiff;
    score += Math.min(timeDiff / 10000, 100);
    
    return score;
  }

  private createMatch(
    req1: MatchRequest, 
    req2: MatchRequest,
    player1: Player,
    player2: Player
  ): Match {
    const match: Match = {
      id: generateId(),
      mode: req1.mode,
      status: 'matched',
      teams: [
        {
          teamId: generateId(),
          players: [player1.id],
          faction: player1.faction,
          power: player1.power,
          averageRating: this.ratings.get(player1.id)?.rating || 1000,
        },
        {
          teamId: generateId(),
          players: [player2.id],
          faction: player2.faction,
          power: player2.power,
          averageRating: this.ratings.get(player2.id)?.rating || 1000,
        },
      ],
      createdAt: Date.now(),
    };

    req1.status = 'matched';
    req2.status = 'matched';

    return match;
  }

  startMatch(matchId: string): boolean {
    const match = this.matches.get(matchId);
    if (!match || match.status !== 'matched') return false;

    match.status = 'battle';
    match.startedAt = Date.now();
    return true;
  }

  completeMatch(matchId: string, winnerTeamId: string): boolean {
    const match = this.matches.get(matchId);
    if (!match || match.status !== 'battle') return false;

    match.status = 'completed';
    match.completedAt = Date.now();
    match.winnerTeamId = winnerTeamId;
    match.duration = match.completedAt - (match.startedAt || match.createdAt);

    const winnerTeam = match.teams.find((t: Match['teams'][0]) => t.teamId === winnerTeamId);
    const loserTeam = match.teams.find((t: Match['teams'][0]) => t.teamId !== winnerTeamId);

    if (winnerTeam) {
      winnerTeam.players.forEach((playerId: string) => {
        this.updateRating(playerId, true);
      });
    }

    if (loserTeam) {
      loserTeam.players.forEach((playerId: string) => {
        this.updateRating(playerId, false);
      });
    }

    this.updateLeaderboard();
    return true;
  }

  private updateRating(playerId: string, isWin: boolean): void {
    const rating = this.ratings.get(playerId);
    if (!rating) return;

    const baseChange = 25;
    const streakBonus = isWin ? Math.min(rating.winStreak * 2, 20) : 0;
    const change = Math.round((baseChange + streakBonus) * (isWin ? 1 : -0.8));

    rating.rating = Math.max(100, rating.rating + change);
    
    if (isWin) {
      rating.winStreak++;
      rating.maxWinStreak = Math.max(rating.maxWinStreak, rating.winStreak);
      rating.seasonWins++;
    } else {
      rating.winStreak = 0;
      rating.seasonLosses++;
    }

    rating.tier = this.calculateTier(rating.rating);
    this.ratings.set(playerId, rating);
  }

  private calculateTier(rating: number): RankTier {
    const tiers = Object.entries(RANK_TIERS) as [RankTier, typeof RANK_TIERS[RankTier]][];
    for (const [tier, info] of tiers) {
      if (rating >= info.minRating && rating <= info.maxRating) {
        return tier;
      }
    }
    return 'legend';
  }

  getRating(playerId: string): PVPRating | undefined {
    return this.ratings.get(playerId);
  }

  getMatch(matchId: string): Match | undefined {
    return this.matches.get(matchId);
  }

  getPlayerMatch(playerId: string): Match | undefined {
    return Array.from(this.matches.values())
      .find((m: Match) => m.teams.some((t: Match['teams'][0]) => t.players.includes(playerId)));
  }

  private updateLeaderboard(): void {
    const entries: LeaderboardEntry[] = [];
    
    this.ratings.forEach((rating: PVPRating, playerId: string) => {
      const player = this.players.get(playerId);
      if (!player) return;

      const totalGames = rating.seasonWins + rating.seasonLosses;
      const winRate = totalGames > 0 ? (rating.seasonWins / totalGames) * 100 : 0;

      entries.push({
        rank: 0,
        playerId,
        playerName: player.name,
        faction: player.faction,
        power: player.power,
        rating: rating.rating,
        tier: rating.tier,
        winRate: Math.round(winRate),
        wins: rating.seasonWins,
      });
    });

    entries.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.rating - a.rating);
    entries.forEach((entry: LeaderboardEntry, index: number) => {
      entry.rank = index + 1;
    });

    this.leaderboard = entries;
  }

  getLeaderboard(page: number = 1, limit: number = 20): LeaderboardEntry[] {
    const start = (page - 1) * limit;
    return this.leaderboard.slice(start, start + limit);
  }

  getPlayerRank(playerId: string): number {
    const entry = this.leaderboard.find((e: LeaderboardEntry) => e.playerId === playerId);
    return entry?.rank || 0;
  }

  getTopPlayers(limit: number = 10): LeaderboardEntry[] {
    return this.leaderboard.slice(0, limit);
  }
}

export const matchSystem = MatchSystem.getInstance();
