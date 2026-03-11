import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import {
  AllianceState,
  Alliance,
  AllianceMember,
  AllianceRole,
  AllianceApplication,
  ShopItem,
  DEFAULT_SHOP_ITEMS,
} from '../types/Alliance';

import { getMaxMembers } from '../config/alliance';

interface ExtendedAllianceState extends AllianceState {
  playerId: string;

  playerName: string;
}

// Initial state logic from AllianceManager.ts

const getInitialState = (): ExtendedAllianceState => {
  const shopItems: ShopItem[] = DEFAULT_SHOP_ITEMS.map((item) => ({
    ...item,

    soldThisWeek: 0,
  }));

  return {
    currentAlliance: null,

    playerAllianceId: null,

    playerRole: null,

    members: [],

    chatMessages: [],

    tradeRequests: [],

    shopItems,

    pendingBids: [],

    activeWar: null,

    applications: [],

    playerContribution: 0,

    playerLastCheckIn: 0,

    checkInStreak: 0,

    playerId: `player_${Date.now()}`,

    playerName: 'Player',
  };
};

const initialState: ExtendedAllianceState = getInitialState();

// Async Thunks

export const createAlliance = createAsyncThunk(
  'alliance/createAlliance',

  async (name: string, { getState, rejectWithValue }) => {
    const state = (getState() as { alliance: ExtendedAllianceState }).alliance;

    if (state.currentAlliance) {
      return rejectWithValue('Player already has an alliance');
    }

    const { playerId, playerName } = state;

    // Wait for a bit to simulate network

    await new Promise((resolve) => setTimeout(resolve, 500));

    const alliance: Alliance = {
      id: `alliance_${Date.now()}`,

      name,

      level: 1,

      announcement: 'Welcome to our alliance!',

      leaderId: playerId,

      memberCount: 1,

      maxMembers: getMaxMembers(1),

      createdAt: Date.now(),

      adSpace: null,

      techLevel: {},

      requiredContribution: 0,
    };

    const leaderMember: AllianceMember = {
      id: playerId,

      address: playerId,

      name: playerName,

      role: AllianceRole.LEADER,

      contribution: 0,

      lastCheckIn: 0,

      joinedAt: Date.now(),

      weeklyContribution: 0,

      contributionHistory: [],
    };

    return { alliance, leaderMember };
  },
);

export const joinAlliance = createAsyncThunk(
  'alliance/joinAlliance',

  async (allianceId: string, { getState, rejectWithValue }) => {
    const state = (getState() as { alliance: ExtendedAllianceState }).alliance;

    if (state.currentAlliance) {
      return rejectWithValue('Player already has an alliance');
    }

    const { playerId, playerName } = state;

    await new Promise((resolve) => setTimeout(resolve, 500));

    const application: AllianceApplication = {
      id: `app_${Date.now()}`,

      playerId,

      playerName,

      allianceId,

      status: 'pending',

      createdAt: Date.now(),
    };

    return application;
  },
);

const allianceSlice = createSlice({
  name: 'alliance',

  initialState,

  reducers: {
    setPlayerInfo: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.playerId = action.payload.id;

      state.playerName = action.payload.name;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(createAlliance.fulfilled, (state, action) => {
        const { alliance, leaderMember } = action.payload;

        state.currentAlliance = alliance;

        state.playerAllianceId = alliance.id;

        state.playerRole = AllianceRole.LEADER;

        state.members = [leaderMember];
      })

      .addCase(joinAlliance.fulfilled, (state, action) => {
        state.applications.push(action.payload);
      });
  },
});

export const { setPlayerInfo } = allianceSlice.actions;

export default allianceSlice.reducer;
