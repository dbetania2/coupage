'use client';
import React, { useState, useEffect } from 'react';
import ProductGrid from '@/components/ProductGrid';
import { ProductCardProps } from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';

interface DjangoProduct {
  id: number;
  name: string;
  brand?: { name: string } | null;
  images: { url: string }[];
  sale_modes: {
    id?: number;
    type: string;
    prices: { amount: string | number }[];
  }[];
}

export default function Home() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ordering, setOrdering] = useState<string>('-id');
  const [loading, setLoading] = useState<boolean>(true);

  const handleCategoryChange = (category: string) => {
    setLoading(true);
    setSelectedCategory(category);
  };

  const handleOrderingChange = (value: string) => {
    setLoading(true);
    setOrdering(value);
  };

  // Efecto que llama a Django cada vez que cambia la categoría o el orden seleccionado
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_CATALOG_API_URL || 'http://127.0.0.1:8000/api';
    const params = new URLSearchParams();
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    if (ordering) {
      params.set('ordering', ordering);
    }
    const queryString = params.toString();
    const url = `${baseUrl}/products/${queryString ? `?${queryString}` : ''}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        const rawList: DjangoProduct[] = Array.isArray(data) ? data : (data.results || []);
        const formattedProducts: ProductCardProps[] = rawList.map((p: DjangoProduct) => {
          const firstMode = p.sale_modes && p.sale_modes.length > 0 ? p.sale_modes[0] : null;
          const rawAmount = firstMode && firstMode.prices && firstMode.prices.length > 0 ? firstMode.prices[0].amount : null;
          return {
            id: p.id,
            brand: p.brand ? p.brand.name : 'GENÉRICO',
            name: p.name,
            price: rawAmount !== null ? `$${Number(rawAmount).toLocaleString('es-AR')}` : 'Consultar',
            numericPrice: rawAmount !== null ? Number(rawAmount) : 0,
            saleModeId: firstMode?.id || 1,
            saleMode: firstMode ? firstMode.type : 'Unidad',
            imageUrl: p.images && p.images.length > 0 ? p.images[0].url : '',
            isExclusive: true,
          };
        });
        setProducts(formattedProducts);
        setTotalCount(typeof data.count === 'number' ? data.count : formattedProducts.length);
      })
      .catch(err => {
        console.error("Error conectando a Django:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCategory, ordering]);

  return (
    <main style={{ padding: '2rem 4rem', maxWidth: '1280px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Inicio / <span style={{ color: 'var(--accent-gold)' }}>Catálogo Público</span>
        </p>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Colección de Grandes Reservas</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: '1.6' }}>
          Descubra obras maestras embotelladas y delicatessen. Seleccione sus productos por unidad o por caja para armar su solicitud de pedido.
        </p>
      </header>

      <div className="main-layout">
        <FilterSidebar onCategoryChange={handleCategoryChange} currentCategory={selectedCategory} />
        
        <section style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Mostrando <strong style={{ color: 'white' }}>{products.length}</strong> de <strong style={{ color: 'white' }}>{totalCount}</strong> joyas seleccionadas
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ordenar por:</span>
              <select
                value={ordering}
                onChange={(e) => handleOrderingChange(e.target.value)}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid var(--border-color)',
                  padding: '0.45rem 0.75rem',
                  minHeight: '40px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <option value="-id" style={{ background: '#111' }}>Más recientes</option>
                <option value="name" style={{ background: '#111' }}>Nombre (A-Z)</option>
                <option value="-name" style={{ background: '#111' }}>Nombre (Z-A)</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <p style={{ color: 'var(--text-secondary)', padding: '2rem 0' }}>Cargando productos de la base de datos...</p>
          ) : (
            <ProductGrid products={products} />
          )}
        </section>
      </div>

    </main>
  );
}
