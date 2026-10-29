import React from 'react';
import styles from './Label.module.css';

export interface LabelProps {
  children: React.ReactNode;
  variant?: 'kicker' | 'badge';
  className?: string;
  as?: React.ElementType;
}

export default function Label({
  children,
  variant = 'kicker',
  className = '',
  as: Component = 'span',
}: LabelProps) {
  return (
    <Component className={`${styles.label} ${styles[variant]} ${className}`.trim()}>
      {variant === 'kicker' ? `— ${children} —` : children}
    </Component>
  );
}

