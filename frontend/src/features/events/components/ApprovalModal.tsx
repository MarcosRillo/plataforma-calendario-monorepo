'use client';

import { useState } from 'react';
import { Event, EVENT_STATUS } from '@/types/event.types';
import { Modal, Button, Textarea, RadioGroup } from '@/components/ui';

interface ApprovalModalProps {
  isOpen: boolean;
  event: Event | null;
  isLoading: boolean;
  onClose: () => void;
  onApproveInternal: (eventId: number) => void;
  onRequestPublic: (eventId: number, comment?: string) => void;
  onApprovePublic: (eventId: number, comment?: string) => void;
  onRequestChanges: (eventId: number, comment: string) => void;
  onReject: (eventId: number, comment: string) => void;
}

export const ApprovalModal = ({
  isOpen,
  event,
  isLoading,
  onClose,
  onApproveInternal,
  onRequestPublic,
  onApprovePublic,
  onRequestChanges,
  onReject,
}: ApprovalModalProps) => {
  const [comment, setComment] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');

  const handleAction = () => {
    if (!event) return;

    switch (selectedAction) {
      case 'approve_internal':
        onApproveInternal(event.id);
        break;
      case 'request_public':
        onRequestPublic(event.id, comment || undefined);
        break;
      case 'approve_public':
        onApprovePublic(event.id, comment || undefined);
        break;
      case 'request_changes':
        if (!comment.trim()) {
          alert('Es necesario proporcionar un comentario para solicitar cambios');
          return;
        }
        onRequestChanges(event.id, comment);
        break;
      case 'reject':
        if (!comment.trim()) {
          alert('Es necesario proporcionar un comentario para rechazar el evento');
          return;
        }
        onReject(event.id, comment);
        break;
    }
    
    // Reset modal
    setComment('');
    setSelectedAction('');
  };

  const getAvailableActions = () => {
    if (!event) return [];

    const actions = [];

    const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status;
    
    switch (statusCode) {
      case EVENT_STATUS.DRAFT:
        actions.push(
          { value: 'approve_internal', label: 'Aprobar Internamente', color: 'blue' },
          { value: 'request_changes', label: 'Solicitar Cambios', color: 'orange' },
          { value: 'reject', label: 'Rechazar', color: 'red' }
        );
        break;
      
      case EVENT_STATUS.APPROVED_INTERNAL:
        actions.push(
          { value: 'request_public', label: 'Solicitar Aprobación Pública', color: 'blue' }
        );
        break;
      
      case EVENT_STATUS.PENDING_PUBLIC_APPROVAL:
        actions.push(
          { value: 'approve_public', label: 'Aprobar para Publicación', color: 'green' },
          { value: 'request_changes', label: 'Solicitar Cambios', color: 'orange' },
          { value: 'reject', label: 'Rechazar', color: 'red' }
        );
        break;
      
      case EVENT_STATUS.REQUIRES_CHANGES:
        actions.push(
          { value: 'approve_internal', label: 'Aprobar Internamente', color: 'blue' },
          { value: 'request_changes', label: 'Solicitar Más Cambios', color: 'orange' },
          { value: 'reject', label: 'Rechazar', color: 'red' }
        );
        break;
    }

    return actions;
  };

  const requiresComment = (action: string) => {
    return action === 'request_changes' || action === 'reject';
  };

  if (!isOpen || !event) return null;

  const availableActions = getAvailableActions();

  // Modal content
  const modalContent = (
    <div className="space-y-6">
      {/* Información del evento */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900">{event.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
        <div className="mt-2 text-xs text-gray-500">
          Estado actual: <span className="font-medium">{typeof event.status === 'object' ? event.status.status_name || event.status.status_code : event.status}</span>
        </div>
      </div>

      {/* Selección de acción */}
      <div>
        <RadioGroup
          label="Seleccionar acción:"
          name="approval-action"
          value={selectedAction}
          onChange={setSelectedAction}
          options={availableActions.map(action => ({
            value: action.value,
            label: action.label,
          }))}
        />
      </div>

      {/* Comentario */}
      {(selectedAction && (requiresComment(selectedAction) || !requiresComment(selectedAction))) && (
        <div>
          <Textarea
            label={`Comentario ${requiresComment(selectedAction) ? '*' : ''}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder={requiresComment(selectedAction) 
              ? "Proporciona detalles sobre los cambios requeridos o la razón del rechazo"
              : "Comentario opcional"}
            fullWidth
          />
        </div>
      )}
    </div>
  );

  // Footer buttons
  const footerContent = (
    <div className="flex justify-end space-x-3">
      <Button
        variant="outline"
        onClick={onClose}
      >
        Cancelar
      </Button>
      {selectedAction && (
        <Button
          onClick={handleAction}
          disabled={isLoading || (requiresComment(selectedAction) && !comment.trim())}
          variant="primary"
          loading={isLoading}
        >
          Confirmar
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Acciones de Aprobación"
      size="md"
      footer={footerContent}
    >
      {modalContent}
    </Modal>
  );
};
