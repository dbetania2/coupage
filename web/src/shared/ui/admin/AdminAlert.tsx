import React, { ReactNode } from 'react';

interface AdminAlertProps {
  variant?: 'danger' | 'warning' | 'info' | 'note';
  compact?: boolean;
  children: ReactNode;
}

/** Caja de aviso semántica del panel (clases .admin-alert-* en admin.css). */
export function AdminAlert({ variant = 'danger', compact = false, children }: AdminAlertProps) {
  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      className={`admin-alert admin-alert-${variant}${compact ? ' admin-alert-compact' : ''}`}
    >
      {children}
    </div>
  );
}

