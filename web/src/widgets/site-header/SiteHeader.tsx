'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Container from '@/shared/ui/Container';
import IconButton from '@/shared/ui/IconButton';
import { useCartUI } from '@/features/cart/context/CartUIContext';
import styles from './SiteHeader.module.css';

interface SearchProductResult {
  id: number;
  name: string;
  brand?: { name: string } | null;
  category?: { name: string } | null;
  sale_modes?: Array<{
    id?: number;
    type?: string;
    prices?: Array<{ amount: string | number }>;
  }>;
}

export default function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [catalogProducts, setCatalogProducts] = useState<SearchProductResult[]>([]);
  const { openCart, totalItems, isSearchOpen, openSearch, closeSearch } = useCartUI();

  useEffect(() => {
    if (!isSearchOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen, closeSearch]);

  // Cargar productos reales de Django cuando se abre el buscador
  useEffect(() => {
    if (!isSearchOpen) return;
    const baseUrl = process.env.NEXT_PUBLIC_CATALOG_API_URL || 'http://127.0.0.1:8000/api';
    fetch(`${baseUrl}/products/?page_size=50`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const list = Array.isArray(data) ? data : data.results || [];
        setCatalogProducts(list);
      })
      .catch(() => {
        // Silencioso si catalog-api está apagado
      });
  }, [isSearchOpen]);

  const filteredSearchProducts = catalogProducts.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.brand?.name && p.brand.name.toLowerCase().includes(q)) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <header className={styles.header}>
        <Container size="default" className={styles.container}>
          {/* Logotipo e identidad a la izquierda */}
          <div className={styles.brandWrapper}>
            <Link href="/" className={styles.brandLink}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/brand/tgg.png"
                alt="Tu Gusto Gourmet Logo"
                className={styles.brandLogo}
              />
              <div className={styles.brandTextGroup}>
                <span className={styles.brandTitle}>TU GUSTO GOURMET</span>
                <span className={styles.brandSubtitle}>BODEGA &amp; DELICATESSEN</span>
              </div>
            </Link>
          </div>

          {/* Navegación centrada (Ley de Hick: 5 opciones principales) */}
          <nav className={styles.navCenter} aria-label="Navegación principal">
            <Link href="/" className={styles.navLink}>Inicio</Link>
            <Link href="/catalogo" className={styles.navLink}>Catálogo</Link>
            <Link href="/#colecciones" className={styles.navLink}>Colecciones</Link>
            <Link href="/#bodega" className={styles.navLink}>Bodega de Autor</Link>
            <Link href="/seguimiento" className={styles.navLink}>Seguimiento</Link>
          </nav>

          {/* Acciones derecha */}
          <div className={styles.actionsRight}>
            <button
              type="button"
              onClick={openSearch}
              className={styles.actionItem}
              aria-label="Buscar productos"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span className={styles.actionText}>BUSCAR</span>
            </button>

            <Link href="/admin/login" className={styles.actionItem} aria-label="Acceso Administrador">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => openCart('cart')}
              className={styles.actionItem}
              aria-label={`Abrir carrito de solicitud de pedido (${totalItems} productos)`}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span className={styles.cartBadge}>({totalItems})</span>
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
              <Link href="/#colecciones" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Colecciones</Link>
              <Link href="/#bodega" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Bodega de Autor</Link>
              <Link href="/seguimiento" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Seguimiento de Pedido</Link>
              <Link href="/admin/login" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Acceso Administrador</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Modal de Búsqueda Rápida conectado a Django */}
      {isSearchOpen && (
        <div
          className={styles.searchBackdrop}
          onClick={closeSearch}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-search-title"
        >
          <div className={styles.searchModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.searchHeader}>
              <h2 id="quick-search-title" style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
                Buscar en el Catálogo (Django Catalog API)
              </h2>
              <button
                type="button"
                onClick={closeSearch}
                style={{
                  minWidth: '40px',
                  minHeight: '40px',
                  background: 'transparent',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.searchInputRow}>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInputField}
                placeholder="Buscar por nombre de vino, licor, marca o categoría..."
                autoFocus
              />
              <Link
                href="/catalogo"
                onClick={closeSearch}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Ver Todo
              </Link>
            </div>

            <div className={styles.searchPlaceholderBox} style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {filteredSearchProducts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredSearchProducts.slice(0, 6).map((prod) => {
                    const priceVal = prod.sale_modes?.[0]?.prices?.[0]?.amount;
                    const modeType = prod.sale_modes?.[0]?.type || 'Unidad';
                    return (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.id}`}
                        onClick={closeSearch}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.65rem 0.85rem',
                          backgroundColor: 'var(--color-bg-card)',
                          border: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', textTransform: 'uppercase' }}>
                            {prod.brand?.name || 'Coupage'} · {prod.category?.name || 'Catálogo'}
                          </span>
                          <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{prod.name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ color: 'var(--color-gold)' }}>
                            {priceVal ? `$${Number(priceVal).toLocaleString('es-AR')}` : 'Consultar'}
                          </strong>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{modeType}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <span>
                  No se encontraron resultados o <code>catalog-api</code> no está activo en <code>127.0.0.1:8000</code>.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
