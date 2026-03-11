import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ResourceType } from '@/features/resource/logic/ResourceManager';
import { BuildingType, Building } from '@/features/city/logic/BuildingManager';

// Define the state interface
export interface CityState {
  resources: Record<ResourceType, number>;
  production: Record<ResourceType, number>;
  capacity: number;
  buildings: Building[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

// Initial state mirroring CityManager
const initialState: CityState = {
  resources: {
    [ResourceType.WOOD]: 1000,
    [ResourceType.STONE]: 1000,
    [ResourceType.FOOD]: 1000,
    [ResourceType.COIN]: 500,
  },
  production: {
    [ResourceType.WOOD]: 0,
    [ResourceType.STONE]: 0,
    [ResourceType.FOOD]: 0,
    [ResourceType.COIN]: 0,
  },
  capacity: 10000,
  buildings: [
    { id: 'castle_1', type: BuildingType.CASTLE, level: 1, position: { x: 400, y: 300 } },
    { id: 'farm_1', type: BuildingType.FARM, level: 1, position: { x: 200, y: 400 } },
    { id: 'quarry_1', type: BuildingType.QUARRY, level: 1, position: { x: 600, y: 400 } },
    { id: 'lumber_1', type: BuildingType.LUMBER_MILL, level: 1, position: { x: 300, y: 500 } },
    { id: 'market_1', type: BuildingType.MARKET, level: 1, position: { x: 500, y: 500 } },
    { id: 'warehouse_1', type: BuildingType.WAREHOUSE, level: 1, position: { x: 400, y: 400 } },
  ],
  status: 'idle',
  error: null,
};

// Helper functions for logic
const calculateProduction = (buildings: Building[]): Record<ResourceType, number> => {
  const production = {
    [ResourceType.WOOD]: 0,
    [ResourceType.STONE]: 0,
    [ResourceType.FOOD]: 0,
    [ResourceType.COIN]: 0,
  };

  buildings.forEach((building) => {
    const level = building.level;
    const baseProd = level * 100;

    switch (building.type) {
      case BuildingType.FARM:
        production[ResourceType.FOOD] += baseProd;
        break;
      case BuildingType.QUARRY:
        production[ResourceType.STONE] += baseProd;
        break;
      case BuildingType.LUMBER_MILL:
        production[ResourceType.WOOD] += baseProd;
        break;
      case BuildingType.MARKET:
        production[ResourceType.COIN] += baseProd / 2;
        break;
      case BuildingType.CASTLE:
        production[ResourceType.WOOD] += level * 10;
        production[ResourceType.STONE] += level * 10;
        production[ResourceType.FOOD] += level * 10;
        production[ResourceType.COIN] += level * 5;
        break;
    }
  });

  return production;
};

const calculateCapacity = (buildings: Building[]): number => {
  let capacity = 1000;
  buildings.forEach((building) => {
    if (building.type === BuildingType.WAREHOUSE) {
      capacity += building.level * 2000;
    } else if (building.type === BuildingType.CASTLE) {
      capacity += building.level * 500;
    }
  });
  return capacity;
};

// Async thunk for upgrading a building
export const upgradeBuilding = createAsyncThunk(
  'city/upgradeBuilding',
  async (buildingId: string, { getState, rejectWithValue }) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const state = (getState() as { city: CityState }).city;
    const building = state.buildings.find((b) => b.id === buildingId);

    if (!building) {
      return rejectWithValue('Building not found');
    }

    // Cost logic: Level * 100 Wood/Stone (from CityManager)
    const cost = building.level * 100;

    if (state.resources[ResourceType.WOOD] < cost || state.resources[ResourceType.STONE] < cost) {
      return rejectWithValue('Not enough resources');
    }

    return {
      buildingId,
      cost,
    };
  },
);

const citySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {
    // Reducer to handle periodic updates (game loop)
    tickResources: (state, action: PayloadAction<number>) => {
      const deltaTime = action.payload; // in seconds
      const factor = deltaTime / 3600; // production is per hour

      Object.values(ResourceType).forEach((type) => {
        const prod = state.production[type as ResourceType];
        if (prod > 0) {
          state.resources[type as ResourceType] = Math.min(
            state.capacity,
            state.resources[type as ResourceType] + prod * factor,
          );
        }
      });
    },
    updateProduction: (state, action: PayloadAction<Record<ResourceType, number>>) => {
      state.production = action.payload;
    },
    updateCapacity: (state, action: PayloadAction<number>) => {
      state.capacity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(upgradeBuilding.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(upgradeBuilding.fulfilled, (state, action) => {
        state.status = 'idle';
        const { buildingId, cost } = action.payload;

        // Consume resources
        state.resources[ResourceType.WOOD] -= cost;
        state.resources[ResourceType.STONE] -= cost;

        // Upgrade building
        const building = state.buildings.find((b) => b.id === buildingId);
        if (building) {
          building.level += 1;
        }

        // Recalculate production and capacity
        // Note: casting to any to avoid Draft type issues with helper functions
        state.production = calculateProduction(state.buildings as Building[]);
        state.capacity = calculateCapacity(state.buildings as Building[]);
      })
      .addCase(upgradeBuilding.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { tickResources, updateProduction, updateCapacity } = citySlice.actions;
export default citySlice.reducer;
