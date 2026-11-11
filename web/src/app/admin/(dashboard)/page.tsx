'use client';
import React, { useMemo, useState } from 'react';
import {
  useOrders,
  ORDER_STATUSES,
  formatDateTime,
  formatMoney,
  getStatusMeta,
  toDate,
} from '@/features/orders/useOrders';

// Escritorio original (diseño Figma) conectado a orders-api (GET /api/orders → Firestore)
export default function AdminDashboardPage() {
  const { orders, loading, error, reload } = useOrders();
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || orders[0] || null;

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      (order.orderNumber || order.id).toLowerCase().includes(q) ||
      order.customer?.name?.toLowerCase().includes(q) ||
      order.items?.some(i => i.productName.toLowerCase().includes(q));
    const matchesStatus = selectedStatus === 'TODOS' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  }), [orders, searchTerm, selectedStatus]);

  // KPIs calculados con los datos reales
  const kpis = useMemo(() => {
    const today = new Date().toDateString();
    const countBy = (status: string) => orders.filter(o => o.status === status).length;
    return {
      today: orders.filter(o => toDate(o.createdAt)?.toDateString() === today).length,
      pending: countBy('PENDIENTE'),
      preparing: countBy('CONFIRMADO') + countBy('PREPARADO'),
      delivered: countBy('ENTREGADO'),
    };
  }, [orders]);

  const tabs = [
    { label: 'Todos', value: 'TODOS', count: orders.length },
    ...ORDER_STATUSES.map(s => ({
      label: s.charAt(0) + s.slice(1).toLowerCase(),
      value: s,
      count: orders.filter(o => o.status === s).length,
    })),
  ];

  return (
    <div>
      {/* Header Superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem', fontFamily: 'Inter, sans-serif' }}>
            Gestión de Pedidos
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Monitorea, filtra y actualiza el estado de las órdenes en tiempo real.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary-white" onClick={reload} style={{ minHeight: '44px' }}>
            ↻ Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '0.9rem 1.1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tarjetas Métricas KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Pedidos de hoy</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div className="kpi-value">{loading ? '…' : kpis.today}</div>
          <div className="kpi-trend trend-neutral">{orders.length} pedidos en total</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Por confirmar</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div className="kpi-value">{loading ? '…' : kpis.pending}</div>
          <div className="kpi-trend trend-neutral">Estado PENDIENTE</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>En preparación</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          </div>
          <div className="kpi-value">{loading ? '…' : kpis.preparing}</div>
          <div className="kpi-trend trend-neutral">Confirmados + Preparados</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Entregados</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className="kpi-value">{loading ? '…' : kpis.delivered}</div>
          <div className="kpi-trend trend-up">Estado terminal ENTREGADO</div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros de Estado */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.9rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Buscar por N° de pedido, cliente o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a' }}
            />
          </div>
        </div>

        <div className="status-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`tab-pill ${selectedStatus === tab.value ? 'active' : 'inactive'}`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid Principal: Tabla de Pedidos a la Izquierda y Detalle a la Derecha */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* Tabla de Pedidos */}
        <div className="admin-table-card" style={{ minWidth: 0 }}>
          <div className="admin-table-scroll">
            <table className="admin-table">
            <thead>
              <tr>
                <th>ID / Fecha</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>Cargando pedidos desde Firestore...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No hay pedidos con el estado o filtro seleccionado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = order.id === selectedOrder?.id;
                  const meta = getStatusMeta(order.status);
                  const itemsCount = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#f4f4f5' : 'transparent',
                        borderLeft: isSelected ? '4px solid #3f3f46' : '4px solid transparent'
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: '#18181b' }}>{order.orderNumber || order.id}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDateTime(order.createdAt)}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.customer?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}</div>
                      </td>
                      <td>
                        <span className={`badge-status ${meta.className}`}>{meta.icon} {order.status}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {formatMoney(order.totalAmount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#ffffff', fontSize: '0.85rem', color: '#64748b' }}>
            <span>Mostrando {filteredOrders.length} de {orders.length} pedidos</span>
            <span style={{ fontSize: '0.78rem' }}>Fuente: <code>GET /api/orders</code></span>
          </div>
        </div>

        {/* Panel Lateral: Detalle del Pedido Seleccionado */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {!selectedOrder ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Seleccioná un pedido para ver su detalle.</p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                    Detalle de Pedido <span style={{ color: '#52525b' }}>{selectedOrder.orderNumber || selectedOrder.id}</span>
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Fecha de creación: {formatDateTime(selectedOrder.createdAt)}</p>
                </div>
                <span className={`badge-status ${getStatusMeta(selectedOrder.status).className}`}>
                  {getStatusMeta(selectedOrder.status).icon} {selectedOrder.status}
                </span>
              </div>

              {/* Flujo del Pedido (history real de Firestore) */}
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Flujo del Pedido</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {(selectedOrder.history || []).map((evt, idx, arr) => {
                    const isLast = idx === arr.length - 1;
                    return (
                      <div key={`${evt.status}-${idx}`} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isLast ? '#3f3f46' : '#71717a', marginTop: '4px', flexShrink: 0 }}></div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{getStatusMeta(evt.status).icon} {evt.status}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {formatDateTime(evt.timestamp)}{evt.author ? ` · ${evt.author}` : ''}
                          </div>
                          {evt.note && <div style={{ fontSize: '0.75rem', color: '#334155' }}>{evt.note}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Información del Cliente */}
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Información del Cliente</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.4rem 1rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Cliente:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{selectedOrder.customer?.name}</span>
                  <span style={{ color: '#64748b' }}>Correo:</span>
                  <span style={{ color: '#0f172a', textAlign: 'right' }}>{selectedOrder.customer?.email}</span>
                  <span style={{ color: '#64748b' }}>Teléfono:</span>
                  <span style={{ color: '#0f172a', textAlign: 'right' }}>{selectedOrder.customer?.phone}</span>
                  <span style={{ color: '#64748b' }}>Dirección:</span>
                  <span style={{ color: '#0f172a', textAlign: 'right' }}>{selectedOrder.customer?.shippingAddress}</span>
                </div>
              </div>

              {/* Productos y Resumen Económico (precios congelados) */}
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', fontSize: '0.88rem' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Productos Solicitados</h4>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={`${item.productId}-${item.saleModeId}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: '#334155' }}>
                    <span>{item.quantity} × {item.productName}</span>
                    <span>{formatMoney(item.subtotal ?? item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', marginTop: '0.5rem', borderTop: '1px dashed #e2e8f0', fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                  <span>Total del Pedido</span>
                  <span>{formatMoney(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Cambiar Estado: pendiente de PATCH /api/orders/:id/status en orders-api */}
              <div>
                <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Cambiar estado del pedido
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Se habilita cuando orders-api exponga <code>PATCH /api/orders/:id/status</code> (T18). Gestión completa en <a href="/admin/orders" style={{ color: '#18181b', fontWeight: 600, textDecoration: 'underline' }}>Pedidos</a>.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {ORDER_STATUSES.map(st => {
                    const meta = getStatusMeta(st);
                    return (
                      <button key={st} disabled className={`badge-status ${meta.className}`} style={{ justifyContent: 'center', opacity: 0.6, cursor: 'not-allowed', minHeight: '36px' }}>
                        {meta.icon} {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
