'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  useOrders,
  ORDER_STATUSES,
  formatDateTime,
  formatMoney,
  getStatusMeta,
} from '@/features/orders/useOrders';

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

  // Cerrar modal de auditoría con Escape (Regla de Hooks con cleanup)
  useEffect(() => {
    if (!isAuditModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAuditModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuditModalOpen]);

  return (
    <div>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            HU4 · T23 &amp; T24 · orders-api + Cloud Firestore
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem', fontFamily: 'Inter, sans-serif' }}>
            Gestión de Solicitudes de Pedido y Trazabilidad
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Datos reales desde <code>GET /api/orders</code>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={reload} className="btn-secondary-white" style={{ minHeight: '44px' }}>
            ↻ Actualizar
          </button>
          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            disabled={!selectedOrder}
            className="btn-primary-blue"
            style={{ minHeight: '44px' }}
          >
            🔍 Ver Auditoría del Pedido
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '0.9rem 1.1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Regla de negocio: Máquina de Estados */}
      <div style={{ backgroundColor: '#f4f4f5', border: '1px dashed #71717a', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.84rem', color: '#27272a', lineHeight: 1.5 }}>
        <strong>📌 Máquina de Estados (T18):</strong>{' '}
        <code>PENDIENTE → CONFIRMADO → PREPARADO → ENTREGADO</code>. Desde <code>PENDIENTE</code> o{' '}
        <code>CONFIRMADO</code> se puede pasar a <code>RECHAZADO</code> o <code>CANCELADO</code>.{' '}
        <code>ENTREGADO</code> y <code>RECHAZADO</code> son terminales (HTTP 422).
      </div>

      {/* Búsqueda y Pestañas */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por N° de pedido, nombre o correo del cliente..."
          style={{ width: '100%', minHeight: '44px', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.88rem', marginBottom: '1rem' }}
        />

        <div className="status-tabs" style={{ marginBottom: 0 }}>
          {['TODOS', ...ORDER_STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedFilter(st)}
              className={`tab-pill ${selectedFilter === st ? 'active' : 'inactive'}`}
              style={{ minHeight: '40px' }}
            >
              {st} ({st === 'TODOS' ? orders.length : orders.filter(o => o.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* Tabla + Panel de transición */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div className="admin-table-card" style={{ minWidth: 0 }}>
          <div className="admin-table-scroll">
            <table className="admin-table">
            <thead>
              <tr>
                <th>ID / Fecha</th>
                <th>Cliente &amp; Contacto</th>
                <th>Productos</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'center' }}>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>Cargando pedidos desde Firestore...</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>No hay pedidos para este filtro.</td></tr>
              ) : filteredRows.map((order) => {
                const isSelected = order.id === selectedOrder?.id;
                const badge = getStatusMeta(order.status);
                const units = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f4f4f5' : 'transparent',
                      borderLeft: isSelected ? '4px solid #3f3f46' : '4px solid transparent',
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: '#18181b' }}>{order.orderNumber || order.id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDateTime(order.createdAt)}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.customer?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.customer?.email} · {order.customer?.phone}</div>
                    </td>
                    <td><span style={{ fontSize: '0.8rem', color: '#334155' }}>{order.items?.length || 0} ítems · {units} u.</span></td>
                    <td><span className={`badge-status ${badge.className}`}>{badge.icon} {order.status}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{formatMoney(order.totalAmount)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order.id); setIsAuditModalOpen(true); }}
                        className="btn-secondary-white"
                        style={{ padding: '0.4rem 0.7rem', fontSize: '0.76rem', minHeight: '36px' }}
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

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.25rem', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Mostrando {filteredRows.length} de {orders.length} pedidos</span>
            <span>Ordenado por <code>createdAt</code> desc.</span>
          </div>
        </div>

        {/* Panel de transición (PATCH pendiente en backend) */}
        <aside style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!selectedOrder ? (
            <p style={{ color: '#64748b' }}>Seleccioná un pedido.</p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Solicitud Seleccionada</span>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                    {selectedOrder.orderNumber || selectedOrder.id}
                  </h2>
                </div>
                <span className={`badge-status ${getStatusMeta(selectedOrder.status).className}`}>
                  {getStatusMeta(selectedOrder.status).icon} {selectedOrder.status}
                </span>
              </div>

              {/* Productos a verificar en cava */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', fontSize: '0.82rem', color: '#334155' }}>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.35rem' }}>Productos a verificar en cava:</strong>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`}>
                    • {item.quantity} × {item.productName} — {formatMoney(item.unitPrice)} c/u
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="audit-note-input" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Nota de Auditoría (campo <code>note</code>)
                </label>
                <textarea
                  id="audit-note-input"
                  rows={2}
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  placeholder="Ej: Stock verificado en cava, 2 cajas separadas"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', marginBottom: '0.5rem' }}
                />
                <p style={{ fontSize: '0.74rem', color: '#b45309', marginBottom: '0.75rem' }}>
                  ⚠️ Botones deshabilitados hasta implementar <code>PATCH /api/orders/:id/status</code> en orders-api (T18).
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button type="button" disabled className="badge-status badge-confirmado" style={{ minHeight: '44px', justifyContent: 'center', opacity: 0.6 }}>✓ CONFIRMADO</button>
                  <button type="button" disabled className="badge-status badge-preparado" style={{ minHeight: '44px', justifyContent: 'center', opacity: 0.6 }}>📦 PREPARADO</button>
                  <button type="button" disabled className="badge-status badge-completado" style={{ minHeight: '44px', justifyContent: 'center', gridColumn: 'span 2', opacity: 0.6 }}>🏁 ENTREGADO</button>
                </div>

                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Acciones de descarte
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button type="button" disabled className="badge-status badge-rechazado" style={{ minHeight: '44px', justifyContent: 'center', opacity: 0.6 }}>✕ RECHAZAR</button>
                  <button type="button" disabled className="badge-status badge-cancelado" style={{ minHeight: '44px', justifyContent: 'center', opacity: 0.6 }}>⊘ CANCELAR</button>
                </div>
              </div>

              <button type="button" onClick={() => setIsAuditModalOpen(true)} className="btn-secondary-white" style={{ width: '100%', minHeight: '44px' }}>
                Ver Línea de Tiempo Completa →
              </button>
            </>
          )}
        </aside>
      </div>

      {/* MODAL T24: Detalle y Línea de Tiempo de Auditoría (datos reales) */}
      {isAuditModalOpen && selectedOrder && (
        <div
          onClick={() => setIsAuditModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-audit-modal-title"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#52525b', textTransform: 'uppercase' }}>T24 · Trazabilidad Inmutable</span>
                <h2 id="order-audit-modal-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                  Auditoría — {selectedOrder.orderNumber || selectedOrder.id}
                </h2>
              </div>
              <button type="button" onClick={() => setIsAuditModalOpen(false)} aria-label="Cerrar" style={{ minWidth: '44px', minHeight: '44px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 700 }}>
                ✕
              </button>
            </header>

            <section style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem 1.25rem', fontSize: '0.85rem' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>1. Datos del Comprador</h3>
              <p><strong>Nombre:</strong> {selectedOrder.customer?.name}</p>
              <p><strong>Email / Teléfono:</strong> {selectedOrder.customer?.email} · {selectedOrder.customer?.phone}</p>
              <p><strong>Dirección / Notas:</strong> {selectedOrder.customer?.shippingAddress}</p>
            </section>

            <section className="admin-table-card">
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', padding: '1rem 1.25rem 0', fontFamily: 'Inter, sans-serif' }}>2. Productos (precio congelado)</h3>
              <table className="admin-table">
                <thead>
                  <tr><th>Producto</th><th>Cant.</th><th>Precio unit.</th><th style={{ textAlign: 'right' }}>Subtotal</th></tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={`${item.productId}-${idx}`}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>{formatMoney(item.unitPrice)}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(item.subtotal ?? item.unitPrice * item.quantity)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} style={{ fontWeight: 800 }}>Total</td>
                    <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatMoney(selectedOrder.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#3f3f46', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>
                3. Línea de Tiempo (<code>history</code>)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '3px solid #52525b', paddingLeft: '1rem' }}>
                {(selectedOrder.history || []).map((evt, idx) => {
                  const meta = getStatusMeta(evt.status);
                  return (
                    <div key={`${evt.status}-${idx}`}>
                      <span className={`badge-status ${meta.className}`}>{meta.icon} {evt.status}</span>
                      <p style={{ fontSize: '0.82rem', color: '#334155', marginTop: '0.25rem' }}>
                        <strong>{formatDateTime(evt.timestamp)}</strong>{evt.author ? ` · ${evt.author}` : ''}
                        {evt.note && <><br />{evt.note}</>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsAuditModalOpen(false)} className="btn-primary-blue" style={{ minHeight: '44px' }}>
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
