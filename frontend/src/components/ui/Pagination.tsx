/**
 * Pagination Component - Unified Version
 * Combines the best features from all pagination implementations
 * Supports both simple and advanced pagination with items per page selector
 */

'use client';

import { Fragment } from 'react';

// Base pagination props (simple mode)
interface BasePaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  className?: string;
}

// Simple pagination mode (backwards compatibility)
interface SimplePaginationProps extends BasePaginationProps {
  totalPages: number;
  totalItems?: number;
  itemsFrom?: number;
  itemsTo?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  // No advanced features
  showPerPageSelector?: false;
  perPage?: never;
  onPerPageChange?: never;
}

// Advanced pagination mode (new features)
interface AdvancedPaginationProps extends BasePaginationProps {
  lastPage: number;
  total: number;
  perPage: number;
  onPerPageChange: (perPage: number) => void;
  // Advanced features enabled
  showPerPageSelector?: true;
  totalPages?: never;
  totalItems?: never;
  itemsFrom?: never;
  itemsTo?: never;
  hasNextPage?: never;
  hasPrevPage?: never;
}

type PaginationProps = SimplePaginationProps | AdvancedPaginationProps;

const Pagination: React.FC<PaginationProps> = (props) => {
  const {
    currentPage,
    onPageChange,
    showInfo = true,
    className = '',
  } = props;

  // Determine if we're in advanced or simple mode
  const isAdvancedMode = 'lastPage' in props && 'total' in props;

  // Extract mode-specific props
  const totalPages = isAdvancedMode ? props.lastPage : props.totalPages;
  const totalItems = isAdvancedMode ? props.total : props.totalItems;
  const perPage = isAdvancedMode ? props.perPage : 10;
  const onPerPageChange = isAdvancedMode ? props.onPerPageChange : undefined;
  const showPerPageSelector = isAdvancedMode;

  // Calculate items info
  const itemsFrom = isAdvancedMode
    ? (currentPage - 1) * perPage + 1
    : props.itemsFrom || ((currentPage - 1) * 10 + 1);

  const itemsTo = isAdvancedMode
    ? Math.min(currentPage * perPage, props.total)
    : props.itemsTo || Math.min(currentPage * 10, totalItems || 0);

  const hasNextPage = isAdvancedMode
    ? currentPage < props.lastPage
    : props.hasNextPage ?? (currentPage < totalPages);

  const hasPrevPage = isAdvancedMode
    ? currentPage > 1
    : props.hasPrevPage ?? (currentPage > 1);

  // Generate visible page numbers with ellipsis
  const getVisiblePages = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const getInfoText = (): string => {
    if (!showInfo || !totalItems) return '';

    if (totalItems === 0) return 'No hay elementos';

    return `Mostrando ${itemsFrom} a ${itemsTo} de ${totalItems} elementos`;
  };

  // Don't render if only one page and no items
  if (totalPages <= 1 && !showPerPageSelector) return null;

  return (
    <div className={`bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 ${className}`}>
      {/* Mobile pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {/* Info text */}
        {showInfo && (
          <div>
            <p className="text-sm text-gray-700">{getInfoText()}</p>
          </div>
        )}

        <div className="flex items-center space-x-4">
          {/* Items per page selector */}
          {showPerPageSelector && onPerPageChange && (
            <div className="flex items-center space-x-2">
              <label htmlFor="pagination-per-page" className="text-sm text-gray-700">
                Mostrar:
              </label>
              <select
                id="pagination-per-page"
                value={perPage}
                onChange={(e) => onPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {/* Previous button */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Anterior</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Page numbers */}
              {getVisiblePages().map((page, index) => (
                <Fragment key={index}>
                  {page === '...' ? (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => onPageChange(Number(page))}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </Fragment>
              ))}

              {/* Next button */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Siguiente</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pagination;