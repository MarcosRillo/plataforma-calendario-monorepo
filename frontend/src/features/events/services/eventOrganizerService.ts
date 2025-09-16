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
  EventPagination, 
  EventStatus
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
export const eventOrganizerService: Omit<OrganizerEventService, 'communication' | 'getEvents' | 'updateEvent' | 'deleteEvent' | 'duplicateEvent' | 'getEvent'> & {
  getEvents?: (filters?: Record<string, unknown>) => Promise<EventPagination>;
  getEvent?: (id: number) => Promise<Event>;
  updateEvent?: (id: number, data: Partial<EventFormData>) => Promise<Event>;
  deleteEvent?: (id: number) => Promise<void>;
  duplicateEvent?: (id: number, overrides?: Partial<EventFormData>) => Promise<Event>;
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
  async updateMyEvent(id: number, data: Partial<EventFormData>): Promise<Event> {
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
  async deleteMyEvent(id: number): Promise<void> {
    await apiClient.delete(`/v1/organizer/events/${id}`);
  },

  /**
   * Duplicate organizer's own event
   */
  async duplicateMyEvent(id: number, overrides: Partial<EventFormData> = {}): Promise<Event> {
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
   * Withdraw event from approval process (back to draft)
   */
  async withdrawFromApproval(id: number): Promise<Event> {
    const response = await apiClient.post(`/v1/organizer/events/${id}/withdraw`);
    return response.data.data;
  },

  /**
   * Resubmit event after changes requested
   */
  async resubmitEvent(id: number, comment?: string): Promise<Event> {
    const response = await apiClient.post(`/v1/organizer/events/${id}/resubmit`, { comment });
    return response.data.data;
  },

  /**
   * Get draft events
   */
  async getDraftEvents(): Promise<Event[]> {
    const response = await apiClient.get('/v1/organizer/events/drafts');
    return response.data.data;
  },

  /**
   * Get events pending approval
   */
  async getPendingEvents(): Promise<Event[]> {
    const response = await apiClient.get('/v1/organizer/events/pending');
    return response.data.data;
  },

  /**
   * Get approved events
   */
  async getApprovedEvents(): Promise<Event[]> {
    const response = await apiClient.get('/v1/organizer/events/approved');
    return response.data.data;
  },

  /**
   * Get events requiring changes
   */
  async getEventsRequiringChanges(): Promise<Event[]> {
    const response = await apiClient.get('/v1/organizer/events/requires-changes');
    return response.data.data;
  },

  /**
   * Get rejected events
   */
  async getRejectedEvents(): Promise<Event[]> {
    const response = await apiClient.get('/v1/organizer/events/rejected');
    return response.data.data;
  },

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get(`/v1/organizer/events/upcoming${params}`);
    return response.data.data;
  },

  /**
   * Get past events
   */
  async getPastEvents(limit?: number): Promise<Event[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get(`/v1/organizer/events/past${params}`);
    return response.data.data;
  },

  /**
   * Get organizer's event statistics
   */
  async getMyStatistics(): Promise<OrganizerStatistics> {
    const response = await apiClient.get('/v1/organizer/events/statistics');
    return response.data;
  },

  /**
   * Get detailed statistics for a date range
   */
  async getDetailedStatistics(startDate?: string, endDate?: string): Promise<OrganizerStatistics & {
    daily_views: { date: string; views: number }[];
    popular_events: { title: string; views: number; id: number }[];
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await apiClient.get(`/v1/organizer/events/statistics/detailed?${params.toString()}`);
    return response.data;
  },

  /**
   * Get event performance metrics
   */
  async getEventMetrics(id: number): Promise<{
    views: number;
    unique_views: number;
    daily_views: { date: string; views: number }[];
    referrers: { source: string; views: number }[];
    locations_views: { city: string; views: number }[];
  }> {
    const response = await apiClient.get(`/v1/organizer/events/${id}/metrics`);
    return response.data;
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
    template_data: Partial<EventFormData>;
    created_at: string;
    last_used: string | null;
  }[]> {
    const response = await apiClient.get('/v1/organizer/templates');
    return response.data.data;
  },

  /**
   * Create event from template
   */
  async createFromTemplate(templateId: number, overrides: Partial<EventFormData> = {}): Promise<Event> {
    const response = await apiClient.post(`/v1/organizer/templates/${templateId}/create-event`, overrides);
    return response.data.data;
  },

  /**
   * Delete event template
   */
  async deleteTemplate(templateId: number): Promise<void> {
    await apiClient.delete(`/v1/organizer/templates/${templateId}`);
  },

  /**
   * Get approval feedback for an event
   */
  async getApprovalFeedback(id: number): Promise<{
    status: EventStatus;
    comments: {
      id: number;
      comment: string;
      created_by: { id: number; name: string; role: string };
      created_at: string;
      type: 'approval' | 'rejection' | 'changes_requested' | 'note';
    }[];
  }> {
    const response = await apiClient.get(`/v1/organizer/events/${id}/feedback`);
    return response.data;
  },

  /**
   * Add response to feedback
   */
  async respondToFeedback(id: number, response: string): Promise<void> {
    await apiClient.post(`/v1/organizer/events/${id}/respond`, { response });
  },

  /**
   * Get organizer profile/settings
   */
  async getOrganizerProfile(): Promise<{
    id: number;
    name: string;
    email: string;
    organization: string;
    bio?: string;
    website?: string;
    social_links?: Record<string, string>;
    notification_preferences: {
      email_on_approval: boolean;
      email_on_rejection: boolean;
      email_on_changes_requested: boolean;
      email_on_published: boolean;
    };
  }> {
    const response = await apiClient.get('/v1/organizer/profile');
    return response.data.data;
  },

  /**
   * Update organizer profile
   */
  async updateProfile(data: {
    bio?: string;
    website?: string;
    social_links?: Record<string, string>;
    notification_preferences?: {
      email_on_approval?: boolean;
      email_on_rejection?: boolean;
      email_on_changes_requested?: boolean;
      email_on_published?: boolean;
    };
  }): Promise<void> {
    await apiClient.put('/v1/organizer/profile', data);
  },

  /**
   * Get available categories for organizer
   */
  async getAvailableCategories(): Promise<{
    id: number;
    name: string;
    slug: string;
    color: string;
    description?: string;
    restrictions?: string[];
  }[]> {
    const response = await apiClient.get('/v1/organizer/categories');
    return response.data.data;
  },

  /**
   * Get available locations for organizer
   */
  async getAvailableLocations(): Promise<{
    id: number;
    name: string;
    address?: string;
    city?: string;
    capacity?: number;
    restrictions?: string[];
  }[]> {
    const response = await apiClient.get('/v1/organizer/locations');
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

// Add missing methods to satisfy interface
const extendedOrganizerService = {
  ...eventOrganizerService,
  
  // Base interface compatibility methods
  async getEvents(filters: Record<string, unknown> = {}): Promise<EventPagination> {
    return eventOrganizerService.getMyEvents(filters);
  },
  
  async getEvent(id: number): Promise<Event> {
    return eventOrganizerService.getMyEvent(id);
  },
  
  async updateEvent(id: number, data: Partial<EventFormData>): Promise<Event> {
    return eventOrganizerService.updateMyEvent(id, data);
  },
  
  async deleteEvent(id: number): Promise<void> {
    return eventOrganizerService.deleteMyEvent(id);
  },
  
  async duplicateEvent(id: number, overrides?: Partial<EventFormData>): Promise<Event> {
    return eventOrganizerService.duplicateMyEvent(id, overrides);
  },
};

/**
 * Combined organizer event service
 */
export const combinedEventOrganizerService: OrganizerEventService = {
  ...extendedOrganizerService,
  communication: eventOrganizerCommunicationService,
};

export default combinedEventOrganizerService;