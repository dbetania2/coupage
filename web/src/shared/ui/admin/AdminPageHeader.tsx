import React, { ReactNode } from 'react';

interface AdminPageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

/** Encabezado estándar de las páginas del panel (clases en admin.css). */
export function AdminPageHeader({ eyebrow, title, subtitle, actions }: AdminPageHeaderProps) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header-text">
        {eyebrow && <span className="admin-page-eyebrow">{eyebrow}</span>}
        <h1 className="admin-page-title">{title}</h1>
        {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="admin-header-actions">{actions}</div>}
    </header>
  );
}

