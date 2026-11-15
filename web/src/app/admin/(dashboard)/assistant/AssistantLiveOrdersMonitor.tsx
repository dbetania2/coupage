'use client';

import React from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '@/features/orders/useOrders';
import styles from './assistant.module.css';

interface AssistantLiveOrdersMonitorProps {
  counts: {
    PENDIENTE: number;
    CONFIRMADO: number;
    PREPARADO: number;
    ENTREGADO: number;
  };
  selectedOrderFilter: OrderStatus;
  onSelectOrderFilter: (status: OrderStatus) => void;
  filteredLiveOrders: Order[];
  loading: boolean;
  loadingOrders: boolean;
  onRefreshOrders: () => void;
  onAnalyzeStatusGroup: (status: OrderStatus) => void;
  onAnalyzeOrder: (
    orderNumber: string,
    status: string,
    customerName: string,
    totalAmount: number
  ) => void;
}

export default function AssistantLiveOrdersMonitor({
  counts,
  selectedOrderFilter,
  onSelectOrderFilter,
  filteredLiveOrders,
  loading,
  loadingOrders,
  onRefreshOrders,
  onAnalyzeStatusGroup,
  onAnalyzeOrder,
}: AssistantLiveOrdersMonitorProps) {
  return (
    <aside className={styles.colInspector} aria-label="Monitor operativo de solicitudes en vivo">
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Monitor de Solicitudes</h2>
          <button
            type="button"
            onClick={onRefreshOrders}
            className={styles.actionMiniBtn}
            title="Actualizar estado de solicitudes"
          >
            {loadingOrders ? '...' : '↻ Actualizar'}
          </button>
        </div>

        <div className={styles.kpiGrid}>
          <button
            type="button"
            onClick={() => onSelectOrderFilter('PENDIENTE')}
            className={`${styles.kpiBox} ${selectedOrderFilter === 'PENDIENTE' ? styles.kpiBoxActive : ''}`}
          >
            <span className={styles.kpiValue}>{counts.PENDIENTE}</span>
            <span className={styles.kpiLabel}>Pendientes</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectOrderFilter('CONFIRMADO')}
            className={`${styles.kpiBox} ${selectedOrderFilter === 'CONFIRMADO' ? styles.kpiBoxActive : ''}`}
          >
            <span className={styles.kpiValue}>{counts.CONFIRMADO}</span>
            <span className={styles.kpiLabel}>Confirmados</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectOrderFilter('PREPARADO')}
            className={`${styles.kpiBox} ${selectedOrderFilter === 'PREPARADO' ? styles.kpiBoxActive : ''}`}
          >
            <span className={styles.kpiValue}>{counts.PREPARADO}</span>
            <span className={styles.kpiLabel}>Preparados</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectOrderFilter('ENTREGADO')}
            className={`${styles.kpiBox} ${selectedOrderFilter === 'ENTREGADO' ? styles.kpiBoxActive : ''}`}
          >
            <span className={styles.kpiValue}>{counts.ENTREGADO}</span>
            <span className={styles.kpiLabel}>Entregados</span>
          </button>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => onAnalyzeStatusGroup(selectedOrderFilter)}
          className={`${styles.btnSecondary} ${styles.fullWidth}`}
        >
          📊 Auditar {selectedOrderFilter.toLowerCase()}s en el chat
        </button>
      </section>

      {/* Cola de Solicitudes según el estado seleccionado */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Cola: {selectedOrderFilter}</h2>
          <Link href="/admin/orders" className={styles.headerLink}>
            Gestionar todos ↗
          </Link>
        </div>

        <div className={styles.liveOrdersList}>
          {filteredLiveOrders.length === 0 ? (
            <p className={styles.emptyText}>
              No hay solicitudes en estado <strong>{selectedOrderFilter}</strong> en este momento.
            </p>
          ) : (
            filteredLiveOrders.map((ord) => {
              const totalUnits = (ord.items || []).reduce(
                (acc, i) => acc + Number(i.quantity || 0),
                0
              );
              return (
                <article key={ord.id} className={styles.liveOrderItem}>
                  <div className={styles.liveOrderTop}>
                    <strong className={styles.orderNumber}>{ord.orderNumber || ord.id}</strong>
                    <span className={styles.orderAmount}>
                      ${Number(ord.totalAmount || 0).toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div className={styles.orderMeta}>
                    {ord.customer?.name || 'Cliente'} · {totalUnits} u. ({ord.items?.length || 0}{' '}
                    ítem/s)
                  </div>

                  <div className={styles.liveOrderActions}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        onAnalyzeOrder(
                          ord.orderNumber || ord.id,
                          ord.status,
                          ord.customer?.name || 'Cliente',
                          Number(ord.totalAmount || 0)
                        )
                      }
                      className={styles.actionMiniBtn}
                    >
                      ✨ Analizar en chat
                    </button>
                    <Link href="/admin/orders" className={styles.detailLink}>
                      Ver detalle →
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </aside>
  );
}

