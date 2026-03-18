import React from 'react';
import { useMainCity } from '@/features/city/hooks/useMainCity';
import { BuildingCard } from './BuildingCard';
import { AdBillboard } from './AdBillboard';
import styles from './MainCity.module.css';

export const MainCityView: React.FC = () => {
  const { buildings, isLoading } = useMainCity();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Main City</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.buildingsSection}>
          <h2 className={styles.sectionTitle}>Buildings</h2>
          <div className={styles.buildingsGrid}>
            {Object.values(buildings).map((building) => (
              <BuildingCard key={building.id} building={building} />
            ))}
          </div>
        </section>

        <aside className={styles.sidebar}>
          <AdBillboard />
        </aside>
      </div>
    </div>
  );
};

export default MainCityView;
