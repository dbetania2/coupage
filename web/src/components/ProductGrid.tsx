'use client';
import React from 'react';
import ProductCard, { ProductCardProps } from '@/features/catalog/ui/ProductCard';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: ProductCardProps[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return <p className={styles.gridEmptyText}>No se encontraron productos para este filtro.</p>;
  }

  return (
    <div className={styles.productGrid}>
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
