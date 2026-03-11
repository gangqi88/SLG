import React, { useState, useEffect } from 'react';
import { TaskManager, Task } from '../game/logic/TaskManager';

const TaskView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  // Use a singleton instance or context in real app. Here we create one or reuse global if available.
  // For demo, we instantiate locally but data won't persist across view changes unless lifted up.
  // We should probably move TaskManager to a higher level or export a singleton.
  // Let's assume we use a singleton for now to keep it simple across re-renders if we move it out.
  
  // Quick singleton hack for demo persistence
  const [manager] = useState(() => (window as any)._taskManager || ((window as any)._taskManager = new TaskManager()));

  useEffect(() => {
    manager.subscribe(setTasks);
    return () => manager.unsubscribe(setTasks);
  }, [manager]);

  const handleClaim = (taskId: string) => {
    manager.claimReward(taskId);
  };

  const handleSimulateProgress = () => {
    manager.updateProgress('upgrade_building', 'castle_1', 2);
    manager.updateProgress('battle_count', undefined, 1);
  };

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>任务系统</h2>
        <button onClick={handleSimulateProgress} style={{ fontSize: '0.8em', padding: '5px' }}>模拟完成任务</button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tasks.map(task => (
          <div key={task.id} style={{ 
            backgroundColor: '#333', 
            padding: '15px', 
            borderRadius: '8px', 
            border: '1px solid #555',
            opacity: task.state === 'Locked' ? 0.5 : 1
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa', fontSize: '0.8em' }}>[{task.type}] {task.state}</span>
              <span style={{ color: '#aaa', fontSize: '0.8em' }}>进度: {task.currentProgress}/{task.target.count}</span>
            </div>
            <h3 style={{ margin: '5px 0' }}>{task.name}</h3>
            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#ccc' }}>{task.description}</p>
            
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8em', color: '#ffd700' }}>
                奖励: {task.rewards.map(r => `${r.amount} ${r.id}`).join(', ')}
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
