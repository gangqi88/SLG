import { WorldMap } from '@/features/alliance/logic/WorldMap';

export class TestOnlyWorldMap {
  static ensureMigrated() {
    (WorldMap as unknown as { load: () => void }).load();
  }
}

