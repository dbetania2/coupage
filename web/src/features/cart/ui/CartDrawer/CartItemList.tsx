'use client';

import React from 'react';
import Link from 'next/link';
import { CartItem } from '../../context/CartUIContext';
import styles from './CartDrawer.module.css';

interface CartItemListProps {
  items: CartItem[];
  onUpdateQuantity: (key: string, quantity: number) => void;
  onRemoveItem: (key: string) => void;
  onCloseCart: () => void;
}

export default function CartItemList({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCloseCart,
}: CartItemListProps) {
  if (items.length === 0) {
    return (
      <div className={styles.templateNotice}>
        <span className={styles.templateNoticeStrong}>
          Tu solicitud aún no tiene productos seleccionados
        </span>
        Explorá el catálogo público de vinos, licores y delicatessen y presioná{' '}
        <strong>&quot;Agregar a Solicitud&quot;</strong> para cargar productos reales de la base de datos.
        <div className={styles.itemsContainer}>
          <Link
            href="/catalogo"
            onClick={onCloseCart}
            className={`${styles.ctaPrimary} ${styles.itemLink}`}
          >
            Ir al Catálogo de Productos →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.itemList}>
      {items.map((item) => (
        <article key={item.key} className={styles.cartItemCard}>
          <div className={`${styles.itemThumbPlaceholder} ${styles.itemThumbImageWrap}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                item.imageUrl ||
                'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=300&auto=format&fit=crop'
              }
              alt={item.productName}
              className={styles.itemThumbImg}
            />
          </div>

          <div className={styles.itemInfo}>
            <span className={styles.itemBrand}>{item.brandName}</span>
            <h3 className={styles.itemTitle}>{item.productName}</h3>
            <p className={styles.itemMeta}>Modalidad: {item.saleModeType}</p>
            <p className={`${styles.itemMeta} ${styles.itemMetaGold}`}>
              ${item.unitPrice.toLocaleString('es-AR')} c/u · Subtotal: $
              {(item.unitPrice * item.quantity).toLocaleString('es-AR')}
            </p>

            <div className={styles.itemControlsRow}>
              <div className={styles.qtyGroup} aria-label="Selector de cantidad">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.key, item.quantity - 1)}
                  className={styles.qtyBtn}
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <span className={styles.qtyValue}>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.key, item.quantity + 1)}
                  className={styles.qtyBtn}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => onRemoveItem(item.key)}
                className={styles.removeBtn}
              >
                Eliminar
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

