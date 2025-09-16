'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, ClockIcon, BuildingOffice2Icon, MapPinIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { Event } from '@/types/event.types';
import { Button } from '@/components/ui';

interface EventDetailModalProps {
  isOpen: boolean;
  event: Event | null;
  onClose: () => void;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: number) => void;
  onApprove?: (event: Event) => void;
  onRequestChanges?: (event: Event) => void;
  onReject?: (event: Event) => void;
}

export const EventDetailModal = ({
  isOpen,
  event,
  onClose,
  onEdit,
  onDelete,
  onApprove,
  onRequestChanges,
  onReject
}: EventDetailModalProps) => {
  if (!event) return null;

  // Helper functions
  const ENTE_TURISMO_ORG_ID = 1;
  const isEnteEvent = event.organization_id === ENTE_TURISMO_ORG_ID;

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    const isSameDay = start.toDateString() === end.toDateString();

    if (isSameDay) {
      return {
        startFormatted: start.toLocaleDateString('es-ES', formatOptions),
        endTime: end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        duration: getDuration(start, end)
      };
    } else {
      return {
        startFormatted: start.toLocaleDateString('es-ES', formatOptions),
        endFormatted: end.toLocaleDateString('es-ES', formatOptions),
        duration: getDuration(start, end)
      };
    }
  };

  const getDuration = (start: Date, end: Date): string => {
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours < 24) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      return `${days}d ${hours}h ${diffMinutes}m`;
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

  const getStatusLabel = (statusCode: string) => {
    const statusLabels: Record<string, string> = {
      'draft': 'Borrador',
      'pending_internal_approval': 'Pendiente Aprobación Interna',
      'approved_internal': 'Aprobado Internamente',
      'pending_public_approval': 'Pendiente Aprobación Pública',
      'published': 'Publicado',
      'requires_changes': 'Requiere Cambios',
      'rejected': 'Rechazado',
      'cancelled': 'Cancelado'
    };
    return statusLabels[statusCode] || statusCode;
  };

  const dateInfo = formatEventDate(event.start_date, event.end_date);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 truncate">
                        {event.title}
                      </Dialog.Title>
                      {event.is_featured && (
                        <StarIcon className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(event.approval_status || 'draft')}`}>
                        {getStatusLabel(event.approval_status || 'draft')}
                      </span>

                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                        isEnteEvent
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {isEnteEvent ? 'Evento Interno' : 'Evento Externo'}
                      </span>

                      {event.category && (
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border text-white"
                          style={{
                            backgroundColor: event.category.color,
                            borderColor: event.category.color,
                          }}
                        >
                          {event.category.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Date and Time */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-lg font-semibold text-gray-900 mb-2">
                        <CalendarIcon className="w-5 h-5 mr-2 text-green-600" />
                        Fecha y Horario
                      </div>
                      <div className="space-y-2 text-gray-700">
                        <div className="flex items-center">
                          <span className="font-medium">Inicio:</span>
                          <span className="ml-2">{dateInfo.startFormatted}</span>
                        </div>
                        {dateInfo.endFormatted ? (
                          <div className="flex items-center">
                            <span className="font-medium">Fin:</span>
                            <span className="ml-2">{dateInfo.endFormatted}</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="font-medium">Hasta:</span>
                            <span className="ml-2">{dateInfo.endTime}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1 text-gray-500" />
                          <span className="text-sm">Duración: {dateInfo.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Organization */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-lg font-semibold text-gray-900 mb-2">
                        <BuildingOffice2Icon className="w-5 h-5 mr-2 text-green-600" />
                        Organización
                      </div>
                      <div className="text-gray-700">
                        <div className="font-medium">{event.organization?.name || 'Sin organización'}</div>
                        {event.organization?.description && (
                          <div className="text-sm text-gray-600 mt-1">{event.organization.description}</div>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center text-lg font-semibold text-gray-900 mb-2">
                        <MapPinIcon className="w-5 h-5 mr-2 text-green-600" />
                        Ubicación
                      </div>
                      <div className="text-gray-700">
                        {event.location ? (
                          <div>
                            <div className="font-medium">{event.location.name}</div>
                            <div className="text-sm text-gray-600">{event.location.address}</div>
                            {event.location.city && (
                              <div className="text-sm text-gray-600">{event.location.city}</div>
                            )}
                          </div>
                        ) : event.location_text ? (
                          <div>{event.location_text}</div>
                        ) : (
                          <div className="text-gray-500">Sin ubicación especificada</div>
                        )}

                        {event.locations && event.locations.length > 1 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium text-blue-600">
                              +{event.locations.length - 1} ubicaciones adicionales
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Description */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-lg font-semibold text-gray-900 mb-2">
                        Descripción
                      </div>
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {event.description || 'Sin descripción disponible.'}
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-lg font-semibold text-gray-900 mb-3">
                        Detalles del Evento
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between">
                          <span className="font-medium">Tipo:</span>
                          <span>{event.type?.type_code === 'sede_unica' ? 'Sede Única' : 'Multi-Sede'}</span>
                        </div>
                        {event.max_attendees && (
                          <div className="flex justify-between">
                            <span className="font-medium">Capacidad máxima:</span>
                            <span>{event.max_attendees} personas</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-medium">Creado:</span>
                          <span>{new Date(event.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                        {event.updated_at && event.updated_at !== event.created_at && (
                          <div className="flex justify-between">
                            <span className="font-medium">Actualizado:</span>
                            <span>{new Date(event.updated_at).toLocaleDateString('es-ES')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-lg font-semibold text-gray-900 mb-2">
                          Información Adicional
                        </div>
                        <div className="space-y-1 text-sm text-gray-700">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end items-center gap-3 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Cerrar
                  </Button>

                  {/* Conditional Action Buttons */}
                  {isEnteEvent ? (
                    // Internal Event Actions
                    <>
                      {onEdit && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            onEdit(event);
                            onClose();
                          }}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          Editar
                        </Button>
                      )}

                      {onDelete && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
                              onDelete(event.id);
                              onClose();
                            }
                          }}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Eliminar
                        </Button>
                      )}
                    </>
                  ) : (
                    // External Event Actions
                    <>
                      {onApprove && (
                        <Button
                          variant="primary"
                          onClick={() => {
                            onApprove(event);
                            onClose();
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Aprobar
                        </Button>
                      )}

                      {onRequestChanges && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            onRequestChanges(event);
                            onClose();
                          }}
                          className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                        >
                          Solicitar Cambios
                        </Button>
                      )}

                      {onReject && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres rechazar este evento?')) {
                              onReject(event);
                              onClose();
                            }
                          }}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Rechazar
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};