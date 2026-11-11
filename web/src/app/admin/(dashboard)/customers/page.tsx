'use client';

import React, { useMemo } from 'react';
import { useOrders, getStatusMeta, formatMoney } from '@/features/orders/useOrders';

interface AggregatedCustomer {
  key: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  ordersCount: number;
  totalSpent: number;
  lastStatus: string;
  lastOrderNumber: string;
}

export default function AdminCustomersPage() {
  const { orders, loading, error } = useOrders();

  const customers = useMemo<AggregatedCustomer[]>(() => {
    const map = new Map<string, AggregatedCustomer>();
    orders.forEach((order) => {
      const email = order.customer?.email || 'sin-email';
      const name = order.customer?.name || 'Cliente';
      const key = email.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpent += Number(order.totalAmount || 0);
      } else {
        map.set(key, {
          key,
          name,
          email: order.customer?.email || '-',
          phone: order.customer?.phone || '-',
          address: order.customer?.shippingAddress || '-',
          ordersCount: 1,
          totalSpent: Number(order.totalAmount || 0),
          lastStatus: order.status,
          lastOrderNumber: order.orderNumber || order.id,
        });
      }
    });
    return Array.from(map.values());
  }, [orders]);

  return (
    <div>
      <header style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Directorio de Solicitantes · Cloud Firestore (orders-api)
        </span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem', fontFamily: 'Inter, sans-serif' }}>
          Clientes y Datos de Contacto
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Compradores reales registrados en las solicitudes de pedido de Cloud Firestore ({customers.length} clientes únicos).
        </p>
      </header>

      {error && (
        <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Comprador</th>
              <th>Contacto (Email / Teléfono)</th>
              <th>Dirección / Notas de Entrega</th>
              <th>Solicitudes</th>
              <th>Monto Acumulado</th>
              <th>Última Solicitud</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Cargando clientes desde Firestore...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No hay clientes registrados aún en Firestore.
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const meta = getStatusMeta(c.lastStatus);
                return (
                  <tr key={c.key}>
                    <td><strong>{c.name}</strong></td>
                    <td>
                      <div>{c.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.phone}</div>
                    </td>
                    <td>{c.address}</td>
                    <td><strong>{c.ordersCount}</strong> pedido(s)</td>
                    <td className="order-amount">{formatMoney(c.totalSpent)}</td>
                    <td>
                      <span className={`badge-status ${meta.className}`}>
                        {meta.icon} {c.lastOrderNumber} · {c.lastStatus}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
