'use client';
import React, { useEffect, useState } from 'react';
import styles from './FilterSidebar.module.css';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface FilterSidebarProps {
  onCategoryChange: (category: string) => void;
  currentCategory: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Vinos' },
  { id: 2, name: 'Licores y Espirituosas' },
  { id: 3, name: 'Delicatessen' },
];

export default function FilterSidebar({ onCategoryChange, currentCategory }: FilterSidebarProps) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_CATALOG_API_URL || 'http://127.0.0.1:8000/api';
    fetch(`${baseUrl}/categories/`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch((err) => {
        console.warn('No se pudieron cargar las categorías desde la API, usando categorías por defecto.', err);
      });
  }, []);

  return (
    <aside className={styles.filterSidebar}>
      <div className={styles.filterHeader}>
        <h3>Filtros</h3>
        <button type="button" className={styles.btnClear} onClick={() => onCategoryChange('')}>
          LIMPIAR TODO
        </button>
      </div>

      <div className={styles.filterGroup}>
        <div className={styles.filterGroupHeader}>
          <h4>CATEGORÍAS</h4>
          <span>⌄</span>
        </div>
        {categories.map((cat) => (
          <label key={cat.id} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={currentCategory === cat.name}
              onChange={() => onCategoryChange(currentCategory === cat.name ? '' : cat.name)}
            />
            <span className={styles.checkmark}></span>
            {cat.name}
          </label>
        ))}
      </div>
    </aside>
  );
}
