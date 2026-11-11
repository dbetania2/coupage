'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutFromServer } from '@/lib/auth';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Ley de Hick: Máximo 7 ítems principales en la barra de navegación
  const navItems: NavItem[] = [
    {
      id: 'nav-dashboard',
      label: 'Escritorio',
      href: '/admin',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      id: 'nav-orders',
      label: 'Pedidos (Node)',
      href: '/admin/orders',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      ),
    },
    {
      id: 'nav-products',
      label: 'Inventario (Django)',
      href: '/admin/products',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8"></polyline>
          <rect x="1" y="3" width="22" height="5"></rect>
          <line x1="10" y1="12" x2="14" y2="12"></line>
        </svg>
      ),
    },
    {
      id: 'nav-assistant',
      label: 'Asistente IA',
      href: '/admin/assistant',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"></path>
          <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"></path>
        </svg>
      ),
    },
    {
      id: 'nav-customers',
      label: 'Clientes',
      href: '/admin/customers',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      id: 'nav-reports',
      label: 'Reportes',
      href: '/admin/reports',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
    },
    {
      id: 'nav-settings',
      label: 'Configuración',
      href: '/admin/settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
    },
  ];

  const handleLogout = async () => {
    await logoutFromServer();
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
    router.push('/');
  };

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header con Logo de Tu Gusto Gourmet + Botón de Colapsar/Expandir integrado en el flujo */}
      <div className="admin-brand">
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
            <div className="admin-brand-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/brand/tgg.png"
                alt="Tu Gusto Gourmet Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div className="admin-brand-text">
              <span className="brand-title">Tu Gusto Gourmet</span>
              <span className="brand-subtitle">PANEL DE GESTIÓN</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="admin-sidebar-toggle-btn"
          title={isCollapsed ? 'Expandir panel lateral' : 'Contraer panel lateral'}
          aria-label={isCollapsed ? 'Expandir panel lateral' : 'Contraer panel lateral'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            {isCollapsed ? (
              <polyline points="13 9 16 12 13 15"></polyline>
            ) : (
              <polyline points="16 15 13 12 16 9"></polyline>
            )}
          </svg>
        </button>
      </div>

      {/* Navigation List (Keys únicas y estables por item.id) */}
      <nav className="admin-nav" aria-label="Menú administrativo">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.id}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
              style={{
                minHeight: '44px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: isCollapsed ? '0.7rem' : '0.7rem 0.9rem',
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Enlace directo a la Web Pública */}
      <div style={{ marginBottom: '1rem', padding: '0 0.25rem' }}>
        <Link
          href="/"
          title="Ver Tienda Pública"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40px',
            borderRadius: '8px',
            border: '1px dashed #3f3f46',
            color: '#d4d4d8',
            fontSize: '0.78rem',
            textDecoration: 'none',
          }}
        >
          {isCollapsed ? '←' : '← Ver Tienda Pública'}
        </Link>
      </div>

      {/* User Profile Footer & Logout */}
      <div
        className="admin-user-footer"
        style={{
          flexDirection: isCollapsed ? 'column' : 'row',
          gap: isCollapsed ? '0.6rem' : '0',
        }}
      >
        <div className="user-profile">
          <div className="user-avatar" title="Administrador">
            <span>AD</span>
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <span className="user-name">Administrador</span>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="btn-logout"
          title="Cerrar Sesión (Invalida Refresh Token)"
          aria-label="Cerrar Sesión"
          style={{ minWidth: '40px', minHeight: '40px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>
  );
}
