'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, ClockIcon, CheckCircleIcon, ShareIcon, XCircleIcon, ViewColumnsIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { Event } from '@/types/event.types';
import { useEventManager } from '@/features/events/hooks/useEventManager';
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
  };

  const handleApprovalAction = (event: Event) => {
    openApprovalModal(event);
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
            onApproveEvent={(event) => {
              // TODO: Implement approval logic or connect to existing
              openApprovalModal(event);
            }}
            onRequestChanges={(event) => {
              requestChanges(event.id, 'Requested changes from detail modal');
            }}
            onRejectEvent={(event) => {
              if (confirm('¿Estás seguro de que quieres rechazar este evento?')) {
                rejectEvent(event.id, 'Rejected from detail modal');
              }
            }}
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
          onApprove={(event) => {
            openApprovalModal(event);
            closeDetailModal();
          }}
          onRequestChanges={(event) => {
            requestChanges(event.id, 'Requested changes from detail modal');
            closeDetailModal();
          }}
          onReject={(event) => {
            if (confirm('¿Estás seguro de que quieres rechazar este evento?')) {
              rejectEvent(event.id, 'Rejected from detail modal');
              closeDetailModal();
            }
          }}
        />
      </div>
    </div>
  );
}
