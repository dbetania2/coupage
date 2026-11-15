'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCartUI } from '@/features/cart/context/CartUIContext';
import styles from './product-detail.module.css';

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
      <main className={styles.emptyState}>
        Cargando joya seleccionada desde la base de datos...
      </main>
    );
  }

  if (!product) {
    return (
      <main className={styles.emptyState}>
        <h2 className={styles.notFoundTitle}>Producto no encontrado</h2>
        <p className={styles.notFoundDesc}>
          La joya gastronómica solicitada no está disponible o el servidor de catálogo no está activo.
        </p>
        <Link href="/catalogo" className={styles.notFoundLink}>
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
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/catalogo" className={styles.backLink}>
          ← Volver al Catálogo Público
        </Link>
      </div>

      <div className={styles.layoutGrid}>
        {/* Columna Izquierda: Imagen */}
        <div className={styles.galleryCard}>
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
            className={styles.productImage}
          />
        </div>

        {/* Columna Derecha: Detalles y Controles de Selección */}
        <div className={styles.detailsCol}>
          <div>
            <p className={styles.brandCategory}>
              {brandName} · {categoryName}
            </p>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <p className={styles.productPrice}>
              {numericPrice > 0 ? `$${numericPrice.toLocaleString('es-AR')}` : 'Consultar'}
            </p>
          </div>
          
          <div className={styles.tastingNotesCard}>
            <p className={styles.sectionEyebrow}>
              Notas de Cata y Descripción
            </p>
            <p className={styles.tastingNotesText}>
              {product.description || 'Sin descripción adicional registrada.'}
            </p>
          </div>

          {/* Selector de Modalidad de Venta (Unidad vs. Caja/Paquete) */}
          <div>
            <p className={styles.modalityHeading}>
              Modalidad Habilitada
            </p>
            <div className={styles.modalityGrid}>
              {saleModes.map((mode, idx) => {
                const modeAmount = mode.prices?.[0]?.amount ? Number(mode.prices[0].amount) : 0;
                const isSelected = selectedModalityIndex === idx;
                return (
                  <button
                    key={mode.id || mode.type}
                    type="button"
                    onClick={() => setSelectedModalityIndex(idx)}
                    className={`${styles.modalityBtn} ${isSelected ? styles.modalityBtnActive : ''}`}
                  >
                    <strong className={`${styles.modalityName} ${isSelected ? styles.modalityNameActive : ''}`}>
                      {mode.type}
                    </strong>
                    <span className={styles.modalityPrice}>
                      {modeAmount > 0 ? `$${modeAmount.toLocaleString('es-AR')}` : 'Consultar'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Cantidad y Botón Principal (Ley de Fitts >= 44px) */}
          <div className={styles.actionsRow}>
            <div className={styles.quantityPicker}>
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className={styles.quantityBtn}
                aria-label="Disminuir cantidad"
              >
                −
              </button>
              <span className={styles.quantityValue}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(prev => prev + 1)}
                className={styles.quantityBtn}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className={`btn-add-cart ${styles.addCartBtn}`}
            >
              AGREGAR AL CARRITO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
