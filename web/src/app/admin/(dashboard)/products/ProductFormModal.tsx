'use client';

import React from 'react';
import { AdminModal } from '@/shared/ui/admin';
import { Category, ProductItem, ProductFormData } from './useAdminProducts';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: ProductItem | null;
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  formData,
  setFormData,
  categories,
  onSubmit,
}: ProductFormModalProps) {
  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={620}
      title={editingProduct ? 'Editar Producto' : 'Dar de Alta Nuevo Producto'}
      subtitle={
        editingProduct
          ? `Modificando ID #${editingProduct.id}`
          : 'Ingrese los datos para añadir al catálogo digital'
      }
    >
      <form onSubmit={onSubmit} className="admin-form">
        <div>
          <label htmlFor="product-name" className="admin-label">
            Nombre del Producto *
          </label>
          <input
            id="product-name"
            type="text"
            required
            className="admin-input"
            placeholder="Ej: Catena Zapata Malbec Argentino"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="admin-form-row">
          <div>
            <label htmlFor="product-category" className="admin-label">
              Categoría *
            </label>
            <select
              id="product-category"
              className="admin-select"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="product-brand" className="admin-label">
              Marca / Bodega
            </label>
            <input
              id="product-brand"
              type="text"
              className="admin-input"
              placeholder="Ej: Rutini, Johnnie Walker"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>
        </div>

        <div className="admin-form-row">
          <div>
            <label htmlFor="product-price" className="admin-label">
              Precio ($ ARS) *
            </label>
            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              className="admin-input"
              placeholder="Ej: 12500"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="product-salemode" className="admin-label">
              Modalidad de Venta *
            </label>
            <select
              id="product-salemode"
              className="admin-select"
              value={formData.saleMode}
              onChange={(e) => setFormData({ ...formData, saleMode: e.target.value })}
            >
              <option value="Unidad">Unidad</option>
              <option value="Caja (6 un.)">Caja (6 un.)</option>
              <option value="Caja (12 un.)">Caja (12 un.)</option>
              <option value="Porción 250g">Porción 250g</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="product-image" className="admin-label">
            URL de Imagen (Cloudinary / Django Media)
          </label>
          <input
            id="product-image"
            type="url"
            className="admin-input"
            placeholder="https://... o http://localhost:8000/media/imagen.png"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />
          {formData.imageUrl && (
            <div className="admin-image-preview">
              <div className="admin-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.imageUrl} alt="Preview" />
              </div>
              <span>✓ Vista previa de imagen cargada</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="product-description" className="admin-label">
            Notas de Cata / Descripción
          </label>
          <textarea
            id="product-description"
            rows={3}
            className="admin-textarea"
            placeholder="Detalles sobre aromas, cosecha, maridaje y crianza en barrica..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="admin-checkbox-row">
          <input
            type="checkbox"
            id="isActiveToggle"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <label htmlFor="isActiveToggle">
            Producto Activo (Visible en el catálogo público)
          </label>
        </div>

        <div className="admin-form-actions">
          <button type="button" onClick={onClose} className="btn-admin btn-admin-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-admin btn-admin-primary btn-admin-wide">
            {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

