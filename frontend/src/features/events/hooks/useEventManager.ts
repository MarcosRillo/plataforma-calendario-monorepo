/**
 * useEventManager Hook - Simplified Architecture
 * Now uses direct service functions without adapter layer
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { usePaginatedData, PaginationMeta } from '../../../hooks/usePaginatedData';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  Event, 
  EventFormData, 
  EventFilters, 
  EventStatistics,
  ApprovalStatistics
} from '@/types/event.types';
import { 
  getEventServiceForContext, 
  type EventServiceContext 
} from '../services/event.service';

// Extend base filters for events
interface EventFiltersExtended extends EventFilters {
  [key: string]: string | number | boolean | undefined;
}

interface UseEventManagerReturn {
  // Data state from generic hook
  events: Event[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  
  // Event-specific state
  currentEvent: Event | null;
  statistics: EventStatistics | null;
  approvalStatistics: ApprovalStatistics | null;
  filters: EventFilters;
  
  // UI state
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Modal state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isApprovalModalOpen: boolean;
  isDetailsModalOpen: boolean;
  
  // Actions from generic hook
  setFilters: (filters: Partial<EventFiltersExtended>) => void;
  resetFilters: () => void;
  changePage: (page: number) => void;
  refreshData: () => void;
  
  // Event-specific actions
  createEvent: (data: EventFormData) => Promise<void>;
  updateEvent: (id: number, data: Partial<EventFormData>) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  duplicateEvent: (id: number, overrides?: Partial<EventFormData>) => Promise<void>;
  toggleFeatured: (id: number) => Promise<void>;
  
  // Approval actions
  approveInternal: (eventId: number, comment?: string) => Promise<void>;
  requestPublic: (eventId: number, comment?: string) => Promise<void>;
  approvePublic: (eventId: number, comment?: string) => Promise<void>;
  requestChanges: (eventId: number, comment: string) => Promise<void>;
  rejectEvent: (eventId: number, comment: string) => Promise<void>;
  
  // Filter actions (wrappers for generic actions)
  updateFilters: (newFilters: Partial<EventFilters>) => void;
  
  // Modal actions
  openCreateModal: () => void;
  openEditModal: (event: Event) => void;
  openDeleteModal: (event: Event) => void;
  openApprovalModal: (event: Event) => void;
  openDetailsModal: (event: Event) => void;
  closeAllModals: () => void;
  
  // Optimistic updates
  addEvent: (event: Event) => void;
  updateEventInList: (id: number, event: Partial<Event>) => void;
  removeEvent: (id: number) => void;
  
  // Utility actions
  loadStatistics: () => Promise<void>;
  loadApprovalStatistics: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook configuration options
 */
interface UseEventManagerOptions {
  context?: EventServiceContext;
  autoDetectContext?: boolean;
}

export function useEventManager(options: UseEventManagerOptions = {}): UseEventManagerReturn {
  
  // Initial filters
  const initialFilters: EventFiltersExtended = {
    page: 1,
    per_page: 15,
  };

  // Check authentication status and permissions
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    isAdmin, 
    isOrganizer, 
    canAccessAdmin
  } = usePermissions();

  // Determine the appropriate service context
  const serviceContext: EventServiceContext = useMemo(() => {
    if (options.context) {
      return options.context;
    }

    if (options.autoDetectContext !== false) {
      // Auto-detect context based on user role
      if (!isAuthenticated) {
        return 'public';
      }
      
      if (isOrganizer()) {
        return 'organizer';
      }
      
      if (isAdmin() || canAccessAdmin()) {
        return 'admin';
      }
      
      // Default to public for other roles
      return 'public';
    }

    // Default fallback
    return 'admin';
  }, [
    options.context, 
    options.autoDetectContext, 
    isAuthenticated, 
    isOrganizer, 
    isAdmin, 
    canAccessAdmin
  ]);

  // Get the appropriate service
  const eventServiceInstance = useMemo(() => {
    return getEventServiceForContext(serviceContext);
  }, [serviceContext]);

  // Service function adapter for Laravel API structure
  const fetchEvents = useCallback(async (filters: EventFiltersExtended) => {
    // Use the appropriate service based on context
    const response = await eventServiceInstance.getEvents(filters);
    
    // EventPagination now already has the correct Laravel structure { data, meta, links }
    // So we can return it directly
    return response;
  }, [eventServiceInstance]);

  // Use the generic paginated data hook - only auto-load if authenticated
  const {
    data: events,
    pagination,
    filters,
    isLoading,
    error,
    setFilters,
    resetFilters,
    changePage,
    refreshData,
    addItem: addEvent,
    updateItem: updateEventInList,
    removeItem: removeEvent,
  } = usePaginatedData<Event, EventFiltersExtended>({
    fetchFn: fetchEvents,
    initialFilters,
    debounceMs: 300,
    autoLoad: isAuthenticated && !authLoading, // Only auto-load when authenticated
  });

  // Event-specific state
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [statistics, setStatistics] = useState<EventStatistics | null>(null);
  const [approvalStatistics, setApprovalStatistics] = useState<ApprovalStatistics | null>(null);
  
  // UI state
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Event-specific actions
  const createEvent = useCallback(async (data: EventFormData) => {
    try {
      setIsCreating(true);
      if (!eventServiceInstance.createEvent) {
        throw new Error('Create event not available in current context');
      }
      const newEvent = await eventServiceInstance.createEvent(data);
      addEvent(newEvent);
      setIsCreateModalOpen(false);
      refreshData(); // Refresh to get updated pagination
    } catch (error) {
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [addEvent, refreshData, eventServiceInstance]);

  const updateEvent = useCallback(async (id: number, data: Partial<EventFormData>) => {
    try {
      setIsUpdating(true);
      if (!eventServiceInstance.updateEvent) {
        throw new Error('Update event not available in current context');
      }
      const updatedEvent = await eventServiceInstance.updateEvent(id, data);
      updateEventInList(id, updatedEvent);
      setIsEditModalOpen(false);
      setCurrentEvent(null);
    } catch (error) {
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [updateEventInList, eventServiceInstance]);

  const deleteEvent = useCallback(async (id: number) => {
    try {
      setIsDeleting(true);
      if (!eventServiceInstance.deleteEvent) {
        throw new Error('Delete event not available in current context');
      }
      // Optimistic update
      removeEvent(id);
      await eventServiceInstance.deleteEvent(id);
      setIsDeleteModalOpen(false);
      setCurrentEvent(null);
      refreshData(); // Refresh to get updated pagination
    } catch (error) {
      // Revert optimistic update
      refreshData();
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [removeEvent, refreshData, eventServiceInstance]);

  const duplicateEvent = useCallback(async (id: number, overrides?: Partial<EventFormData>) => {
    try {
      if (!eventServiceInstance.duplicateEvent) {
        throw new Error('Duplicate event not available in current context');
      }
      const duplicatedEvent = await eventServiceInstance.duplicateEvent(id, overrides);
      addEvent(duplicatedEvent);
      refreshData();
    } catch (error) {
      throw error;
    }
  }, [addEvent, refreshData, eventServiceInstance]);

  const toggleFeatured = useCallback(async (id: number) => {
    try {
      if (!eventServiceInstance.toggleFeatured) {
        throw new Error('Toggle featured not available in current context');
      }
      const updatedEvent = await eventServiceInstance.toggleFeatured(id);
      updateEventInList(id, updatedEvent);
    } catch (error) {
      throw error;
    }
  }, [updateEventInList, eventServiceInstance]);

  // Approval actions - only available for admin services
  const approveInternal = useCallback(async (eventId: number, comment?: string) => {
    try {
      // Only admin services have approval functionality
      if ('approval' in eventServiceInstance) {
        const updatedEvent = await eventServiceInstance.approval.approveInternal(eventId, { comment });
        updateEventInList(eventId, updatedEvent);
        setIsApprovalModalOpen(false);
        setCurrentEvent(null);
      } else {
        throw new Error('Approval functionality not available in current context');
      }
    } catch (error) {
      throw error;
    }
  }, [updateEventInList, eventServiceInstance]);

  const requestPublic = useCallback(async (eventId: number, comment?: string) => {
    try {
      if ('approval' in eventServiceInstance) {
        const updatedEvent = await eventServiceInstance.approval.requestPublic(eventId, { comment });
        updateEventInList(eventId, updatedEvent);
        setIsApprovalModalOpen(false);
        setCurrentEvent(null);
      } else {
        throw new Error('Approval functionality not available in current context');
      }
    } catch (error) {
      throw error;
    }
  }, [updateEventInList, eventServiceInstance]);

  const approvePublic = useCallback(async (eventId: number, comment?: string) => {
    try {
      if ('approval' in eventServiceInstance) {
        const updatedEvent = await eventServiceInstance.approval.approvePublic(eventId, { comment });
        updateEventInList(eventId, updatedEvent);
        setIsApprovalModalOpen(false);
        setCurrentEvent(null);
      } else {
        throw new Error('Approval functionality not available in current context');
      }
    } catch (error) {
      throw error;
    }
  }, [updateEventInList, eventServiceInstance]);

  const requestChanges = useCallback(async (eventId: number, comment: string) => {
    try {
      if ('approval' in eventServiceInstance) {
        const updatedEvent = await eventServiceInstance.approval.requestChanges(eventId, comment);
        updateEventInList(eventId, updatedEvent);
        setIsApprovalModalOpen(false);
        setCurrentEvent(null);
      } else {
        throw new Error('Approval functionality not available in current context');
      }
    } catch (error) {
      throw error;
    }
  }, [updateEventInList, eventServiceInstance]);

  const rejectEvent = useCallback(async (eventId: number, comment: string) => {
    try {
      if ('approval' in eventServiceInstance) {
        const updatedEvent = await eventServiceInstance.approval.rejectEvent(eventId, comment);
        updateEventInList(eventId, updatedEvent);
        setIsApprovalModalOpen(false);
        setCurrentEvent(null);
      } else {
        throw new Error('Approval functionality not available in current context');
      }
    } catch (error) {
      throw error;
    }
  }, [updateEventInList, eventServiceInstance]);

  // Filter actions (wrappers)
  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters(newFilters);
  }, [setFilters]);

  // Modal actions
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const openEditModal = useCallback((event: Event) => {
    setCurrentEvent(event);
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((event: Event) => {
    setCurrentEvent(event);
    setIsDeleteModalOpen(true);
  }, []);

  const openApprovalModal = useCallback((event: Event) => {
    setCurrentEvent(event);
    setIsApprovalModalOpen(true);
  }, []);

  const openDetailsModal = useCallback((event: Event) => {
    setCurrentEvent(event);
    setIsDetailsModalOpen(true);
  }, []);

  const closeAllModals = useCallback(() => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsApprovalModalOpen(false);
    setIsDetailsModalOpen(false);
    setCurrentEvent(null);
  }, []);

  // Utility actions
  const loadStatistics = useCallback(async () => {
    try {
      if (!eventServiceInstance.getStatistics) {
        return; // Statistics not available in current context
      }
      const stats = await eventServiceInstance.getStatistics();
      setStatistics(stats);
    } catch {
      // Handle error silently for statistics
    }
  }, [eventServiceInstance]);

  const loadApprovalStatistics = useCallback(async () => {
    try {
      if ('approval' in eventServiceInstance) {
        const stats = await eventServiceInstance.approval.getApprovalStatistics();
        setApprovalStatistics(stats);
      }
    } catch {
      // Handle error silently for statistics
    }
  }, [eventServiceInstance]);

  const clearError = useCallback(() => {
    // This would be handled by the generic hook if needed
  }, []);

  return {
    // Data state
    events,
    pagination,
    isLoading,
    error,
    
    // Event-specific state
    currentEvent,
    statistics,
    approvalStatistics,
    filters: filters as EventFilters,
    
    // UI state
    isCreating,
    isUpdating,
    isDeleting,
    
    // Modal state
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isApprovalModalOpen,
    isDetailsModalOpen,
    
    // Actions from generic hook
    setFilters,
    resetFilters,
    changePage,
    refreshData,
    
    // Event-specific actions
    createEvent,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    toggleFeatured,
    
    // Approval actions
    approveInternal,
    requestPublic,
    approvePublic,
    requestChanges,
    rejectEvent,
    
    // Filter actions
    updateFilters,
    
    // Modal actions
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openApprovalModal,
    openDetailsModal,
    closeAllModals,
    
    // Optimistic updates
    addEvent,
    updateEventInList,
    removeEvent,
    
    // Utility actions
    loadStatistics,
    loadApprovalStatistics,
    clearError,
  };
}
