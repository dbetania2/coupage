'use client';

import React from 'react';
import styles from './CartDrawer.module.css';

interface CartCheckoutFormProps {
  customerName: string;
  setCustomerName: (v: string) => void;
  customerEmail: string;
  setCustomerEmail: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  shippingAddress: string;
  setShippingAddress: (v: string) => void;
  submitError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CartCheckoutForm({
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  shippingAddress,
  setShippingAddress,
  submitError,
  onSubmit,
}: CartCheckoutFormProps) {
  return (
    <>
      <div className={styles.templateNotice}>
        <span className={styles.templateNoticeStrong}>
          📌 Solicitud sin cobro automático (Conectado a POST /api/orders)
        </span>
        Tu pedido se guardará en <strong>Cloud Firestore</strong> con estado inicial <code>PENDIENTE</code> para
        que el personal verifique disponibilidad física en cava.
      </div>

      {submitError && (
        <div role="alert" className={styles.checkoutAlert}>
          ⚠️ {submitError}
        </div>
      )}

      <form
        id="checkout-order-form"
        onSubmit={onSubmit}
        className={styles.formStack}
      >
        <div className={styles.formGroup}>
          <label htmlFor="req-name" className={styles.label}>
            Nombre y Apellido Completo *
          </label>
          <input
            id="req-name"
            type="text"
            required
            minLength={3}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className={styles.input}
            placeholder="Ej: Agustín Del Grecco"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="req-email" className={styles.label}>
            Correo Electrónico *
          </label>
          <input
            id="req-email"
            type="email"
            required
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className={styles.input}
            placeholder="Ej: cliente@correo.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="req-phone" className={styles.label}>
            Teléfono / WhatsApp de Contacto *
          </label>
          <input
            id="req-phone"
            type="tel"
            required
            minLength={6}
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className={styles.input}
            placeholder="Ej: +54 9 362 400-0000"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="req-notes" className={styles.label}>
            Dirección de Entrega o Notas de Retiro en Cava *
          </label>
          <textarea
            id="req-notes"
            rows={3}
            required
            minLength={5}
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            className={styles.textarea}
            placeholder="Ej: Retiro en Julio A. Roca esq. Echeverría o dirección de envío..."
          />
        </div>
      </form>
    </>
  );
}

