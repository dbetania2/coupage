import React from 'react';
import styles from './Container.module.css';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'full';
  as?: React.ElementType;
}

export default function Container({
  children,
  className = '',
  size = 'default',
  as: Component = 'div',
}: ContainerProps) {
  const sizeClass = styles[size] || styles.default;
  return (
    <Component className={`${styles.container} ${sizeClass} ${className}`.trim()}>
      {children}
    </Component>
  );
}

