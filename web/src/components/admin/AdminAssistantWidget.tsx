'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminAssistantWidget.module.css';

interface QuickPrompt {
  id: string;
  label: string;
  toolName: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'prompt-prep-today',
    label: '¿Qué productos debo preparar para las solicitudes confirmadas de hoy?',
    toolName: 'consultarPedidosConfirmados + consolidarListaPreparacion',
  },
  {
    id: 'prompt-delayed',
    label: '¿Qué solicitudes en estado PENDIENTE llevan más tiempo esperando verificación?',
    toolName: 'consultarPedidosPorEstado(status="PENDIENTE")',
  },
  {
    id: 'prompt-boxes',
    label: 'Resumen de cajas cerradas vs. unidades sueltas solicitadas esta semana',
    toolName: 'agruparModalidadesPedidos',
  },
];

export default function AdminAssistantWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<QuickPrompt>(QUICK_PROMPTS[0]);
  const [inputQuery, setInputQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Regla de Hooks: Limpieza de listener de teclado (Escape)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Si ya estamos en la pantalla dedicada /admin/assistant, evitamos duplicar el botón flotante
  if (pathname === '/admin/assistant') {
    return null;
  }

  return (
    <>
      {/* Botón Flotante (FAB) — Ley de Fitts: >= 48x48px */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir Asistente Operativo de IA"
        className={styles.fabButton}
      >
        <span className={styles.statusDot} aria-hidden="true" />
        <span>✨ Asistente IA (Personal)</span>
      </button>

      {/* Drawer Flotante con Backdrop (Principio de Figura y Fondo - Gestalt) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-drawer-title"
          className={styles.backdrop}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className={styles.drawer}
          >
            {/* Cabecera del Asistente IA */}
            <header className={styles.header}>
              <div>
                <span className={styles.eyebrow}>
                  HU5 · Claude API + Tool Calling (Node.js)
                </span>
                <h2 id="ai-drawer-title" className={styles.title}>
                  Asistente Operativo de Cava
                </h2>
              </div>

              <div className={styles.headerActions}>
                <Link
                  href="/admin/assistant"
                  onClick={() => setIsOpen(false)}
                  className={styles.headerBtn}
                >
                  Vista Completa ↗
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Cerrar asistente IA"
                  className={styles.headerBtn}
                >
                  ✕
                </button>
              </div>
            </header>

            {/* Barra de Estado de Sesión y Rate Limiting (T26 / T31) */}
            <div className={styles.metaBar}>
              <span>[Aquí va ID de Sesión (T26)]</span>
              <span>⚡ [Aquí va Rate Limit / Tokens (T31)]</span>
            </div>

            {/* Cuerpo del Chat */}
            <div className={styles.body}>
              {/* Chips de Consultas Rápidas (T34 - Ley de Tesler) */}
              <div>
                <p className={styles.sectionLabel}>
                  Sugerencias Operativas Rápidas (T34):
                </p>
                <div className={styles.promptList}>
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.id}
                      type="button"
                      onClick={() => {
                        setSelectedPrompt(qp);
                        setInputQuery(qp.label);
                        inputRef.current?.focus();
                      }}
                      className={`${styles.promptChip} ${
                        selectedPrompt.id === qp.id ? styles.promptChipActive : ''
                      }`}
                    >
                      💬 {qp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Burbuja de Consulta del Administrador */}
              <div className={styles.userBubble}>
                <strong>[Aquí va la consulta enviada por el personal]:</strong>
                <div style={{ marginTop: '0.25rem' }}>{selectedPrompt.label}</div>
              </div>

              {/* Bloque de Despacho de Tool Calling y Enmascaramiento PII (T27, T28, T29, T35) */}
              <div className={styles.toolTraceBox}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>
                  🔧 [Aquí va el indicador de Tool Calling ejecutado en Node.js (T27-T29)]:
                </strong>
                • Herramienta invocada: <code>{selectedPrompt.toolName}</code>
                <br />• Seguridad PII (T35): <code>[Aquí se enmascaran datos sensibles antes de enviar a Claude]</code>
                <br />• Grounding (T36): <code>[Sin acceso libre a BD; solo respuestas basadas en las tools]</code>
              </div>

              {/* Respuesta del Agente con Streaming SSE y Tabla Markdown (T30, T32, T33) */}
              <div className={styles.assistantCard}>
                <strong style={{ color: '#27272a' }}>
                  🤖 [Aquí va la respuesta en Streaming (SSE - T30/T32) y Markdown/Tablas (T33)]:
                </strong>
                <p style={{ color: '#475569', lineHeight: 1.5 }}>
                  [Aquí irá el resumen en lenguaje natural generado por el agente a partir de los pedidos reales de Firestore].
                </p>

                <div className={styles.tablePreview}>
                  <strong>[Aquí se renderizará la Tabla Dinámica Markdown de preparación]:</strong>
                  <br />• Columna 1: <code>[Producto / Vino]</code>
                  <br />• Columna 2: <code>[Modalidad: Unidad / Caja]</code>
                  <br />• Columna 3: <code>[Cantidad Total Consolidada a retirar de cava]</code>
                </div>
              </div>
            </div>

            {/* Footer Input del Chat */}
            <footer className={styles.footer}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className={styles.inputForm}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="[Aquí el personal escribe su pregunta operativa...]"
                  className={styles.inputField}
                  aria-label="Escribir consulta rápida para el asistente IA"
                />
                <button type="submit" className={styles.sendBtn}>
                  Enviar
                </button>
              </form>

              <div className={styles.footerBottomRow}>
                <span>
                  Endpoint: <code>POST /api/ai/chat</code> (JWT Protected)
                </span>
                <button type="button" className={styles.clearBtn}>
                  [Limpiar historial (T34)]
                </button>
              </div>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}
