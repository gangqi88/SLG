import React from 'react';
import { useAlliance } from '@/features/alliance/hooks/useAlliance';
import styles from './AllianceCheckIn.module.css';
import { useModal } from '@/shared/components/ModalProvider';

export const AllianceCheckIn: React.FC = () => {
  const { checkIn, checkInStatus, playerContribution } = useAlliance();
  const modal = useModal();

  const handleCheckIn = async () => {
    const result = await checkIn();
    if (result.contribution > 0) {
      modal.openAlert({
        title: '签到成功',
        message: `获得贡献 +${result.contribution}`,
      });
    }
  };

  const rewards = [
    { day: 1, bonus: 50 },
    { day: 2, bonus: 60 },
    { day: 3, bonus: 70 },
    { day: 4, bonus: 80 },
    { day: 5, bonus: 100 },
    { day: 6, bonus: 120 },
    { day: 7, bonus: 150 },
  ];

  return (
    <div className={styles.checkIn}>
      <div className={styles.header}>
        <h3>Daily Check-in</h3>
        <div className={styles.currentContribution}>
          Your Contribution: <span>{playerContribution}</span>
        </div>
      </div>

      <div className={styles.status}>
        {checkInStatus.available ? (
          <div className={styles.available}>
            <p>Check-in is available!</p>
            <button className={styles.checkInButton} onClick={handleCheckIn}>
              Check In Now
            </button>
          </div>
        ) : (
          <div className={styles.unavailable}>
            <p>You've already checked in today.</p>
            <p className={styles.streak}>Current streak: {checkInStatus.streak} days</p>
          </div>
        )}
      </div>

      <div className={styles.rewards}>
        <h4>Weekly Rewards</h4>
        <div className={styles.rewardList}>
          {rewards.map((reward, index) => (
            <div
              key={index}
              className={`${styles.rewardItem} ${checkInStatus.streak >= reward.day ? styles.claimed : ''}`}
            >
              <span className={styles.day}>Day {reward.day}</span>
              <span className={styles.bonus}>+{reward.bonus}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
