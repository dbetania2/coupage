'use client';

import React from 'react';
import { Category, ProductItem } from './useAdminProducts';

interface ProductFiltersBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  categories: Category[];
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (val: 'all' | 'active' | 'inactive') => void;
  products: ProductItem[];
}

export default function ProductFiltersBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  statusFilter,
  onStatusFilterChange,
  products,
}: ProductFiltersBarProps) {
  return (
    <div className="admin-filter-bar">
      <div className="admin-filter-bar-row">
        <label className="admin-search">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre de vino, licor o bodega..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar productos"
          />
        </label>

        <div className="admin-filter-group">
          <span className="admin-filter-label">Categoría:</span>
          <select
            className="admin-select w-auto"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="Todas">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-pill-group">
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`tab-pill ${statusFilter === 'all' ? 'active' : 'inactive'}`}
          >
            Todos ({products.length})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('active')}
            className={`tab-pill ${statusFilter === 'active' ? 'active' : 'inactive'}`}
          >
            Activos ({products.filter((p) => p.isActive).length})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('inactive')}
            className={`tab-pill ${statusFilter === 'inactive' ? 'active' : 'inactive'}`}
          >
            Inactivos ({products.filter((p) => !p.isActive).length})
          </button>
        </div>
      </div>
    </div>
  );
}

