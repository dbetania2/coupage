'use client';
import React, { useEffect, useState } from 'react';

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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    fetch(`${baseUrl}/categories/`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(err => {
        console.warn("No se pudieron cargar las categorías desde la API, usando categorías por defecto.", err);
      });
  }, []);

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3>Filtros</h3>
        <button className="btn-clear" onClick={() => onCategoryChange('')}>LIMPIAR TODO</button>
      </div>

      <div className="filter-group">
        <div className="filter-group-header">
          <h4>CATEGORÍAS</h4>
          <span>⌄</span>
        </div>
        {categories.map((cat) => (
          <label key={cat.id} className="checkbox-label">
            <input 
              type="checkbox" 
              checked={currentCategory === cat.name} 
              onChange={() => onCategoryChange(currentCategory === cat.name ? '' : cat.name)} 
            />
            <span className="checkmark"></span>
            {cat.name}
          </label>
        ))}
      </div>
    </aside>
  );
}
