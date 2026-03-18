import { TaskManager } from './TaskManager';

type TaskWindow = Window & { _taskManager?: TaskManager };

export const getTaskManager = () => {
  const globalWindow = window as TaskWindow;
  if (!globalWindow._taskManager) {
    globalWindow._taskManager = new TaskManager();
  }
  return globalWindow._taskManager;
};

