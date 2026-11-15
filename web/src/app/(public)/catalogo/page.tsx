'use client';
import React, { useState, useEffect } from 'react';
import ProductGrid from '@/components/ProductGrid';
import { ProductCardProps } from '@/features/catalog/ui/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import styles from './page.module.css';

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
    <main className={styles.main}>
      
      <header className={styles.header}>
        <p className={styles.breadcrumb}>
          Inicio / <span className={styles.breadcrumbActive}>Catálogo Público</span>
        </p>
        <h1 className={styles.title}>Colección de Grandes Reservas</h1>
        <p className={styles.subtitle}>
          Descubra obras maestras embotelladas y delicatessen. Seleccione sus productos por unidad o por caja para armar su solicitud de pedido.
        </p>
      </header>

      <div className={styles.mainLayout}>
        <FilterSidebar onCategoryChange={handleCategoryChange} currentCategory={selectedCategory} />
        
        <section className={styles.contentSection}>
          <div className={styles.toolbar}>
            <p className={styles.resultsCount}>
              Mostrando <strong className={styles.resultsCountBold}>{products.length}</strong> de <strong className={styles.resultsCountBold}>{totalCount}</strong> joyas seleccionadas
            </p>
            <div className={styles.sortGroup}>
              <span className={styles.sortLabel}>Ordenar por:</span>
              <select
                value={ordering}
                onChange={(e) => handleOrderingChange(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="-id" className={styles.sortOption}>Más recientes</option>
                <option value="name" className={styles.sortOption}>Nombre (A-Z)</option>
                <option value="-name" className={styles.sortOption}>Nombre (Z-A)</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <p className={styles.loadingText}>Cargando productos de la base de datos...</p>
          ) : (
            <ProductGrid products={products} />
          )}
        </section>
      </div>

    </main>
  );
}
