/**
 * Event Organizer Service
 * 
 * Specialized service for organizer_admin role.
 * Provides limited CRUD operations for organizers to manage only their own events.
 */

import apiClient from '@/services/apiClient';
import {
  Event,
  EventFormData,
  EventFilters,
  EventPagination
} from '@/types/event.types';
import { OrganizerEventService } from './types';

/**
 * Organizer-specific event filters
 */
export interface OrganizerEventFilters extends EventFilters {
  // Status filters relevant to organizers
  draft_only?: boolean;
  submitted_only?: boolean;
  approved_only?: boolean;
  requires_changes_only?: boolean;
  
  // Date filters for organizer's events
  upcoming_only?: boolean;
  past_events?: boolean;
}

/**
 * Organizer event statistics
 */
export interface OrganizerStatistics {
  total_events: number;
  draft_events: number;
  submitted_events: number;
  approved_events: number;
  published_events: number;
  rejected_events: number;
  total_views: number;
  upcoming_events: number;
  past_events: number;
  
  // Monthly breakdown
  monthly_stats: {
    month: string;
    events_created: number;
    events_published: number;
    total_views: number;
  }[];
  
  // Category breakdown
  category_breakdown: {
    category: string;
    count: number;
  }[];
}

/**
 * Organizer event service operations
 */
export const eventOrganizerService: Omit<OrganizerEventService, 'communication' | 'getEvents' | 'getEvent'> & {
  getMyEvents: (filters?: OrganizerEventFilters) => Promise<EventPagination>;
  getMyEvent: (id: number) => Promise<Event>;
} = {
  /**
   * Get organizer's own events
   */
  async getMyEvents(filters: OrganizerEventFilters = {}): Promise<EventPagination> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/v1/organizer/events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single event owned by the organizer
   */
  async getMyEvent(id: number): Promise<Event> {
    const response = await apiClient.get(`/v1/organizer/events/${id}`);
    return response.data.data;
  },

  /**
   * Create a new event as organizer
   */
  async createEvent(data: EventFormData): Promise<Event> {
    const payload = {
      ...data,
      status: 'draft', // Organizers always start with draft
      end_date: data.end_date || data.start_date,
    };

    const response = await apiClient.post('/v1/organizer/events', payload);
    return response.data.data;
  },

  /**
   * Update organizer's own event (only if not published)
   */
  async updateEvent(id: number, data: Partial<EventFormData>): Promise<Event> {
    const payload = {
      ...data,
      ...(data.start_date && !data.end_date && { end_date: data.start_date }),
    };

    const response = await apiClient.put(`/v1/organizer/events/${id}`, payload);
    return response.data.data;
  },

  /**
   * Delete organizer's own event (only if draft or rejected)
   */
  async deleteEvent(id: number): Promise<void> {
    await apiClient.delete(`/v1/organizer/events/${id}`);
  },

  /**
   * Duplicate organizer's own event
   */
  async duplicateEvent(id: number, overrides: Partial<EventFormData> = {}): Promise<Event> {
    const response = await apiClient.post(`/v1/organizer/events/${id}/duplicate`, overrides);
    return response.data.data;
  },

  /**
   * Submit event for approval
   */
  async submitForApproval(id: number, comment?: string): Promise<Event> {
    const response = await apiClient.post(`/v1/organizer/events/${id}/submit`, { comment });
    return response.data.data;
  },




  /**
   * Save event as template
   */
  async saveAsTemplate(id: number, templateName: string): Promise<{
    id: number;
    name: string;
    template_data: Partial<EventFormData>;
  }> {
    const response = await apiClient.post(`/v1/organizer/events/${id}/save-template`, {
      name: templateName,
    });
    return response.data.data;
  },

  /**
   * Get organizer's event templates
   */
  async getMyTemplates(): Promise<{
    id: number;
    name: string;
    template_data: Record<string, unknown>;
    created_at: string;
    last_used?: string;
  }[]> {
    const response = await apiClient.get('/v1/organizer/templates');
    return response.data.data;
  },

};

/**
 * Organizer communication service
 */
export const eventOrganizerCommunicationService = {
  /**
   * Send message to admin about an event
   */
  async sendMessageToAdmin(eventId: number, subject: string, message: string): Promise<void> {
    await apiClient.post(`/v1/organizer/events/${eventId}/message`, {
      subject,
      message,
    });
  },

  /**
   * Get messages/communications about an event
   */
  async getEventMessages(eventId: number): Promise<{
    id: number;
    subject: string;
    message: string;
    from: { id: number; name: string; role: string };
    to: { id: number; name: string; role: string };
    event_id: number;
    read_at?: string;
    created_at: string;
  }[]> {
    const response = await apiClient.get(`/v1/organizer/events/${eventId}/messages`);
    return response.data.data;
  },

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: number): Promise<void> {
    await apiClient.post(`/v1/organizer/messages/${messageId}/read`);
  },

  /**
   * Get unread messages count
   */
  async getUnreadMessagesCount(): Promise<number> {
    const response = await apiClient.get('/v1/organizer/messages/unread-count');
    return response.data.count;
  },
};

/**
 * Combined organizer event service with interface compatibility
 */
export const combinedEventOrganizerService: OrganizerEventService = {
  ...eventOrganizerService,

  // Required base interface methods (delegate to organizer-specific methods)
  getEvents: async (filters?: Record<string, unknown>) => {
    return eventOrganizerService.getMyEvents(filters as OrganizerEventFilters);
  },
  getEvent: async (id: number) => {
    return eventOrganizerService.getMyEvent(id);
  },

  communication: eventOrganizerCommunicationService,
};

export default combinedEventOrganizerService;