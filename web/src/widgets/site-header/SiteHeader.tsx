'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Container from '@/shared/ui/Container';
import IconButton from '@/shared/ui/IconButton';
import styles from './SiteHeader.module.css';

export default function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <Container size="default" className={styles.container}>
        {/* Navegación izquierda */}
        <nav className={styles.navLeft} aria-label="Navegación principal">
          <Link href="/" className={styles.navLink}>Inicio</Link>
          <Link href="/catalogo" className={styles.navLink}>Catálogo</Link>
          <Link href="#colecciones" className={styles.navLink}>Colecciones</Link>
          <Link href="#bodega" className={styles.navLink}>Bodega de Autor</Link>
          <Link href="#atelier" className={styles.navLink}>Atelier</Link>
        </nav>

        {/* Logotipo centrado */}
        <div className={styles.brandWrapper}>
          <Link href="/" className={styles.brandLink}>
            <span className={styles.brandTitle}>TU GUSTO GOURMET</span>
          </Link>
        </div>

        {/* Acciones derecha */}
        <div className={styles.actionsRight}>
          <button className={styles.actionItem} aria-label="Buscar productos">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span className={styles.actionText}>BUSCAR</span>
          </button>

          <Link href="/admin/login" className={styles.actionItem} aria-label="Cuenta de usuario">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>

          <button className={styles.actionItem} aria-label="Carrito de compras (0 items)">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className={styles.cartBadge}>(0)</span>
          </button>

          {/* Botón hamburguesa mobile */}
          <IconButton
            variant="ghost"
            size="sm"
            className={styles.menuToggle}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="7" x2="21" y2="7"></line>
                  <line x1="3" y1="17" x2="21" y2="17"></line>
                </>
              )}
            </svg>
          </IconButton>
        </div>
      </Container>

      {/* Drawer mobile */}
      {isMobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <nav className={styles.mobileNav}>
            <Link href="/" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Inicio</Link>
            <Link href="/catalogo" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Catálogo</Link>
            <Link href="#colecciones" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Colecciones</Link>
            <Link href="#bodega" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Bodega de Autor</Link>
            <Link href="#atelier" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Atelier</Link>
            <Link href="/admin/login" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Acceso Administrador</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

