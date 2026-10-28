'use client';
import React, { useState, useEffect, useCallback } from 'react';

interface Category {
  id: number;
  name: string;
}

interface ProductItem {
  id: number | string;
  name: string;
  description: string;
  category: { id: number; name: string } | null;
  brand: { id: number; name: string } | null;
  price: number;
  saleMode: string;
  imageUrl: string;
  isActive: boolean;
}

interface RawProductData {
  id: number | string;
  name: string;
  description?: string;
  category?: { id: number; name: string };
  brand?: { id: number; name: string };
  sale_modes?: Array<{
    type?: string;
    prices?: Array<{ amount: string | number }>;
  }>;
  images?: Array<{ url: string }>;
  is_active?: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Estado del Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    categoryId: '',
    price: '',
    saleMode: 'Unidad',
    imageUrl: '',
    description: '',
    isActive: true,
  });

  // Notificación tipo Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper para peticiones con JWT (Criterio de Aceptación T13)
  const fetchWithAuth = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('access_token') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    return fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/categories/');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      setCategories([
        { id: 1, name: 'Vinos' },
        { id: 2, name: 'Licores y Espirituosas' },
        { id: 3, name: 'Delicatessen' },
      ]);
    }
  }, [fetchWithAuth]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/products/');
      if (res.ok) {
        const data = await res.json();
        const formatted: ProductItem[] = data.map((p: RawProductData) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          category: p.category || null,
          brand: p.brand || null,
          price: p.sale_modes?.[0]?.prices?.[0]?.amount ? Number(p.sale_modes[0].prices[0].amount) : 0,
          saleMode: p.sale_modes?.[0]?.type || 'Unidad',
          imageUrl: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop',
          isActive: p.is_active !== undefined ? p.is_active : true,
        }));
        setProducts(formatted);
      } else {
        throw new Error('API offline');
      }
    } catch {
      // Datos mock iniciales si el backend está en desarrollo
      setProducts([
        {
          id: 1,
          name: 'Rutini Cabernet Malbec',
          description: 'Un vino tinto elegante, con notas de frutos rojos maduros y roble francés.',
          category: { id: 1, name: 'Vinos' },
          brand: { id: 1, name: 'Rutini Wines' },
          price: 12500,
          saleMode: 'Unidad',
          imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop',
          isActive: true,
        },
        {
          id: 2,
          name: 'Catena Zapata Malbec Argentino',
          description: 'Gran joya de la vitivinicultura argentina con aromas a cassis y moca.',
          category: { id: 1, name: 'Vinos' },
          brand: { id: 2, name: 'Catena Zapata' },
          price: 115000,
          saleMode: 'Unidad',
          imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop',
          isActive: true,
        },
        {
          id: 3,
          name: 'Johnnie Walker Blue Label',
          description: 'Blend escocés extraordinario creado con whiskies raros y excepcionales.',
          category: { id: 2, name: 'Licores y Espirituosas' },
          brand: { id: 3, name: 'Johnnie Walker' },
          price: 350000,
          saleMode: 'Unidad',
          imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=600&auto=format&fit=crop',
          isActive: true,
        },
        {
          id: 4,
          name: 'Queso Manchego Curado Añejo',
          description: 'Auténtico queso manchego de leche cruda de oveja con maduración superior a 12 meses.',
          category: { id: 3, name: 'Delicatessen' },
          brand: { id: 4, name: 'Joselito' },
          price: 25000,
          saleMode: 'Porción 250g',
          imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=600&auto=format&fit=crop',
          isActive: false, // Ejemplo de baja lógica
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  // Carga inicial de datos
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  // Abrir Modal para Crear
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      categoryId: categories[0]?.id.toString() || '1',
      price: '',
      saleMode: 'Unidad',
      imageUrl: '',
      description: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar
  const handleOpenEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand?.name || '',
      categoryId: product.category?.id.toString() || '1',
      price: product.price.toString(),
      saleMode: product.saleMode,
      imageUrl: product.imageUrl,
      description: product.description,
      isActive: product.isActive,
    });
    setIsModalOpen(true);
  };

  // Guardar (Alta o Modificación)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('El nombre del producto es obligatorio');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      category_id: Number(formData.categoryId),
      brand_name: formData.brand,
      price: Number(formData.price) || 0,
      sale_mode: formData.saleMode,
      image_url: formData.imageUrl || 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop',
      is_active: formData.isActive,
    };

    try {
      if (editingProduct) {
        // Modificación (PUT / PATCH)
        await fetchWithAuth(`/products/${editingProduct.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });

        // Actualizar estado local
        setProducts(prev => prev.map(p => {
          if (p.id === editingProduct.id) {
            const cat = categories.find(c => c.id === Number(formData.categoryId));
            return {
              ...p,
              name: formData.name,
              description: formData.description,
              brand: formData.brand ? { id: p.brand?.id || 99, name: formData.brand } : null,
              category: cat ? { id: cat.id, name: cat.name } : p.category,
              price: Number(formData.price) || 0,
              saleMode: formData.saleMode,
              imageUrl: payload.image_url,
              isActive: formData.isActive,
            };
          }
          return p;
        }));
        showToast(`✅ Producto "${formData.name}" modificado exitosamente.`);
      } else {
        // Alta (POST)
        await fetchWithAuth('/products/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        const newId = Date.now();
        const cat = categories.find(c => c.id === Number(formData.categoryId));
        const newProduct: ProductItem = {
          id: newId,
          name: formData.name,
          description: formData.description,
          brand: formData.brand ? { id: 99, name: formData.brand } : null,
          category: cat ? { id: cat.id, name: cat.name } : null,
          price: Number(formData.price) || 0,
          saleMode: formData.saleMode,
          imageUrl: payload.image_url,
          isActive: formData.isActive,
        };

        setProducts(prev => [newProduct, ...prev]);
        showToast(`🎉 Nuevo producto "${formData.name}" creado con éxito.`);
      }

      setIsModalOpen(false);
    } catch {
      showToast('⚠️ No se pudo sincronizar con el servidor, cambio aplicado localmente.');
      setIsModalOpen(false);
    }
  };

  // Baja Lógica / Alta Lógica (Toggle de Estado)
  const handleToggleStatus = async (product: ProductItem) => {
    const updatedStatus = !product.isActive;
    const actionName = updatedStatus ? 'activado' : 'desactivado (baja lógica)';

    try {
      await fetchWithAuth(`/products/${product.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: updatedStatus }),
      });
    } catch {
      // Manejo silencioso en caso de backend desconectado
    }

    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: updatedStatus } : p));
    showToast(`ℹ️ Producto "${product.name}" ${actionName}.`);
  };

  // Filtrado de la grilla
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand?.name && p.brand.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todas' || p.category?.name === selectedCategory;

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'inactive' && !p.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#0d1527',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          border: '1px solid #2563eb',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'fadeIn 0.3s ease',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}>
          {toastMessage}
        </div>
      )}

      {/* Header Superior con Botón de Creación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem', fontFamily: 'Inter, sans-serif' }}>
            Gestión de Inventario y Catálogo
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Alta, edición, fijación de precios y control de visibilidad (baja lógica) de los productos.
          </p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn-primary-blue" style={{ padding: '0.75rem 1.4rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          + Nuevo Producto
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Input Buscador */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0.6rem 0.9rem',
          minWidth: '320px',
          flex: 1,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre de vino, licor o bodega..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a' }}
          />
        </div>

        {/* Filtro por Categoría */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Categoría:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.6rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '0.88rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="Todas">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Estado (Activo/Inactivo) */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => setStatusFilter('all')}
            className={`tab-pill ${statusFilter === 'all' ? 'active' : 'inactive'}`}
          >
            Todos ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`tab-pill ${statusFilter === 'active' ? 'active' : 'inactive'}`}
          >
            Activos ({products.filter(p => p.isActive).length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`tab-pill ${statusFilter === 'inactive' ? 'active' : 'inactive'}`}
          >
            Inactivos ({products.filter(p => !p.isActive).length})
          </button>
        </div>
      </div>

      {/* Data Grid: Tabla de Productos */}
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Foto</th>
              <th>Producto & Bodega</th>
              <th>Categoría</th>
              <th>Modalidad</th>
              <th>Precio</th>
              <th>Estado</th>
              <th style={{ textAlign: 'center', width: '180px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  Cargando catálogo de productos...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No se encontraron productos que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id}>
                  {/* Foto Miniatura (Estrategia de Almacenamiento) */}
                  <td>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=300&auto=format&fit=crop';
                        }}
                      />
                    </div>
                  </td>

                  {/* Nombre y Marca */}
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.brand?.name || 'Bodega General'}</div>
                  </td>

                  {/* Categoría */}
                  <td>
                    <span style={{
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}>
                      {p.category?.name || 'Sin categoría'}
                    </span>
                  </td>

                  {/* Modalidad */}
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>{p.saleMode}</span>
                  </td>

                  {/* Precio */}
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                      ${p.price.toLocaleString('es-AR')}
                    </span>
                  </td>

                  {/* Estado (Alta/Baja Lógica) */}
                  <td>
                    <span className={`badge-status ${p.isActive ? 'badge-completado' : 'badge-cancelado'}`}>
                      {p.isActive ? '● Activo' : '○ Inactivo'}
                    </span>
                  </td>

                  {/* Botones de Acción */}
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="btn-secondary-white"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleStatus(p)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          fontSize: '0.78rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                          backgroundColor: p.isActive ? '#fee2e2' : '#dcfce7',
                          color: p.isActive ? '#dc2626' : '#16a34a',
                          transition: 'all 0.2s',
                        }}
                        title={p.isActive ? 'Desactivar producto (Baja lógica)' : 'Reactivar producto'}
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

        {/* Footer de Paginación / Resumen */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          fontSize: '0.85rem',
          color: '#64748b',
        }}>
          <span>Mostrando {filteredProducts.length} de {products.length} productos en catálogo</span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>API Endpoint: <code>/api/products/</code> (JWT Protected)</span>
        </div>
      </div>

      {/* MODAL DE ALTA Y EDICIÓN (ABM) */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '1.5rem',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'scaleIn 0.2s ease',
          }}>
            {/* Cabecera del Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                  {editingProduct ? 'Editar Producto' : 'Dar de Alta Nuevo Producto'}
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {editingProduct ? `Modificando ID #${editingProduct.id}` : 'Ingrese los datos para añadir al catálogo digital'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.5rem' }}
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Nombre del Producto */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Catena Zapata Malbec Argentino"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              {/* Categoría y Marca (Grid 2 columnas) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Categoría *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff', outline: 'none' }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Marca / Bodega
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Rutini, Johnnie Walker"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Precio y Modalidad (Grid 2 columnas) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Precio ($ ARS) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej: 12500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Modalidad de Venta *
                  </label>
                  <select
                    value={formData.saleMode}
                    onChange={(e) => setFormData({ ...formData, saleMode: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff', outline: 'none' }}
                  >
                    <option value="Unidad">Unidad</option>
                    <option value="Caja (6 un.)">Caja (6 un.)</option>
                    <option value="Caja (12 un.)">Caja (12 un.)</option>
                    <option value="Porción 250g">Porción 250g</option>
                  </select>
                </div>
              </div>

              {/* Estrategia de Imágenes (URL / Storage CDN) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  URL de Imagen (Cloudinary / Django Media)
                </label>
                <input
                  type="url"
                  placeholder="https://... o http://localhost:8000/media/imagen.png"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
                {/* Previsualización en tiempo real */}
                {formData.imageUrl && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>✓ Vista previa de imagen cargada</span>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Notas de Cata / Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre aromas, cosecha, maridaje y crianza en barrica..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Toggle de Estado (Activo / Baja Lógica) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                />
                <label htmlFor="isActiveToggle" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                  Producto Activo (Visible en el catálogo público)
                </label>
              </div>

              {/* Botones del Modal */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-blue"
                  style={{ minWidth: '140px', justifyContent: 'center' }}
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
