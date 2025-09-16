/**
 * Event Card Component
 * Compact card display for events with essential information
 * Adapted from dashboard for use in consolidated events view
 */

'use client';

import { Event } from '@/types/event.types';
import { CalendarIcon, ClockIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface EventCardProps {
  event: Event;
  onViewDetail: (eventId: number) => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (eventId: number) => void;
  // Double-Level Workflow Actions
  onApproveInternal?: (event: Event) => void;
  onRequestPublicApproval?: (event: Event) => void;
  onPublishEvent?: (event: Event) => void;
  onRequestChanges?: (event: Event) => void;
  onRejectEvent?: (event: Event) => void;
  // Legacy compatibility
  onApproveEvent?: (event: Event) => void;
  isEnteEvent: boolean;
}

export const EventCard = ({
  event,
  onViewDetail,
  onEditEvent,
  onDeleteEvent,
  onApproveInternal,
  onRequestPublicApproval,
  onPublishEvent,
  onRequestChanges,
  onRejectEvent,
  // Legacy compatibility
  onApproveEvent,
  isEnteEvent
}: EventCardProps) => {
  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const isSameDay = start.toDateString() === end.toDateString();

    if (isSameDay) {
      return {
        date: start.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        }),
        time: `${start.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })} - ${end.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })}`,
      };
    } else {
      return {
        date: `${start.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        })} - ${end.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        })}`,
        time: `${start.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })}`,
      };
    }
  };

  const getStatusColor = (statusCode: string) => {
    switch (statusCode) {
      case 'pending_internal_approval':
      case 'pending_public_approval':
      case 'requires_changes':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'approved_internal':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIndicator = (event: Event) => {
    // Use the standard Event type structure
    const now = new Date();
    const eventStart = new Date(event.start_date);
    const eventEnd = new Date(event.end_date);
    const daysUntilEvent = Math.ceil((eventStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const hasEnded = eventEnd.getTime() < now.getTime();
    const isHappening = eventStart.getTime() <= now.getTime() && now.getTime() <= eventEnd.getTime();

    if (hasEnded) return null;

    if (daysUntilEvent <= 3 && daysUntilEvent > 0) {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <ClockIcon className="w-3 h-3 mr-1" />
          Próximo ({daysUntilEvent}d)
        </div>
      );
    }

    if (isHappening) {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <div className="w-2 h-2 bg-blue-600 rounded-full mr-1 animate-pulse" />
          En curso
        </div>
      );
    }

    return null;
  };

  // Double-level workflow helper functions
  const getEventStatus = () => {
    return event.status?.status_code || event.approval_status;
  };

  const canApproveInternal = () => {
    return getEventStatus() === 'pending_internal_approval';
  };

  const canRequestPublicApproval = () => {
    return getEventStatus() === 'approved_internal';
  };

  const canPublish = () => {
    return getEventStatus() === 'pending_public_approval';
  };

  const canRequestChanges = () => {
    const status = getEventStatus();
    return !['rejected', 'published', 'cancelled'].includes(status);
  };

  const canReject = () => {
    const status = getEventStatus();
    return !['rejected', 'published', 'cancelled'].includes(status);
  };

  const { date, time } = formatEventDate(event.start_date, event.end_date);
  const urgencyIndicator = getUrgencyIndicator(event);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:border-[#228B22] hover:shadow-md transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {event.title}
              </h3>
              {event.is_featured && (
                <StarIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <BuildingOffice2Icon className="w-4 h-4 mr-1" />
              <span className="truncate">{event.organization?.name || 'Sin organización'}</span>
            </div>
          </div>

          {urgencyIndicator && (
            <div className="ml-3 flex-shrink-0">
              {urgencyIndicator}
            </div>
          )}
        </div>

        {/* Status and Category */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.approval_status)}`}>
            {event.approval_status}
          </span>

          {/* Organization Type Badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            isEnteEvent
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-purple-50 text-purple-700 border-purple-200'
          }`}>
            {isEnteEvent ? 'Evento Interno' : 'Evento Externo'}
          </span>

          {event.category && (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border text-white"
              style={{
                backgroundColor: event.category.color,
                borderColor: event.category.color,
              }}
            >
              {event.category.name}
            </span>
          )}
        </div>

        {/* Date and Updated Info - Same Row */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span className="font-medium">{date}</span>
            </div>
            {event.updated_at && (
              <div className="text-xs text-gray-500 mt-1 sm:mt-0">
                Actualizado: {new Date(event.updated_at).toLocaleDateString('es-ES')}
              </div>
            )}
          </div>

          {/* Time Info - Separate Row */}
          <div className="flex items-center text-sm text-gray-500 ml-6">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span>{time}</span>
          </div>
        </div>

        {/* Actions Section - Dedicated Row */}
        <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => onViewDetail(event.id)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-[#228B22] bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#228B22] transition-colors duration-200"
            >
              Ver Detalle
            </button>

            {/* Double-Level Workflow Action Buttons */}

            {/* Primary Workflow Actions */}
            {canApproveInternal() && onApproveInternal && (
              <button
                onClick={() => onApproveInternal(event)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-600 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                Aprobar Interno
              </button>
            )}

            {canRequestPublicApproval() && onRequestPublicApproval && (
              <button
                onClick={() => onRequestPublicApproval(event)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Solicitar Público
              </button>
            )}

            {canPublish() && onPublishEvent && (
              <button
                onClick={() => onPublishEvent(event)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-purple-600 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                Publicar
              </button>
            )}

            {/* Secondary Actions */}
            {canRequestChanges() && onRequestChanges && (
              <button
                onClick={() => onRequestChanges(event)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-600 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
              >
                Solicitar Cambios
              </button>
            )}

            {canReject() && onRejectEvent && (
              <button
                onClick={() => onRejectEvent(event)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Rechazar
              </button>
            )}

            {/* Management Actions (for internal events) */}
            {isEnteEvent && (
              <>
                {onEditEvent && (
                  <button
                    onClick={() => onEditEvent(event)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#228B22] transition-colors duration-200"
                  >
                    Editar
                  </button>
                )}

                {onDeleteEvent && (
                  <button
                    onClick={() => onDeleteEvent(event.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    Eliminar
                  </button>
                )}
              </>
            )}

            {/* Legacy Action (fallback) */}
            {!canApproveInternal() && !canRequestPublicApproval() && !canPublish() && onApproveEvent && (
              <button
                onClick={() => onApproveEvent(event)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-600 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                Aprobar (Legacy)
              </button>
            )}
        </div>
      </div>
    </div>
  );
};