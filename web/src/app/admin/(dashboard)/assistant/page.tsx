'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import styles from './assistant.module.css';

type PromptCategory = 'preparacion' | 'auditoria' | 'catalogo';

interface SuggestedPrompt {
  id: string;
  category: PromptCategory;
  promptText: string;
  targetTool: string;
  ticketRef: string;
}

interface PersistedSessionSlot {
  id: string;
  titlePlaceholder: string;
  datePlaceholder: string;
  messagesCountPlaceholder: string;
}

interface BackendToolSpec {
  id: string;
  name: string;
  ticket: string;
  moduleOrigin: string;
  paramsPlaceholder: string;
  returnPlaceholder: string;
}

const PERSISTED_SESSIONS: PersistedSessionSlot[] = [
  {
    id: 'sess-active-1',
    titlePlaceholder: '[Aquí va Título de Sesión Activa: Preparación del Día]',
    datePlaceholder: '[Aquí va timestamp de última actividad]',
    messagesCountPlaceholder: '[Cant. turnos guardados]',
  },
  {
    id: 'sess-history-2',
    titlePlaceholder: '[Aquí va Sesión Anterior #2: Revisión de Pendientes]',
    datePlaceholder: '[Aquí va fecha de sesión en BD]',
    messagesCountPlaceholder: '[Cant. turnos guardados]',
  },
  {
    id: 'sess-history-3',
    titlePlaceholder: '[Aquí va Sesión Anterior #3: Consulta de Cajas Cerradas]',
    datePlaceholder: '[Aquí va fecha de sesión en BD]',
    messagesCountPlaceholder: '[Cant. turnos guardados]',
  },
];

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'sug-prep-1',
    category: 'preparacion',
    promptText: '¿Qué productos (por unidad y por caja) debo preparar para las solicitudes confirmadas de hoy?',
    targetTool: 'consolidarListaPreparacion(fecha="hoy", estado="CONFIRMADO")',
    ticketRef: 'T28 + T33',
  },
  {
    id: 'sug-prep-2',
    category: 'preparacion',
    promptText: 'Generá una tabla consolidada de cajas de vino y delicatessen para los pedidos en estado PREPARADO.',
    targetTool: 'agruparModalidadesPorEstado(estado="PREPARADO")',
    ticketRef: 'T28 + T33',
  },
  {
    id: 'sug-audit-1',
    category: 'auditoria',
    promptText: '¿Qué solicitudes en estado PENDIENTE llevan más tiempo esperando verificación física en cava?',
    targetTool: 'consultarPedidosPorEstado(status="PENDIENTE", orden="antiguedad")',
    ticketRef: 'T28',
  },
  {
    id: 'sug-audit-2',
    category: 'auditoria',
    promptText: 'Mostrame el resumen de solicitudes rechazadas o canceladas de la semana y sus motivos en history.',
    targetTool: 'consultarHistorialEstados(estados=["RECHAZADO", "CANCELADO"])',
    ticketRef: 'T28',
  },
  {
    id: 'sug-cat-1',
    category: 'catalogo',
    promptText: '¿Qué vinos tintos activos en el catálogo tienen habilitada la modalidad de venta por Caja de 6 unidades?',
    targetTool: 'consultarCatalogoProductos(categoria="Vinos", modalidad="Caja")',
    ticketRef: 'T27',
  },
  {
    id: 'sug-cat-2',
    category: 'catalogo',
    promptText: 'Verificá cuáles son los precios vigentes en Django para la categoría Delicatessen.',
    targetTool: 'leerPreciosVigentesCatalogo(categoria="Delicatessen")',
    ticketRef: 'T27',
  },
];

const BACKEND_TOOLS_SPECS: BackendToolSpec[] = [
  {
    id: 'spec-tool-orders-1',
    name: 'consultarPedidosPorEstado',
    ticket: 'T28 · Tools de Pedidos',
    moduleOrigin: 'Node.js · Cloud Firestore',
    paramsPlaceholder: '{ status: "PENDIENTE" | "CONFIRMADO" | "PREPARADO" | "ENTREGADO", limit?: number }',
    returnPlaceholder: '[Aquí devuelve la lista de pedidos filtrados con PII enmascarado (T35)]',
  },
  {
    id: 'spec-tool-orders-2',
    name: 'consolidarListaPreparacion',
    ticket: 'T28 · Tools de Pedidos',
    moduleOrigin: 'Node.js · Cloud Firestore',
    paramsPlaceholder: '{ fecha: string, incluirModalidades: true }',
    returnPlaceholder: '[Aquí suma cantidades por producto separando Unidades vs. Cajas]',
  },
  {
    id: 'spec-tool-catalog-1',
    name: 'consultarCatalogoProductos',
    ticket: 'T27 · Tools de Catálogo',
    moduleOrigin: 'Django DRF · PostgreSQL',
    paramsPlaceholder: '{ category?: string, saleMode?: string, onlyActive: true }',
    returnPlaceholder: '[Aquí consulta GET /api/products/ para informar precios y modalidades activas]',
  },
];

export default function AdminAssistantPage() {
  // Hooks en el nivel superior (Regla Sagrada de los Hooks - tipsdiseño.md Sección 2)
  const [selectedSessionId, setSelectedSessionId] = useState<string>(PERSISTED_SESSIONS[0].id);
  const [activeCategory, setActiveCategory] = useState<PromptCategory>('preparacion');
  const [selectedPrompt, setSelectedPrompt] = useState<SuggestedPrompt>(SUGGESTED_PROMPTS[0]);
  const [queryText, setQueryText] = useState<string>('');
  const [confirmClearHistory, setConfirmClearHistory] = useState<boolean>(false);

  // useRef para acceso directo al DOM sin provocar re-renders (tipsdiseño.md Sección 2)
  const inputRef = useRef<HTMLInputElement | null>(null);

  // useMemo para filtrar sugerencias por categoría activa (tipsdiseño.md Sección 2)
  const visiblePrompts = useMemo(() => {
    return SUGGESTED_PROMPTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // useCallback para seleccionar un prompt sugerido y enfocar el input (Ley de Tesler)
  const handleSelectPrompt = useCallback((prompt: SuggestedPrompt) => {
    setSelectedPrompt(prompt);
    setQueryText(prompt.promptText);
    inputRef.current?.focus();
  }, []);

  return (
    <div className={styles.pageContainer}>
      {/* Cabecera Semántica */}
      <header className={styles.headerBar}>
        <div>
          <span className={styles.eyebrow}>
            <span>✨ Sprint 3 · HU5 · Tickets T25 a T36</span>
            <span className={`${styles.statusPill} ${styles.statusInfo}`}>
              🔒 Exclusivo Personal Autenticado (JWT)
            </span>
          </span>
          <h1 className={styles.pageTitle}>
            Asistente Operativo de IA — Tu Gusto Gourmet
          </h1>
          <p className={styles.pageSubtitle}>
            Consola de asistencia en lenguaje natural conectada a Claude API (Anthropic) mediante ejecución controlada
            de herramientas de backend (Tool Calling), sin acceso libre a la base de datos.
          </p>
        </div>

        {/* Acciones de Cabecera con confirmación en acción destructiva (Ley de Fitts) */}
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => inputRef.current?.focus()}
          >
            ⌨️ Enfocar Consola (useRef)
          </button>

          {!confirmClearHistory ? (
            <button
              type="button"
              className={styles.btnDanger}
              onClick={() => setConfirmClearHistory(true)}
            >
              🗑 Limpiar Historial de Chat (T34)
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={() => setConfirmClearHistory(false)}
              >
                ⚠️ Confirmar Borrado de Sesión (DELETE /api/ai/sessions/:id)
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setConfirmClearHistory(false)}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Grilla Principal de 12 Columnas (3 + 6 + 3 en Desktop) */}
      <div className={styles.workspaceGrid}>
        {/* ====================================================================
            COLUMNA IZQUIERDA (3 cols): Sesiones (T26), Rate Limit (T31) y Prompt (T25)
            ==================================================================== */}
        <aside className={styles.colSessions} aria-label="Gestión de sesiones y control de costos">
          {/* T26: Persistencia de Sesiones de Chat */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>1. Sesiones de Chat (T26)</h2>
              <span className={`${styles.statusPill} ${styles.statusSuccess}`}>● BD Activa</span>
            </div>

            <button type="button" className={styles.btnPrimary} style={{ width: '100%' }}>
              + Nueva Sesión Operativa
            </button>

            <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.45 }}>
              [Aquí se listan las sesiones de conversación guardadas en base de datos para mantener el contexto del
              turno de trabajo]:
            </p>

            <div className={styles.sessionList}>
              {PERSISTED_SESSIONS.map((sess) => (
                <button
                  key={sess.id}
                  type="button"
                  onClick={() => setSelectedSessionId(sess.id)}
                  className={`${styles.sessionCard} ${
                    selectedSessionId === sess.id ? styles.sessionCardActive : ''
                  }`}
                >
                  <span className={styles.sessionTitle}>{sess.titlePlaceholder}</span>
                  <span className={styles.sessionMeta}>
                    {sess.datePlaceholder} · {sess.messagesCountPlaceholder}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* T31: Rate Limiting y Control de Costos (Tokens) */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>2. Control de Costos (T31)</h2>
              <span className={`${styles.statusPill} ${styles.statusInfo}`}>⚡ Rate Limit OK</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Presupuesto de Tokens:</span>
                <strong>[Aquí va X / Máx Tokens]</strong>
              </div>
              <div className={styles.quotaMeter} role="progressbar" aria-valuenow={35} aria-valuemin={0} aria-valuemax={100}>
                <div className={styles.quotaFill} />
              </div>
              <p style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
                • <strong>Ventana de Peticiones:</strong> <code>[Aquí va cant. consultas / minuto por admin]</code>
                <br />• <strong>Protección de Cuota:</strong> Si se alcanza el umbral, el backend en Node.js responde{' '}
                <code>HTTP 429 Too Many Requests</code>.
              </p>
            </div>
          </section>

          {/* T25: Configuración Base y System Prompt */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>3. System Prompt (T25)</h2>
              <span className={`${styles.statusPill} ${styles.statusSuccess}`}>✓ Grounded</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
              <strong>[Aquí va la directiva de rol configurada en el SDK de Claude]:</strong>
              <br />
              • Rol exclusivo: Asistente interno de <em>Tu Gusto Gourmet</em>.
              <br />
              • Prohibido inventar stock, precios o estados que no provengan de las Tools.
              <br />
              • Formato de salida preferido: Tablas Markdown claras para armado de pedidos en cava.
            </div>
          </section>
        </aside>

        {/* ====================================================================
            COLUMNA CENTRAL (6 cols): Consola SSE (T30/T32), Markdown (T33) y Sugerencias (T34)
            ==================================================================== */}
        <section className={styles.colChat} aria-label="Consola de conversación con el asistente IA">
          <div className={styles.chatConsole}>
            {/* Barra Superior de Conexión Streaming SSE (T30) */}
            <div className={styles.chatTopBar}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase' }}>
                  T30 &amp; T32 · Server-Sent Events (text/event-stream)
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  Sesión activa: <code>[Aquí va {selectedSessionId}]</code>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`${styles.statusPill} ${styles.statusSuccess}`}>
                  ● Streaming SSE Listo
                </span>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  style={{ minHeight: '36px', padding: '0.25rem 0.65rem', fontSize: '0.74rem' }}
                >
                  ⏹ [Detener Generación]
                </button>
              </div>
            </div>

            {/* T34: UI de Sugerencias Rápidas divididas en 3 categorías (Ley de Hick + Ley de Tesler) */}
            <div className={styles.suggestionsSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                  💡 Consultas Operativas Frecuentes (T34 — Clic para autocompletar):
                </span>
                <div className={styles.tabsRow} role="tablist" aria-label="Categorías de sugerencias">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === 'preparacion'}
                    onClick={() => setActiveCategory('preparacion')}
                    className={`${styles.tabBtn} ${activeCategory === 'preparacion' ? styles.tabBtnActive : ''}`}
                  >
                    📦 Preparación del Día
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === 'auditoria'}
                    onClick={() => setActiveCategory('auditoria')}
                    className={`${styles.tabBtn} ${activeCategory === 'auditoria' ? styles.tabBtnActive : ''}`}
                  >
                    ⏳ Demoras y Estados
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === 'catalogo'}
                    onClick={() => setActiveCategory('catalogo')}
                    className={`${styles.tabBtn} ${activeCategory === 'catalogo' ? styles.tabBtnActive : ''}`}
                  >
                    🍷 Catálogo y Modalidades
                  </button>
                </div>
              </div>

              {/* Lista de Chips con keys únicas y estables (tipsdiseño.md Sección 1) */}
              <div className={styles.chipsGrid}>
                {visiblePrompts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPrompt(item)}
                    className={styles.promptChip}
                  >
                    <span>💬 {item.promptText}</span>
                    <span className={`${styles.statusPill} ${styles.statusInfo}`}>
                      {item.ticketRef}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Viewport de Mensajes y Ejecución de Tools */}
            <div className={styles.messagesViewport}>
              {/* 1. Mensaje del Administrador */}
              <article className={styles.userBubble}>
                <strong style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', opacity: 0.9, marginBottom: '0.25rem' }}>
                  👤 [Aquí va la consulta enviada por el personal de tienda]:
                </strong>
                {selectedPrompt.promptText}
              </article>

              {/* 2. T29: Motor de Despacho (Dispatcher) y Ejecución de Tool Calling */}
              <section className={styles.dispatcherTrace} aria-label="Traza de ejecución del Dispatcher">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <strong style={{ color: '#0f172a' }}>
                    ⚙️ [Aquí va el Motor de Despacho (Dispatcher - T29) ejecutando Tool Calling]:
                  </strong>
                  <span className={`${styles.statusPill} ${styles.statusSuccess}`}>
                    ✓ Tool Ejecutada Sin Acceso Directo a BD
                  </span>
                </div>

                <div className={styles.traceSteps}>
                  <div className={styles.traceStepItem}>
                    <strong>Paso 1 (Claude Tool Use):</strong>
                    <br />
                    <code>[Aquí selecciona: {selectedPrompt.targetTool}]</code>
                  </div>
                  <div className={styles.traceStepItem}>
                    <strong>Paso 2 (Ejecución Backend):</strong>
                    <br />
                    <code>[Aquí Node.js consulta Firestore / Catalog API]</code>
                  </div>
                  <div className={styles.traceStepItem}>
                    <strong>Paso 3 (Sanitización PII - T35):</strong>
                    <br />
                    <code>[Aquí se enmascaran teléfonos/emails del resultado]</code>
                  </div>
                  <div className={styles.traceStepItem}>
                    <strong>Paso 4 (Streaming SSE - T30):</strong>
                    <br />
                    <code>[Aquí se emiten los chunks de texto al navegador]</code>
                  </div>
                </div>
              </section>

              {/* 3. T32 & T33: Respuesta del Agente con Renderizado de Markdown y Tablas Dinámicas */}
              <article className={styles.assistantBubble}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <strong style={{ color: '#27272a', fontSize: '0.9rem' }}>
                    🤖 [Aquí va la Respuesta en Streaming (T32) + Renderizado Markdown (T33)]:
                  </strong>
                  <span className={`${styles.statusPill} ${styles.statusInfo}`}>
                    ✓ Datos Verificados (Grounding T36)
                  </span>
                </div>

                <div className={styles.placeholderBanner}>
                  <strong>[Aquí va el resumen narrativo en Markdown]:</strong>
                  <br />
                  Aquí el asistente resumirá cuántas solicitudes fueron encontradas en el estado consultado y detallará
                  la lista consolidada de preparación separando <strong>Unidades sueltas</strong> y{' '}
                  <strong>Cajas cerradas</strong> para que el empleado retire de cava.
                </div>

                {/* Tabla Dinámica Markdown (T33) */}
                <div className="admin-table-card">
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.78rem', color: '#0f172a', textTransform: 'uppercase' }}>
                      📊 [Aquí se renderiza la Tabla Dinámica Markdown de Preparación (T33)]
                    </strong>
                    <button type="button" className={styles.btnSecondary} style={{ minHeight: '32px', padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}>
                      📋 [Copiar Resumen]
                    </button>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Producto (Vino / Licor / Delicatessen)</th>
                        <th>Modalidad Requerida</th>
                        <th>Cant. Total a Preparar</th>
                        <th>Solicitudes Asociadas</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>[Aquí va Nombre del Producto #1]</strong></td>
                        <td><span className={`${styles.statusPill} ${styles.statusInfo}`}>📦 [Aquí va: Caja x 6 un.]</span></td>
                        <td><strong>[Aquí va Total Cajas]</strong></td>
                        <td><code>[Aquí van #ORD-XXXX, #ORD-YYYY]</code></td>
                      </tr>
                      <tr>
                        <td><strong>[Aquí va Nombre del Producto #2]</strong></td>
                        <td><span className={`${styles.statusPill} ${styles.statusSuccess}`}>🍾 [Aquí va: Por Unidad]</span></td>
                        <td><strong>[Aquí va Total Unidades]</strong></td>
                        <td><code>[Aquí va #ORD-ZZZZ]</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Previsualización de Plantillas de Fallback (T29) y Bloqueo de Inyección (T36) */}
                <div className={styles.statesPreviewGrid}>
                  <div className={styles.fallbackBox}>
                    <strong>⚠️ [Plantilla de Fallback / Error de Tool (T29)]:</strong>
                    <br />
                    Aquí se mostrará un aviso controlado si <code>catalog-api</code> o Firestore demoran o fallan,
                    sin exponer trazas internas del servidor.
                  </div>

                  <div className={styles.guardrailBox}>
                    <strong>🛡️ [Plantilla de Bloqueo de Inyección / Salida de Rol (T36)]:</strong>
                    <br />
                    Aquí se mostrará el rechazo seguro si alguien intenta pedirle a la IA tareas ajenas a la vinoteca o
                    modificar datos sin autorización.
                  </div>
                </div>
              </article>
            </div>

            {/* Formulario Inferior de Consulta */}
            <form
              className={styles.chatInputArea}
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className={styles.inputRow}>
                <input
                  ref={inputRef}
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  className={styles.chatInput}
                  placeholder="[Aquí el personal escribe su consulta en lenguaje natural, ej: '¿Qué cajas debo armar hoy?']"
                  aria-label="Escribir consulta operativa para el asistente de IA"
                />
                <button type="submit" className={styles.btnPrimary}>
                  Enviar Consulta (SSE) →
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#475569', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span>
                  Endpoint: <code>POST /api/ai/chat</code> · Header: <code>Authorization: Bearer &lt;JWT&gt;</code>
                </span>
                <span>
                  Grounding estricto (T36): Solo lectura mediante Tools autorizadas
                </span>
              </div>
            </form>
          </div>
        </section>

        {/* ====================================================================
            COLUMNA DERECHA (3 cols): Tools de Catálogo (T27), Pedidos (T28) y PII (T35)
            ==================================================================== */}
        <aside className={styles.colInspector} aria-label="Inspector de herramientas y seguridad">
          {/* T27 y T28: Especificación de Tools disponibles */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>4. Tools Backend (T27 &amp; T28)</h2>
              <span className={`${styles.statusPill} ${styles.statusInfo}`}>3 Tools</span>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.45 }}>
              [Aquí se muestran las herramientas declaradas en el esquema JSON de Claude API y despachadas por Node.js]:
            </p>

            {BACKEND_TOOLS_SPECS.map((tool) => (
              <article key={tool.id} className={styles.toolCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#27272a' }}>{tool.name}()</strong>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>{tool.ticket}</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Origen: {tool.moduleOrigin}</span>
                <div className={styles.codeSnippet}>{tool.paramsPlaceholder}</div>
                <p style={{ color: '#334155', marginTop: '0.25rem' }}>{tool.returnPlaceholder}</p>
              </article>
            ))}
          </section>

          {/* T35: Enmascaramiento de Datos Sensibles (PII) */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>5. Sanitización PII (T35)</h2>
              <span className={`${styles.statusPill} ${styles.statusWarning}`}>🛡️ Filtro Activo</span>
            </div>

            <p style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
              Antes de enviar el resultado de una Tool de pedidos hacia la API externa de Anthropic, el middleware de
              Node.js reemplaza los datos personales del comprador:
            </p>

            <div className={styles.codeSnippet}>
              {`// [Aquí actúa el sanitizador PII (T35)]
customer: {
  name: "[Nombre Inicial + ***]",
  email: "[u***@dominio.com]",
  phone: "[***-***-9988]",
  address: "[Omitido para el LLM]"
}`}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
