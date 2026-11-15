'use client';

import React from 'react';
import { AiSessionSummary, AiEngineStatus } from '@/features/ai/useAiAssistant';
import styles from './assistant.module.css';

interface AssistantSessionsSidebarProps {
  sessions: AiSessionSummary[];
  filteredSessions: AiSessionSummary[];
  activeSessionId: string | null;
  sessionSearch: string;
  onSessionSearchChange: (val: string) => void;
  messagesCount: number;
  isMounted: boolean;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  productLookupText: string;
  onProductLookupChange: (val: string) => void;
  onProductLookupSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  engineStatus: AiEngineStatus | null;
}

export default function AssistantSessionsSidebar({
  sessions,
  filteredSessions,
  activeSessionId,
  sessionSearch,
  onSessionSearchChange,
  messagesCount,
  isMounted,
  onSelectSession,
  onDeleteSession,
  productLookupText,
  onProductLookupChange,
  onProductLookupSubmit,
  loading,
  engineStatus,
}: AssistantSessionsSidebarProps) {
  return (
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
          onChange={(e) => onSessionSearchChange(e.target.value)}
          placeholder="Buscar conversación anterior..."
          className={styles.searchBox}
          aria-label="Buscar conversación por título"
        />

        {messagesCount >= 12 && (
          <div role="status" className="admin-alert admin-alert-warning admin-alert-compact">
            💡 Esta sesión tiene {messagesCount} mensajes. Si cambiás de turno o tarea, te sugerimos
            abrir una <strong>Nueva Conversación</strong> para mantener respuestas ágiles.
          </div>
        )}

        <div className={styles.sessionList}>
          {filteredSessions.length === 0 ? (
            <p className={styles.emptyText}>
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
                  onClick={() => onSelectSession(sess.id)}
                  className={styles.sessionSelectBtn}
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
                    onDeleteSession(sess.id);
                  }}
                  title="Eliminar conversación"
                  aria-label={`Eliminar ${sess.title}`}
                  className={styles.sessionDeleteBtn}
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
        <p className={styles.helperText}>
          Verificá al instante cuántas unidades se solicitaron de un vino o bodega y su precio
          vigente:
        </p>
        <form onSubmit={onProductLookupSubmit} className={styles.stackForm}>
          <input
            type="text"
            value={productLookupText}
            onChange={(e) => onProductLookupChange(e.target.value)}
            disabled={loading}
            placeholder="Ej: Malbec, Rutini, Luigi Bosca..."
            className={styles.searchBox}
            aria-label="Nombre de vino o bodega a consultar"
          />
          <button
            type="submit"
            disabled={loading || !productLookupText.trim()}
            className={`${styles.btnSecondary} ${styles.fullWidth}`}
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

        <div className={styles.capacityList}>
          <div className={styles.capacityRow}>
            <span>Consultas disponibles / min:</span>
            <strong>
              {engineStatus?.rateLimit
                ? `${engineStatus.rateLimit.remainingInWindow} de ${engineStatus.rateLimit.maxPerMinute}`
                : '12 de 12'}
            </strong>
          </div>
          <div className={styles.capacityRow}>
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
  );
}

