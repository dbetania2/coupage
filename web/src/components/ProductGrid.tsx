'use client';
import React from 'react';
import ProductCard, { ProductCardProps } from './ProductCard';

interface ProductGridProps {
  products: ProductCardProps[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return <p style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>No se encontraron productos para este filtro.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
