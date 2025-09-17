// Event components
export { EventTable } from './EventTable';
export { CreateEventForm } from './CreateEventForm';
export { EditEventForm } from './EditEventForm';
export { ApprovalModal } from './ApprovalModal';
export { EventFiltersBar } from './EventFiltersBar';
// EventDetailModal moved to @/components/ui (unified implementation)

// Dashboard Components (migrated from dashboard/)
export { EventCard } from './EventCard';
export { EventsFilterTabs } from './EventsFilterTabs';
export { EventsList } from './EventsList';
export { DashboardModeView } from './DashboardModeView';

// Re-export types
export type { DashboardTab } from './EventsFilterTabs';
