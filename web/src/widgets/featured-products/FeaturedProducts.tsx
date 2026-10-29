'use client';

import React from 'react';
import Container from '@/shared/ui/Container';
import SectionHeading from '@/shared/ui/SectionHeading';
import IconButton from '@/shared/ui/IconButton';
import ProductCard from '@/features/catalog/ui/ProductCard';
import { FEATURED_PRODUCTS } from '@/features/catalog/data/featured';
import styles from './FeaturedProducts.module.css';

export default function FeaturedProducts() {
  return (
    <section id="solicitados" className={styles.section}>
      <Container size="default">
        <SectionHeading
          kicker="DESTACADOS"
          title="Los Más Solicitados de la Semana"
          align="left"
          action={
            <div className={styles.carouselNav}>
              <IconButton variant="outline" size="sm" aria-label="Anterior producto">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </IconButton>
              <IconButton variant="filled" size="sm" aria-label="Siguiente producto">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </IconButton>
            </div>
          }
        />

        <div className={styles.grid}>
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}

