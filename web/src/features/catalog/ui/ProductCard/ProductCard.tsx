'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Label from '@/shared/ui/Label';
import Button from '@/shared/ui/Button';
import { formatPrice } from '@/shared/lib/formatters';
import { useCartUI } from '@/features/cart/context/CartUIContext';
import type { Product } from '../../data/featured';
import styles from './ProductCard.module.css';

export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600&auto=format&fit=crop';

export interface ProductCardProps {
  product?: Product;
  id?: number;
  brand?: string;
  name?: string;
  price?: string;
  numericPrice?: number;
  saleModeId?: number;
  imageUrl?: string;
  saleMode?: string;
  isExclusive?: boolean;
}

export default function ProductCard({
  product,
  id,
  brand,
  name,
  price,
  numericPrice,
  saleModeId,
  imageUrl,
  saleMode,
  isExclusive,
}: ProductCardProps) {
  const { addItem } = useCartUI();

  // Normalizar propiedades ya sea que vengan por `product` (Featured) o sueltas (Catálogo)
  const resolvedId = product ? product.id : id;
  const resolvedName = product ? product.name : name || '';
  const resolvedBrand = product ? product.subtitle : brand || '';
  const resolvedImage = product ? product.image : imageUrl || FALLBACK_PRODUCT_IMAGE;
  const resolvedBadge = product ? product.badge : isExclusive ? 'EXCLUSIVO' : undefined;
  const resolvedPriceDisplay = product ? formatPrice(product.price) : price || '';

  const [imgSrc, setImgSrc] = useState(resolvedImage || FALLBACK_PRODUCT_IMAGE);

  const productHref = /^\d+$/.test(String(resolvedId))
    ? `/product/${resolvedId}`
    : '/catalogo';

  const handleAddToCart = () => {
    const parsedPrice = product
      ? product.price
      : numericPrice !== undefined
        ? numericPrice
        : Number(String(price).replace(/[^0-9.]/g, '')) || 0;

    addItem({
      productId: Number(resolvedId) || 1,
      saleModeId: saleModeId || 1,
      productName: resolvedName,
      brandName: resolvedBrand,
      saleModeType: saleMode || 'Unidad',
      unitPrice: parsedPrice,
      quantity: 1,
      imageUrl: imgSrc,
    });
  };

  return (
    <article className={styles.card}>
      <Link href={productHref} className={styles.cardLink}>
        <div className={styles.imageWrapper}>
          {resolvedBadge && (
            <div className={styles.badgeContainer}>
              <Label variant="badge">{resolvedBadge}</Label>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={resolvedName}
            className={styles.image}
            onError={() => {
              if (imgSrc !== FALLBACK_PRODUCT_IMAGE) {
                setImgSrc(FALLBACK_PRODUCT_IMAGE);
              }
            }}
            loading="lazy"
          />
          <div className={styles.imageOverlay} />
        </div>
      </Link>

      <div className={styles.info}>
        <span className={styles.subtitle}>{resolvedBrand}</span>
        <Link href={productHref} className={styles.titleLink}>
          <h3 className={styles.name}>{resolvedName}</h3>
        </Link>
        <p className={styles.price}>{resolvedPriceDisplay}</p>
        {saleMode && <p className={styles.saleMode}>Modalidad: {saleMode}</p>}

        <div className={styles.actionWrapper}>
          {product ? (
            <Link href={productHref} className={styles.plainLink}>
              <Button variant="secondary" size="sm" className={styles.actionButton}>
                Ver Detalle
              </Button>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className={styles.addToCartButton}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={styles.btnIconStart}
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              AGREGAR A SOLICITUD
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
