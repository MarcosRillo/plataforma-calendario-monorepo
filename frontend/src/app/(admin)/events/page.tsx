'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, ClockIcon, CheckCircleIcon, ShareIcon, XCircleIcon, ViewColumnsIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { Event } from '@/types/event.types';
import { useEventManager } from '@/features/events/hooks/useEventManager';
import { useApprovalManager } from '@/features/events/hooks/useApprovalManager';
import {
  EventTable,
  CreateEventForm,
  EditEventForm,
  ApprovalModal,
  EventFiltersBar,
  DashboardModeView,
  EventDetailModal,
} from '@/features/events/components';
import { Pagination, Button } from '@/components/ui';

type ViewMode = 'table' | 'dashboard';

export default function EventsPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Double-level approval workflow hook
  const {
    approveInternal: workflowApproveInternal,
    requestPublicApproval: workflowRequestPublicApproval,
    publishEvent: workflowPublishEvent,
    requestChanges: workflowRequestChanges,
    rejectEvent: workflowRejectEvent,
    toggleFeatured,
    isLoading: approvalLoading,
    error: approvalError,
    canApproveInternal,
    canRequestPublicApproval,
    canPublish,
    canRequestChanges: workflowCanRequestChanges,
    canReject: workflowCanReject,
    isInternallyApproved,
    isPublished,
    getWorkflowStage,
    clearError: clearApprovalError,
    // Legacy compatibility
    approveEvent,
    canApprove
  } = useApprovalManager();

  const {
    // State
    events,
    pagination,
    filters,
    statistics,
    isLoading,
    error,
    currentEvent,
    isCreateModalOpen,
    isEditModalOpen,
    isApprovalModalOpen,

    // CRUD operations
    createEvent,
    updateEvent,
    deleteEvent,

    // Approval workflow
    approveInternal,
    requestPublic,
    approvePublic,
    requestChanges,
    rejectEvent,

    // Actions
    openCreateModal,
    openEditModal,
    openApprovalModal,
    closeAllModals,
    updateFilters,
    resetFilters,
    changePage,
    refreshData,
  } = useEventManager();

  // Determine default view mode based on user role
  const shouldShowDashboardByDefault = () => {
    const userRole = user?.role?.role_code;
    return userRole === 'entity_admin' || userRole === 'entity_staff';
  };

  // Set default view mode based on user role
  useEffect(() => {
    if (user) {
      const defaultMode = shouldShowDashboardByDefault() ? 'dashboard' : 'table';
      setViewMode(defaultMode);
    }
  }, [user]);
  
  const handleEditEvent = (event: Event) => {
    openEditModal(event);
  };

  const handleSelectEvent = (event: Event) => {
    // In table mode, this could navigate to detail page or open modal
    void event; // Suppress unused parameter warning
  };

  const handleViewDetail = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setIsDetailModalOpen(true);
    }
  };

  const closeDetailModal = () => {
    setSelectedEvent(null);
    setIsDetailModalOpen(false);
    clearApprovalError();
  };

  const handleApprovalAction = (event: Event) => {
    openApprovalModal(event);
  };

  // Double-level approval handlers
  const handleApproveInternal = async (event: Event) => {
    const updatedEvent = await workflowApproveInternal(event.id, 'Aprobado para calendario interno');
    if (updatedEvent) {
      refreshData(); // Refresh events list
    }
  };

  const handleRequestPublicApproval = async (event: Event) => {
    const comment = prompt('Comentario opcional para la solicitud de aprobación pública:') || '';
    const updatedEvent = await workflowRequestPublicApproval(event.id, comment || 'Solicitud de aprobación para calendario público');
    if (updatedEvent) {
      refreshData();
    }
  };

  const handlePublishEvent = async (event: Event) => {
    if (confirm('¿Estás seguro de que quieres publicar este evento en el calendario público?')) {
      const updatedEvent = await workflowPublishEvent(event.id);
      if (updatedEvent) {
        refreshData();
      }
    }
  };

  // Legacy handler for backward compatibility
  const handleApproveEvent = async (event: Event) => {
    return handleApproveInternal(event);
  };

  const handleRequestChangesEvent = async (event: Event) => {
    const feedback = prompt('Ingresa los cambios solicitados:');
    if (!feedback) return;

    const updatedEvent = await workflowRequestChanges(event.id, feedback);
    if (updatedEvent) {
      refreshData();
    }
  };

  const handleRejectEvent = async (event: Event) => {
    const reason = prompt('Ingresa el motivo del rechazo:');
    if (!reason) return;

    if (confirm('¿Estás seguro de que quieres rechazar este evento?')) {
      const updatedEvent = await workflowRejectEvent(event.id, reason);
      if (updatedEvent) {
        refreshData();
      }
    }
  };

  const handleToggleFeatured = async (event: Event) => {
    const updatedEvent = await toggleFeatured(event.id);
    if (updatedEvent) {
      refreshData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Eventos</h1>
            <p className="mt-2 text-gray-600">
              {shouldShowDashboardByDefault()
                ? 'Dashboard de gestión y aprobación de eventos'
                : 'Administra y supervisa todos los eventos de la organización'
              }
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                  viewMode === 'dashboard'
                    ? 'bg-[#228B22] text-white border-[#228B22]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title="Vista Dashboard"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium rounded-r-md border-l-0 border ${
                  viewMode === 'table'
                    ? 'bg-[#228B22] text-white border-[#228B22]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title="Vista Tabla"
              >
                <ViewColumnsIcon className="w-4 h-4" />
              </button>
            </div>

            <Button
              onClick={openCreateModal}
              leftIcon={<PlusIcon className="w-5 h-5" />}
            >
              Crear Evento
            </Button>
          </div>
        </div>

        {/* Approval Error Notification */}
        {approvalError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error en la operación</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{approvalError.message}</p>
                  {approvalError.details && (
                    <p className="mt-1 text-xs text-red-600">{approvalError.details}</p>
                  )}
                </div>
              </div>
              <div className="ml-auto pl-3">
                <button
                  type="button"
                  onClick={clearApprovalError}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Eventos</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.draft}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Próximos</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.upcoming}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ShareIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Públicos</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.published}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={refreshData}
                    variant="ghost"
                    size="sm"
                    className="text-sm text-red-800 underline hover:text-red-600"
                  >
                    Intentar de nuevo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conditional View Rendering */}
        {viewMode === 'dashboard' ? (
          /* Dashboard Mode View */
          <DashboardModeView
            events={events}
            isLoading={isLoading}
            onViewDetail={handleViewDetail}
            onEditEvent={handleEditEvent}
            onDeleteEvent={deleteEvent}
            onApproveInternal={handleApproveInternal}
            onRequestPublicApproval={handleRequestPublicApproval}
            onPublishEvent={handlePublishEvent}
            onRequestChanges={handleRequestChangesEvent}
            onRejectEvent={handleRejectEvent}
            // Legacy compatibility
            onApproveEvent={handleApproveEvent}
          />
        ) : (
          /* Table Mode View (Original) */
          <>
            {/* Filters */}
            <EventFiltersBar
              filters={filters}
              onFiltersChange={updateFilters}
              categories={[]}
              sections={[]}
              onClearFilters={resetFilters}
            />

            {/* Events table */}
            <div className="bg-white shadow-sm rounded-lg">
              <EventTable
                events={events}
                isLoading={isLoading}
                onSelectEvent={handleSelectEvent}
                onEditEvent={handleEditEvent}
                onDeleteEvent={deleteEvent}
                onApprovalAction={handleApprovalAction}
              />

              {/* Pagination */}
              {pagination && (
                <div className="border-t border-gray-200 px-6">
                  <Pagination
                    currentPage={pagination.current_page}
                    totalPages={pagination.last_page}
                    onPageChange={changePage}
                    showInfo={true}
                    totalItems={pagination.total}
                    itemsFrom={pagination.from ?? undefined}
                    itemsTo={pagination.to ?? undefined}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Modals */}
        <CreateEventForm
          isOpen={isCreateModalOpen}
          isLoading={isLoading}
          onClose={closeAllModals}
          onSubmit={createEvent}
        />

        <EditEventForm
          isOpen={isEditModalOpen}
          isLoading={isLoading}
          event={currentEvent}
          onClose={closeAllModals}
          onSubmit={updateEvent}
        />

        <ApprovalModal
          isOpen={isApprovalModalOpen}
          event={currentEvent}
          isLoading={isLoading}
          onClose={closeAllModals}
          onApproveInternal={approveInternal}
          onRequestPublic={requestPublic}
          onApprovePublic={approvePublic}
          onRequestChanges={requestChanges}
          onReject={rejectEvent}
        />

        <EventDetailModal
          isOpen={isDetailModalOpen}
          event={selectedEvent}
          onClose={closeDetailModal}
          onEdit={handleEditEvent}
          onDelete={deleteEvent}
          onApproveInternal={async (event) => {
            await handleApproveInternal(event);
            closeDetailModal();
          }}
          onRequestPublicApproval={async (event) => {
            await handleRequestPublicApproval(event);
            closeDetailModal();
          }}
          onPublishEvent={async (event) => {
            await handlePublishEvent(event);
            closeDetailModal();
          }}
          onRequestChanges={async (event) => {
            await handleRequestChangesEvent(event);
            closeDetailModal();
          }}
          onReject={async (event) => {
            await handleRejectEvent(event);
            closeDetailModal();
          }}
          // Legacy compatibility
          onApprove={async (event) => {
            await handleApproveEvent(event);
            closeDetailModal();
          }}
        />
      </div>
    </div>
  );
}
