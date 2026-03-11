import { ResourceType } from '@/features/resource/logic/ResourceManager';

export enum BuildingType {
  CASTLE = 'Castle',
  WAREHOUSE = 'Warehouse',
  FARM = 'Farm',
  QUARRY = 'Quarry',
  LUMBER_MILL = 'LumberMill',
  MARKET = 'Market',
  BARRACKS = 'Barracks',
}

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  position: { x: number; y: number }; // For scene placement
}

export class BuildingManager {
  private buildings: Map<string, Building>;

  constructor() {
    this.buildings = new Map();
    // Initialize default buildings
    this.addBuilding('castle_1', BuildingType.CASTLE, 1, { x: 400, y: 300 });
    this.addBuilding('farm_1', BuildingType.FARM, 1, { x: 200, y: 400 });
    this.addBuilding('quarry_1', BuildingType.QUARRY, 1, { x: 600, y: 400 });
    this.addBuilding('lumber_1', BuildingType.LUMBER_MILL, 1, { x: 300, y: 500 });
    this.addBuilding('market_1', BuildingType.MARKET, 1, { x: 500, y: 500 });
    this.addBuilding('warehouse_1', BuildingType.WAREHOUSE, 1, { x: 400, y: 400 });
  }

  public addBuilding(id: string, type: BuildingType, level: number, position: { x: number; y: number }) {
    this.buildings.set(id, { id, type, level, position });
  }

  public getBuildings(): Building[] {
    return Array.from(this.buildings.values());
  }

  public getBuilding(id: string): Building | undefined {
    return this.buildings.get(id);
  }

  public upgradeBuilding(id: string): boolean {
    const building = this.buildings.get(id);
    if (building) {
      // Check resources (mock logic for now, should integrate with ResourceManager)
      // For MVP, just upgrade
      building.level++;
      return true;
    }
    return false;
  }

  public calculateProduction(): { [key in ResourceType]: number } {
    const production = {
      [ResourceType.WOOD]: 0,
      [ResourceType.STONE]: 0,
      [ResourceType.FOOD]: 0,
      [ResourceType.COIN]: 0,
    };

    this.buildings.forEach(building => {
      const level = building.level;
      // Base production: Level * 100 per hour
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
          production[ResourceType.COIN] += baseProd / 2; // Coins are harder
          break;
        case BuildingType.CASTLE:
          // Castle gives a small amount of everything
          production[ResourceType.WOOD] += level * 10;
          production[ResourceType.STONE] += level * 10;
          production[ResourceType.FOOD] += level * 10;
          production[ResourceType.COIN] += level * 5;
          break;
      }
    });

    return production;
  }

  public calculateCapacity(): number {
    let capacity = 1000; // Base capacity
    this.buildings.forEach(building => {
      if (building.type === BuildingType.WAREHOUSE) {
        capacity += building.level * 2000;
      } else if (building.type === BuildingType.CASTLE) {
        capacity += building.level * 500;
      }
    });
    return capacity;
  }
}
