import { Hero } from '@/features/hero/types/Hero';

export enum TaskType {
  MAIN = 'Main',
  SIDE = 'Side',
  DAILY = 'Daily',
  ACHIEVEMENT = 'Achievement',
}

export enum TaskState {
  LOCKED = 'Locked',
  UNLOCKED = 'Unlocked',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
  CLAIMED = 'Claimed',
}

export interface TaskReward {
  type: 'resource' | 'item' | 'hero';
  id: string; // e.g., 'wood', 'diamond', 'hero_123'
  amount: number;
}

export interface Task {
  id: string;
  type: TaskType;
  name: string;
  description: string;
  target: {
    type: string; // e.g., 'upgrade_building', 'kill_monster'
    targetId?: string; // e.g., 'castle'
    count: number;
  };
  currentProgress: number;
  rewards: TaskReward[];
  preRequisiteTaskId?: string; // ID of task that must be claimed to unlock this
  state: TaskState;
}

export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private listeners: ((tasks: Task[]) => void)[] = [];

  constructor() {
    this.initTasks();
  }

  private initTasks() {
    // Mock data
    const tasks: Task[] = [
      {
        id: 'main_1',
        type: TaskType.MAIN,
        name: '建设城堡',
        description: '将城堡升级到等级 2',
        target: { type: 'upgrade_building', targetId: 'castle_1', count: 2 },
        currentProgress: 1, // Assume level 1
        rewards: [
          { type: 'resource', id: 'wood', amount: 1000 },
          { type: 'resource', id: 'diamond', amount: 100 },
        ],
        state: TaskState.IN_PROGRESS,
      },
      {
        id: 'daily_1',
        type: TaskType.DAILY,
        name: '每日战斗',
        description: '完成 1 次战斗',
        target: { type: 'battle_count', count: 1 },
        currentProgress: 0,
        rewards: [{ type: 'resource', id: 'coin', amount: 500 }],
        state: TaskState.IN_PROGRESS,
      },
      {
        id: 'ach_1',
        type: TaskType.ACHIEVEMENT,
        name: '初出茅庐',
        description: '获得 3 个英雄',
        target: { type: 'own_hero_count', count: 3 },
        currentProgress: 0,
        rewards: [{ type: 'resource', id: 'diamond', amount: 500 }],
        state: TaskState.IN_PROGRESS,
      },
    ];

    tasks.forEach((t) => this.tasks.set(t.id, t));
  }

  public getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  public updateProgress(type: string, targetId: string | undefined, amount: number = 1) {
    let changed = false;
    this.tasks.forEach((task) => {
      if (task.state === TaskState.IN_PROGRESS) {
        if (task.target.type === type) {
          if (!task.target.targetId || task.target.targetId === targetId) {
            // For 'count' type targets, usually we increment.
            // For 'level' type (like upgrade), we set value.
            // Simplified logic here: assume everything is "reach X amount/level" or "accumulate X count"
            // Actually, let's just increment for battle_count, and set for upgrade_building if provided amount is absolute level.

            if (type === 'upgrade_building') {
              task.currentProgress = Math.max(task.currentProgress, amount);
            } else {
              task.currentProgress += amount;
            }

            if (task.currentProgress >= task.target.count) {
              task.state = TaskState.COMPLETED;
              changed = true;
            } else {
              changed = true;
            }
          }
        }
      }
    });

    if (changed) this.notifyListeners();
  }

  public claimReward(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (task && task.state === TaskState.COMPLETED) {
      task.state = TaskState.CLAIMED;

      // Unlock next tasks
      this.tasks.forEach((t) => {
        if (t.preRequisiteTaskId === taskId && t.state === TaskState.LOCKED) {
          t.state = TaskState.UNLOCKED; // Or directly IN_PROGRESS if auto-accept
          // Simplified:
          t.state = TaskState.IN_PROGRESS;
        }
      });

      this.notifyListeners();
      return true;
    }
    return false;
  }

  public subscribe(callback: (tasks: Task[]) => void) {
    this.listeners.push(callback);
    callback(this.getTasks());
  }

  public unsubscribe(callback: (tasks: Task[]) => void) {
    this.listeners = this.listeners.filter((l) => l !== callback);
  }

  private notifyListeners() {
    const tasks = this.getTasks();
    this.listeners.forEach((l) => l(tasks));
  }
}
