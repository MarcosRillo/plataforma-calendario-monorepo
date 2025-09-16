/**
 * Event Approval Actions
 * Action buttons and confirmation flow for event approval, rejection, and change requests
 */

'use client';

import { useState } from 'react';
import { 
  ApprovalAction, 
  EventDetailResponse,
  eventApprovalService 
} from '@/services/eventApprovalService';
import { useEventActions } from '@/hooks/useEventActions';
import { ApprovalConfirmDialog } from './ApprovalConfirmDialog';

interface EventApprovalActionsProps {
  event: EventDetailResponse;
  onActionComplete: () => void;
}

export const EventApprovalActions = ({
  event,
  onActionComplete,
}: EventApprovalActionsProps) => {
  const { isPerformingAction, actionError, performAction, clearError } = useEventActions();
  const [confirmDialogState, setConfirmDialogState] = useState<{
    isOpen: boolean;
    action: ApprovalAction | null;
    nextStatus?: string;
  }>({
    isOpen: false,
    action: null,
  });

  const availableActions = eventApprovalService.getAvailableActions(event);

  const handleActionClick = (action: ApprovalAction) => {
    clearError();
    
    // Determine next status based on action and current status
    let nextStatus = '';
    switch (action) {
      case 'approve':
        if (event.status.code === 'pending_internal_approval') {
          nextStatus = 'Aprobado Internamente';
        } else if (event.status.code === 'approved_internal') {
          nextStatus = 'Publicado';
        } else if (event.status.code === 'pending_public_approval') {
          nextStatus = 'Publicado';
        }
        break;
      case 'reject':
        nextStatus = 'Rechazado';
        break;
      case 'request_changes':
        nextStatus = 'Requiere Cambios';
        break;
    }

    setConfirmDialogState({
      isOpen: true,
      action,
      nextStatus,
    });
  };

  const handleConfirmAction = async (reason?: string, comments?: string) => {
    if (!confirmDialogState.action) return;

    const result = await performAction(event.id, {
      action: confirmDialogState.action,
      reason,
      comments,
    });

    if (result) {
      // Success - close dialog and notify parent
      setConfirmDialogState({ isOpen: false, action: null });
      onActionComplete();
    }
    // On error, keep dialog open so user can see the error and retry
  };

  const handleCancelConfirm = () => {
    if (!isPerformingAction) {
      setConfirmDialogState({ isOpen: false, action: null });
      clearError();
    }
  };

  const getActionButtonClasses = (color: 'green' | 'red' | 'yellow', enabled: boolean) => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    if (!enabled) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }
    
    switch (color) {
      case 'green':
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white`;
      case 'red':
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white`;
      case 'yellow':
        return `${baseClasses} bg-yellow-600 hover:bg-yellow-700 text-white`;
      default:
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 text-white`;
    }
  };

  const getActionIcon = (action: ApprovalAction) => {
    switch (action) {
      case 'approve':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'reject':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'request_changes':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
    }
  };

  if (availableActions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Sin acciones disponibles
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Este evento no puede ser modificado en su estado actual.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Acciones de Aprobación
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              En {event.status.name}: {eventApprovalService.getStatusDurationText(event.current_status_duration)}
            </span>
          </div>
        </div>

        {/* Action Error */}
        {actionError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700">{actionError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {availableActions.map(({ action, label, color, enabled }) => (
            <button
              key={action}
              onClick={() => handleActionClick(action)}
              disabled={!enabled}
              className={getActionButtonClasses(color, enabled)}
              title={!enabled ? 'Esta acción no está disponible para el estado actual del evento' : ''}
            >
              {getActionIcon(action)}
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Status info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-medium">Estado actual: {event.status.name}</p>
              <p>Seleccione una acción para cambiar el estado del evento.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ApprovalConfirmDialog
        isOpen={confirmDialogState.isOpen}
        action={confirmDialogState.action}
        eventTitle={event.title}
        currentStatus={event.status.name}
        nextStatus={confirmDialogState.nextStatus}
        isLoading={isPerformingAction}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelConfirm}
      />
    </>
  );
};