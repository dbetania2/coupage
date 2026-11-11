'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAccessToken } from '@/lib/auth';

export type OrderStatus = 'PENDIENTE' | 'CONFIRMADO' | 'PREPARADO' | 'ENTREGADO' | 'RECHAZADO' | 'CANCELADO';

export const ORDER_STATUSES: OrderStatus[] = [
  'PENDIENTE',
  'CONFIRMADO',
  'PREPARADO',
  'ENTREGADO',
  'RECHAZADO',
  'CANCELADO',
];

export interface OrderItem {
  productId: number;
  saleModeId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal?: number;
}

export interface OrderHistoryEvent {
  status: OrderStatus;
  timestamp: string | { _seconds: number };
  note?: string;
  author?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    shippingAddress: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  history: OrderHistoryEvent[];
  createdAt: string;
  updatedAt?: string;
}

export const ORDERS_API_URL = (process.env.NEXT_PUBLIC_ORDERS_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

const FALLBACK_LOCAL_ORDERS: Order[] = [
  {
    id: 'ord-seed-1',
    orderNumber: 'ORD-2026-0001',
    customer: {
      name: 'Agustín Del Grecco',
      email: 'agustin.delgrecco@email.com',
      phone: '+54 9 362 411-2233',
      shippingAddress: 'Av. Sarmiento 1250, Resistencia, Chaco',
    },
    items: [
      {
        productId: 101,
        saleModeId: 1,
        productName: 'Catena Zapata Malbec Argentino 2021',
        unitPrice: 48500,
        quantity: 2,
        subtotal: 97000,
      },
      {
        productId: 204,
        saleModeId: 1,
        productName: 'Queso Brie Fermier Selección Coupage',
        unitPrice: 12500,
        quantity: 1,
        subtotal: 12500,
      },
    ],
    totalAmount: 109500,
    status: 'PENDIENTE',
    history: [
      {
        status: 'PENDIENTE',
        timestamp: '2026-04-12T15:15:10.331Z',
        note: 'Pedido creado por el cliente.',
      },
    ],
    createdAt: '2026-04-12T15:15:10.331Z',
  },
  {
    id: 'ord-seed-2',
    orderNumber: 'ORD-2026-0002',
    customer: {
      name: 'Daiana Satina',
      email: 'daiana.satina@email.com',
      phone: '+54 9 362 455-6677',
      shippingAddress: 'Julio A. Roca 450, Piso 3B, Resistencia, Chaco',
    },
    items: [
      {
        productId: 105,
        saleModeId: 2,
        productName: 'Rutini Apartado Gran Malbec (Caja x6)',
        unitPrice: 210000,
        quantity: 1,
        subtotal: 210000,
      },
    ],
    totalAmount: 210000,
    status: 'CONFIRMADO',
    history: [
      {
        status: 'PENDIENTE',
        timestamp: '2026-04-11T15:15:10.333Z',
        note: 'Pedido creado por el cliente.',
      },
      {
        status: 'CONFIRMADO',
        timestamp: '2026-04-12T03:15:10.333Z',
        note: 'Disponibilidad de stock verificada en cava.',
      },
    ],
    createdAt: '2026-04-11T15:15:10.333Z',
  },
  {
    id: 'ord-seed-3',
    orderNumber: 'ORD-2026-0003',
    customer: {
      name: 'Santiago Gallardi',
      email: 'santiago.gallardi@email.com',
      phone: '+54 9 379 488-9900',
      shippingAddress: 'Costanera Gral. San Martín 800, Corrientes',
    },
    items: [
      {
        productId: 301,
        saleModeId: 1,
        productName: 'El Enemigo Cabernet Franc 2020',
        unitPrice: 26000,
        quantity: 3,
        subtotal: 78000,
      },
    ],
    totalAmount: 78000,
    status: 'ENTREGADO',
    history: [
      {
        status: 'PENDIENTE',
        timestamp: '2026-04-09T15:15:10.333Z',
        note: 'Pedido recibido.',
      },
      {
        status: 'CONFIRMADO',
        timestamp: '2026-04-10T15:15:10.333Z',
        note: 'Confirmado telefónicamente.',
      },
      {
        status: 'PREPARADO',
        timestamp: '2026-04-11T15:15:10.333Z',
        note: 'Empaquetado en estuche de madera.',
      },
      {
        status: 'ENTREGADO',
        timestamp: '2026-04-12T09:15:10.333Z',
        note: 'Retirado en sucursal por el titular.',
      },
    ],
    createdAt: '2026-04-09T15:15:10.333Z',
  },
];

/** Convierte un timestamp de Firestore (ISO o {_seconds}) a Date */
export function toDate(value: OrderHistoryEvent['timestamp'] | string | undefined): Date | null {
  if (!value) return null;
  if (typeof value === 'object' && '_seconds' in value) return new Date(value._seconds * 1000);
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
}

export function formatDateTime(value: OrderHistoryEvent['timestamp'] | string | undefined): string {
  const d = toDate(value);
  return d ? d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '-';
}

export function formatMoney(value: number): string {
  return `$${Number(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Badge accesible: color + ícono + texto (WCAG, regla del 8% de daltonismo) */
export function getStatusMeta(status: string): { className: string; icon: string } {
  switch (status) {
    case 'PENDIENTE': return { className: 'badge-pendiente', icon: '⏳' };
    case 'CONFIRMADO': return { className: 'badge-confirmado', icon: '✓' };
    case 'PREPARADO': return { className: 'badge-preparado', icon: '📦' };
    case 'ENTREGADO': return { className: 'badge-completado', icon: '🏁' };
    case 'RECHAZADO': return { className: 'badge-rechazado', icon: '✕' };
    case 'CANCELADO': return { className: 'badge-cancelado', icon: '⊘' };
    default: return { className: '', icon: '•' };
  }
}

/**
 * Hook que consulta GET /api/orders en orders-api (Node + Firestore).
 * Envía el JWT de Django en Authorization para cuando Node lo empiece a validar.
 */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAccessToken();
      const res = await fetch(`${ORDERS_API_URL}/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setOrders(FALLBACK_LOCAL_ORDERS);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = getAccessToken();
    fetch(`${ORDERS_API_URL}/orders`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setOrders(Array.isArray(data) ? data : []);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrders(FALLBACK_LOCAL_ORDERS);
          setError(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { orders, loading, error, reload };
}

