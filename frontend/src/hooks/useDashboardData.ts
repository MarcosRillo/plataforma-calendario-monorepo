/**
 * Dashboard Data Hook
 * Manages dashboard summary and events data with caching and error handling
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  dashboardService, 
  DashboardSummary, 
  DashboardEventsResponse,
  DashboardEventsParams 
} from '@/services/dashboardService';

interface UseDashboardDataReturn {
  summary: DashboardSummary | null;
  events: DashboardEventsResponse | null;
  isLoadingSummary: boolean;
  isLoadingEvents: boolean;
  error: string | null;
  refetchSummary: () => Promise<void>;
  refetchEvents: () => Promise<void>;
}

// Render counter for debugging
let useDashboardDataRenderCount = 0;

export const useDashboardData = (params: DashboardEventsParams = {}): UseDashboardDataReturn => {
  console.log(`🔢 useDashboardData Render #${++useDashboardDataRenderCount} - params:`, params);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [events, setEvents] = useState<DashboardEventsResponse | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize params to prevent infinite re-renders
  const memoizedParams = useMemo(() => {
    console.log('🔄 useDashboardData useMemo - params changed, creating new memoizedParams:', params);
    return params;
  }, [params]);

  const fetchSummary = async () => {
    console.log('📊 Dashboard API call starting - fetchSummary...');
    setIsLoadingSummary(true);
    setError(null);

    try {
      const summaryData = await dashboardService.getSummary();
      console.log('📊 Dashboard summary result:', summaryData);
      setSummary(summaryData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard summary';
      console.error('📊 Dashboard summary error:', err);
      setError(errorMessage);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const fetchEvents = async () => {
    console.log('📊 Dashboard API call starting - fetchEvents with params:', memoizedParams);
    setIsLoadingEvents(true);
    setError(null);

    try {
      const eventsData = await dashboardService.getEvents(memoizedParams);
      console.log('📊 Dashboard events result:', eventsData);
      setEvents(eventsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
      console.error('📊 Dashboard events error:', err);
      setError(errorMessage);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Fetch summary on mount
  useEffect(() => {
    console.log('🔄 useEffect #1 (useDashboardData fetchSummary) - FIRED');
    fetchSummary();
  }, []);

  // Fetch events when memoized params change
  useEffect(() => {
    console.log('🔄 useEffect #2 (useDashboardData fetchEvents) - FIRED - memoizedParams:', memoizedParams);
    fetchEvents();
  }, [memoizedParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    summary,
    events,
    isLoadingSummary,
    isLoadingEvents,
    error,
    refetchSummary: fetchSummary,
    refetchEvents: fetchEvents,
  };
};