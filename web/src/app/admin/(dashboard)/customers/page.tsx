'use client';

import React, { useMemo } from 'react';
import { useOrders, getStatusMeta, formatMoney } from '@/features/orders/useOrders';
import { AdminPageHeader, AdminAlert } from '@/shared/ui/admin';

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
      <AdminPageHeader
        eyebrow="Directorio de Solicitantes · Cloud Firestore (orders-api)"
        title="Clientes y Datos de Contacto"
        subtitle={`Compradores reales registrados en las solicitudes de pedido de Cloud Firestore (${customers.length} clientes únicos).`}
      />

      {error && <AdminAlert variant="danger">⚠️ {error}</AdminAlert>}

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
                <td colSpan={6} className="table-empty-cell">Cargando clientes desde Firestore...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-empty-cell">No hay clientes registrados aún en Firestore.</td>
              </tr>
            ) : (
              customers.map((c) => {
                const meta = getStatusMeta(c.lastStatus);
                return (
                  <tr key={c.key}>
                    <td><strong>{c.name}</strong></td>
                    <td>
                      <div>{c.email}</div>
                      <div className="cell-subtitle">{c.phone}</div>
                    </td>
                    <td>{c.address}</td>
                    <td><strong>{c.ordersCount}</strong> pedido(s)</td>
                    <td className="text-strong">{formatMoney(c.totalSpent)}</td>
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
