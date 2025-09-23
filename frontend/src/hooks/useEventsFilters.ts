/**
 * Events Filters Hook
 * Manages dashboard tab and search state
 */

import { useState, useCallback } from 'react';
import { DashboardTab } from '@/features/events/components/EventsFilterTabs';

interface UseEventsFiltersReturn {
  activeTab: DashboardTab;
  searchQuery: string;
  currentPage: number;
  setActiveTab: (tab: DashboardTab) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  resetFilters: () => void;
  handleTabChange: (tab: DashboardTab) => void;
  handleSearchChange: (query: string) => void;
  handlePageChange: (page: number) => void;
}

// Render counter for debugging
let useEventsFiltersRenderCount = 0;

export const useEventsFilters = (
  initialTab: DashboardTab = 'requires-action'
): UseEventsFiltersReturn => {
  console.log(`🔢 useEventsFilters Render #${++useEventsFiltersRenderCount} - initialTab: ${initialTab}`);

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabChange = useCallback((tab: DashboardTab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset page when changing tabs
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset page when searching
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const resetFilters = useCallback(() => {
    setActiveTab('requires-action');
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  return {
    activeTab,
    searchQuery,
    currentPage,
    setActiveTab,
    setSearchQuery,
    setCurrentPage,
    resetFilters,
    handleTabChange,
    handleSearchChange,
    handlePageChange,
  };
};