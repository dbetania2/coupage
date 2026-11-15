'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  useOrders,
  ORDER_STATUSES,
  formatDateTime,
  formatMoney,
  getStatusMeta,
} from '@/features/orders/useOrders';
import { AdminPageHeader, AdminModal, AdminAlert } from '@/shared/ui/admin';

export default function AdminOrdersPage() {
  const { orders, loading, error, reload } = useOrders();
  const [selectedFilter, setSelectedFilter] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [auditNote, setAuditNote] = useState<string>('');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0] || null;

  const filteredRows = useMemo(() => orders.filter((row) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      (row.orderNumber || row.id).toLowerCase().includes(q) ||
      row.customer?.name?.toLowerCase().includes(q) ||
      row.customer?.email?.toLowerCase().includes(q);
    const matchesStatus = selectedFilter === 'TODOS' || row.status === selectedFilter;
    return matchesSearch && matchesStatus;
  }), [orders, searchTerm, selectedFilter]);

  // AdminModal gestiona Escape, click fuera y bloqueo de scroll
  const closeAuditModal = useCallback(() => setIsAuditModalOpen(false), []);

  return (
    <div>
      <AdminPageHeader
        eyebrow={<>HU4 · T23 &amp; T24 · orders-api + Cloud Firestore</>}
        title="Gestión de Solicitudes de Pedido y Trazabilidad"
        subtitle={<>Datos reales desde <code>GET /api/orders</code>.</>}
        actions={
          <>
            <button type="button" onClick={reload} className="btn-admin btn-admin-secondary">
              ↻ Actualizar
            </button>
            <button
              type="button"
              onClick={() => setIsAuditModalOpen(true)}
              disabled={!selectedOrder}
              className="btn-admin btn-admin-primary"
            >
              🔍 Ver Auditoría del Pedido
            </button>
          </>
        }
      />

      {error && <AdminAlert variant="danger">⚠️ {error}</AdminAlert>}

      {/* Regla de negocio: Máquina de Estados */}
      <AdminAlert variant="note">
        <strong>📌 Máquina de Estados (T18):</strong>{' '}
        <code>PENDIENTE → CONFIRMADO → PREPARADO → ENTREGADO</code>. Desde <code>PENDIENTE</code> o{' '}
        <code>CONFIRMADO</code> se puede pasar a <code>RECHAZADO</code> o <code>CANCELADO</code>.{' '}
        <code>ENTREGADO</code> y <code>RECHAZADO</code> son terminales (HTTP 422).
      </AdminAlert>

      {/* Búsqueda y Pestañas */}
      <div className="admin-filter-bar">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por N° de pedido, nombre o correo del cliente..."
          className="admin-input admin-input-subtle"
          aria-label="Buscar pedidos"
        />

        <div className="status-tabs">
          {['TODOS', ...ORDER_STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedFilter(st)}
              className={`tab-pill ${selectedFilter === st ? 'active' : 'inactive'}`}
            >
              {st} ({st === 'TODOS' ? orders.length : orders.filter(o => o.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* Tabla + Panel de transición */}
      <div className="admin-split">
        <div className="admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID / Fecha</th>
                  <th>Cliente &amp; Contacto</th>
                  <th>Productos</th>
                  <th>Estado</th>
                  <th className="text-right">Total</th>
                  <th className="text-center">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="table-empty-cell">Cargando pedidos desde Firestore...</td></tr>
                ) : filteredRows.length === 0 ? (
                  <tr><td colSpan={6} className="table-empty-cell">No hay pedidos para este filtro.</td></tr>
                ) : filteredRows.map((order) => {
                  const isSelected = order.id === selectedOrder?.id;
                  const badge = getStatusMeta(order.status);
                  const units = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
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
                        <div className="cell-subtitle">{order.customer?.email} · {order.customer?.phone}</div>
                      </td>
                      <td className="cell-meta">{order.items?.length || 0} ítems · {units} u.</td>
                      <td><span className={`badge-status ${badge.className}`}>{badge.icon} {order.status}</span></td>
                      <td className="cell-amount">{formatMoney(order.totalAmount)}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order.id); setIsAuditModalOpen(true); }}
                          className="btn-admin btn-admin-secondary btn-admin-sm"
                        >
                          Ver Trazabilidad
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="admin-table-footer">
            <span>Mostrando {filteredRows.length} de {orders.length} pedidos</span>
            <span>Ordenado por <code>createdAt</code> desc.</span>
          </div>
        </div>

        {/* Panel de transición (PATCH pendiente en backend) */}
        <aside className="admin-card admin-card-stack">
          {!selectedOrder ? (
            <p className="text-muted">Seleccioná un pedido.</p>
          ) : (
            <>
              <div className="admin-detail-head">
                <div>
                  <span className="admin-detail-heading">Solicitud Seleccionada</span>
                  <h2 className="admin-detail-title">{selectedOrder.orderNumber || selectedOrder.id}</h2>
                </div>
                <span className={`badge-status ${getStatusMeta(selectedOrder.status).className}`}>
                  {getStatusMeta(selectedOrder.status).icon} {selectedOrder.status}
                </span>
              </div>

              {/* Productos a verificar en cava */}
              <div className="admin-info-box">
                <strong className="text-strong d-block mb-xs">Productos a verificar en cava:</strong>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`}>
                    • {item.quantity} × {item.productName} — {formatMoney(item.unitPrice)} c/u
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="audit-note-input" className="admin-label admin-label-upper">
                  Nota de Auditoría (campo <code>note</code>)
                </label>
                <textarea
                  id="audit-note-input"
                  rows={2}
                  className="admin-textarea"
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  placeholder="Ej: Stock verificado en cava, 2 cajas separadas"
                />
                <p className="admin-hint-warning">
                  ⚠️ Botones deshabilitados hasta implementar <code>PATCH /api/orders/:id/status</code> en orders-api (T18).
                </p>

                <div className="admin-status-grid mb-md">
                  <button type="button" disabled className="badge-status badge-action badge-confirmado">✓ CONFIRMADO</button>
                  <button type="button" disabled className="badge-status badge-action badge-preparado">📦 PREPARADO</button>
                  <button type="button" disabled className="badge-status badge-action badge-completado span-2">🏁 ENTREGADO</button>
                </div>

                <p className="admin-detail-heading admin-detail-heading-danger">Acciones de descarte</p>
                <div className="admin-status-grid">
                  <button type="button" disabled className="badge-status badge-action badge-rechazado">✕ RECHAZAR</button>
                  <button type="button" disabled className="badge-status badge-action badge-cancelado">⊘ CANCELAR</button>
                </div>
              </div>

              <button type="button" onClick={() => setIsAuditModalOpen(true)} className="btn-admin btn-admin-secondary btn-admin-block">
                Ver Línea de Tiempo Completa →
              </button>
            </>
          )}
        </aside>
      </div>

      {/* MODAL T24: Detalle y Línea de Tiempo de Auditoría (datos reales) */}
      {selectedOrder && (
        <AdminModal
          isOpen={isAuditModalOpen}
          onClose={closeAuditModal}
          maxWidth={760}
          eyebrow="T24 · Trazabilidad Inmutable"
          title={`Auditoría — ${selectedOrder.orderNumber || selectedOrder.id}`}
          footer={
            <button type="button" onClick={closeAuditModal} className="btn-admin btn-admin-primary">
              Cerrar
            </button>
          }
        >
          <section className="admin-info-box">
            <h3 className="admin-modal-section-title">1. Datos del Comprador</h3>
            <p><strong>Nombre:</strong> {selectedOrder.customer?.name}</p>
            <p><strong>Email / Teléfono:</strong> {selectedOrder.customer?.email} · {selectedOrder.customer?.phone}</p>
            <p><strong>Dirección / Notas:</strong> {selectedOrder.customer?.shippingAddress}</p>
          </section>

          <section className="admin-table-card">
            <h3 className="admin-table-heading">2. Productos (precio congelado)</h3>
            <table className="admin-table">
              <thead>
                <tr><th>Producto</th><th>Cant.</th><th>Precio unit.</th><th className="text-right">Subtotal</th></tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, idx) => (
                  <tr key={`${item.productId}-${idx}`}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>{formatMoney(item.unitPrice)}</td>
                    <td className="text-right">{formatMoney(item.subtotal ?? item.unitPrice * item.quantity)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="text-strong">Total</td>
                  <td className="cell-amount">{formatMoney(selectedOrder.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="admin-card">
            <h3 className="admin-modal-section-title mb-md">
              3. Línea de Tiempo (<code>history</code>)
            </h3>
            <div className="admin-timeline admin-timeline-bordered">
              {(selectedOrder.history || []).map((evt, idx) => {
                const meta = getStatusMeta(evt.status);
                return (
                  <div key={`${evt.status}-${idx}`}>
                    <span className={`badge-status ${meta.className}`}>{meta.icon} {evt.status}</span>
                    <p className="admin-timeline-note">
                      <strong>{formatDateTime(evt.timestamp)}</strong>{evt.author ? ` · ${evt.author}` : ''}
                      {evt.note && <><br />{evt.note}</>}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </AdminModal>
      )}
    </div>
  );
}
