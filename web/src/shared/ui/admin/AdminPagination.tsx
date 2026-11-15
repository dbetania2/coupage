import React from 'react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  disabled?: boolean;
  /** Texto resumen a la izquierda (ej: "Mostrando 10 de 120 productos"). */
  summary?: React.ReactNode;
}

/** Pie de tabla con resumen, selector de tamaño de página y navegación. */
export function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  disabled = false,
  summary,
}: AdminPaginationProps) {
  const safeTotal = Math.max(1, totalPages);

  return (
    <div className="admin-table-footer">
      <div className="admin-pagination-group">
        {summary && <span>{summary}</span>}
        {onPageSizeChange && pageSize !== undefined && (
          <label className="admin-pagination-group">
            <span>Por pág:</span>
            <select
              className="admin-select admin-select-sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="admin-pagination-group">
        <button
          type="button"
          className="btn-admin btn-admin-secondary btn-admin-sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={disabled || currentPage <= 1}
        >
          ← Anterior
        </button>
        <span className="admin-pagination-current">
          Página {currentPage} de {safeTotal}
        </span>
        <button
          type="button"
          className="btn-admin btn-admin-secondary btn-admin-sm"
          onClick={() => onPageChange(Math.min(safeTotal, currentPage + 1))}
          disabled={disabled || currentPage >= safeTotal}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

