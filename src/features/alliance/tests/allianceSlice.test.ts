import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import allianceReducer, {
  createAlliance,
  joinAlliance,
  setPlayerInfo,
} from '../model/allianceSlice';
import { AllianceRole } from '../types/Alliance';

describe('allianceSlice', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        alliance: allianceReducer,
      },
    });
  });

  it('should handle initial state', () => {
    const state = store.getState().alliance;
    expect(state.currentAlliance).toBeNull();
    expect(state.members).toHaveLength(0);
    expect(state.playerId).toBeDefined();
  });

  it('should handle setPlayerInfo', () => {
    store.dispatch(setPlayerInfo({ id: 'test_id', name: 'Test Player' }));
    const state = store.getState().alliance;
    expect(state.playerId).toBe('test_id');
    expect(state.playerName).toBe('Test Player');
  });

  it('should handle createAlliance success', async () => {
    const allianceName = 'Test Alliance';
    await store.dispatch(createAlliance(allianceName));

    const state = store.getState().alliance;
    expect(state.currentAlliance).not.toBeNull();
    expect(state.currentAlliance?.name).toBe(allianceName);
    expect(state.playerRole).toBe(AllianceRole.LEADER);
    expect(state.members).toHaveLength(1);
    expect(state.members[0].role).toBe(AllianceRole.LEADER);
  });

  it('should reject createAlliance if already in alliance', async () => {
    // First create one
    await store.dispatch(createAlliance('Alliance 1'));

    // Try to create another
    const result = await store.dispatch(createAlliance('Alliance 2'));
    expect(result.type).toBe('alliance/createAlliance/rejected');
    expect(result.payload).toBe('Player already has an alliance');
  });

  it('should handle joinAlliance success', async () => {
    const allianceId = 'target_alliance_id';
    await store.dispatch(joinAlliance(allianceId));

    const state = store.getState().alliance;
    expect(state.applications).toHaveLength(1);
    expect(state.applications[0].allianceId).toBe(allianceId);
    expect(state.applications[0].status).toBe('pending');
  });

  it('should reject joinAlliance if already in alliance', async () => {
    // First create one (which puts player in alliance)
    await store.dispatch(createAlliance('My Alliance'));

    // Try to join another
    const result = await store.dispatch(joinAlliance('other_alliance'));
    expect(result.type).toBe('alliance/joinAlliance/rejected');
    expect(result.payload).toBe('Player already has an alliance');
  });
});
