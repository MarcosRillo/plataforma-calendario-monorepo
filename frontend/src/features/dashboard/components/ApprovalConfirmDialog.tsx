/**
 * Approval Confirm Dialog
 * Secondary dialog for confirming approval actions with comments/reasons
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { ApprovalAction } from '@/services/eventApprovalService';

interface ApprovalConfirmDialogProps {
  isOpen: boolean;
  action: ApprovalAction | null;
  eventTitle: string;
  currentStatus: string;
  nextStatus?: string;
  isLoading: boolean;
  onConfirm: (reason?: string, comments?: string) => void;
  onCancel: () => void;
}

export const ApprovalConfirmDialog = ({
  isOpen,
  action,
  eventTitle,
  currentStatus,
  nextStatus,
  isLoading,
  onConfirm,
  onCancel,
}: ApprovalConfirmDialogProps) => {
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const reasonTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setComments('');
      setValidationErrors([]);
      // Focus on first input when dialog opens
      setTimeout(() => {
        reasonTextareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, action]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen || !action) return null;

  const getActionConfig = (action: ApprovalAction) => {
    switch (action) {
      case 'approve':
        return {
          title: 'Confirmar Aprobación',
          color: 'green',
          buttonText: 'Aprobar Evento',
          requiresReason: false,
          reasonLabel: 'Comentarios adicionales (opcional)',
          reasonPlaceholder: 'Escriba cualquier comentario adicional sobre la aprobación...',
          minLength: 0,
        };
      case 'reject':
        return {
          title: 'Confirmar Rechazo',
          color: 'red',
          buttonText: 'Rechazar Evento',
          requiresReason: true,
          reasonLabel: 'Razón del rechazo *',
          reasonPlaceholder: 'Explique por qué está rechazando este evento (mínimo 10 caracteres)...',
          minLength: 10,
        };
      case 'request_changes':
        return {
          title: 'Solicitar Cambios',
          color: 'yellow',
          buttonText: 'Solicitar Cambios',
          requiresReason: true,
          reasonLabel: 'Cambios requeridos *',
          reasonPlaceholder: 'Describa detalladamente los cambios necesarios (mínimo 20 caracteres)...',
          minLength: 20,
        };
      default:
        return {
          title: 'Confirmar Acción',
          color: 'gray',
          buttonText: 'Confirmar',
          requiresReason: false,
          reasonLabel: 'Comentarios',
          reasonPlaceholder: 'Escriba sus comentarios...',
          minLength: 0,
        };
    }
  };

  const config = getActionConfig(action);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (config.requiresReason && reason.trim().length < config.minLength) {
      errors.push(`${config.reasonLabel.replace(' *', '')} debe tener al menos ${config.minLength} caracteres`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) return;

    const reasonValue = config.requiresReason ? reason.trim() : undefined;
    const commentsValue = comments.trim() || undefined;

    onConfirm(reasonValue, commentsValue);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {config.title}
            </h3>
            {!isLoading && (
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Event Info */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Evento:</h4>
            <p className="text-sm text-gray-600 mb-3">"{eventTitle}"</p>
            
            <div className="flex items-center space-x-4 text-sm">
              <div>
                <span className="text-gray-500">Estado actual:</span>
                <span className="ml-2 font-medium">{currentStatus}</span>
              </div>
              {nextStatus && (
                <>
                  <span className="text-gray-300">→</span>
                  <div>
                    <span className="text-gray-500">Nuevo estado:</span>
                    <span className="ml-2 font-medium text-blue-600">{nextStatus}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reason/Comments Form */}
          <div className="space-y-4">
            {/* Main reason field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {config.reasonLabel}
              </label>
              <textarea
                ref={reasonTextareaRef}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={config.reasonPlaceholder}
                rows={4}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
              {config.requiresReason && (
                <p className="mt-1 text-xs text-gray-500">
                  {reason.length}/{config.minLength} caracteres mínimos
                </p>
              )}
            </div>

            {/* Additional comments for reject/request_changes */}
            {(action === 'reject' || action === 'request_changes') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios adicionales (opcional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Información adicional o contexto..."
                  rows={3}
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            )}
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    Por favor, corrija los siguientes errores:
                  </h4>
                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
              config.color === 'green'
                ? 'bg-green-600 hover:bg-green-700'
                : config.color === 'red'
                ? 'bg-red-600 hover:bg-red-700'
                : config.color === 'yellow'
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {config.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};