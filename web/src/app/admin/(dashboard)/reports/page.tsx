'use client';

import React from 'react';
import { useOrders, formatMoney, getStatusMeta } from '@/features/orders/useOrders';

const STATUS_LIST = ['PENDIENTE', 'CONFIRMADO', 'PREPARADO', 'ENTREGADO', 'CANCELADO', 'RECHAZADO'];

export default function AdminReportsPage() {
  const { orders, loading } = useOrders();

  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELADO' && o.status !== 'RECHAZADO')
    .reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);

  return (
    <div>
      <header style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Métricas Operativas · Pedidos y Catálogo
        </span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem', fontFamily: 'Inter, sans-serif' }}>
          Reportes y Estadísticas de Solicitudes
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Resumen en tiempo real de las órdenes almacenadas en Cloud Firestore ({totalOrders} solicitudes · {formatMoney(totalRevenue)} monto activo).
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <section style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>
            1. Distribución Real por Estado de Solicitud (Firestore)
          </h2>
          {loading ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Calculando métricas desde orders-api...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {STATUS_LIST.map((st) => {
                const count = orders.filter((o) => o.status === st).length;
                const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                const meta = getStatusMeta(st);
                return (
                  <div
                    key={st}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <span className={`badge-status ${meta.className}`}>
                      {meta.icon} {st}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      {count} solicitud(es) ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>
            2. Productos Solicitados en Pedidos Activos
          </h2>
          {loading ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Cargando ítems...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {orders.flatMap((o) => o.items || []).slice(0, 6).map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.83rem',
                  }}
                >
                  <strong style={{ color: '#0f172a' }}>{item.productName}</strong>
                  <span style={{ color: '#475569' }}>
                    {item.quantity} u. · {formatMoney(item.subtotal || item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: '0.5rem', padding: '0.85rem', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', fontSize: '0.8rem', color: '#475569' }}>
                [Aquí se integrarán gráficos avanzados de tiempos promedio de transición de estado una vez habilitado PATCH /api/orders/:id/status].
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
