'use client';

import React, { useState } from 'react';
import { useOrders, Order, formatDateTime } from '@/features/orders/useOrders';
import styles from './page.module.css';

const LIFECYCLE_STAGES = [
  { code: 'PENDIENTE', label: '1. Solicitud Recibida' },
  { code: 'CONFIRMADO', label: '2. Stock Verificado en Cava' },
  { code: 'PREPARADO', label: '3. Pedido Armado' },
  { code: 'ENTREGADO', label: '4. Entregado al Cliente' },
];

export default function SeguimientoPedidoPage() {
  const { orders, loading } = useOrders();
  const [trackingInput, setTrackingInput] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  const selectedOrder: Order | null =
    orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId) ||
    orders[0] ||
    null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = trackingInput.trim().toLowerCase();
    if (!q) return;
    const found = orders.find(
      (o) =>
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        o.id.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q)
    );
    if (found) {
      setSelectedOrderId(found.id);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <p className={styles.breadcrumb}>
          Inicio / <span style={{ color: 'var(--color-gold)' }}>Seguimiento de Solicitud</span>
        </p>
        <h1 className={styles.title}>Seguimiento de tu Solicitud de Pedido</h1>
        <p className={styles.subtitle}>
          Consultá en tiempo real el estado de tu solicitud registrada en Firebase Firestore a través de{' '}
          <code>orders-api</code>.
        </p>
      </header>

      {/* Buscador por Código de Seguimiento */}
      <section className={styles.searchCard} aria-labelledby="tracking-search-heading">
        <h2 id="tracking-search-heading" className={styles.sectionHeading} style={{ marginBottom: 0 }}>
          Buscar por Código de Pedido o Nombre
        </h2>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            className={styles.searchInput}
            placeholder="Ej: ORD-2026-0001 o nombre del comprador..."
            aria-label="Código de seguimiento del pedido"
          />
          <button type="submit" className={styles.searchBtn}>
            Consultar Estado
          </button>
        </form>

        {/* Selector rápido de pedidos reales en la base de datos */}
        {orders.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Pedidos en Firestore:
            </span>
            {orders.map((ord) => (
              <button
                key={ord.id}
                type="button"
                onClick={() => {
                  setSelectedOrderId(ord.id);
                  setTrackingInput(ord.orderNumber || ord.id);
                }}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  borderRadius: '4px',
                  backgroundColor:
                    selectedOrder?.id === ord.id ? 'var(--color-gold)' : 'var(--color-bg-base)',
                  color: selectedOrder?.id === ord.id ? '#080808' : 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-medium)',
                  fontWeight: 600,
                }}
              >
                {ord.orderNumber || ord.id} ({ord.status})
              </button>
            ))}
          </div>
        )}
      </section>

      {loading ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>Cargando pedidos desde Firestore...</p>
      ) : selectedOrder ? (
        <>
          {/* Máquina de Estados del Ciclo de Vida */}
          <section className={styles.stepperSection} aria-labelledby="lifecycle-heading">
            <h2 id="lifecycle-heading" className={styles.sectionHeading}>
              Estado Actual del Pedido {selectedOrder.orderNumber}:{' '}
              <span style={{ color: '#fff' }}>{selectedOrder.status}</span>
            </h2>

            <div className={styles.statesGrid}>
              {LIFECYCLE_STAGES.map((stage) => {
                const isActive = selectedOrder.status === stage.code;
                const historyMatch = selectedOrder.history?.find((h) => h.status === stage.code);
                return (
                  <article
                    key={stage.code}
                    className={`${styles.stateCard} ${isActive ? styles.stateCardActive : ''}`}
                  >
                    <span className={styles.stateBadge}>
                      {historyMatch ? '✓ ' : ''}
                      {stage.code}
                    </span>
                    <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                      {stage.label}
                    </strong>
                    <p className={styles.stateDesc}>
                      {historyMatch
                        ? `${formatDateTime(historyMatch.timestamp)} — ${historyMatch.note || ''}`
                        : 'Pendiente de alcanzar esta etapa'}
                    </p>
                  </article>
                );
              })}
            </div>

            {(selectedOrder.status === 'CANCELADO' || selectedOrder.status === 'RECHAZADO') && (
              <div
                className={styles.placeholderBlock}
                style={{ marginTop: '1rem', borderColor: '#ef4444', color: '#fca5a5' }}
              >
                ⚠️ <strong>Pedido {selectedOrder.status}:</strong>{' '}
                {selectedOrder.history?.[selectedOrder.history.length - 1]?.note ||
                  'Solicitud finalizada sin entrega.'}
              </div>
            )}
          </section>

          {/* Detalle en 2 columnas: Trazabilidad Histórica + Ítems Solicitados */}
          <div className={styles.detailsGrid}>
            <section className={styles.infoCard} aria-labelledby="history-heading">
              <h2 id="history-heading" className={styles.sectionHeading} style={{ marginBottom: 0 }}>
                Historial de Trazabilidad (Firestore history)
              </h2>

              {selectedOrder.history && selectedOrder.history.length > 0 ? (
                selectedOrder.history.map((evt, index) => (
                  <div key={`${evt.status}-${index}`} className={styles.placeholderBlock}>
                    <strong style={{ color: 'var(--color-gold)' }}>
                      ● {evt.status} — {formatDateTime(evt.timestamp)}
                    </strong>
                    <br />
                    {evt.note && <span>Nota: {evt.note}</span>}
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  Sin eventos registrados en el historial.
                </p>
              )}
            </section>

            <section className={styles.infoCard} aria-labelledby="items-heading">
              <h2 id="items-heading" className={styles.sectionHeading} style={{ marginBottom: 0 }}>
                Productos Solicitados y Datos del Cliente
              </h2>

              {selectedOrder.items?.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className={styles.placeholderBlock}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{item.productName}</strong>
                  <br />• Cantidad: <strong>{item.quantity}</strong> · Precio Unitario Congelado:{' '}
                  <strong>${Number(item.unitPrice).toLocaleString('es-AR')}</strong>
                  <br />• Subtotal:{' '}
                  <strong style={{ color: 'var(--color-gold)' }}>
                    ${Number(item.subtotal || item.unitPrice * item.quantity).toLocaleString('es-AR')}
                  </strong>
                </div>
              ))}

              <div className={styles.placeholderBlock}>
                <strong style={{ color: 'var(--color-gold)' }}>Datos del Solicitante:</strong>
                <br />• Cliente: {selectedOrder.customer?.name}
                <br />• Contacto: {selectedOrder.customer?.email} · {selectedOrder.customer?.phone}
                <br />• Entrega: {selectedOrder.customer?.shippingAddress}
                <br />• <strong>Total del Pedido:</strong> $
                {Number(selectedOrder.totalAmount).toLocaleString('es-AR')}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
