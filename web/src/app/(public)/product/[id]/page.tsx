'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCartUI } from '@/features/cart/context/CartUIContext';

interface ProductDetail {
  id: number;
  name: string;
  description?: string;
  brand?: { name: string } | null;
  category?: { name: string } | null;
  images: { url: string }[];
  sale_modes: {
    id?: number;
    type: string;
    prices: { amount: string | number }[];
  }[];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCartUI();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModalityIndex, setSelectedModalityIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_CATALOG_API_URL || 'http://127.0.0.1:8000/api';
    fetch(`${baseUrl}/products/${id}/`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.id) {
          setProduct(data);
        } else {
          setProduct(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar producto:", err);
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Cargando joya seleccionada desde la base de datos...
      </main>
    );
  }

  if (!product) {
    return (
      <main style={{ padding: '4rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Producto no encontrado</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          La joya gastronómica solicitada no está disponible o el servidor de catálogo no está activo.
        </p>
        <Link href="/catalogo" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>
          ← Volver al Catálogo Público
        </Link>
      </main>
    );
  }

  const rawImageUrl = (product.images && product.images.length > 0) ? product.images[0].url : '';
  const fallbackImage = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600&auto=format&fit=crop';
  const brandName = product.brand ? product.brand.name : 'Coupage';
  const categoryName = product.category ? product.category.name : 'Catálogo';
  const saleModes =
    product.sale_modes && product.sale_modes.length > 0
      ? product.sale_modes
      : [{ id: 1, type: 'Unidad', prices: [{ amount: 0 }] }];
  const activeSaleMode = saleModes[selectedModalityIndex] || saleModes[0];
  const numericPrice =
    activeSaleMode?.prices?.[0]?.amount !== undefined
      ? Number(activeSaleMode.prices[0].amount)
      : 0;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      saleModeId: activeSaleMode.id || selectedModalityIndex + 1,
      productName: product.name,
      brandName,
      saleModeType: activeSaleMode.type,
      unitPrice: numericPrice,
      quantity,
      imageUrl: rawImageUrl || fallbackImage,
    });
  };

  return (
    <div style={{ padding: '3rem 2rem 5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/catalogo" style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          ← Volver al Catálogo Público
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3.5rem' }}>
        {/* Columna Izquierda: Imagen */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2.5rem',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rawImageUrl || fallbackImage}
            alt={product.name}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== fallbackImage) {
                target.src = fallbackImage;
              }
            }}
            style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain' }}
          />
        </div>

        {/* Columna Derecha: Detalles y Controles de Selección */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
          <div>
            <p style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {brandName} · {categoryName}
            </p>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', lineHeight: 1.15 }}>{product.name}</h1>
            <p style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
              {numericPrice > 0 ? `$${numericPrice.toLocaleString('es-AR')}` : 'Consultar'}
            </p>
          </div>
          
          <div style={{ backgroundColor: 'var(--bg-input)', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Notas de Cata y Descripción
            </p>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              {product.description || 'Sin descripción adicional registrada.'}
            </p>
          </div>

          {/* Selector de Modalidad de Venta (Unidad vs. Caja/Paquete) */}
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', fontWeight: 600 }}>
              Modalidad Habilitada
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {saleModes.map((mode, idx) => {
                const modeAmount = mode.prices?.[0]?.amount ? Number(mode.prices[0].amount) : 0;
                return (
                  <button
                    key={mode.id || mode.type}
                    type="button"
                    onClick={() => setSelectedModalityIndex(idx)}
                    style={{
                      minHeight: '48px',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      backgroundColor: selectedModalityIndex === idx ? 'rgba(197, 160, 89, 0.15)' : 'var(--bg-card)',
                      border: selectedModalityIndex === idx ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <strong style={{ display: 'block', color: selectedModalityIndex === idx ? 'var(--accent-gold)' : 'inherit' }}>
                      {mode.type}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {modeAmount > 0 ? `$${modeAmount.toLocaleString('es-AR')}` : 'Consultar'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Cantidad y Botón Principal (Ley de Fitts >= 44px) */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-input)',
            }}>
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                style={{ minWidth: '48px', minHeight: '48px', background: 'transparent', color: 'var(--text-primary)', fontSize: '1.2rem' }}
                aria-label="Disminuir cantidad"
              >
                −
              </button>
              <span style={{ padding: '0 1rem', fontWeight: 600, minWidth: '48px', textAlign: 'center' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(prev => prev + 1)}
                style={{ minWidth: '48px', minHeight: '48px', background: 'transparent', color: 'var(--text-primary)', fontSize: '1.2rem' }}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="btn-add-cart"
              style={{ flex: 1, minHeight: '48px', fontSize: '0.9rem' }}
            >
              AGREGAR AL CARRITO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
