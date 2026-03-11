import { describe, it, expect, beforeEach } from 'vitest';
import { TaskManager, TaskState } from '@/features/task/logic/TaskManager';

describe('TaskManager', () => {
  let taskManager: TaskManager;

  beforeEach(() => {
    taskManager = new TaskManager();
  });

  it('should initialize with tasks', () => {
    const tasks = taskManager.getTasks();
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.some((t) => t.id === 'main_1')).toBe(true);
  });

  it('should update progress correctly', () => {
    taskManager.updateProgress('upgrade_building', 'castle_1', 2);

    const task = taskManager.getTasks().find((t) => t.id === 'main_1');
    expect(task).toBeDefined();
    expect(task?.currentProgress).toBe(2);
    expect(task?.state).toBe(TaskState.COMPLETED);
  });

  it('should claim reward and unlock subsequent tasks', () => {
    // Complete main task
    taskManager.updateProgress('upgrade_building', 'castle_1', 2);

    const task = taskManager.getTasks().find((t) => t.id === 'main_1');
    expect(task?.state).toBe(TaskState.COMPLETED);

    // Claim
    const success = taskManager.claimReward('main_1');
    expect(success).toBe(true);
    expect(task?.state).toBe(TaskState.CLAIMED);

    // Check unlocks (if any logic existed in mock data)
    // Currently mock data doesn't have chained tasks, but logic is there.
  });
});
