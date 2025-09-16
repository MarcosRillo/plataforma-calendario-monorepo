/**
 * Events List Component
 * Container for displaying events with loading states and pagination
 */

'use client';

import { DashboardEvent, DashboardEventsResponse } from '@/services/dashboardService';
import { EventCard } from './EventCard';
import { EventPagination } from './EventPagination';

interface EventsListProps {
  events: DashboardEventsResponse | null;
  isLoading: boolean;
  error: string | null;
  onViewDetail: (eventId: number) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

// Loading skeleton component
const EventCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow border border-gray-200 animate-pulse">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
      
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-gray-200 rounded w-24"></div>
        <div className="h-5 bg-gray-200 rounded w-20"></div>
      </div>
      
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-28"></div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-40"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// Empty state component
const EmptyState = ({ searchQuery, activeTab }: { searchQuery: string; activeTab: string }) => (
  <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {searchQuery ? 'No se encontraron eventos' : 'No hay eventos'}
    </h3>
    <p className="text-sm text-gray-500 max-w-sm mx-auto">
      {searchQuery 
        ? `No se encontraron eventos que coincidan con "${searchQuery}" en la pestaña ${activeTab}.`
        : `No hay eventos en la pestaña ${activeTab} en este momento.`
      }
    </p>
  </div>
);

// Error state component
const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
    <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Error al cargar eventos
    </h3>
    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
      {error}
    </p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#228B22] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#228B22] transition-colors duration-200"
    >
      Intentar de nuevo
    </button>
  </div>
);

export const EventsList = ({
  events,
  isLoading,
  error,
  onViewDetail,
  onPageChange,
  onRetry,
}: EventsListProps) => {
  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!events || events.data.length === 0) {
    return (
      <EmptyState 
        searchQuery="" 
        activeTab="current" 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
        {events.data.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onViewDetail={onViewDetail}
          />
        ))}
      </div>

      {/* Pagination */}
      {events.pagination.total > events.pagination.per_page && (
        <EventPagination
          currentPage={events.pagination.current_page}
          totalPages={events.pagination.last_page}
          totalItems={events.pagination.total}
          itemsPerPage={events.pagination.per_page}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};