'use client';

import { Event, EVENT_STATUS } from '@/types/event.types';
import { FormModal, FormSubmitHandler, FormValidator, Textarea, RadioGroup } from '@/components/ui';

interface ApprovalModalProps {
  isOpen: boolean;
  event: Event | null;
  onClose: () => void;
  onSuccess: () => void;
  onApproveInternal: (eventId: number) => void;
  onRequestPublic: (eventId: number, comment?: string) => void;
  onApprovePublic: (eventId: number, comment?: string) => void;
  onRequestChanges: (eventId: number, comment: string) => void;
  onReject: (eventId: number, comment: string) => void;
}

// Form data interface
interface ApprovalFormData {
  action: string;
  comment: string;
}

// Initial form data
const getInitialData = (): ApprovalFormData => ({
  action: '',
  comment: '',
});

// Form validator
const approvalValidator: FormValidator<ApprovalFormData> = (data) => {
  const errors: string[] = [];

  if (!data.action) {
    errors.push('Debes seleccionar una acción');
  }

  // Require comment for certain actions
  if ((data.action === 'request_changes' || data.action === 'reject') && !data.comment.trim()) {
    errors.push('Es necesario proporcionar un comentario para esta acción');
  }

  return errors;
};

export const ApprovalModal = ({
  isOpen,
  event,
  onClose,
  onSuccess,
  onApproveInternal,
  onRequestPublic,
  onApprovePublic,
  onRequestChanges,
  onReject,
}: ApprovalModalProps) => {
  // Submit handler
  const handleSubmit: FormSubmitHandler<ApprovalFormData> = async (formData) => {
    if (!event) {
      throw new Error('No hay evento para procesar');
    }

    const { action, comment } = formData;

    switch (action) {
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
        onRequestChanges(event.id, comment);
        break;
      case 'reject':
        onReject(event.id, comment);
        break;
      default:
        throw new Error('Acción no válida');
    }
  };

  // Success handler
  const handleSuccess = () => {
    onSuccess();
  };

  const getAvailableActions = () => {
    if (!event) return [];

    const actions = [];

    const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status;

    switch (statusCode) {
      case EVENT_STATUS.DRAFT:
        actions.push(
          { value: 'approve_internal', label: 'Aprobar Internamente' },
          { value: 'request_changes', label: 'Solicitar Cambios' },
          { value: 'reject', label: 'Rechazar' }
        );
        break;

      case EVENT_STATUS.APPROVED_INTERNAL:
        actions.push(
          { value: 'request_public', label: 'Solicitar Aprobación Pública' }
        );
        break;

      case EVENT_STATUS.PENDING_PUBLIC_APPROVAL:
        actions.push(
          { value: 'approve_public', label: 'Aprobar para Publicación' },
          { value: 'request_changes', label: 'Solicitar Cambios' },
          { value: 'reject', label: 'Rechazar' }
        );
        break;

      case EVENT_STATUS.REQUIRES_CHANGES:
        actions.push(
          { value: 'approve_internal', label: 'Aprobar Internamente' },
          { value: 'request_changes', label: 'Solicitar Más Cambios' },
          { value: 'reject', label: 'Rechazar' }
        );
        break;
    }

    return actions;
  };

  const requiresComment = (action: string) => {
    return action === 'request_changes' || action === 'reject';
  };

  if (!event) return null;

  const availableActions = getAvailableActions();

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      title="Acciones de Aprobación"
      submitButtonText="Confirmar"
      initialData={getInitialData()}
      validator={approvalValidator}
      submitHandler={handleSubmit}
      size="md"
      resetOnSuccess={true}
      closeOnSuccess={true}
    >
      {({ formData, errors, isLoading, handleFieldChange }) => (
        <>
          {/* Información del evento */}
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900">{event.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              Estado actual: <span className="font-medium">
                {typeof event.status === 'object' ? event.status.status_name || event.status.status_code : event.status}
              </span>
            </div>
          </div>

          {/* Selección de acción */}
          <div>
            <RadioGroup
              label="Seleccionar acción:"
              name="action"
              value={formData.action}
              onChange={(value) => handleFieldChange('action', value)}
              options={availableActions}
              disabled={isLoading}
              error={errors.action}
            />
          </div>

          {/* Comentario */}
          {formData.action && (
            <div>
              <Textarea
                label={`Comentario ${requiresComment(formData.action) ? '*' : ''}`}
                name="comment"
                value={formData.comment}
                onChange={(e) => handleFieldChange('comment', e.target.value)}
                rows={3}
                placeholder={requiresComment(formData.action)
                  ? "Proporciona detalles sobre los cambios requeridos o la razón del rechazo"
                  : "Comentario opcional"}
                disabled={isLoading}
                error={errors.comment}
                fullWidth
              />
            </div>
          )}
        </>
      )}
    </FormModal>
  );
};
