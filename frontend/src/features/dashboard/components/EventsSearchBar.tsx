/**
 * Events Search Bar Component
 * Search input with debounce functionality and clear button
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface EventsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  debounceMs?: number;
}

export const EventsSearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar eventos...',
  debounceMs = 300,
}: EventsSearchBarProps) => {
  const [internalValue, setInternalValue] = useState(value);

  // Debounced onChange callback
  const debouncedOnChange = useCallback(
    debounce((searchValue: string) => {
      onChange(searchValue);
    }, debounceMs),
    [onChange, debounceMs]
  );

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    debouncedOnChange(newValue);
  };

  // Handle clear button
  const handleClear = () => {
    setInternalValue('');
    onClear();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
      e.currentTarget.blur();
    }
  };

  // Sync internal value with external prop
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <div className="max-w-lg mx-auto lg:max-w-none">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        
        <input
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full rounded-lg border-0 py-3 pl-10 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#228B22] sm:text-sm sm:leading-6 transition-all duration-200"
          aria-label="Buscar eventos"
        />

        {/* Clear button - only show when there's text */}
        {internalValue && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              onClick={handleClear}
              className="h-5 w-5 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
              aria-label="Limpiar búsqueda"
            >
              <XMarkIcon aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Search hints/shortcuts */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>
          {internalValue 
            ? `Buscando: "${internalValue}"`
            : 'Buscar por título, organización o categoría'
          }
        </span>
        <span className="hidden sm:inline">
          <kbd className="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
            Esc
          </kbd>
          {' '}para limpiar
        </span>
      </div>
    </div>
  );
};

// Utility: Debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}