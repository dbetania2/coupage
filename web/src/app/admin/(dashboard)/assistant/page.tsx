'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect, useSyncExternalStore } from 'react';
import { useAiAssistant } from '@/features/ai/useAiAssistant';
import { useOrders, OrderStatus } from '@/features/orders/useOrders';
import AssistantSessionsSidebar from './AssistantSessionsSidebar';
import AssistantQuickPrompts, { QUICK_ACTIONS, PromptCategory } from './AssistantQuickPrompts';
import AssistantChatMessages from './AssistantChatMessages';
import AssistantLiveOrdersMonitor from './AssistantLiveOrdersMonitor';
import styles from './assistant.module.css';

const emptySubscribe = () => () => {};

export default function AdminAssistantPage() {
  const {
    engineStatus,
    sessions,
    activeSessionId,
    messages,
    loading,
    error,
    sendMessage,
    selectSession,
    startNewSession,
    deleteSession,
  } = useAiAssistant();

  const { orders, loading: loadingOrders, reload: refreshOrders } = useOrders();

  const counts = useMemo(() => {
    return {
      PENDIENTE: orders.filter((o) => o.status === 'PENDIENTE').length,
      CONFIRMADO: orders.filter((o) => o.status === 'CONFIRMADO').length,
      PREPARADO: orders.filter((o) => o.status === 'PREPARADO').length,
      ENTREGADO: orders.filter((o) => o.status === 'ENTREGADO').length,
    };
  }, [orders]);

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [activeCategory, setActiveCategory] = useState<PromptCategory>('preparacion');
  const [queryText, setQueryText] = useState<string>('');
  const [sessionSearch, setSessionSearch] = useState<string>('');
  const [selectedOrderFilter, setSelectedOrderFilter] = useState<OrderStatus>('PENDIENTE');
  const [productLookupText, setProductLookupText] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [confirmDeleteActive, setConfirmDeleteActive] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length, loading]);

  const visibleActions = useMemo(() => {
    return QUICK_ACTIONS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const filteredSessions = useMemo(() => {
    const q = sessionSearch.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, sessionSearch]);

  const filteredLiveOrders = useMemo(() => {
    return orders.filter((o) => o.status === selectedOrderFilter).slice(0, 8);
  }, [orders, selectedOrderFilter]);

  const activeSessionTitle = useMemo(() => {
    if (!activeSessionId) return 'Nueva conversación';
    const found = sessions.find((s) => s.id === activeSessionId);
    return found ? found.title : `Conversación (${activeSessionId.slice(0, 8)})`;
  }, [activeSessionId, sessions]);

  const handleCopyText = useCallback(async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Silencioso si el navegador bloquea el portapapeles
    }
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim() || loading) return;
    const toSend = queryText;
    setQueryText('');
    void sendMessage(toSend);
  };

  const handleProductLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = productLookupText.trim();
    if (!term || loading) return;
    setProductLookupText('');
    void sendMessage(
      `Buscá información sobre "${term}" tanto en el catálogo de productos como en las solicitudes de pedidos activas y mostrame precios y unidades solicitadas.`
    );
  };

  const handleAnalyzeOrder = (
    orderNumber: string,
    status: string,
    _customerName: string,
    totalAmount: number
  ) => {
    void sendMessage(
      `Analizá el pedido ${orderNumber} (Estado actual: ${status}, Total: $${totalAmount.toLocaleString(
        'es-AR'
      )}): detallá en una tabla qué productos incluye y qué paso operativo corresponde realizar.`
    );
  };

  const handleAnalyzeStatusGroup = (status: OrderStatus) => {
    void sendMessage(
      `Mostrame en una tabla todas las solicitudes que se encuentran en estado ${status} con sus productos y montos.`
    );
  };

  const lastAssistantMessage = useMemo(() => {
    return [...messages].reverse().find((m) => m.role === 'assistant') || null;
  }, [messages]);

  return (
    <div className={styles.pageContainer}>
      {/* Cabecera Principal */}
      <header className={styles.headerBar}>
        <div>
          <span className={styles.eyebrow}>
            <span>Asistente Operativo · Gestión de Cava y Pedidos</span>
            <span className={`${styles.statusPill} ${styles.statusSuccess}`}>
              ● {engineStatus?.apiKeyConfigured ? 'En línea' : 'Modo Local'}
            </span>
          </span>
          <h1 className={styles.pageTitle}>Asistente de Operaciones y Despacho</h1>
          <p className={styles.pageSubtitle}>
            Consultá solicitudes en tiempo real, generá hojas de preparación de pedidos en tabla,
            descargá reportes en CSV y verificá disponibilidad del catálogo.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => {
              startNewSession();
              inputRef.current?.focus();
            }}
          >
            + Nueva Conversación
          </button>

          {activeSessionId && !confirmDeleteActive && (
            <button
              type="button"
              className={styles.btnDanger}
              onClick={() => setConfirmDeleteActive(true)}
            >
              🗑 Borrar Conversación
            </button>
          )}

          {confirmDeleteActive && (
            <div className={styles.inlineRow}>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={() => {
                  if (activeSessionId) {
                    void deleteSession(activeSessionId);
                  }
                  setConfirmDeleteActive(false);
                }}
              >
                Confirmar borrado
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setConfirmDeleteActive(false)}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div role="alert" className="admin-alert admin-alert-danger">
          ⚠️ {error}
        </div>
      )}

      {/* Grilla Principal (3 + 6 + 3) */}
      <div className={styles.workspaceGrid}>
        <AssistantSessionsSidebar
          sessions={sessions}
          filteredSessions={filteredSessions}
          activeSessionId={activeSessionId}
          sessionSearch={sessionSearch}
          onSessionSearchChange={setSessionSearch}
          messagesCount={messages.length}
          isMounted={isMounted}
          onSelectSession={(id) => void selectSession(id)}
          onDeleteSession={(id) => void deleteSession(id)}
          productLookupText={productLookupText}
          onProductLookupChange={setProductLookupText}
          onProductLookupSubmit={handleProductLookupSubmit}
          loading={loading}
          engineStatus={engineStatus}
        />

        {/* COLUMNA CENTRAL: Consola de Chat + Reportes y Exportación CSV */}
        <section className={styles.colChat} aria-label="Consola de conversación">
          <div className={styles.chatConsole}>
            <div className={styles.chatTopBar}>
              <div className={styles.topBarInfo}>
                <span className={styles.topBarEyebrow}>Conversación Activa</span>
                <div className={styles.topBarTitle}>{activeSessionTitle}</div>
              </div>

              <div className={styles.inlineRow}>
                {lastAssistantMessage && (
                  <button
                    type="button"
                    className={styles.topBarBtn}
                    onClick={() => void handleCopyText(lastAssistantMessage.content, -1)}
                  >
                    {copiedIndex === -1 ? '✓ Copiado' : '📋 Copiar último reporte'}
                  </button>
                )}
                <button
                  type="button"
                  className={styles.topBarBtn}
                  onClick={startNewSession}
                  disabled={loading}
                >
                  + Nuevo Chat
                </button>
              </div>
            </div>

            <AssistantQuickPrompts
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              visibleActions={visibleActions}
              loading={loading}
              onSendMessage={(prompt) => void sendMessage(prompt)}
            />

            <AssistantChatMessages
              messages={messages}
              loading={loading}
              copiedIndex={copiedIndex}
              onCopyText={(text, idx) => void handleCopyText(text, idx)}
              messagesEndRef={messagesEndRef}
            />

            <form className={styles.chatInputArea} onSubmit={handleFormSubmit}>
              <div className={styles.inputRow}>
                <input
                  ref={inputRef}
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  disabled={loading}
                  className={styles.chatInput}
                  placeholder="Escribí una pregunta sobre pedidos, armado de cajas, estados o catálogo..."
                  aria-label="Escribir consulta para el asistente"
                />
                <button
                  type="submit"
                  disabled={loading || !queryText.trim()}
                  className={styles.btnPrimary}
                >
                  {loading ? 'Consultando...' : 'Enviar →'}
                </button>
              </div>
            </form>
          </div>
        </section>

        <AssistantLiveOrdersMonitor
          counts={counts}
          selectedOrderFilter={selectedOrderFilter}
          onSelectOrderFilter={setSelectedOrderFilter}
          filteredLiveOrders={filteredLiveOrders}
          loading={loading}
          loadingOrders={loadingOrders}
          onRefreshOrders={() => void refreshOrders()}
          onAnalyzeStatusGroup={handleAnalyzeStatusGroup}
          onAnalyzeOrder={handleAnalyzeOrder}
        />
      </div>
    </div>
  );
}
