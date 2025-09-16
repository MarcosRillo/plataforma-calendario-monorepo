'use client';

import { useMemo, type ReactNode } from 'react';
import { Event, EVENT_STATUS, EVENT_TYPE } from '@/types/event.types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button, LoadingSpinner } from '@/components/ui';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Permission } from '@/types/auth.types';

// View mode types
export type EventTableViewMode = 'admin' | 'organizer' | 'public';

// Column configuration
interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  className?: string;
}

// Action configuration
interface ActionConfig {
  key: string;
  label: string;
  icon: ReactNode;
  className: string;
  condition?: (event: Event) => boolean;
  permission?: string;
  onClick: (event: Event) => void;
}

interface EventTableProps {
  events: Event[];
  isLoading: boolean;
  viewMode?: EventTableViewMode;
  onSelectEvent?: (event: Event) => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (eventId: number) => void;
  onDuplicateEvent?: (event: Event) => void;
  onApprovalAction?: (event: Event) => void;
  onToggleFeatured?: (event: Event) => void;
  onRequestApproval?: (event: Event) => void;
  onShareEvent?: (event: Event) => void;
  onExportToCalendar?: (event: Event) => void;
  onViewComments?: (event: Event) => void;
  // Backward compatibility
  showActions?: boolean;
  compactView?: boolean;
}

// Helper functions to handle 3NF objects
const getEventStatusCode = (status: any): string => {
  return typeof status === 'object' ? status.status_code : status;
};

const getEventTypeCode = (type: any): string => {
  return typeof type === 'object' ? type.type_code : type;
};

const statusLabels = {
  [EVENT_STATUS.DRAFT]: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
  [EVENT_STATUS.PENDING_INTERNAL_APPROVAL]: { label: 'Pendiente Aprobación Interna', className: 'bg-yellow-100 text-yellow-800' },
  [EVENT_STATUS.APPROVED_INTERNAL]: { label: 'Aprobado Internamente', className: 'bg-blue-100 text-blue-800' },
  [EVENT_STATUS.PENDING_PUBLIC_APPROVAL]: { label: 'Pendiente Aprobación Pública', className: 'bg-orange-100 text-orange-800' },
  [EVENT_STATUS.PUBLISHED]: { label: 'Publicado', className: 'bg-green-100 text-green-800' },
  [EVENT_STATUS.REQUIRES_CHANGES]: { label: 'Requiere Cambios', className: 'bg-red-100 text-red-800' },
  [EVENT_STATUS.REJECTED]: { label: 'Rechazado', className: 'bg-red-100 text-red-800' },
  [EVENT_STATUS.CANCELLED]: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800' },
};

const typeLabels = {
  [EVENT_TYPE.SINGLE_LOCATION]: 'Sede Única',
  [EVENT_TYPE.MULTI_LOCATION]: 'Multi-Sede',
};

export const EventTable = ({
  events,
  isLoading,
  viewMode = 'admin',
  onSelectEvent,
  onEditEvent,
  onDeleteEvent,
  onDuplicateEvent,
  onApprovalAction,
  onToggleFeatured,
  onRequestApproval,
  onShareEvent,
  onExportToCalendar,
  onViewComments,
  showActions = true,
  compactView = false,
}: EventTableProps) => {
  // usePermissions not needed here as PermissionGate handles permission checks
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), compactView ? 'dd/MM/yy' : 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return dateString;
    }
  };

  // Column configuration based on view mode
  const columns = useMemo((): ColumnConfig[] => {
    const baseColumns: ColumnConfig[] = [
      { key: 'event', label: 'Evento', visible: true },
      { key: 'date', label: 'Fecha y Hora', visible: true },
      { key: 'location', label: 'Ubicación', visible: true },
    ];

    switch (viewMode) {
      case 'admin':
        return [
          ...baseColumns,
          { key: 'type', label: 'Tipo', visible: true },
          { key: 'status', label: 'Estado', visible: true },
          { key: 'category', label: 'Categoría', visible: true },
          { key: 'organizer', label: 'Organizador', visible: true },
          { key: 'created', label: 'Creado', visible: !compactView },
          { key: 'actions', label: 'Acciones', visible: showActions, className: 'text-right' },
        ];
      
      case 'organizer':
        return [
          ...baseColumns,
          { key: 'type', label: 'Tipo', visible: !compactView },
          { key: 'status', label: 'Estado', visible: true },
          { key: 'category', label: 'Categoría', visible: true },
          { key: 'feedback', label: 'Comentarios', visible: true },
          { key: 'actions', label: 'Acciones', visible: showActions, className: 'text-right' },
        ];
      
      case 'public':
        return [
          ...baseColumns,
          { key: 'category', label: 'Categoría', visible: true },
          { key: 'type', label: 'Tipo', visible: !compactView },
          { key: 'actions', label: 'Compartir', visible: showActions, className: 'text-right' },
        ];
      
      default:
        return baseColumns;
    }
  }, [viewMode, showActions, compactView]);

  // Action configuration based on view mode
  const actions = useMemo((): ActionConfig[] => {
    const editIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    );

    const deleteIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    );

    const approvalIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );

    const duplicateIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    );

    const starIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    );

    const shareIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
    );

    const calendarIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );

    const commentsIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    );

    switch (viewMode) {
      case 'admin':
        return [
          {
            key: 'edit',
            label: 'Editar evento',
            icon: editIcon,
            className: 'text-blue-600 hover:text-blue-900',
            permission: 'events.update',
            onClick: (event) => onEditEvent?.(event),
          },
          {
            key: 'duplicate',
            label: 'Duplicar evento',
            icon: duplicateIcon,
            className: 'text-green-600 hover:text-green-900',
            permission: 'events.create',
            onClick: (event) => onDuplicateEvent?.(event),
          },
          {
            key: 'featured',
            label: 'Alternar destacado',
            icon: starIcon,
            className: 'text-yellow-600 hover:text-yellow-900',
            permission: 'events.feature',
            onClick: (event) => onToggleFeatured?.(event),
          },
          {
            key: 'approval',
            label: 'Acciones de aprobación',
            icon: approvalIcon,
            className: 'text-green-600 hover:text-green-900',
            permission: 'events.approve',
            condition: (event) => {
              const status = getEventStatusCode(event.status);
              return status === EVENT_STATUS.DRAFT || 
                     status === EVENT_STATUS.PENDING_PUBLIC_APPROVAL ||
                     status === EVENT_STATUS.REQUIRES_CHANGES;
            },
            onClick: (event) => onApprovalAction?.(event),
          },
          {
            key: 'delete',
            label: 'Eliminar evento',
            icon: deleteIcon,
            className: 'text-red-600 hover:text-red-900',
            permission: 'events.delete',
            onClick: (event) => {
              if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
                onDeleteEvent?.(event.id);
              }
            },
          },
        ];

      case 'organizer':
        return [
          {
            key: 'edit',
            label: 'Editar evento',
            icon: editIcon,
            className: 'text-blue-600 hover:text-blue-900',
            condition: (event) => {
              const status = getEventStatusCode(event.status);
              return status === EVENT_STATUS.DRAFT || 
                     status === EVENT_STATUS.REQUIRES_CHANGES;
            },
            onClick: (event) => onEditEvent?.(event),
          },
          {
            key: 'duplicate',
            label: 'Duplicar evento',
            icon: duplicateIcon,
            className: 'text-green-600 hover:text-green-900',
            onClick: (event) => onDuplicateEvent?.(event),
          },
          {
            key: 'request-approval',
            label: 'Solicitar aprobación',
            icon: approvalIcon,
            className: 'text-orange-600 hover:text-orange-900',
            condition: (event) => getEventStatusCode(event.status) === EVENT_STATUS.DRAFT,
            onClick: (event) => onRequestApproval?.(event),
          },
          {
            key: 'view-comments',
            label: 'Ver comentarios',
            icon: commentsIcon,
            className: 'text-purple-600 hover:text-purple-900',
            condition: (event) => {
              const status = getEventStatusCode(event.status);
              return status === EVENT_STATUS.REQUIRES_CHANGES || 
                     status === EVENT_STATUS.REJECTED;
            },
            onClick: (event) => onViewComments?.(event),
          },
          {
            key: 'delete',
            label: 'Eliminar evento',
            icon: deleteIcon,
            className: 'text-red-600 hover:text-red-900',
            condition: (event) => {
              const status = getEventStatusCode(event.status);
              return status === EVENT_STATUS.DRAFT || 
                     status === EVENT_STATUS.REJECTED;
            },
            onClick: (event) => {
              if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
                onDeleteEvent?.(event.id);
              }
            },
          },
        ];

      case 'public':
        return [
          {
            key: 'share',
            label: 'Compartir evento',
            icon: shareIcon,
            className: 'text-blue-600 hover:text-blue-900',
            onClick: (event) => onShareEvent?.(event),
          },
          {
            key: 'calendar',
            label: 'Añadir a calendario',
            icon: calendarIcon,
            className: 'text-green-600 hover:text-green-900',
            onClick: (event) => onExportToCalendar?.(event),
          },
        ];

      default:
        return [];
    }
  }, [viewMode, onEditEvent, onDeleteEvent, onDuplicateEvent, onApprovalAction, 
      onToggleFeatured, onRequestApproval, onShareEvent, onExportToCalendar, onViewComments]);

  // Status labels with different styling per view mode
  const getStatusLabel = (status: any, viewMode: EventTableViewMode) => {
    const statusCode = getEventStatusCode(status);
    const baseLabel = statusLabels[statusCode as keyof typeof statusLabels];
    if (!baseLabel) return { label: statusCode, className: 'bg-gray-100 text-gray-800' };

    // Customize styling based on view mode
    switch (viewMode) {
      case 'organizer':
        // More prominent status colors for organizers
        return {
          ...baseLabel,
          className: baseLabel.className.replace('100', '200'),
        };
      case 'public':
        // Softer colors for public view
        return {
          ...baseLabel,
          className: baseLabel.className.replace('800', '600'),
        };
      default:
        return baseLabel;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (events.length === 0) {
    const emptyMessage = viewMode === 'public' 
      ? 'No hay eventos disponibles' 
      : viewMode === 'organizer' 
      ? 'No tienes eventos creados'
      : 'No se encontraron eventos';
      
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  const tableTheme = viewMode === 'public' 
    ? 'bg-white border border-gray-200' 
    : 'bg-white shadow-sm';
    
  const headerTheme = viewMode === 'public'
    ? 'bg-gray-100'
    : 'bg-gray-50';

  return (
    <div className={`overflow-x-auto rounded-lg ${tableTheme}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={headerTheme}>
          <tr>
            {columns.filter(col => col.visible).map((column) => (
              <th 
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.className || ''
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {events.map((event) => {
            const statusLabel = getStatusLabel(event.status, viewMode);
            const rowTheme = viewMode === 'public' ? 'hover:bg-blue-50' : 'hover:bg-gray-50';
            
            return (
              <tr
                key={event.id}
                className={`${rowTheme} cursor-pointer`}
                onClick={() => onSelectEvent?.(event)}
              >
                {/* Render cells based on visible columns */}
                {columns.filter(col => col.visible).map((column) => {
                  switch (column.key) {
                    case 'event':
                      return (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <div className="text-sm font-medium text-gray-900">
                                  {event.title}
                                </div>
                                {event.is_featured && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    Destacado
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {event.description}
                              </div>
                            </div>
                          </div>
                        </td>
                      );

                    case 'date':
                      return (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(event.start_date)}
                          </div>
                          {event.end_date && !compactView && (
                            <div className="text-sm text-gray-500">
                              hasta {formatDate(event.end_date)}
                            </div>
                          )}
                        </td>
                      );

                    case 'location':
                      return (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {event.location?.name || event.location_text || 'Sin ubicación'}
                          </div>
                          {event.location?.address && !compactView && (
                            <div className="text-sm text-gray-500">
                              {event.location.address}
                            </div>
                          )}
                          {getEventTypeCode(event.type) === EVENT_TYPE.MULTI_LOCATION && event.locations?.length > 1 && (
                            <div className="text-xs text-blue-600 mt-1">
                              +{event.locations.length - 1} ubicaciones más
                            </div>
                          )}
                        </td>
                      );

                    case 'type':
                      return (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {typeLabels[getEventTypeCode(event.type)]}
                          </span>
                        </td>
                      );

                    case 'status':
                      return (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              statusLabel.className
                            }`}
                          >
                            {statusLabel.label}
                          </span>
                        </td>
                      );

                    case 'category':
                      return (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {event.category?.color && (
                              <div 
                                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                style={{ backgroundColor: event.category.color }}
                              />
                            )}
                            <span className="text-sm text-gray-900">
                              {event.category?.name || 'Sin categoría'}
                            </span>
                          </div>
                        </td>
                      );

                    case 'organizer':
                      const ENTE_TURISMO_ORG_ID = 1;
                      const isEnteEvent = event.organization_id === ENTE_TURISMO_ORG_ID;

                      return (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm text-gray-900">
                              {event.organization?.name || 'Sin organización'}
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                              isEnteEvent
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {isEnteEvent ? 'Interno' : 'Externo'}
                            </span>
                          </div>
                          {event.organization?.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {event.organization.description}
                            </div>
                          )}
                        </td>
                      );

                    case 'created':
                      return (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {event.created_at && formatDate(event.created_at)}
                          </div>
                          {event.updated_at && event.updated_at !== event.created_at && (
                            <div className="text-sm text-gray-500">
                              Act: {formatDate(event.updated_at)}
                            </div>
                          )}
                        </td>
                      );

                    case 'feedback':
                      return (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {getEventStatusCode(event.status) === EVENT_STATUS.REQUIRES_CHANGES || 
                           getEventStatusCode(event.status) === EVENT_STATUS.REJECTED ? (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-red-600 font-medium">
                                Requiere atención
                              </span>
                            </div>
                          ) : getEventStatusCode(event.status) === EVENT_STATUS.PUBLISHED ? (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-green-600 font-medium">
                                Publicado
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Sin comentarios
                            </span>
                          )}
                        </td>
                      );

                    case 'actions':
                      return (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            {actions
                              .filter(action => !action.condition || action.condition(event))
                              .map((action) => {
                                const ActionButton = (
                                  <Button
                                    key={action.key}
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick(event);
                                    }}
                                    className={`${action.className} p-1`}
                                    title={action.label}
                                  >
                                    {action.icon}
                                  </Button>
                                );

                                // Wrap in PermissionGate if permission is specified
                                if (action.permission) {
                                  return (
                                    <PermissionGate key={action.key} permission={action.permission as Permission}>
                                      {ActionButton}
                                    </PermissionGate>
                                  );
                                }

                                return ActionButton;
                              })}
                          </div>
                        </td>
                      );

                    default:
                      return null;
                  }
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Default export for backward compatibility
export default EventTable;
