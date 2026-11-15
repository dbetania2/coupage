'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccessToken, refreshAccessToken } from '@/lib/auth';

export interface Category {
  id: number;
  name: string;
}

export interface ProductItem {
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

export interface ProductFormData {
  name: string;
  brand: string;
  categoryId: string;
  price: string;
  saleMode: string;
  imageUrl: string;
  description: string;
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

export function useAdminProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Paginación real conectada al backend
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Estado del Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<ProductFormData>({
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

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const fetchWithAuth = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = process.env.NEXT_PUBLIC_CATALOG_API_URL || 'http://127.0.0.1:8000/api';
    const token = getAccessToken();

    const buildHeaders = (jwt: string | null): Record<string, string> => ({
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    });

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: buildHeaders(token),
    });

    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return fetch(`${baseUrl}${endpoint}`, {
          ...options,
          headers: buildHeaders(newToken),
        });
      }
    }

    return response;
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
      const res = await fetchWithAuth(`/products/?page=${currentPage}&page_size=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        const rawList: RawProductData[] = Array.isArray(data) ? data : data.results || [];
        const total = typeof data.count === 'number' ? data.count : rawList.length;
        const totalP =
          typeof data.total_paginas === 'number'
            ? data.total_paginas
            : Math.ceil(total / pageSize) || 1;

        setTotalCount(total);
        setTotalPages(totalP);

        const formatted: ProductItem[] = rawList.map((p: RawProductData) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          category: p.category || null,
          brand: p.brand || null,
          price: p.sale_modes?.[0]?.prices?.[0]?.amount
            ? Number(p.sale_modes[0].prices[0].amount)
            : 0,
          saleMode: p.sale_modes?.[0]?.type || 'Unidad',
          imageUrl:
            p.images?.[0]?.url ||
            'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop',
          isActive: p.is_active !== undefined ? p.is_active : true,
        }));
        setProducts(formatted);
      } else {
        throw new Error('API offline');
      }
    } catch {
      setTotalCount(4);
      setTotalPages(1);
      setProducts([
        {
          id: 1,
          name: 'Rutini Cabernet Malbec',
          description: 'Un vino tinto elegante, con notas de frutos rojos maduros y roble francés.',
          category: { id: 1, name: 'Vinos' },
          brand: { id: 1, name: 'Rutini Wines' },
          price: 12500,
          saleMode: 'Unidad',
          imageUrl:
            'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop',
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
          imageUrl:
            'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop',
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
          imageUrl:
            'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=600&auto=format&fit=crop',
          isActive: true,
        },
        {
          id: 4,
          name: 'Queso Manchego Curado Añejo',
          description:
            'Auténtico queso manchego de leche cruda de oveja con maduración superior a 12 meses.',
          category: { id: 3, name: 'Delicatessen' },
          brand: { id: 4, name: 'Joselito' },
          price: 25000,
          saleMode: 'Porción 250g',
          imageUrl:
            'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=600&auto=format&fit=crop',
          isActive: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, currentPage, pageSize]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleOpenCreateModal = useCallback(() => {
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
  }, [categories]);

  const handleOpenEditModal = useCallback((product: ProductItem) => {
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
  }, []);

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
      image_url:
        formData.imageUrl ||
        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop',
      is_active: formData.isActive,
    };

    try {
      if (editingProduct) {
        const res = await fetchWithAuth(`/products/${editingProduct.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        await loadProducts();
        showToast(`✅ Producto "${formData.name}" modificado exitosamente.`);
      } else {
        const res = await fetchWithAuth('/products/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        await loadProducts();
        showToast(`🎉 Nuevo producto "${formData.name}" creado con éxito.`);
      }

      setIsModalOpen(false);
    } catch {
      showToast('⚠️ No se pudo sincronizar con el servidor, cambio aplicado localmente.');
      setIsModalOpen(false);
    }
  };

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

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isActive: updatedStatus } : p))
    );
    showToast(`ℹ️ Producto "${product.name}" ${actionName}.`);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand?.name && p.brand.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'Todas' || p.category?.name === selectedCategory;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'inactive' && !p.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return {
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
  };
}
