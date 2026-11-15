'use client';

import React, { ReactNode, useEffect, useId } from 'react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Ancho máximo del contenedor. Por defecto 680px. */
  maxWidth?: number;
}

/**
 * Modal reutilizable del panel: backdrop con blur, cierre con Escape y
 * click fuera, bloqueo de scroll del body y atributos ARIA.
 */
export function AdminModal({
  isOpen,
  onClose,
  title,
  eyebrow,
  subtitle,
  children,
  footer,
  maxWidth,
}: AdminModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        style={maxWidth ? { maxWidth } : undefined}
      >
        <header className="admin-modal-header">
          <div>
            {eyebrow && <span className="admin-page-eyebrow">{eyebrow}</span>}
            <h2 id={titleId} className="admin-modal-title">{title}</h2>
            {subtitle && <p className="admin-modal-subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="btn-admin btn-admin-icon" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        {children}

        {footer && <footer className="admin-modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}

