import { InventoryItem, LootBox, ITEMS_DB } from '../../types/LootBox';

class InventoryManager {
  private static instance: InventoryManager;
  private items: Map<string, number> = new Map();
  private listeners: (() => void)[] = [];

  private constructor() {
    this.load();
  }

  public static getInstance(): InventoryManager {
    if (!InventoryManager.instance) {
      InventoryManager.instance = new InventoryManager();
    }
    return InventoryManager.instance;
  }

  private load() {
    if (typeof localStorage === 'undefined') return;
    const saved = localStorage.getItem('slg_inventory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.items = new Map(Object.entries(parsed));
      } catch (e) {
        console.error('Failed to load inventory', e);
        this.items = new Map();
      }
    }
  }

  private save() {
    if (typeof localStorage !== 'undefined') {
      const obj = Object.fromEntries(this.items);
      localStorage.setItem('slg_inventory', JSON.stringify(obj));
    }
    this.notifyListeners();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }

  public addItem(itemId: string, quantity: number) {
    if (!ITEMS_DB[itemId]) {
      console.warn(`Item ${itemId} not found in DB`);
      return;
    }
    const current = this.items.get(itemId) || 0;
    this.items.set(itemId, current + quantity);
    this.save();
    console.log(`Added ${quantity} x ${ITEMS_DB[itemId].name}`);
  }

  public removeItem(itemId: string, quantity: number): boolean {
    const current = this.items.get(itemId) || 0;
    if (current < quantity) return false;
    
    const newValue = current - quantity;
    if (newValue === 0) {
      this.items.delete(itemId);
    } else {
      this.items.set(itemId, newValue);
    }
    this.save();
    return true;
  }

  public getItems(): InventoryItem[] {
    const result: InventoryItem[] = [];
    this.items.forEach((qty, id) => {
      const itemDef = ITEMS_DB[id];
      if (itemDef) {
        result.push({ item: itemDef, quantity: qty });
      }
    });
    return result;
  }

  public openBox(boxId: string): { item: InventoryItem, dropped: boolean }[] | null {
    const box = ITEMS_DB[boxId] as LootBox;
    if (!box || box.type !== 'box') return null;

    if (!this.removeItem(boxId, 1)) return null;

    // Logic for drop table
    // For now, let's pick ONE item based on weight.
    // Or maybe multiple? Usually lootboxes drop 1-3 items.
    // Let's implement: Pick 1 item from the table based on weights.
    
    const totalWeight = box.dropTable.reduce((sum, drop) => sum + drop.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedDrop = null;
    for (const drop of box.dropTable) {
      random -= drop.weight;
      if (random <= 0) {
        selectedDrop = drop;
        break;
      }
    }

    if (!selectedDrop) {
        // Fallback to first item if something goes wrong with float precision
        selectedDrop = box.dropTable[0];
    }

    const qty = Math.floor(Math.random() * (selectedDrop.maxQuantity - selectedDrop.minQuantity + 1)) + selectedDrop.minQuantity;
    this.addItem(selectedDrop.itemId, qty);

    return [{ 
        item: { item: ITEMS_DB[selectedDrop.itemId], quantity: qty },
        dropped: true
    }];
  }
}

export default InventoryManager.getInstance();
