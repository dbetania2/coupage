'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600&auto=format&fit=crop';

export interface ProductCardProps {
  id: number;
  brand: string;
  name: string;
  price: string;
  imageUrl: string;
  saleMode: string;
  isExclusive?: boolean;
}

export default function ProductCard({ id, brand, name, price, imageUrl, saleMode, isExclusive }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(imageUrl || FALLBACK_PRODUCT_IMAGE);

  return (
    <article className="product-card">
      <Link href={`/product/${id}`}>
        <div className="card-image-wrapper">
          {isExclusive && <span className="badge-exclusive">EXCLUSIVO</span>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={name}
            className="product-image"
            onError={() => {
              if (imgSrc !== FALLBACK_PRODUCT_IMAGE) {
                setImgSrc(FALLBACK_PRODUCT_IMAGE);
              }
            }}
            loading="lazy"
          />
        </div>
      </Link>
      
      <div className="card-content">
        <p className="product-brand">{brand}</p>
        <Link href={`/product/${id}`}>
          <h3 className="product-name">{name}</h3>
        </Link>
        <p className="product-price">{price}</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1rem', marginTop: '-1rem' }}>
          Modalidad: {saleMode}
        </p>
        
        <button className="btn-add-cart">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          AGREGAR
        </button>
      </div>
    </article>
  );
}
