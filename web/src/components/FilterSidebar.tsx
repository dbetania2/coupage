'use client';
import React from 'react';

interface FilterSidebarProps {
  onCategoryChange: (category: string) => void;
  currentCategory: string;
}

export default function FilterSidebar({ onCategoryChange, currentCategory }: FilterSidebarProps) {
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
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={currentCategory === 'Vinos'} 
            onChange={() => onCategoryChange(currentCategory === 'Vinos' ? '' : 'Vinos')} 
          />
          <span className="checkmark"></span>
          Vinos
        </label>
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={currentCategory === 'Licores'} 
            onChange={() => onCategoryChange(currentCategory === 'Licores' ? '' : 'Licores')} 
          />
          <span className="checkmark"></span>
          Licores y Espirituosas
        </label>
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={currentCategory === 'Delicatessen'} 
            onChange={() => onCategoryChange(currentCategory === 'Delicatessen' ? '' : 'Delicatessen')} 
          />
          <span className="checkmark"></span>
          Delicatessen
        </label>
      </div>

    </aside>
  );
}
