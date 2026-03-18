import InventoryManager from '@/features/resource/logic/InventoryManager';
import { TaskState } from '@/features/task/logic/TaskManager';
import { getTaskManager } from '@/features/task/logic/taskSingleton';

export type UINotificationsSnapshot = {
  lootBoxCount: number;
  taskClaimableCount: number;
  mailUnreadCount: number;
  activityCount: number;
};

type Listener = () => void;

class UINotificationsStore {
  private snapshot: UINotificationsSnapshot = {
    lootBoxCount: 0,
    taskClaimableCount: 0,
    mailUnreadCount: 0,
    activityCount: 0,
  };
  private listeners: Set<Listener> = new Set();
  private taskManager = getTaskManager();

  constructor() {
    this.recompute();
    InventoryManager.subscribe(() => this.recompute());
    this.taskManager.subscribe(() => this.recompute());
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): UINotificationsSnapshot {
    return this.snapshot;
  }

  setMailUnreadCount(count: number) {
    const next = Math.max(0, Math.floor(count));
    if (this.snapshot.mailUnreadCount === next) return;
    this.snapshot = { ...this.snapshot, mailUnreadCount: next };
    this.emit();
  }

  setActivityCount(count: number) {
    const next = Math.max(0, Math.floor(count));
    if (this.snapshot.activityCount === next) return;
    this.snapshot = { ...this.snapshot, activityCount: next };
    this.emit();
  }

  private recompute() {
    const items = InventoryManager.getItems();
    const lootBoxCount = items
      .filter((i) => i.item.type === 'box')
      .reduce((sum, i) => sum + i.quantity, 0);
    const tasks = this.taskManager.getTasks();
    const taskClaimableCount = tasks.filter((t) => t.state === TaskState.COMPLETED).length;
    const next: UINotificationsSnapshot = {
      lootBoxCount,
      taskClaimableCount,
      mailUnreadCount: this.snapshot.mailUnreadCount,
      activityCount: this.snapshot.activityCount,
    };
    if (
      next.lootBoxCount === this.snapshot.lootBoxCount &&
      next.taskClaimableCount === this.snapshot.taskClaimableCount &&
      next.mailUnreadCount === this.snapshot.mailUnreadCount &&
      next.activityCount === this.snapshot.activityCount
    ) {
      return;
    }
    this.snapshot = next;
    this.emit();
  }
}

export const UINotifications = new UINotificationsStore();
