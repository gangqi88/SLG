import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GameMain.module.css';

type Entry = {
  key: string;
  title: string;
  description: string;
  path: string;
};

const entries: Entry[] = [
  { key: 'heroes', title: 'Heroes', description: 'View and manage heroes', path: '/heroes' },
  {
    key: 'main-city',
    title: 'Main City',
    description: 'Buildings and management UI',
    path: '/main-city',
  },
  { key: 'city', title: 'City', description: 'Phaser city scene', path: '/city' },
  {
    key: 'gathering',
    title: 'Gathering',
    description: 'Side-scrolling resource gathering',
    path: '/gathering',
  },
  { key: 'tasks', title: 'Tasks', description: 'Progress and quests', path: '/tasks' },
  { key: 'gacha', title: 'Gacha', description: 'Recruit heroes and rewards', path: '/gacha' },
  { key: 'lootbox', title: 'Loot Box', description: 'Open loot boxes', path: '/lootbox' },
  {
    key: 'tower-defense',
    title: 'Guard Qiao',
    description: 'Action tower defense',
    path: '/tower-defense',
  },
  { key: 'cooking', title: 'Chef Contest', description: 'Cooking mini-game', path: '/cooking' },
  { key: 'siege', title: 'Siege War', description: 'Siege mode', path: '/siege' },
  { key: 'battle', title: 'Battle', description: 'Test battle route', path: '/battle' },
  { key: 'alliance', title: 'Alliance', description: 'Alliance system', path: '/alliance' },
];

const GameMain: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.root}>
      <div className={styles.backdrop} aria-hidden />

      <div className={styles.content}>
        <div className={styles.headerRow}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>Game Main</h1>
            <p className={styles.subtitle}>Choose where to go next</p>
          </div>

          <div className={styles.quickActions}>
            <button type="button" onClick={() => navigate('/style-guide')}>
              Style Guide
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          {entries.map((e) => (
            <button
              key={e.key}
              type="button"
              className={styles.entry}
              onClick={() => navigate(e.path)}
            >
              <div className={styles.entryTitle}>{e.title}</div>
              <div className={styles.entryDesc}>{e.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameMain;
