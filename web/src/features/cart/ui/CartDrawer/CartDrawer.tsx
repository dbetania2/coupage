'use client';

import React, { useState, useEffect } from 'react';
import { useCartUI } from '../../context/CartUIContext';
import CartItemList from './CartItemList';
import CartCheckoutForm from './CartCheckoutForm';
import CartConfirmationView, { CreatedOrderResponse } from './CartConfirmationView';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const {
    isCartOpen,
    activeStep,
    items,
    totalItems,
    totalAmount,
    closeCart,
    setStep,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartUI();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrderResponse | null>(null);

  useEffect(() => {
    if (!isCartOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) {
    return null;
  }

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (items.length === 0) {
      setSubmitError('Agregá al menos un producto del catálogo antes de enviar la solicitud.');
      return;
    }

    setSubmitting(true);
    try {
      const ordersBaseUrl = process.env.NEXT_PUBLIC_ORDERS_API_URL || 'http://localhost:3000/api';
      const cleanBase = ordersBaseUrl.replace(/\/+$/, '');
      const idempotencyKey =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `idem-${Date.now()}`;

      const payload = {
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim(),
          shippingAddress: shippingAddress.trim(),
        },
        items: items.map((item) => ({
          productId: Number(item.productId) || 1,
          saleModeId: Number(item.saleModeId) || 1,
          productName: item.productName,
          unitPrice: Number(item.unitPrice) > 0 ? Number(item.unitPrice) : 1000,
          quantity: item.quantity,
        })),
      };

      const res = await fetch(`${cleanBase}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.details?.join(' ') ||
          data?.message ||
          data?.error ||
          `Error HTTP ${res.status} al registrar el pedido en orders-api.`;
        setSubmitError(msg);
        setSubmitting(false);
        return;
      }

      if (data && data.order) {
        setCreatedOrder(data.order);
      }
      clearCart();
      setStep('confirmation');
    } catch {
      setSubmitError(
        'No se pudo conectar con orders-api (http://127.0.0.1:3000). Verificá que el servidor de Node.js esté corriendo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={closeCart}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del Drawer */}
        <header className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.eyebrow}>Solicitud de Reserva · Sin Pago Inmediato</span>
            <h2 id="cart-drawer-title" className={styles.title}>
              {activeStep === 'cart' && `1. Tu Selección (${totalItems})`}
              {activeStep === 'checkout' && '2. Datos de Contacto y Entrega'}
              {activeStep === 'confirmation' && '3. Solicitud Registrada'}
            </h2>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeCart}
            aria-label="Cerrar panel de carrito"
          >
            ✕
          </button>
        </header>

        {/* Barra de Pasos / Wizard */}
        <nav className={styles.wizardBar} aria-label="Pasos de la solicitud de pedido">
          <button
            type="button"
            onClick={() => setStep('cart')}
            className={`${styles.stepTab} ${activeStep === 'cart' ? styles.stepTabActive : ''}`}
          >
            1. Carrito ({totalItems})
          </button>
          <button
            type="button"
            onClick={() => setStep('checkout')}
            className={`${styles.stepTab} ${activeStep === 'checkout' ? styles.stepTabActive : ''}`}
          >
            2. Tus Datos
          </button>
          <button
            type="button"
            onClick={() => setStep('confirmation')}
            className={`${styles.stepTab} ${activeStep === 'confirmation' ? styles.stepTabActive : ''}`}
          >
            3. Confirmación
          </button>
        </nav>

        {/* Cuerpo dinámico modularizado */}
        <div className={styles.body}>
          {activeStep === 'cart' && (
            <CartItemList
              items={items}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onCloseCart={closeCart}
            />
          )}

          {activeStep === 'checkout' && (
            <CartCheckoutForm
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerEmail={customerEmail}
              setCustomerEmail={setCustomerEmail}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              shippingAddress={shippingAddress}
              setShippingAddress={setShippingAddress}
              submitError={submitError}
              onSubmit={handleCheckoutSubmit}
            />
          )}

          {activeStep === 'confirmation' && (
            <CartConfirmationView
              createdOrder={createdOrder}
              onCloseCart={closeCart}
            />
          )}
        </div>

        {/* Footer del Drawer */}
        <footer className={styles.footer}>
          {activeStep === 'cart' && (
            <>
              <div className={styles.summaryRow}>
                <span>Artículos en solicitud</span>
                <span>{totalItems} unidades/cajas</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryTotal}>Total Estimado</span>
                <span className={`${styles.summaryTotal} ${styles.summaryTotalGold}`}>
                  ${totalAmount.toLocaleString('es-AR')}
                </span>
              </div>
              <button
                type="button"
                className={styles.ctaPrimary}
                disabled={items.length === 0}
                onClick={() => setStep('checkout')}
              >
                Continuar con Datos de Contacto →
              </button>
            </>
          )}

          {activeStep === 'checkout' && (
            <>
              <button
                type="submit"
                form="checkout-order-form"
                disabled={submitting}
                className={styles.ctaPrimary}
              >
                {submitting ? 'Enviando a Firestore...' : 'Confirmar Solicitud de Pedido'}
              </button>
              <button
                type="button"
                className={styles.ctaSecondary}
                onClick={() => setStep('cart')}
              >
                ← Volver al carrito
              </button>
            </>
          )}

          {activeStep === 'confirmation' && (
            <button type="button" className={styles.ctaSecondary} onClick={closeCart}>
              Cerrar ventana
            </button>
          )}
        </footer>
      </aside>
    </div>
  );
}
