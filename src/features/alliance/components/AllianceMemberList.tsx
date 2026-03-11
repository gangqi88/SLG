import React from 'react';
import { useAlliance } from '../../hooks/useAlliance';
import { AllianceRole } from '../../types/Alliance';
import styles from './AllianceMemberList.module.css';

export const AllianceMemberList: React.FC = () => {
  const { members } = useAlliance();

  const getRoleBadge = (role: AllianceRole) => {
    const badges = {
      leader: { text: 'Leader', class: styles.leaderBadge },
      officer: { text: 'Officer', class: styles.officerBadge },
      member: { text: 'Member', class: styles.memberBadge },
    };
    return badges[role];
  };

  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { leader: 0, officer: 1, member: 2 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  return (
    <div className={styles.memberList}>
      <div className={styles.header}>
        <h3>Members ({members.length})</h3>
      </div>
      
      <div className={styles.list}>
        {sortedMembers.map((member) => {
          const badge = getRoleBadge(member.role);
          return (
            <div key={member.id} className={styles.member}>
              <div className={styles.avatar}>
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.info}>
                <div className={styles.name}>
                  {member.name}
                  {member.id === members[0]?.id && (
                    <span className={styles.you}>(You)</span>
                  )}
                </div>
                <div className={styles.joined}>
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </div>
              </div>
              <div className={styles.stats}>
                <div className={styles.contribution}>
                  <span className={styles.label}>Contribution</span>
                  <span className={styles.value}>{member.contribution.toLocaleString()}</span>
                </div>
                <div className={styles.weekly}>
                  <span className={styles.label}>This Week</span>
                  <span className={styles.value}>{member.weeklyContribution.toLocaleString()}</span>
                </div>
              </div>
              <span className={`${styles.badge} ${badge.class}`}>
                {badge.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
