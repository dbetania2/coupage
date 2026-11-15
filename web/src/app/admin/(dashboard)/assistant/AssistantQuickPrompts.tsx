'use client';

import React from 'react';
import styles from './assistant.module.css';

export type PromptCategory = 'preparacion' | 'estados' | 'catalogo';

export interface QuickActionPrompt {
  id: string;
  category: PromptCategory;
  title: string;
  promptText: string;
}

export const QUICK_ACTIONS: QuickActionPrompt[] = [
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

interface AssistantQuickPromptsProps {
  activeCategory: PromptCategory;
  onSelectCategory: (cat: PromptCategory) => void;
  visibleActions: QuickActionPrompt[];
  loading: boolean;
  onSendMessage: (prompt: string) => void;
}

export default function AssistantQuickPrompts({
  activeCategory,
  onSelectCategory,
  visibleActions,
  loading,
  onSendMessage,
}: AssistantQuickPromptsProps) {
  return (
    <div className={styles.suggestionsSection}>
      <div className={styles.spaceBetween}>
        <span className={styles.sectionLabel}>Reportes y Consultas Frecuentes:</span>
        <div className={styles.tabsRow} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'preparacion'}
            onClick={() => onSelectCategory('preparacion')}
            className={`${styles.tabBtn} ${activeCategory === 'preparacion' ? styles.tabBtnActive : ''}`}
          >
            📦 Armado en Cava
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'estados'}
            onClick={() => onSelectCategory('estados')}
            className={`${styles.tabBtn} ${activeCategory === 'estados' ? styles.tabBtnActive : ''}`}
          >
            ⏳ Control de Estados
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'catalogo'}
            onClick={() => onSelectCategory('catalogo')}
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
            onClick={() => onSendMessage(item.promptText)}
            className={styles.promptChip}
          >
            <span>{item.title}</span>
            <span className={styles.chipArrow}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

