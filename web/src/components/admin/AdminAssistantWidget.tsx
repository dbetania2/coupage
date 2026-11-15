'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAiAssistant, parseMarkdownBlocks } from '@/features/ai/useAiAssistant';
import styles from './AdminAssistantWidget.module.css';

interface QuickPrompt {
  id: string;
  label: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'prompt-prep-today',
    label: '¿Qué productos debo preparar para las solicitudes confirmadas y pendientes? Incluí una tabla.',
  },
  {
    id: 'prompt-delayed',
    label: '¿Qué solicitudes están en estado PENDIENTE esperando verificación en cava?',
  },
  {
    id: 'prompt-boxes',
    label: 'Mostrame el ranking de los productos más solicitados en Firestore.',
  },
];

export default function AdminAssistantWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const drawerEndRef = useRef<HTMLDivElement | null>(null);

  const {
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

  useEffect(() => {
    if (!isOpen) return;
    drawerEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [isOpen, messages.length, loading]);

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

  if (pathname === '/admin/assistant') {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;
    const q = inputQuery;
    setInputQuery('');
    void sendMessage(q);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir Asistente Operativo de IA"
        className={styles.fabButton}
      >
        <span className={styles.statusDot} aria-hidden="true" />
        <span>✨ Asistente IA (Personal)</span>
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-drawer-title"
          className={styles.backdrop}
        >
          <aside onClick={(e) => e.stopPropagation()} className={styles.drawer}>
            <header className={styles.header}>
              <div>
                <span className={styles.eyebrow}>
                  Asistente Operativo
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

            <div className={styles.metaBar}>
              <div className={styles.sessionGroup}>
                <label htmlFor="widget-session-select" className={styles.sessionLabel}>
                  Sesión:
                </label>
                <select
                  id="widget-session-select"
                  value={activeSessionId || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      startNewSession();
                    } else {
                      void selectSession(val);
                    }
                  }}
                  className={styles.sessionSelect}
                >
                  <option value="">+ Nueva sesión del turno</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.messagesCount} msg)
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={startNewSession}
                className={styles.sessionNewBtn}
                title="Iniciar una nueva sesión limpia para este turno"
              >
                + Nueva
              </button>
            </div>

            <div className={styles.body}>
              <div>
                <p className={styles.sectionLabel}>
                  Sugerencias Operativas Rápidas (Clic para consultar):
                </p>
                <div className={styles.promptList}>
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.id}
                      type="button"
                      disabled={loading}
                      onClick={() => void sendMessage(qp.label)}
                      className={styles.promptChip}
                    >
                      💬 {qp.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div role="alert" className="admin-alert admin-alert-danger">
                  ⚠️ {error}
                </div>
              )}

              {messages.length === 0 ? (
                <div className={styles.assistantCard}>
                  <strong className={styles.assistantTitle}>
                    🤖 Asistente Operativo Listo
                  </strong>
                  <p className={styles.assistantDesc}>
                    Seleccioná una sugerencia rápida o escribí tu pregunta abajo para consultar en vivo los pedidos de
                    Firestore y el catálogo de Django.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  if (msg.role === 'user') {
                    return (
                      <div key={`w-msg-${idx}`} className={styles.userBubble}>
                        <strong>👤 Consulta:</strong>
                        <div className={styles.userContent}>{msg.content}</div>
                      </div>
                    );
                  }

                  const blocks = parseMarkdownBlocks(msg.content);
                  return (
                    <React.Fragment key={`w-msg-${idx}`}>
                      {msg.toolTraces && msg.toolTraces.length > 0 && (
                        <div className={styles.toolTraceBox}>
                          <strong className={styles.toolTitle}>
                            🔧 Tool Calling ejecutado en Node.js:
                          </strong>
                          {msg.toolTraces.map((t, tIdx) => (
                            <div key={`${t.toolName}-${tIdx}`}>
                              • <code>{t.toolName}()</code> → {t.source} ({t.durationMs}ms)
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={styles.assistantCard}>
                        <strong className={styles.assistantTitle}>
                          🤖 Respuesta del Asistente:
                        </strong>
                        {blocks.map((b, bIdx) =>
                          b.type === 'table' ? (
                            <div key={`wb-${bIdx}`} className="admin-table-card">
                              <div className="admin-table-scroll">
                                <table className="admin-table">
                                  <thead>
                                    <tr>
                                      {b.headers.map((h, hIdx) => (
                                        <th key={hIdx}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {b.rows.map((r, rIdx) => (
                                      <tr key={rIdx}>
                                        {r.map((c, cIdx) => (
                                          <td key={cIdx}>{c}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div key={`wb-${bIdx}`} className={styles.msgText}>
                              {b.text}
                            </div>
                          )
                        )}
                      </div>
                    </React.Fragment>
                  );
                })
              )}

              {loading && (
                <div className={styles.toolTraceBox}>
                  ⏳ Procesando consulta...
                </div>
              )}
              <div ref={drawerEndRef} />
            </div>

            <footer className={styles.footer}>
              <form onSubmit={handleSubmit} className={styles.inputForm}>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  disabled={loading}
                  placeholder="Escribí tu pregunta operativa..."
                  className={styles.inputField}
                  aria-label="Escribir consulta rápida para el asistente IA"
                />
                <button type="submit" disabled={loading || !inputQuery.trim()} className={styles.sendBtn}>
                  {loading ? '...' : 'Enviar'}
                </button>
              </form>

              <div className={styles.footerBottomRow}>
                <span>
                  Sincronizado con la consola principal
                </span>
                <button
                  type="button"
                  onClick={() => void deleteSession(activeSessionId)}
                  className={styles.clearBtn}
                >
                  Eliminar sesión activa
                </button>
              </div>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}
