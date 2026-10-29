'use client';

import React from 'react';
import Image from 'next/image';
import Label from '@/shared/ui/Label';
import Button from '@/shared/ui/Button';
import { formatPrice } from '@/shared/lib/formatters';
import type { Product } from '../../data/featured';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className={styles.card}>
      {/* Marco de imagen con badge */}
      <div className={styles.imageWrapper}>
        {product.badge && (
          <div className={styles.badgeContainer}>
            <Label variant="badge">{product.badge}</Label>
          </div>
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className={styles.image}
        />
        <div className={styles.imageOverlay} />
      </div>

      {/* Información editorial */}
      <div className={styles.info}>
        <span className={styles.subtitle}>{product.subtitle}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>{formatPrice(product.price)}</p>

        <div className={styles.actionWrapper}>
          <Button
            variant="secondary"
            size="sm"
            className={styles.actionButton}
            onClick={() => alert(`Añadido "${product.name}" al carrito`)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            Añadir
          </Button>
        </div>
      </div>
    </article>
  );
}

