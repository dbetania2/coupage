'use client';

import React, { useState, useEffect } from 'react';
import Container from '@/shared/ui/Container';
import SectionHeading from '@/shared/ui/SectionHeading';
import IconButton from '@/shared/ui/IconButton';
import ProductCard from '@/features/catalog/ui/ProductCard';
import { FEATURED_PRODUCTS, type Product } from '@/features/catalog/data/featured';
import styles from './FeaturedProducts.module.css';

interface DjangoProductItem {
  id: number;
  name: string;
  brand?: { name: string } | null;
  category?: { name: string } | null;
  images?: { url: string }[];
  sale_modes?: {
    type: string;
    prices?: { amount: string | number }[];
  }[];
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>(FEATURED_PRODUCTS);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_CATALOG_API_URL || 'http://127.0.0.1:8000/api';
    fetch(`${baseUrl}/products/?page_size=4`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const rawList: DjangoProductItem[] = Array.isArray(data) ? data : data.results || [];
        if (rawList.length > 0) {
          const mapped: Product[] = rawList.slice(0, 4).map((p) => {
            const amount = p.sale_modes?.[0]?.prices?.[0]?.amount;
            const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?q=80&w=800&auto=format&fit=crop';
            return {
              id: String(p.id),
              name: p.name,
              subtitle: p.brand?.name || 'SELECCIÓN DE CAVA',
              price: amount ? Number(amount) : 0,
              badge: p.sale_modes?.[0]?.type || 'EXCLUSIVO',
              category: p.category?.name || 'Catálogo',
              image: img,
            };
          });
          setProducts(mapped);
        }
      })
      .catch(() => {
        // Mantiene FEATURED_PRODUCTS si catalog-api no está corriendo
      });
  }, []);

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
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
