import React, { useState } from 'react';
import { useAlliance } from '@/features/alliance/hooks/useAlliance';
import styles from './AllianceWar.module.css';

export const AllianceWar: React.FC = () => {
  const { activeWar, declareWar, submitWarScore, alliance } = useAlliance();
  const [targetId, setTargetId] = useState('');
  const [score, setScore] = useState(100);

  const handleDeclare = async () => {
    if (!targetId.trim()) {
      alert('Please enter target alliance ID');
      return;
    }

    if ((alliance?.level || 0) < 5) {
      alert('Alliance level 5 required to declare war');
      return;
    }

    const war = await declareWar(targetId);
    if (war) {
      alert('War declared successfully!');
      setTargetId('');
    } else {
      alert('Failed to declare war. Check requirements.');
    }
  };

  const handleSubmitScore = () => {
    const success = submitWarScore(score);
    if (success) {
      alert('Score submitted!');
    }
  };

  const getWarStatus = () => {
    if (!activeWar) return 'No active war';
    switch (activeWar.status) {
      case 'preparing':
        return 'Preparing';
      case 'active':
        return 'Active';
      case 'finished':
        return activeWar.winnerId === alliance?.id ? 'Victory!' : 'Defeat';
      default:
        return 'Unknown';
    }
  };

  const getTimeRemaining = () => {
    if (!activeWar) return '';
    const remaining = activeWar.endTime - Date.now();
    if (remaining <= 0) return 'Ended';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={styles.war}>
      <div className={styles.header}>
        <h3>Alliance War</h3>
        {(alliance?.level || 0) >= 5 && <span className={styles.available}>Available</span>}
      </div>

      <div className={styles.declareSection}>
        <h4>Declare War</h4>
        <p>Cost: 50,000 Gold deposit</p>
        <div className={styles.declareForm}>
          <input
            type="text"
            placeholder="Target Alliance ID"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleDeclare} className={styles.declareButton}>
            Declare War
          </button>
        </div>
      </div>

      {activeWar && (
        <div className={styles.activeWar}>
          <h4>Active War</h4>
          <div className={styles.warInfo}>
            <div className={styles.warStatus}>
              <span className={styles.statusLabel}>Status</span>
              <span
                className={`${styles.status} ${activeWar.status === 'active' ? styles.active : ''}`}
              >
                {getWarStatus()}
              </span>
            </div>
            <div className={styles.timer}>
              <span className={styles.timeLabel}>Time Remaining</span>
              <span className={styles.timeValue}>{getTimeRemaining()}</span>
            </div>
          </div>

          <div className={styles.scoreBoard}>
            <div className={styles.score}>
              <span className={styles.teamName}>{activeWar.attackerName}</span>
              <span className={styles.scoreValue}>{activeWar.attackerScore}</span>
            </div>
            <div className={styles.vs}>VS</div>
            <div className={styles.score}>
              <span className={styles.teamName}>{activeWar.defenderName}</span>
              <span className={styles.scoreValue}>{activeWar.defenderScore}</span>
            </div>
          </div>

          {activeWar.status === 'active' && (
            <div className={styles.submitSection}>
              <h5>Submit Your Score</h5>
              <div className={styles.submitForm}>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  min={1}
                  className={styles.input}
                />
                <button onClick={handleSubmitScore} className={styles.submitButton}>
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
