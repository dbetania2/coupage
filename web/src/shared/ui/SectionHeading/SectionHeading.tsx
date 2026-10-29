import React from 'react';
import Label from '../Label';
import styles from './SectionHeading.module.css';

export interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
  action?: React.ReactNode;
}

export default function SectionHeading({
  kicker,
  title,
  subtitle,
  align = 'center',
  className = '',
  action,
}: SectionHeadingProps) {
  return (
    <div className={`${styles.wrapper} ${styles[align]} ${className}`.trim()}>
      <div className={styles.textGroup}>
        {kicker && <Label variant="kicker" className={styles.kicker}>{kicker}</Label>}
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

