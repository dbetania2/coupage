import React from 'react';
import Container from '@/shared/ui/Container';
import styles from './Benefits.module.css';

interface BenefitItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const BENEFITS_DATA: BenefitItem[] = [
  {
    id: 'b-1',
    title: 'Envío Climatizado',
    description: 'Transporte a temperatura controlada constante para preservar el estado vivo de cada botella.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
      </svg>
    ),
  },
  {
    id: 'b-2',
    title: 'Garantía de Atelier',
    description: 'Autenticidad y origen trazable directamente de bodegas históricas y afinadores de prestigio.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
  },
  {
    id: 'b-3',
    title: 'Packaging Premium',
    description: 'Estuches isotérmicos y cajas de madera noble para una experiencia de unboxing insuperable.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <polyline points="21 8 21 21 3 21 3 8"></polyline>
        <rect x="1" y="3" width="22" height="5"></rect>
        <line x1="10" y1="12" x2="14" y2="12"></line>
      </svg>
    ),
  },
];

export default function Benefits() {
  return (
    <section className={styles.section}>
      <Container size="default">
        <div className={styles.grid}>
          {BENEFITS_DATA.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.iconCircle}>{item.icon}</div>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.description}>{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

