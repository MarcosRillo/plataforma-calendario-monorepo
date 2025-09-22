/**
 * Events Dashboard - Main Component
 * Centralized dashboard for entity admin/staff to manage event approvals
 */

'use client';

import { useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useEventsFilters } from '@/hooks/useEventsFilters';
import { useEventDetail } from '@/hooks/useEventDetail';
import { EventsFilterTabs } from './EventsFilterTabs';
import { EventsSearchBar } from './EventsSearchBar';
import { EventsList } from './EventsList';
import { EventDetailModal } from '@/components/ui';

export type DashboardTab = 'requires-action' | 'pending' | 'published' | 'historic';

export const EventsDashboard = () => {
  const {
    activeTab,
    searchQuery,
    currentPage,
    handleTabChange,
    handleSearchChange,
    handlePageChange,
  } = useEventsFilters();

  const {
    summary,
    events,
    isLoadingSummary,
    isLoadingEvents,
    error,
    refetchSummary,
    refetchEvents,
  } = useDashboardData({
    tab: activeTab,
    page: currentPage,
    search: searchQuery,
  });

  // Modal state management
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load event details for modal
  const { event: selectedEvent, isLoading: isLoadingEvent } = useEventDetail(selectedEventId, {
    enabled: isModalOpen && !!selectedEventId
  });

  const handleSearchClear = () => {
    handleSearchChange('');
  };

  const handleViewDetail = (eventId: number) => {
    setSelectedEventId(eventId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEventId(null);
  };

  const handleActionComplete = () => {
    // Refresh dashboard data after successful action
    refetchSummary();
    refetchEvents();
  };

  // Create counters object with proper mapping
  const counters: Record<DashboardTab, number> = {
    'requires-action': summary?.requiere_accion ?? 0,
    'pending': summary?.pendientes ?? 0,
    'published': summary?.publicados ?? 0,
    'historic': summary?.historico ?? 0,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Eventos</h1>
          <p className="mt-2 text-sm text-gray-600">
            Administra la aprobación y publicación de eventos de organizaciones externas
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex mt-4 mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <span className="text-sm font-medium text-gray-500">Dashboard</span>
          </li>
          <li>
            <svg className="flex-shrink-0 w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
          </li>
          <li>
            <span className="text-sm font-medium text-[#228B22]">Gestión de Eventos</span>
          </li>
        </ol>
      </nav>

      {/* Search Bar */}
      <div className="mb-6">
        <EventsSearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleSearchClear}
          placeholder="Buscar eventos por título, organización o categoría..."
        />
      </div>

      {/* Filter Tabs */}
      <div className="mb-8">
        <EventsFilterTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counters={counters}
          isLoading={isLoadingSummary}
        />
      </div>

      {/* Events Content */}
      <EventsList
        events={events}
        isLoading={isLoadingEvents}
        error={error}
        onViewDetail={handleViewDetail}
        onPageChange={handlePageChange}
        onRetry={refetchEvents}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event={isLoadingEvent ? null : (selectedEvent as any)}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        context="dashboard"
        onActionComplete={handleActionComplete}
      />
    </div>
  );
};