export enum ResourceType {
  WOOD = 'wood',
  STONE = 'stone',
  FOOD = 'food',
  COIN = 'coin',
}

export interface Resources {
  [ResourceType.WOOD]: number;
  [ResourceType.STONE]: number;
  [ResourceType.FOOD]: number;
  [ResourceType.COIN]: number;
}

export interface ResourceProduction {
  [ResourceType.WOOD]: number; // per hour
  [ResourceType.STONE]: number;
  [ResourceType.FOOD]: number;
  [ResourceType.COIN]: number;
}

export class ResourceManager {
  private resources: Resources;
  private production: ResourceProduction;
  private capacity: number; // Max storage for each resource (simplified)

  constructor() {
    this.resources = {
      [ResourceType.WOOD]: 1000,
      [ResourceType.STONE]: 1000,
      [ResourceType.FOOD]: 1000,
      [ResourceType.COIN]: 500,
    };

    this.production = {
      [ResourceType.WOOD]: 0,
      [ResourceType.STONE]: 0,
      [ResourceType.FOOD]: 0,
      [ResourceType.COIN]: 0,
    };

    this.capacity = 10000;
  }

  public update(deltaTime: number) {
    // deltaTime in seconds
    // Production is per hour, so per second is / 3600
    const factor = deltaTime / 3600;

    Object.values(ResourceType).forEach((type) => {
      const prod = this.production[type];
      if (prod > 0) {
        this.addResource(type, prod * factor);
      }
    });
  }

  public addResource(type: ResourceType, amount: number) {
    this.resources[type] = Math.min(this.capacity, this.resources[type] + amount);
  }

  public consumeResource(type: ResourceType, amount: number): boolean {
    if (this.resources[type] >= amount) {
      this.resources[type] -= amount;
      return true;
    }
    return false;
  }

  public getResource(type: ResourceType): number {
    return Math.floor(this.resources[type]);
  }

  public setProduction(type: ResourceType, amount: number) {
    this.production[type] = amount;
  }

  public getProduction(type: ResourceType): number {
    return this.production[type];
  }

  public setCapacity(amount: number) {
    this.capacity = amount;
  }

  public getCapacity(): number {
    return this.capacity;
  }
}
