import React, { useMemo, useState, useEffect } from 'react';
import { TaskManager, Task } from '@/features/task/logic/TaskManager';
import { getTaskManager } from '@/features/task/logic/taskSingleton';
import { useModal } from '@/shared/components/ModalProvider';
import { applyRewards, formatRewardLines } from '@/shared/logic/rewards';

const TaskView: React.FC = () => {
  const modal = useModal();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [manager] = useState<TaskManager>(() => getTaskManager());

  useEffect(() => {
    manager.subscribe(setTasks);
    return () => manager.unsubscribe(setTasks);
  }, [manager]);

  const taskById = useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach((t) => map.set(t.id, t));
    return map;
  }, [tasks]);

  const handleClaim = (taskId: string) => {
    const task = taskById.get(taskId);
    manager.claimReward(taskId);
    if (task) {
      applyRewards(task.rewards);
      const lines = formatRewardLines(task.rewards);
      modal.openModal({
        title: '获得奖励',
        content: (
          <div>
            <div style={{ color: 'var(--game-text-muted)', marginBottom: 10 }}>{task.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {lines.map((l, idx) => (
                <div key={`${l.label}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{l.label}</span>
                  <span style={{ fontFamily: 'var(--game-font-mono)', color: 'var(--game-title)' }}>
                    +{l.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }
  };

  const handleSimulateProgress = () => {
    manager.updateProgress('upgrade_building', 'castle_1', 2);
    manager.updateProgress('battle_count', undefined, 1);
  };

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>任务系统</h2>
        <button onClick={handleSimulateProgress} style={{ fontSize: '0.8em', padding: '5px' }}>
          模拟完成任务
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              backgroundColor: '#333',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #555',
              opacity: task.state === 'Locked' ? 0.5 : 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa', fontSize: '0.8em' }}>
                [{task.type}] {task.state}
              </span>
              <span style={{ color: '#aaa', fontSize: '0.8em' }}>
                进度: {task.currentProgress}/{task.target.count}
              </span>
            </div>
            <h3 style={{ margin: '5px 0' }}>{task.name}</h3>
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#ccc' }}>{task.description}</p>

            <div
              style={{
                marginTop: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '0.8em', color: '#ffd700' }}>
                奖励: {task.rewards.map((r) => `${r.amount} ${r.id}`).join(', ')}
              </div>

              {task.state === 'Completed' && (
                <button
                  onClick={() => handleClaim(task.id)}
                  style={{ backgroundColor: '#4caf50', border: 'none' }}
                >
                  领取奖励
                </button>
              )}
              {task.state === 'Claimed' && <span style={{ color: '#4caf50' }}>已领取</span>}
              {task.state === 'InProgress' && <span style={{ color: '#2196f3' }}>进行中</span>}
              {task.state === 'Locked' && <span style={{ color: '#777' }}>未解锁</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskView;
