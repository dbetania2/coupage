'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useAiAssistant, parseMarkdownBlocks, MarkdownTableBlock } from '@/features/ai/useAiAssistant';
import { useOrders, OrderStatus } from '@/features/orders/useOrders';
import styles from './assistant.module.css';

type PromptCategory = 'preparacion' | 'estados' | 'catalogo';

interface QuickActionPrompt {
  id: string;
  category: PromptCategory;
  title: string;
  promptText: string;
}

const QUICK_ACTIONS: QuickActionPrompt[] = [
  {
    id: 'qa-prep-1',
    category: 'preparacion',
    title: 'Hoja de preparación del día',
    promptText:
      '¿Qué productos y cantidades exactas debo preparar hoy para cubrir las solicitudes pendientes y confirmadas? Armá una tabla detallada.',
  },
  {
    id: 'qa-prep-2',
    category: 'preparacion',
    title: 'Prioridad de despacho en cava',
    promptText:
      'Listá en una tabla las solicitudes confirmadas y en preparación ordenadas por monto total para priorizar el armado.',
  },
  {
    id: 'qa-est-1',
    category: 'estados',
    title: 'Solicitudes pendientes de revisión',
    promptText:
      '¿Qué solicitudes están en estado PENDIENTE esperando verificación de stock? Incluí una tabla con código, cliente, productos y total.',
  },
  {
    id: 'qa-est-2',
    category: 'estados',
    title: 'Balance general por estado',
    promptText:
      'Dame un resumen general de todas las solicitudes agrupadas por estado y el monto activo acumulado.',
  },
  {
    id: 'qa-cat-1',
    category: 'catalogo',
    title: 'Ranking de etiquetas más pedidas',
    promptText:
      'Mostrame en una tabla el ranking de los vinos y productos más solicitados con sus unidades pedidas e ingresos.',
  },
  {
    id: 'qa-cat-2',
    category: 'catalogo',
    title: 'Listado de precios y modalidades',
    promptText:
      'Consultá el catálogo de productos y mostrame en una tabla las etiquetas registradas con su bodega y precios vigentes.',
  },
];

function exportTableToCsv(table: MarkdownTableBlock, filename = 'reporte-asistente.csv') {
  const escapeCsvCell = (cell: string) => `"${String(cell || '').replace(/"/g, '""')}"`;
  const lines = [
    table.headers.map(escapeCsvCell).join(','),
    ...table.rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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

  const handleAnalyzeOrder = (orderNumber: string, status: string, customerName: string, totalAmount: number) => {
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
            Consultá solicitudes en tiempo real, generá hojas de preparación de pedidos en tabla, descargá reportes en
            CSV y verificá disponibilidad del catálogo.
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
            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={() => {
                  void deleteSession(activeSessionId);
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
        <div
          role="alert"
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.84rem',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Grilla Principal (3 + 6 + 3) */}
      <div className={styles.workspaceGrid}>
        {/* COLUMNA IZQUIERDA: Historial de Conversaciones, Buscador y Estado */}
        <aside className={styles.colSessions} aria-label="Historial de conversaciones">
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Conversaciones</h2>
              <span className={`${styles.statusPill} ${styles.statusInfo}`}>
                {sessions.length} guardadas
              </span>
            </div>

            <input
              type="search"
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              placeholder="Buscar conversación anterior..."
              className={styles.searchBox}
              aria-label="Buscar conversación por título"
            />

            {messages.length >= 12 && (
              <div
                style={{
                  padding: '0.55rem 0.7rem',
                  borderRadius: '6px',
                  backgroundColor: '#fefce8',
                  border: '1px solid #fde047',
                  color: '#854d0e',
                  fontSize: '0.73rem',
                  lineHeight: 1.4,
                }}
              >
                💡 Esta sesión tiene {messages.length} mensajes. Si cambiás de turno o tarea, te sugerimos abrir una{' '}
                <strong>Nueva Conversación</strong> para mantener respuestas ágiles.
              </div>
            )}

            <div className={styles.sessionList}>
              {filteredSessions.length === 0 ? (
                <p style={{ fontSize: '0.76rem', color: '#71717a', padding: '0.25rem 0' }}>
                  {sessionSearch
                    ? 'No se encontraron conversaciones con ese nombre.'
                    : 'Todavía no hay conversaciones guardadas. Enviá una consulta para iniciar.'}
                </p>
              ) : (
                filteredSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`${styles.sessionCard} ${
                      activeSessionId === sess.id ? styles.sessionCardActive : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => void selectSession(sess.id)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.18rem',
                      }}
                    >
                      <span className={styles.sessionTitle}>{sess.title}</span>
                      <span className={styles.sessionMeta}>
                        {sess.messagesCount} mensajes ·{' '}
                        {isMounted && sess.updatedAt
                          ? new Date(sess.updatedAt).toLocaleTimeString('es-AR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Reciente'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteSession(sess.id);
                      }}
                      title="Eliminar conversación"
                      aria-label={`Eliminar ${sess.title}`}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#71717a',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        padding: '0.2rem 0.35rem',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Buscador Rápido por Etiqueta o Bodega */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Consulta por Etiqueta</h2>
              <span className={`${styles.statusPill} ${styles.statusInfo}`}>Catálogo + Pedidos</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#52525b', lineHeight: 1.4 }}>
              Verificá al instante cuántas unidades se solicitaron de un vino o bodega y su precio vigente:
            </p>
            <form onSubmit={handleProductLookupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="text"
                value={productLookupText}
                onChange={(e) => setProductLookupText(e.target.value)}
                disabled={loading}
                placeholder="Ej: Malbec, Rutini, Luigi Bosca..."
                className={styles.searchBox}
                aria-label="Nombre de vino o bodega a consultar"
              />
              <button
                type="submit"
                disabled={loading || !productLookupText.trim()}
                className={styles.btnSecondary}
                style={{ width: '100%' }}
              >
                🔍 Consultar demanda y precio
              </button>
            </form>
          </section>

          {/* Capacidad y Estado del Servicio */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Capacidad Operativa</h2>
              <span className={`${styles.statusPill} ${styles.statusSuccess}`}>Disponible</span>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#27272a', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Consultas disponibles / min:</span>
                <strong>
                  {engineStatus?.rateLimit
                    ? `${engineStatus.rateLimit.remainingInWindow} de ${engineStatus.rateLimit.maxPerMinute}`
                    : '12 de 12'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Capacidad del turno:</span>
                <strong>{100 - (engineStatus?.quota.percentage || 0)}% libre</strong>
              </div>
              <div className={styles.quotaMeter}>
                <div
                  className={styles.quotaFill}
                  style={{ width: `${Math.max(3, engineStatus?.quota.percentage || 2)}%` }}
                />
              </div>
            </div>
          </section>
        </aside>

        {/* COLUMNA CENTRAL: Consola de Chat + Reportes y Exportación CSV */}
        <section className={styles.colChat} aria-label="Consola de conversación">
          <div className={styles.chatConsole}>
            <div className={styles.chatTopBar}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '0.68rem', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase' }}>
                  Conversación Activa
                </span>
                <div
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {activeSessionTitle}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
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

            {/* Atajos de Reportes Operativos */}
            <div className={styles.suggestionsSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.73rem', fontWeight: 700, color: '#27272a', textTransform: 'uppercase' }}>
                  Reportes y Consultas Frecuentes:
                </span>
                <div className={styles.tabsRow} role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === 'preparacion'}
                    onClick={() => setActiveCategory('preparacion')}
                    className={`${styles.tabBtn} ${activeCategory === 'preparacion' ? styles.tabBtnActive : ''}`}
                  >
                    📦 Armado en Cava
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === 'estados'}
                    onClick={() => setActiveCategory('estados')}
                    className={`${styles.tabBtn} ${activeCategory === 'estados' ? styles.tabBtnActive : ''}`}
                  >
                    ⏳ Control de Estados
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === 'catalogo'}
                    onClick={() => setActiveCategory('catalogo')}
                    className={`${styles.tabBtn} ${activeCategory === 'catalogo' ? styles.tabBtnActive : ''}`}
                  >
                    🍷 Demanda y Catálogo
                  </button>
                </div>
              </div>

              <div className={styles.chipsGrid}>
                {visibleActions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={loading}
                    onClick={() => void sendMessage(item.promptText)}
                    className={styles.promptChip}
                  >
                    <span>{item.title}</span>
                    <span style={{ color: '#71717a', fontSize: '0.75rem' }}>→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Historial de Mensajes */}
            <div className={styles.messagesViewport}>
              {messages.length === 0 ? (
                <div className={styles.placeholderBanner}>
                  <strong>Asistente listo para tu turno operativo</strong>
                  <br />
                  Seleccioná cualquiera de los reportes frecuentes de arriba, hacé clic en un pedido de la columna
                  derecha para analizarlo, o escribí tu consulta abajo.
                </div>
              ) : (
                messages.map((msg, idx) => {
                  if (msg.role === 'user') {
                    return (
                      <article key={`msg-${idx}`} className={styles.userBubble}>
                        {msg.content}
                      </article>
                    );
                  }

                  const blocks = parseMarkdownBlocks(msg.content);
                  const traces = msg.toolTraces && msg.toolTraces.length > 0 ? msg.toolTraces : [];
                  const firstTable = blocks.find((b): b is MarkdownTableBlock => b.type === 'table');

                  return (
                    <article key={`msg-${idx}`} className={styles.assistantBubble}>
                      <div className={styles.bubbleHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <strong style={{ color: '#18181b', fontSize: '0.84rem' }}>Asistente Operativo</strong>
                          {traces.length > 0 && (
                            <span className={`${styles.statusPill} ${styles.statusInfo}`}>
                              ✓ Datos en vivo ({traces.map((t) => t.source.split(' ')[0]).join(' + ')})
                            </span>
                          )}
                        </div>

                        <div className={styles.bubbleActions}>
                          <button
                            type="button"
                            className={styles.actionMiniBtn}
                            onClick={() => void handleCopyText(msg.content, idx)}
                          >
                            {copiedIndex === idx ? '✓ Copiado' : '📋 Copiar'}
                          </button>
                          {firstTable && (
                            <button
                              type="button"
                              className={styles.actionMiniBtn}
                              onClick={() =>
                                exportTableToCsv(firstTable, `reporte-cava-${new Date().toISOString().slice(0, 10)}.csv`)
                              }
                            >
                              📥 Descargar CSV
                            </button>
                          )}
                        </div>
                      </div>

                      {blocks.map((block, bIdx) => {
                        if (block.type === 'table') {
                          return (
                            <div key={`blk-${bIdx}`} className="admin-table-card">
                              <div className="admin-table-scroll">
                                <table className="admin-table">
                                  <thead>
                                    <tr>
                                      {block.headers.map((h, hIdx) => (
                                        <th key={`th-${hIdx}`}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {block.rows.map((row, rIdx) => (
                                      <tr key={`tr-${rIdx}`}>
                                        {row.map((cell, cIdx) => (
                                          <td key={`td-${cIdx}`}>{cell}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={`blk-${bIdx}`}
                            style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#18181b' }}
                          >
                            {block.text}
                          </div>
                        );
                      })}
                    </article>
                  );
                })
              )}

              {loading && (
                <div className={styles.placeholderBanner}>
                  ⏳ <strong>Elaborando respuesta...</strong> Consultando datos actualizados del sistema.
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Formulario Inferior */}
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
                <button type="submit" disabled={loading || !queryText.trim()} className={styles.btnPrimary}>
                  {loading ? 'Consultando...' : 'Enviar →'}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* COLUMNA DERECHA: Monitor Operativo de Pedidos en Vivo y Análisis Directo */}
        <aside className={styles.colInspector} aria-label="Monitor operativo de solicitudes en vivo">
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Monitor de Solicitudes</h2>
              <button
                type="button"
                onClick={() => void refreshOrders()}
                className={styles.actionMiniBtn}
                title="Actualizar estado de solicitudes"
              >
                {loadingOrders ? '...' : '↻ Actualizar'}
              </button>
            </div>

            <div className={styles.kpiGrid}>
              <button
                type="button"
                onClick={() => setSelectedOrderFilter('PENDIENTE')}
                className={`${styles.kpiBox} ${selectedOrderFilter === 'PENDIENTE' ? styles.kpiBoxActive : ''}`}
              >
                <span className={styles.kpiValue}>{counts.PENDIENTE}</span>
                <span className={styles.kpiLabel}>Pendientes</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderFilter('CONFIRMADO')}
                className={`${styles.kpiBox} ${selectedOrderFilter === 'CONFIRMADO' ? styles.kpiBoxActive : ''}`}
              >
                <span className={styles.kpiValue}>{counts.CONFIRMADO}</span>
                <span className={styles.kpiLabel}>Confirmados</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderFilter('PREPARADO')}
                className={`${styles.kpiBox} ${selectedOrderFilter === 'PREPARADO' ? styles.kpiBoxActive : ''}`}
              >
                <span className={styles.kpiValue}>{counts.PREPARADO}</span>
                <span className={styles.kpiLabel}>Preparados</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderFilter('ENTREGADO')}
                className={`${styles.kpiBox} ${selectedOrderFilter === 'ENTREGADO' ? styles.kpiBoxActive : ''}`}
              >
                <span className={styles.kpiValue}>{counts.ENTREGADO}</span>
                <span className={styles.kpiLabel}>Entregados</span>
              </button>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleAnalyzeStatusGroup(selectedOrderFilter)}
              className={styles.btnSecondary}
              style={{ width: '100%' }}
            >
              📊 Auditar {selectedOrderFilter.toLowerCase()}s en el chat
            </button>
          </section>

          {/* Cola de Solicitudes según el estado seleccionado */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Cola: {selectedOrderFilter}</h2>
              <Link
                href="/admin/orders"
                style={{ fontSize: '0.72rem', fontWeight: 600, color: '#3f3f46', textDecoration: 'underline' }}
              >
                Gestionar todos ↗
              </Link>
            </div>

            <div className={styles.liveOrdersList}>
              {filteredLiveOrders.length === 0 ? (
                <p style={{ fontSize: '0.76rem', color: '#71717a' }}>
                  No hay solicitudes en estado <strong>{selectedOrderFilter}</strong> en este momento.
                </p>
              ) : (
                filteredLiveOrders.map((ord) => {
                  const totalUnits = (ord.items || []).reduce((acc, i) => acc + Number(i.quantity || 0), 0);
                  return (
                    <article key={ord.id} className={styles.liveOrderItem}>
                      <div className={styles.liveOrderTop}>
                        <strong style={{ color: '#18181b' }}>{ord.orderNumber || ord.id}</strong>
                        <span style={{ fontWeight: 700, color: '#27272a' }}>
                          ${Number(ord.totalAmount || 0).toLocaleString('es-AR')}
                        </span>
                      </div>

                      <div style={{ color: '#52525b', fontSize: '0.73rem' }}>
                        {ord.customer?.name || 'Cliente'} · {totalUnits} u. ({ord.items?.length || 0} ítem/s)
                      </div>

                      <div className={styles.liveOrderActions}>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleAnalyzeOrder(
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
                        <Link
                          href="/admin/orders"
                          style={{ fontSize: '0.7rem', color: '#52525b', textDecoration: 'none', fontWeight: 600 }}
                        >
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
      </div>
    </div>
  );
}
