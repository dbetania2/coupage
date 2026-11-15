'use client';

import React from 'react';
import { AdminPageHeader } from '@/shared/ui/admin';
import { useAdminProducts } from './useAdminProducts';
import ProductFiltersBar from './ProductFiltersBar';
import ProductTable from './ProductTable';
import ProductFormModal from './ProductFormModal';

export default function AdminProductsPage() {
  const {
    products,
    filteredProducts,
    categories,
    loading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    isModalOpen,
    editingProduct,
    formData,
    setFormData,
    toastMessage,
    closeModal,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSubmit,
    handleToggleStatus,
  } = useAdminProducts();

  return (
    <div>
      {toastMessage && (
        <div className="admin-toast" role="status">
          {toastMessage}
        </div>
      )}

      <AdminPageHeader
        title="Gestión de Inventario y Catálogo"
        subtitle="Alta, edición, fijación de precios y control de visibilidad (baja lógica) de los productos."
        actions={
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="btn-admin btn-admin-primary"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nuevo Producto
          </button>
        }
      />

      <ProductFiltersBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        products={products}
      />

      <ProductTable
        loading={loading}
        products={products}
        filteredProducts={filteredProducts}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onEdit={handleOpenEditModal}
        onToggleStatus={handleToggleStatus}
      />

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
