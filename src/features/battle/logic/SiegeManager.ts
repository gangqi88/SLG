export enum SiegePhase {
  None = 'None',
  Declaration = 'Declaration',
  Attack = 'Attack',
}

export class SiegeManager {
  private debugTime: Date | null = null;

  constructor() {}

  public setDebugTime(hour: number) {
    const now = new Date();
    now.setHours(hour, 30, 0, 0); // Set to hour:30 to be safely inside the hour
    this.debugTime = now;
  }

  public clearDebugTime() {
    this.debugTime = null;
  }

  public getCurrentTime(): Date {
    return this.debugTime || new Date();
  }

  public getCurrentPhase(): SiegePhase {
    const now = this.getCurrentTime();
    const hour = now.getHours();

    // 12:00 - 13:00 Declaration
    if (hour >= 12 && hour < 13) {
      return SiegePhase.Declaration;
    }

    // 20:00 - 21:00 Attack
    if (hour >= 20 && hour < 21) {
      return SiegePhase.Attack;
    }

    return SiegePhase.None;
  }
}
