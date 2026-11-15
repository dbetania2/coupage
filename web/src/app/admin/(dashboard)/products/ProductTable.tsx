'use client';

import React from 'react';
import { AdminPagination } from '@/shared/ui/admin';
import { ProductItem } from './useAdminProducts';

interface ProductTableProps {
  loading: boolean;
  products: ProductItem[];
  filteredProducts: ProductItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (product: ProductItem) => void;
  onToggleStatus: (product: ProductItem) => void;
}

export default function ProductTable({
  loading,
  products,
  filteredProducts,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onToggleStatus,
}: ProductTableProps) {
  return (
    <div className="admin-table-card">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Producto &amp; Bodega</th>
            <th>Categoría</th>
            <th>Modalidad</th>
            <th>Precio</th>
            <th>Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="table-empty-cell">
                Cargando catálogo de productos...
              </td>
            </tr>
          ) : filteredProducts.length === 0 ? (
            <tr>
              <td colSpan={7} className="table-empty-cell">
                No se encontraron productos que coincidan con los filtros.
              </td>
            </tr>
          ) : (
            filteredProducts.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="admin-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=300&auto=format&fit=crop';
                      }}
                    />
                  </div>
                </td>
                <td>
                  <div className="cell-title">{p.name}</div>
                  <div className="cell-subtitle">{p.brand?.name || 'Bodega General'}</div>
                </td>
                <td>
                  <span className="admin-chip">{p.category?.name || 'Sin categoría'}</span>
                </td>
                <td className="cell-meta">{p.saleMode}</td>
                <td className="cell-title">${p.price.toLocaleString('es-AR')}</td>
                <td>
                  <span
                    className={`badge-status ${p.isActive ? 'badge-completado' : 'badge-cancelado'}`}
                  >
                    {p.isActive ? '● Activo' : '○ Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="btn-admin btn-admin-secondary btn-admin-sm"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(p)}
                      className={`btn-admin btn-admin-sm ${p.isActive ? 'btn-admin-danger' : 'btn-admin-success'}`}
                      title={
                        p.isActive
                          ? 'Desactivar producto (Baja lógica)'
                          : 'Reactivar producto'
                      }
                    >
                      {p.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <AdminPagination
        summary={`Mostrando ${filteredProducts.length} de ${totalCount || products.length} productos en catálogo`}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        disabled={loading}
      />
    </div>
  );
}

