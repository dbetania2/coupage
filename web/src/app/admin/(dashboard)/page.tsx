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
import { AdminPageHeader, AdminAlert } from '@/shared/ui/admin';

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
      <AdminPageHeader
        title="Gestión de Pedidos"
        subtitle="Monitorea, filtra y actualiza el estado de las órdenes en tiempo real."
        actions={
          <button type="button" className="btn-admin btn-admin-secondary" onClick={reload}>
            ↻ Actualizar
          </button>
        }
      />

      {error && <AdminAlert variant="danger">⚠️ {error}</AdminAlert>}

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
      <div className="admin-filter-bar">
        <label className="admin-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Buscar por N° de pedido, cliente o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar pedidos"
          />
        </label>

        <div className="status-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedStatus(tab.value)}
              className={`tab-pill ${selectedStatus === tab.value ? 'active' : 'inactive'}`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid Principal: Tabla de Pedidos a la Izquierda y Detalle a la Derecha */}
      <div className="admin-split">
        <div className="admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID / Fecha</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="table-empty-cell">Cargando pedidos desde Firestore...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan={4} className="table-empty-cell">No hay pedidos con el estado o filtro seleccionado.</td></tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isSelected = order.id === selectedOrder?.id;
                    const meta = getStatusMeta(order.status);
                    const itemsCount = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`admin-row-selectable${isSelected ? ' is-selected' : ''}`}
                      >
                        <td>
                          <div className="cell-title">{order.orderNumber || order.id}</div>
                          <div className="cell-subtitle">{formatDateTime(order.createdAt)}</div>
                        </td>
                        <td>
                          <div className="cell-title">{order.customer?.name}</div>
                          <div className="cell-subtitle">{itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}</div>
                        </td>
                        <td>
                          <span className={`badge-status ${meta.className}`}>{meta.icon} {order.status}</span>
                        </td>
                        <td className="cell-amount">{formatMoney(order.totalAmount)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-table-footer">
            <span>Mostrando {filteredOrders.length} de {orders.length} pedidos</span>
            <span>Fuente: <code>GET /api/orders</code></span>
          </div>
        </div>

        {/* Panel Lateral: Detalle del Pedido Seleccionado */}
        <div className="admin-card">
          {!selectedOrder ? (
            <p className="text-muted">Seleccioná un pedido para ver su detalle.</p>
          ) : (
            <>
              <div className="admin-detail-head mb-lg">
                <div>
                  <h2 className="admin-detail-title">
                    Detalle de Pedido <span>{selectedOrder.orderNumber || selectedOrder.id}</span>
                  </h2>
                  <p className="cell-subtitle">Fecha de creación: {formatDateTime(selectedOrder.createdAt)}</p>
                </div>
                <span className={`badge-status ${getStatusMeta(selectedOrder.status).className}`}>
                  {getStatusMeta(selectedOrder.status).icon} {selectedOrder.status}
                </span>
              </div>

              {/* Flujo del Pedido (history real de Firestore) */}
              <div className="admin-detail-section">
                <h4 className="admin-detail-heading">Flujo del Pedido</h4>
                <div className="admin-timeline">
                  {(selectedOrder.history || []).map((evt, idx, arr) => {
                    const isLast = idx === arr.length - 1;
                    return (
                      <div key={`${evt.status}-${idx}`} className="admin-timeline-item">
                        <div className={`admin-timeline-dot${isLast ? ' is-current' : ''}`}></div>
                        <div>
                          <div className="admin-timeline-status">{getStatusMeta(evt.status).icon} {evt.status}</div>
                          <div className="cell-subtitle">
                            {formatDateTime(evt.timestamp)}{evt.author ? ` · ${evt.author}` : ''}
                          </div>
                          {evt.note && <div className="cell-meta">{evt.note}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="admin-detail-section">
                <h4 className="admin-detail-heading">Información del Cliente</h4>
                <div className="admin-kv-grid">
                  <span>Cliente:</span>
                  <span className="text-strong">{selectedOrder.customer?.name}</span>
                  <span>Correo:</span>
                  <span>{selectedOrder.customer?.email}</span>
                  <span>Teléfono:</span>
                  <span>{selectedOrder.customer?.phone}</span>
                  <span>Dirección:</span>
                  <span>{selectedOrder.customer?.shippingAddress}</span>
                </div>
              </div>

              {/* Productos y Resumen Económico (precios congelados) */}
              <div className="admin-detail-section">
                <h4 className="admin-detail-heading">Productos Solicitados</h4>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={`${item.productId}-${item.saleModeId}-${idx}`} className="admin-line-item">
                    <span>{item.quantity} × {item.productName}</span>
                    <span>{formatMoney(item.subtotal ?? item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                <div className="admin-total-row">
                  <span>Total del Pedido</span>
                  <span>{formatMoney(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Cambiar Estado: pendiente de PATCH /api/orders/:id/status en orders-api */}
              <div>
                <h4 className="admin-detail-heading">Cambiar estado del pedido</h4>
                <p className="cell-subtitle mb-sm">
                  Se habilita cuando orders-api exponga <code>PATCH /api/orders/:id/status</code> (T18). Gestión completa en{' '}
                  <a href="/admin/orders" className="admin-link">Pedidos</a>.
                </p>
                <div className="admin-status-grid admin-status-grid-3">
                  {ORDER_STATUSES.map(st => {
                    const meta = getStatusMeta(st);
                    return (
                      <button key={st} type="button" disabled className={`badge-status badge-action badge-action-sm ${meta.className}`}>
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
