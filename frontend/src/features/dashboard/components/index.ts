/**
 * Dashboard Components - Index
 * Centralized exports for dashboard feature components
 */

export { EventsDashboard } from './EventsDashboard';
export { EventsFilterTabs } from './EventsFilterTabs';
export { EventsSearchBar } from './EventsSearchBar';
export { EventsList } from './EventsList';
export { EventCard } from './EventCard';

// Phase 3 - Event Approval Modal Components
// EventDetailModal moved to @/components/ui (unified implementation)
export { EventApprovalActions } from './EventApprovalActions';
export { ApprovalConfirmDialog } from './ApprovalConfirmDialog';

// Export types
export type { DashboardTab } from './EventsDashboard';