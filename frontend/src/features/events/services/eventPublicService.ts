/**
 * Event Public Service
 * 
 * Specialized service for public calendar views.
 * Provides read-only access to published events with public-focused features.
 */

import apiClient from '@/services/apiClient';
import { 
  Event, 
  EventFilters, 
  EventPagination,
} from '@/types/event.types';
import { PublicEventService } from './types';

/**
 * Public event filters with additional public-specific options
 */
export interface PublicEventFilters extends Omit<EventFilters, 'status'> {
  // Date range filters
  date_from?: string;
  date_to?: string;
  month?: string;
  year?: string;
  
  // Public-specific filters
  featured_only?: boolean;
  upcoming_only?: boolean;
  this_week?: boolean;
  this_month?: boolean;
  
  // Location-based filters
  near_location?: string;
  within_radius?: number; // kilometers
  
  // Sorting options
  sort_by?: 'date' | 'popularity' | 'featured' | 'name';
  sort_order?: 'asc' | 'desc';
}

/**
 * Public event service operations
 */
export const eventPublicService: Omit<PublicEventService, 'export'> = {
  /**
   * Get paginated list of events (alias for public events)
   */
  async getEvents(filters: Record<string, unknown> = {}): Promise<EventPagination> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/v1/public/events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get single event (alias for public event)
   */
  async getEvent(id: number): Promise<Event> {
    const response = await apiClient.get(`/v1/public/events/${id}`);
    return response.data.data;
  },

  /**
   * Get paginated list of published events for public view
   * Uses new public events endpoint without authentication
   */
  async getPublicEvents(filters: PublicEventFilters = {}): Promise<EventPagination> {
    const params = new URLSearchParams();
    
    // Map public filters to public API parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/v1/public/events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single published event by ID or slug
   */
  async getPublicEvent(identifier: number | string): Promise<Event> {
    const response = await apiClient.get(`/v1/public/events/${identifier}`);
    return response.data.data;
  },

  /**
   * Search events with full-text search
   */
  async searchEvents(query: string, filters: PublicEventFilters = {}): Promise<EventPagination> {
    const params = new URLSearchParams();
    params.append('q', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/v1/public/events/search?${params.toString()}`);
    return response.data;
  },

  /**
   * Get featured events
   */
  async getFeaturedEvents(limit: number = 6): Promise<Event[]> {
    const response = await apiClient.get(`/v1/public/events/featured?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get popular events based on views/attendance
   * Note: No public popular events endpoint available - method removed
   */

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    const response = await apiClient.get(`/v1/public/events/upcoming?limit=${limit}`);
    return response.data.data;
  },

  // Only interface-defined methods remain
};

/**
 * RSS and Calendar Export service
 */
export const eventPublicExportService = {
  /**
   * Get RSS feed URL for public events
   */
  getRSSFeedUrl(filters: PublicEventFilters = {}): string {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseUrl}/api/v1/public/events/rss?${params.toString()}`;
  },

  /**
   * Get iCal URL for public events
   */
  getICalUrl(filters: PublicEventFilters = {}): string {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseUrl}/api/v1/public/events/ical?${params.toString()}`;
  },

  /**
   * Get iCal URL for a specific event
   */
  getEventICalUrl(eventId: number): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseUrl}/api/v1/public/events/${eventId}/ical`;
  },

  /**
   * Download events as iCal file
   */
  async downloadICalFile(filters: PublicEventFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/v1/public/events/ical?${params.toString()}`, {
      responseType: 'blob',
    });
    
    return response.data;
  },

  /**
   * Get Google Calendar add URL for an event
   */
  getGoogleCalendarUrl(event: Event): string {
    const startDate = new Date(event.start_date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(event.end_date || event.start_date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description || '',
      location: event.location?.address || event.location_text || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  },

  /**
   * Get Outlook Calendar add URL for an event
   */
  getOutlookCalendarUrl(event: Event): string {
    const startDate = new Date(event.start_date).toISOString();
    const endDate = new Date(event.end_date || event.start_date).toISOString();
    
    const params = new URLSearchParams({
      subject: event.title,
      startdt: startDate,
      enddt: endDate,
      body: event.description || '',
      location: event.location?.address || event.location_text || '',
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  },
};

/**
 * Combined public event service
 */
export const combinedEventPublicService: PublicEventService = {
  ...eventPublicService,
  export: eventPublicExportService,
};


export default combinedEventPublicService;