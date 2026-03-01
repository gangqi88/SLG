import {
  Alliance,
  AllianceMember,
  AllianceApplication,
  AllianceRole,
  AllianceBuildingType,
  ALLIANCE_CONSTANTS,
} from '../types/slg/multiplayer.types';
import { generateId } from '../utils/helpers';

export class AllianceSystem {
  private static instance: AllianceSystem;
  
  private alliances: Map<string, Alliance> = new Map();
  private applications: Map<string, AllianceApplication[]> = new Map();
  private playerAlliance: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): AllianceSystem {
    if (!AllianceSystem.instance) {
      AllianceSystem.instance = new AllianceSystem();
    }
    return AllianceSystem.instance;
  }

  createAlliance(
    name: string, 
    tag: string, 
    leaderId: string, 
    leaderName: string,
    faction: string
  ): Alliance | null {
    if (name.length < ALLIANCE_CONSTANTS.MIN_NAME_LENGTH || 
        name.length > ALLIANCE_CONSTANTS.MAX_NAME_LENGTH) {
      return null;
    }

    if (tag.length < ALLIANCE_CONSTANTS.MIN_TAG_LENGTH || 
        tag.length > ALLIANCE_CONSTANTS.MAX_TAG_LENGTH) {
      return null;
    }

    if (this.playerAlliance.has(leaderId)) {
      return null;
    }

    const alliance: Alliance = {
      id: generateId(),
      name,
      tag,
      leaderId,
      members: [
        {
          playerId: leaderId,
          playerName: leaderName,
          role: 'leader',
          contribution: 0,
          weeklyContribution: 0,
          joinTime: Date.now(),
          lastActiveTime: Date.now(),
        },
      ],
      level: 1,
      exp: 0,
      notice: '欢迎加入联盟！',
      faction,
      createdAt: Date.now(),
      totalPower: 0,
      memberLimit: ALLIANCE_CONSTANTS.MAX_MEMBERS,
    };

    this.alliances.set(alliance.id, alliance);
    this.playerAlliance.set(leaderId, alliance.id);
    this.applications.set(alliance.id, []);

    return alliance;
  }

  getAlliance(allianceId: string): Alliance | undefined {
    return this.alliances.get(allianceId);
  }

  getAllianceByTag(tag: string): Alliance | undefined {
    return Array.from(this.alliances.values())
      .find(a => a.tag.toLowerCase() === tag.toLowerCase());
  }

  getPlayerAlliance(playerId: string): Alliance | undefined {
    const allianceId = this.playerAlliance.get(playerId);
    return allianceId ? this.alliances.get(allianceId) : undefined;
  }

  applyToAlliance(playerId: string, playerName: string, power: number, allianceId: string, message?: string): boolean {
    const alliance = this.alliances.get(allianceId);
    if (!alliance) return false;

    if (this.playerAlliance.has(playerId)) return false;

    const applications = this.applications.get(allianceId) || [];
    if (applications.some(a => a.playerId === playerId && a.status === 'pending')) {
      return false;
    }

    const application: AllianceApplication = {
      id: generateId(),
      playerId,
      playerName,
      power,
      message,
      appliedAt: Date.now(),
      status: 'pending',
    };

    applications.push(application);
    this.applications.set(allianceId, applications);
    return true;
  }

  handleApplication(allianceId: string, applicationId: string, accepted: boolean): boolean {
    const applications = this.applications.get(allianceId);
    if (!applications) return false;

    const application = applications.find(a => a.id === applicationId);
    if (!application || application.status !== 'pending') return false;

    if (accepted) {
      const alliance = this.alliances.get(allianceId);
      if (!alliance || alliance.members.length >= alliance.memberLimit) {
        application.status = 'rejected';
        return false;
      }

      const member: AllianceMember = {
        playerId: application.playerId,
        playerName: application.playerName,
        role: 'member',
        contribution: 0,
        weeklyContribution: 0,
        joinTime: Date.now(),
        lastActiveTime: Date.now(),
      };

      alliance.members.push(member);
      this.playerAlliance.set(application.playerId, allianceId);
      application.status = 'accepted';
    } else {
      application.status = 'rejected';
    }

    return true;
  }

  leaveAlliance(playerId: string): boolean {
    const allianceId = this.playerAlliance.get(playerId);
    if (!allianceId) return false;

    const alliance = this.alliances.get(allianceId);
    if (!alliance) return false;

    if (alliance.leaderId === playerId) {
      return false;
    }

    alliance.members = alliance.members.filter(m => m.playerId !== playerId);
    this.playerAlliance.delete(playerId);
    return true;
  }

  kickMember(allianceId: string, leaderId: string, targetPlayerId: string): boolean {
    const alliance = this.alliances.get(allianceId);
    if (!alliance || alliance.leaderId !== leaderId) return false;

    const targetMember = alliance.members.find(m => m.playerId === targetPlayerId);
    if (!targetMember || targetMember.role === 'leader') return false;

    alliance.members = alliance.members.filter(m => m.playerId !== targetPlayerId);
    this.playerAlliance.delete(targetPlayerId);
    return true;
  }

  setMemberRole(allianceId: string, leaderId: string, targetPlayerId: string, role: AllianceRole): boolean {
    const alliance = this.alliances.get(allianceId);
    if (!alliance || alliance.leaderId !== leaderId) return false;

    const member = alliance.members.find(m => m.playerId === targetPlayerId);
    if (!member) return false;

    member.role = role;
    return true;
  }

  updateNotice(allianceId: string, playerId: string, notice: string): boolean {
    const alliance = this.alliances.get(allianceId);
    if (!alliance) return false;

    const member = alliance.members.find(m => m.playerId === playerId);
    if (!member) return false;

    if (member.role !== 'leader' && member.role !== 'vice_leader') {
      return false;
    }

    alliance.notice = notice;
    return true;
  }

  contribute(allianceId: string, playerId: string, amount: number): boolean {
    const alliance = this.alliances.get(allianceId);
    if (!alliance) return false;

    const member = alliance.members.find(m => m.playerId === playerId);
    if (!member) return false;

    member.contribution += amount;
    member.weeklyContribution += amount;
    alliance.exp += amount;
    alliance.totalPower += amount;

    return true;
  }

  getApplications(allianceId: string): AllianceApplication[] {
    return this.applications.get(allianceId) || [];
  }

  searchAlliances(keyword: string, page: number = 1, limit: number = 10): Alliance[] {
    const all = Array.from(this.alliances.values());
    
    const filtered = keyword 
      ? all.filter(a => a.name.includes(keyword) || a.tag.includes(keyword))
      : all;

    filtered.sort((a, b) => b.totalPower - a.totalPower);
    
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }

  upgradeBuilding(allianceId: string, _buildingType: AllianceBuildingType): boolean {
    const alliance = this.alliances.get(allianceId);
    if (!alliance) return false;

    return true;
  }

  getAllianceLeaderboard(): { rank: number; alliance: Alliance }[] {
    const all = Array.from(this.alliances.values());
    all.sort((a, b) => b.totalPower - a.totalPower);
    
    return all.map((alliance, index) => ({
      rank: index + 1,
      alliance,
    }));
  }
}

export const allianceSystem = AllianceSystem.getInstance();
