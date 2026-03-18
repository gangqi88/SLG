import React from 'react';
import { useAlliance } from '@/features/alliance/hooks/useAlliance';
import styles from './AllianceTech.module.css';
import { useModal } from '@/shared/components/ModalProvider';
import { useNavigate } from 'react-router-dom';
import { openContributionWays } from '@/shared/logic/openContributionWays';

export const AllianceTech: React.FC = () => {
  const { techList, playerContribution, upgradeTech } = useAlliance();
  const modal = useModal();
  const navigate = useNavigate();

  const handleUpgrade = async (techId: string) => {
    const tech = techList.find((t) => t.id === techId);
    if (!tech) return;

    if (playerContribution < tech.costPerLevel) {
      openContributionWays({ modal, navigate, needAmount: tech.costPerLevel, haveAmount: playerContribution });
      return;
    }

    if (tech.currentLevel >= tech.maxLevel) {
      modal.openAlert({ title: '提示', message: '已达到最高等级。' });
      return;
    }

    const success = await upgradeTech(techId);
    if (success) {
      modal.openAlert({ title: '升级成功', message: '联盟科技已升级。' });
    }
  };

  const getTechIcon = (effectType: string) => {
    const icons: Record<string, string> = {
      resource: '🌲',
      training: '⚔️',
      defense: '🛡️',
      attack: '⚡',
      gathering: '⛏️',
    };
    return icons[effectType] || '🔧';
  };

  return (
    <div className={styles.tech}>
      <div className={styles.header}>
        <h3>Alliance Tech</h3>
        <div className={styles.contribution}>
          Your Points: <span>{playerContribution}</span>
        </div>
      </div>

      <div className={styles.list}>
        {techList.map((tech) => {
          const canUpgrade =
            playerContribution >= tech.costPerLevel && tech.currentLevel < tech.maxLevel;

          return (
            <div key={tech.id} className={styles.techItem}>
              <div className={styles.icon}>{getTechIcon(tech.effectType)}</div>
              <div className={styles.info}>
                <h4>{tech.name}</h4>
                <p>{tech.description}</p>
                <div className={styles.level}>
                  <span>
                    Level {tech.currentLevel}/{tech.maxLevel}
                  </span>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progress}
                      style={{ width: `${(tech.currentLevel / tech.maxLevel) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.upgrade}>
                <div className={styles.cost}>
                  <span>{tech.costPerLevel}</span>
                  <span className={styles.costLabel}>Points</span>
                </div>
                <button
                  className={styles.upgradeButton}
                  onClick={() => handleUpgrade(tech.id)}
                  disabled={!canUpgrade}
                >
                  {tech.currentLevel >= tech.maxLevel ? 'MAX' : 'Upgrade'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
