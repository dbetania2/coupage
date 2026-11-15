'use client';

import React from 'react';
import { useOrders, formatMoney, getStatusMeta } from '@/features/orders/useOrders';
import { AdminPageHeader } from '@/shared/ui/admin';

const STATUS_LIST = ['PENDIENTE', 'CONFIRMADO', 'PREPARADO', 'ENTREGADO', 'CANCELADO', 'RECHAZADO'];

export default function AdminReportsPage() {
  const { orders, loading } = useOrders();

  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELADO' && o.status !== 'RECHAZADO')
    .reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Métricas Operativas · Pedidos y Catálogo"
        title="Reportes y Estadísticas de Solicitudes"
        subtitle={`Resumen en tiempo real de las órdenes almacenadas en Cloud Firestore (${totalOrders} solicitudes · ${formatMoney(totalRevenue)} monto activo).`}
      />

      <div className="admin-grid-2">
        <section className="admin-card">
          <h2 className="admin-card-title">1. Distribución Real por Estado de Solicitud (Firestore)</h2>
          {loading ? (
            <p className="text-muted text-sm">Calculando métricas desde orders-api...</p>
          ) : (
            <div className="admin-list">
              {STATUS_LIST.map((st) => {
                const count = orders.filter((o) => o.status === st).length;
                const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                const meta = getStatusMeta(st);
                return (
                  <div key={st} className="admin-list-row">
                    <span className={`badge-status ${meta.className}`}>
                      {meta.icon} {st}
                    </span>
                    <span className="text-strong">{count} solicitud(es) ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="admin-card">
          <h2 className="admin-card-title">2. Productos Solicitados en Pedidos Activos</h2>
          {loading ? (
            <p className="text-muted text-sm">Cargando ítems...</p>
          ) : (
            <div className="admin-list">
              {orders.flatMap((o) => o.items || []).slice(0, 6).map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="admin-list-row">
                  <strong className="text-strong">{item.productName}</strong>
                  <span className="cell-meta">
                    {item.quantity} u. · {formatMoney(item.subtotal || item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="admin-placeholder-box">
                [Aquí se integrarán gráficos avanzados de tiempos promedio de transición de estado una vez habilitado PATCH /api/orders/:id/status].
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
