'use client';

import React from 'react';
import Link from 'next/link';
import styles from './CartDrawer.module.css';

export interface CreatedOrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    shippingAddress: string;
  };
}

interface CartConfirmationViewProps {
  createdOrder: CreatedOrderResponse | null;
  onCloseCart: () => void;
}

export default function CartConfirmationView({
  createdOrder,
  onCloseCart,
}: CartConfirmationViewProps) {
  return (
    <div className={styles.confirmationBox}>
      <span className={styles.eyebrow}>✓ Solicitud Registrada en Cloud Firestore</span>
      <h3 className={`${styles.title} ${styles.confirmationTitle}`}>
        {createdOrder
          ? '¡Tu solicitud de pedido fue enviada con éxito!'
          : '[Aquí se mostrará la confirmación tras enviar tu solicitud]'}
      </h3>

      <div className={styles.orderCodeBadge}>
        {createdOrder ? createdOrder.orderNumber : '[Código de Seguimiento: ej. ORD-2026-0001]'}
      </div>

      <div className={`${styles.templateNotice} ${styles.templateNoticeLeft}`}>
        <span className={styles.templateNoticeStrong}>
          Estado Inicial: ● {createdOrder ? createdOrder.status : 'PENDIENTE'}
        </span>
        {createdOrder ? (
          <>
            • <strong>Cliente:</strong> {createdOrder.customer.name} ({createdOrder.customer.phone})
            <br />• <strong>Entrega / Notas:</strong> {createdOrder.customer.shippingAddress}
            <br />• <strong>Total Calculado en Servidor:</strong> $
            {Number(createdOrder.totalAmount).toLocaleString('es-AR')}
          </>
        ) : (
          <>
            • Revisá el estado de tu pedido o buscá cualquiera de las órdenes cargadas en la base de datos desde la pantalla de seguimiento.
          </>
        )}
      </div>

      <Link
        href={
          createdOrder
            ? `/seguimiento?order=${encodeURIComponent(createdOrder.orderNumber)}`
            : '/seguimiento'
        }
        onClick={onCloseCart}
        className={`${styles.ctaPrimary} ${styles.ctaSecondaryMargin}`}
      >
        Consultar Seguimiento de Pedido →
      </Link>
    </div>
  );
}

