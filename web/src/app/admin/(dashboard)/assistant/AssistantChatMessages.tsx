'use client';

import React from 'react';
import {
  AiChatMessage,
  parseMarkdownBlocks,
  MarkdownTableBlock,
} from '@/features/ai/useAiAssistant';
import styles from './assistant.module.css';

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

interface AssistantChatMessagesProps {
  messages: AiChatMessage[];
  loading: boolean;
  copiedIndex: number | null;
  onCopyText: (text: string, idx: number) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function AssistantChatMessages({
  messages,
  loading,
  copiedIndex,
  onCopyText,
  messagesEndRef,
}: AssistantChatMessagesProps) {
  return (
    <div className={styles.messagesViewport}>
      {messages.length === 0 ? (
        <div className={styles.placeholderBanner}>
          <strong>Asistente listo para tu turno operativo</strong>
          <br />
          Seleccioná cualquiera de los reportes frecuentes de arriba, hacé clic en un pedido de la
          columna derecha para analizarlo, o escribí tu consulta abajo.
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
                <div className={styles.inlineRow}>
                  <strong className={styles.bubbleAuthor}>Asistente Operativo</strong>
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
                    onClick={() => onCopyText(msg.content, idx)}
                  >
                    {copiedIndex === idx ? '✓ Copiado' : '📋 Copiar'}
                  </button>
                  {firstTable && (
                    <button
                      type="button"
                      className={styles.actionMiniBtn}
                      onClick={() =>
                        exportTableToCsv(
                          firstTable,
                          `reporte-cava-${new Date().toISOString().slice(0, 10)}.csv`
                        )
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
                  <div key={`blk-${bIdx}`} className={styles.textBlock}>
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
  );
}

