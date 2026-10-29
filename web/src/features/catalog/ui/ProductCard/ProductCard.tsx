'use client';

import React from 'react';
import Link from 'next/link';
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
  const productHref = /^\d+$/.test(String(product.id)) ? `/product/${product.id}` : `/catalogo`;

  return (
    <article className={styles.card}>
      {/* Marco de imagen con badge */}
      <Link href={productHref} style={{ display: 'block', position: 'relative', textDecoration: 'none' }}>
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
      </Link>

      {/* Información editorial */}
      <div className={styles.info}>
        <span className={styles.subtitle}>{product.subtitle}</span>
        <Link href={productHref} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>
        <p className={styles.price}>{formatPrice(product.price)}</p>

        <div className={styles.actionWrapper}>
          <Link href={productHref} style={{ textDecoration: 'none' }}>
            <Button
              variant="secondary"
              size="sm"
              className={styles.actionButton}
            >
              Ver Detalle
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

