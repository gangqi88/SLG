import { ResourceManager, ResourceType } from './ResourceManager';
import { BuildingManager } from './BuildingManager';
import { Hero } from '../../types/Hero';

export class CityManager {
  public resourceManager: ResourceManager;
  public buildingManager: BuildingManager;
  private ownedHeroes: Hero[];

  constructor(ownedHeroes: Hero[]) {
    this.resourceManager = new ResourceManager();
    this.buildingManager = new BuildingManager();
    this.ownedHeroes = ownedHeroes;
    
    // Initial calculation
    this.recalculateProduction();
    this.recalculateCapacity();
  }

  public update(deltaTime: number) {
    this.resourceManager.update(deltaTime);
  }

  public upgradeBuilding(buildingId: string): boolean {
    const building = this.buildingManager.getBuilding(buildingId);
    if (!building) return false;

    // Simple cost logic: Level * 100 Wood/Stone
    const cost = building.level * 100;
    
    // Check resources
    if (this.resourceManager.getResource(ResourceType.WOOD) >= cost && 
        this.resourceManager.getResource(ResourceType.STONE) >= cost) {
      
      if (this.resourceManager.consumeResource(ResourceType.WOOD, cost) && 
          this.resourceManager.consumeResource(ResourceType.STONE, cost)) {
        
        if (this.buildingManager.upgradeBuilding(buildingId)) {
          this.recalculateProduction();
          this.recalculateCapacity();
          return true;
        }
      }
    }
    return false;
  }

  private recalculateProduction() {
    const baseProduction = this.buildingManager.calculateProduction();
    
    // Apply Hero Bonuses
    let woodBonus = 0;
    let stoneBonus = 0;
    let foodBonus = 0;
    let coinBonus = 0;

    this.ownedHeroes.forEach(hero => {
      // Check Talents
      if (hero.talent) {
        if (hero.talent.description.includes('全资源产量')) {
          const match = hero.talent.description.match(/全资源产量\+(\d+)%/);
          if (match) {
            const val = parseInt(match[1]) / 100;
            woodBonus += val;
            stoneBonus += val;
            foodBonus += val;
            coinBonus += val;
          }
        }
        if (hero.talent.description.includes('粮食') && hero.talent.description.includes('+')) {
           const match = hero.talent.description.match(/粮食\+(\d+)%/);
           if (match) foodBonus += parseInt(match[1]) / 100;
        }
        if (hero.talent.description.includes('铜币') && hero.talent.description.includes('+')) {
           const match = hero.talent.description.match(/铜币\+(\d+)%/);
           if (match) coinBonus += parseInt(match[1]) / 100;
        }
      }

      // Check Passive Skills
      if (hero.passiveSkill) {
        if (hero.passiveSkill.description.includes('资源产量')) {
           const match = hero.passiveSkill.description.match(/资源产量.*?\+(\d+)%/);
           if (match) {
             const val = parseInt(match[1]) / 100;
             woodBonus += val;
             stoneBonus += val;
             foodBonus += val;
             coinBonus += val;
           }
        }
        if (hero.passiveSkill.description.includes('铜币产量')) {
           const match = hero.passiveSkill.description.match(/铜币产量\+(\d+)%/);
           if (match) coinBonus += parseInt(match[1]) / 100;
        }
      }
    });

    // Set final production
    this.resourceManager.setProduction(ResourceType.WOOD, baseProduction[ResourceType.WOOD] * (1 + woodBonus));
    this.resourceManager.setProduction(ResourceType.STONE, baseProduction[ResourceType.STONE] * (1 + stoneBonus));
    this.resourceManager.setProduction(ResourceType.FOOD, baseProduction[ResourceType.FOOD] * (1 + foodBonus));
    this.resourceManager.setProduction(ResourceType.COIN, baseProduction[ResourceType.COIN] * (1 + coinBonus));
  }

  private recalculateCapacity() {
    const capacity = this.buildingManager.calculateCapacity();
    this.resourceManager.setCapacity(capacity);
  }
}
