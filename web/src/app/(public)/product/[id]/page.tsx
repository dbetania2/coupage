'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    fetch(`${baseUrl}/products/${id}/`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar producto:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <main style={{ padding: '4rem', textAlign: 'center' }}>Cargando joya seleccionada...</main>;
  if (!product) return <main style={{ padding: '4rem', textAlign: 'center' }}>Producto no encontrado</main>;

  const imageUrl = product.images.length > 0 ? product.images[0].url : '';
  const brandName = product.brand ? product.brand.name : '';
  const categoryName = product.category ? product.category.name : '';
  const defaultSaleMode = product.sale_modes.length > 0 ? product.sale_modes[0] : null;
  const price = defaultSaleMode && defaultSaleMode.prices.length > 0 ? defaultSaleMode.prices[0].amount : 'Consultar';

  return (
    <main style={{ padding: '4rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '4rem' }}>
      
      {/* Columna Izquierda: Imagen */}
      <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <img src={imageUrl} alt={product.name} style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
      </div>

      {/* Columna Derecha: Detalles del Producto */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          {brandName}
        </p>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.1 }}>{product.name}</h1>
        <p style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>${price}</p>
        
        <div style={{ backgroundColor: 'var(--bg-input)', padding: '1.5rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descripción del Sommelier</p>
          <p style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{product.description}</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Categoría</p>
            <p style={{ fontWeight: 600 }}>{categoryName}</p>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Modalidad Habilitada</p>
            <p style={{ fontWeight: 600 }}>{defaultSaleMode ? defaultSaleMode.type : 'N/A'}</p>
          </div>
        </div>

        <button className="btn-add-cart" style={{ padding: '1rem', fontSize: '1rem' }}>
          AGREGAR AL CARRITO
        </button>
      </div>
      
    </main>
  );
}
