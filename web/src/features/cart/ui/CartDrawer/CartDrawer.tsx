'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartUI } from '../../context/CartUIContext';
import styles from './CartDrawer.module.css';

interface CreatedOrderResponse {
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

        {/* Barra de Pasos / Wizard (Ley de Hick) */}
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

        {/* Cuerpo dinámico */}
        <div className={styles.body}>
          {activeStep === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className={styles.templateNotice}>
                  <span className={styles.templateNoticeStrong}>
                    Tu solicitud aún no tiene productos seleccionados
                  </span>
                  Explorá el catálogo público de vinos, licores y delicatessen y presioná{' '}
                  <strong>&quot;Agregar a Solicitud&quot;</strong> para cargar productos reales de la base de datos.
                  <div style={{ marginTop: '1rem' }}>
                    <Link
                      href="/catalogo"
                      onClick={closeCart}
                      className={styles.ctaPrimary}
                      style={{ textDecoration: 'none' }}
                    >
                      Ir al Catálogo de Productos →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className={styles.itemList}>
                  {items.map((item) => (
                    <article key={item.key} className={styles.cartItemCard}>
                      <div className={styles.itemThumbPlaceholder} style={{ padding: 0, overflow: 'hidden', borderStyle: 'solid' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=300&auto=format&fit=crop'}
                          alt={item.productName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      <div className={styles.itemInfo}>
                        <span className={styles.itemBrand}>{item.brandName}</span>
                        <h3 className={styles.itemTitle}>{item.productName}</h3>
                        <p className={styles.itemMeta}>Modalidad: {item.saleModeType}</p>
                        <p className={styles.itemMeta} style={{ color: 'var(--color-gold)' }}>
                          ${item.unitPrice.toLocaleString('es-AR')} c/u · Subtotal: $
                          {(item.unitPrice * item.quantity).toLocaleString('es-AR')}
                        </p>

                        <div className={styles.itemControlsRow}>
                          <div className={styles.qtyGroup} aria-label="Selector de cantidad">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              className={styles.qtyBtn}
                              aria-label="Disminuir cantidad"
                            >
                              −
                            </button>
                            <span className={styles.qtyValue}>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              className={styles.qtyBtn}
                              aria-label="Aumentar cantidad"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className={styles.removeBtn}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {activeStep === 'checkout' && (
            <>
              <div className={styles.templateNotice}>
                <span className={styles.templateNoticeStrong}>
                  📌 Solicitud sin cobro automático (Conectado a POST /api/orders)
                </span>
                Tu pedido se guardará en <strong>Cloud Firestore</strong> con estado inicial <code>PENDIENTE</code> para
                que el personal verifique disponibilidad física en cava.
              </div>

              {submitError && (
                <div
                  role="alert"
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    color: '#fca5a5',
                    fontSize: '0.82rem',
                    borderRadius: '4px',
                  }}
                >
                  ⚠️ {submitError}
                </div>
              )}

              <form
                id="checkout-order-form"
                onSubmit={handleCheckoutSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
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
          )}

          {activeStep === 'confirmation' && (
            <div className={styles.confirmationBox}>
              <span className={styles.eyebrow}>✓ Solicitud Registrada en Cloud Firestore</span>
              <h3 className={styles.title} style={{ fontSize: '1.35rem' }}>
                {createdOrder
                  ? '¡Tu solicitud de pedido fue enviada con éxito!'
                  : '[Aquí se mostrará la confirmación tras enviar tu solicitud]'}
              </h3>

              <div className={styles.orderCodeBadge}>
                {createdOrder ? createdOrder.orderNumber : '[Código de Seguimiento: ej. ORD-2026-0001]'}
              </div>

              <div className={styles.templateNotice} style={{ textAlign: 'left' }}>
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
                onClick={closeCart}
                className={styles.ctaPrimary}
                style={{ marginTop: '0.5rem', textDecoration: 'none' }}
              >
                Consultar Seguimiento de Pedido →
              </Link>
            </div>
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
                <span className={styles.summaryTotal} style={{ color: 'var(--color-gold)' }}>
                  ${totalAmount.toLocaleString('es-AR')}
                </span>
              </div>
              <button
                type="button"
                className={styles.ctaPrimary}
                disabled={items.length === 0}
                onClick={() => setStep('checkout')}
                style={{ opacity: items.length === 0 ? 0.5 : 1 }}
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
