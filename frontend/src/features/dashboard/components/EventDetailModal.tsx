/**
 * Event Detail Modal
 * Main modal component for displaying complete event information and approval actions
 */

'use client';

import { useEffect } from 'react';
import { useEventDetail } from '@/hooks/useEventDetail';
import { eventApprovalService } from '@/services/eventApprovalService';
import { EventApprovalActions } from './EventApprovalActions';

export interface EventDetailModalProps {
  eventId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: () => void;
}

export const EventDetailModal = ({
  eventId,
  isOpen,
  onClose,
  onActionComplete,
}: EventDetailModalProps) => {
  const { event, isLoading, error, refetch } = useEventDetail(eventId, { enabled: isOpen && !!eventId });

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleActionComplete = () => {
    onActionComplete();
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalles del Evento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Cargando detalles del evento...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error al cargar el evento</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    <button
                      onClick={refetch}
                      className="mt-2 text-sm text-red-800 underline hover:no-underline"
                    >
                      Intentar nuevamente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {event && (
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Event Title and Category */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${event.category.color}20`,
                          color: event.category.color,
                          border: `1px solid ${event.category.color}40`,
                        }}
                      >
                        {event.category.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {event.event_type.name}
                      </span>
                    </div>
                  </div>

                  {/* Status and Duration */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Estado Actual</h4>
                        <p className="text-blue-700 font-medium">{event.status.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Tiempo en este estado</p>
                        <p className="font-medium text-gray-900">
                          {eventApprovalService.getStatusDurationText(event.current_status_duration)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Público Objetivo</h5>
                      <p className="mt-1 text-gray-900">{event.target_audience}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Asistencia Esperada</h5>
                      <p className="mt-1 text-gray-900">{event.expected_attendance.toLocaleString()} personas</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Inscripción</h5>
                      <p className="mt-1 text-gray-900">
                        {event.registration_required ? 'Requerida' : 'No requerida'}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Costo</h5>
                      <p className="mt-1 text-gray-900">
                        {event.cost_type === 'free' 
                          ? 'Gratuito' 
                          : event.cost_type === 'paid' 
                          ? `$${event.cost_amount?.toLocaleString()}`
                          : 'Por donación'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Organization Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Organización</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-900">{event.organization.name}</p>
                        <p className="text-sm text-gray-600">{event.organization.legal_type}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <span className="ml-2 text-gray-900">{event.organization.email}</span>
                        </div>
                        {event.organization.phone && (
                          <div>
                            <span className="text-gray-500">Teléfono:</span>
                            <span className="ml-2 text-gray-900">{event.organization.phone}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Contacto:</span>
                          <span className="ml-2 text-gray-900">{event.organization.contact_person.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Dates */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Fechas y Horarios</h4>
                    <div className="space-y-3">
                      {event.event_dates.map((date, index) => (
                        <div
                          key={date.id}
                          className={`p-3 rounded-lg border ${
                            date.is_main_date 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatDate(date.date)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatTime(date.start_time)} - {formatTime(date.end_time)}
                              </p>
                            </div>
                            {date.is_main_date && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Principal
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Locations */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Ubicaciones</h4>
                    <div className="space-y-3">
                      {event.locations.map((location) => (
                        <div key={location.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <h5 className="font-medium text-gray-900">{location.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {location.address}, {location.city}, {location.province}
                          </p>
                          {location.capacity && (
                            <p className="text-xs text-gray-500 mt-1">
                              Capacidad: {location.capacity.toLocaleString()} personas
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status History */}
              {event.status_history && event.status_history.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Historial de Estados</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="space-y-3">
                      {event.status_history.map((history, index) => (
                        <div key={history.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {history.status_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDateTime(history.changed_at)}
                              </p>
                            </div>
                            <p className="text-xs text-gray-600">
                              por {history.changed_by.name} ({history.changed_by.role})
                            </p>
                            {history.comments && (
                              <p className="text-sm text-gray-700 mt-1 italic">
                                "{history.comments}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Actions */}
              <EventApprovalActions
                event={event}
                onActionComplete={handleActionComplete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};