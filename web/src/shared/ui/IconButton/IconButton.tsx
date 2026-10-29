import React from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'filled' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  'aria-label': string;
}

export default function IconButton({
  children,
  variant = 'outline',
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
  ...props
}: IconButtonProps) {
  const classes = `${styles.iconButton} ${styles[variant]} ${styles[size]} ${className}`.trim();

  return (
    <button className={classes} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  );
}

