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
    type: string;
    prices: { amount: string | number }[];
  }[];
}

export default function Home() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ordering, setOrdering] = useState<string>('-id');

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
      .then(res => res.json())
      .then(data => {
        const rawList: DjangoProduct[] = Array.isArray(data) ? data : (data.results || []);
        // Adaptamos el JSON complejo de Django al formato simple de las tarjetas
        const formattedProducts = rawList.map((p: DjangoProduct) => ({
          id: p.id,
          brand: p.brand ? p.brand.name : 'GENÉRICO',
          name: p.name,
          // Tomamos el primer precio de la primera modalidad de venta si existe
          price: p.sale_modes && p.sale_modes.length > 0 && p.sale_modes[0].prices.length > 0 
            ? `$${p.sale_modes[0].prices[0].amount}` 
            : 'Consultar',
          saleMode: p.sale_modes && p.sale_modes.length > 0 ? p.sale_modes[0].type : 'Consultar',
          imageUrl: p.images && p.images.length > 0 ? p.images[0].url : '',
          isExclusive: true // hardcodeado para mantener la estética
        }));
        setProducts(formattedProducts);
        setTotalCount(typeof data.count === 'number' ? data.count : formattedProducts.length);
      })
      .catch(err => console.error("Error conectando a Django:", err));
  }, [selectedCategory, ordering]);

  return (
    <main style={{ padding: '2rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Inicio / <span style={{ color: 'var(--accent-gold)' }}>Catálogo Público</span>
        </p>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Colección de Grandes Reservas</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.6' }}>
          Descubra obras maestras embotelladas. Cosechas excepcionales, vinos de autor seleccionados
          meticulosamente por nuestro panel de expertos sumilleres.
        </p>
      </header>

      <div className="main-layout">
        {/* Pasamos la función para cambiar la categoría al sidebar */}
        <FilterSidebar onCategoryChange={setSelectedCategory} currentCategory={selectedCategory} />
        
        <section style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Mostrando <strong style={{color: 'white'}}>{products.length}</strong> de <strong style={{color: 'white'}}>{totalCount}</strong> joyas seleccionadas</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ordenar por:</span>
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid var(--border-color)',
                  padding: '0.3rem 0.6rem',
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
          
          {/* Pasamos los productos traídos de la API a la grilla */}
          <ProductGrid products={products} />
        </section>
      </div>

    </main>
  );
}
