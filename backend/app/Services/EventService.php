<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Event Service
 * 
 * Business logic for event management operations.
 * Handles complex business rules and multi-model interactions.
 * 
 * ARCHITECTURE RULES:
 * - All business logic resides here
 * - Controllers remain thin
 * - Transactional operations for data consistency
 * - Proper error handling and logging
 */
class EventService
{
    /**
     * Get paginated events with optional filtering.
     */
    public function getEvents(array $filters = []): LengthAwarePaginator
    {
        $query = Event::with(['category', 'organization']);

        // Apply filters
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['status'])) {
            $query->where('status_id', $filters['status']);
        }

        if (!empty($filters['type'])) {
            $query->byType($filters['type']);
        }

        if (!empty($filters['category_id'])) {
            $query->byCategory($filters['category_id']);
        }

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->dateRange($filters['start_date'], $filters['end_date']);
        }

        if (isset($filters['is_featured'])) {
            if ($filters['is_featured']) {
                $query->featured();
            } else {
                $query->where('is_featured', false);
            }
        }

        // Default ordering by start_date
        $query->orderBy('start_date', 'asc');

        $perPage = $filters['per_page'] ?? 15;
        return $query->paginate($perPage);
    }

    /**
     * Get a single event by ID with relationships.
     */
    public function getEvent(int $id): Event
    {
        return Event::with(['category', 'entity'])
                   ->findOrFail($id);
    }

    /**
     * Create a new event with approval workflow logic.
     * 
     * Lógica para createEvent(array $data, User $user):
     * - Admin: puede crear eventos directamente publicados
     * - Manager: puede crear eventos con aprobación interna automática
     * - Editor: debe crear eventos en estado "pending_internal_approval"
     * - El status inicial depende del rol del usuario y nivel de confianza de la organización
     */
    public function createEvent(array $data, User $user): Event
    {
        return DB::transaction(function () use ($data, $user) {
            Log::info('Creating new event with approval workflow', [
                'title' => $data['title'],
                'user_id' => $user->id,
                'user_role' => $user->role,
                'organization_confidence' => $user->organization->confidence_level ?? 'medium'
            ]);

            // Handle location data
            $locationIds = $data['location_ids'] ?? null;
            
            // Remove location_ids from data since it's not a direct model field
            unset($data['location_ids']);

            // Set the creator
            $data['created_by'] = $user->id;

            // Set entity_id from user's first organization
            if ($user->organizations()->exists()) {
                $data['entity_id'] = $user->organizations()->first()->id;
            } else {
                throw new \Exception('User must belong to at least one organization to create events');
            }

            // Determine initial status based on user role and organization confidence
            $data['status_id'] = $this->determineInitialStatus($user);

            // Initialize approval history
            $data['approval_history'] = [];

            // Create the event
            $event = Event::create($data);

            // Handle location relationships if location_ids are provided
            if (!empty($locationIds)) {
                // Clear location_text if using structured locations
                $event->update(['location_text' => null]);
                $this->syncEventLocations($event, $locationIds);
            }

            // Add initial entry to approval history
            $event->addApprovalHistoryEntry('created', $user->id, 'Event created');
            $event->save();

            // Handle automatic approvals for high-privilege users
            if ($this->shouldAutoApproveInternally($user)) {
                $this->autoApproveInternally($event, $user);
            }

            Log::info('Event created successfully with approval workflow', [
                'event_id' => $event->id,
                'status' => $event->status
            ]);

            return $event->load(['category', 'locations', 'creator', 'approver']);
        });
    }

    /**
     * Update an existing event with approval workflow logic.
     * 
     * Lógica para updateEvent(Event $event, array $data, User $user):
     * - Si el evento está publicado y se modifica contenido principal, vuelve a "approved_internal"
     * - Si el usuario no tiene permisos suficientes, puede requerir nueva aprobación
     * - Mantiene historial de cambios en approval_history
     */
    public function updateEvent(Event $event, array $data, User $user): Event
    {
        return DB::transaction(function () use ($event, $data, $user) {
            Log::info('Updating event with approval workflow', [
                'event_id' => $event->id,
                'user_id' => $user->id,
                'user_role' => $user->role,
                'current_status' => $event->status
            ]);

            // Handle location data
            $locationIds = $data['location_ids'] ?? null;
            
            // Remove location_ids from data since it's not a direct model field
            unset($data['location_ids']);

            // Check if this update requires re-approval
            $requiresReApproval = $this->updateRequiresReApproval($event, $data, $user);

            // Determine new status if re-approval is needed
            if ($requiresReApproval) {
                $data['status_id'] = $this->determineStatusAfterUpdate($event, $user);
                $data['approved_by'] = null;
                $data['approved_at'] = null;
                
                // Add re-approval entry to history
                $event->addApprovalHistoryEntry('updated_requires_reapproval', $user->id, 'Event updated, requires re-approval');
            } else {
                // Add regular update entry to history
                $event->addApprovalHistoryEntry('updated', $user->id, 'Event updated without requiring re-approval');
            }

            // Update the event
            $event->update($data);

            // Handle location relationships if location_ids are provided
            if ($locationIds !== null) {
                if (!empty($locationIds)) {
                    // Clear location_text if using structured locations
                    $event->update(['location_text' => null]);
                    $this->syncEventLocations($event, $locationIds);
                } else {
                    // Clear all location relationships if empty array provided
                    $event->locations()->detach();
                }
            }

            // Handle automatic re-approvals for high-privilege users
            if ($requiresReApproval && $this->shouldAutoApproveInternally($user)) {
                $this->autoApproveInternally($event, $user);
            }

            Log::info('Event updated successfully with approval workflow', [
                'event_id' => $event->id,
                'requires_reapproval' => $requiresReApproval,
                'new_status' => $event->status
            ]);

            return $event->load(['category', 'locations', 'creator', 'approver']);
        });
    }

    /**
     * Delete an event.
     */
    public function deleteEvent(Event $event): bool
    {
        return DB::transaction(function () use ($event) {
            Log::info('Deleting event', ['event_id' => $event->id]);

            // Detach all locations first
            $event->locations()->detach();

            // Delete the event
            $deleted = $event->delete();

            Log::info('Event deleted successfully', ['event_id' => $event->id]);

            return $deleted;
        });
    }

    /**
     * Change event status.
     */
    public function changeEventStatus(Event $event, int $statusId): Event
    {
        Log::info('Changing event status', [
            'event_id' => $event->id,
            'old_status_id' => $event->status_id,
            'new_status_id' => $statusId
        ]);

        $event->update(['status_id' => $statusId]);

        return $event->load(['category', 'locations']);
    }

    /**
     * Toggle event featured status.
     */
    public function toggleFeaturedStatus(Event $event): Event
    {
        $newStatus = !$event->is_featured;
        
        Log::info('Toggling event featured status', [
            'event_id' => $event->id,
            'new_featured_status' => $newStatus
        ]);

        $event->update(['is_featured' => $newStatus]);

        return $event->load(['category', 'locations']);
    }

    /**
     * Duplicate an event.
     */
    public function duplicateEvent(Event $event, array $overrides = []): Event
    {
        return DB::transaction(function () use ($event, $overrides) {
            Log::info('Duplicating event', ['original_event_id' => $event->id]);

            // Prepare data for duplication
            $data = $event->toArray();
            
            // Remove non-duplicatable fields
            unset($data['id'], $data['created_at'], $data['updated_at']);
            
            // Apply overrides
            $data = array_merge($data, $overrides);
            
            // Set as draft by default
            $draftStatus = EventStatus::where('status_code', 'draft')->first();
            $data['status_id'] = $data['status_id'] ?? $draftStatus?->id;
            
            // Reset approval-related fields for the duplicate
            $data['created_by'] = null;
            $data['approved_by'] = null;
            $data['approved_at'] = null;
            $data['approval_comments'] = null;
            $data['approval_history'] = [];
            
            // Create new event
            $newEvent = Event::create($data);

            // Location relationships are now handled by location_text field
            // No need to sync location relationships

            Log::info('Event duplicated successfully', [
                'original_event_id' => $event->id,
                'new_event_id' => $newEvent->id
            ]);

            return $newEvent->load(['category']);
        });
    }

    /**
     * Get events by date range.
     */
    public function getEventsByDateRange(string $startDate, string $endDate): Collection
    {
        return Event::with(['category'])
                   ->dateRange($startDate, $endDate)
                   ->published()
                   ->orderBy('start_date', 'asc')
                   ->get();
    }

    /**
     * Get upcoming events.
     */
    public function getUpcomingEvents(int $limit = 10): Collection
    {
        return Event::with(['category', 'locations'])
                   ->where('start_date', '>', now())
                   ->published()
                   ->orderBy('start_date', 'asc')
                   ->limit($limit)
                   ->get();
    }

    /**
     * Get featured events.
     */
    public function getFeaturedEvents(int $limit = 5): Collection
    {
        return Event::with(['category', 'locations'])
                   ->featured()
                   ->published()
                   ->orderBy('start_date', 'asc')
                   ->limit($limit)
                   ->get();
    }

    /**
     * Get events statistics.
     */
    public function getEventStatistics(): array
    {
        $total = Event::count();
        $published = Event::published()->count();
        $draft = Event::draft()->count();
        $cancelled = Event::cancelled()->count();
        $upcoming = Event::where('start_date', '>', now())->published()->count();
        $featured = Event::featured()->count();

        return [
            'total' => $total,
            'published' => $published,
            'draft' => $draft,
            'cancelled' => $cancelled,
            'upcoming' => $upcoming,
            'featured' => $featured,
        ];
    }

    /**
     * Sync event locations with pivot data.
     * 
     * @param Event $event
     * @param array $locationIds Array of location IDs or associative array with pivot data
     */
    private function syncEventLocations(Event $event, array $locationIds): void
    {
        // Validate that all locations belong to the same entity
        if (!empty($locationIds)) {
            $validLocationIds = is_array(reset($locationIds)) 
                ? array_keys($locationIds) 
                : $locationIds;

            $validLocations = Location::whereIn('id', $validLocationIds)
                                    ->where('entity_id', $event->entity_id)
                                    ->pluck('id')
                                    ->toArray();

            if (count($validLocationIds) !== count($validLocations)) {
                throw new \InvalidArgumentException('Some locations do not belong to the same organization as the event.');
            }
        }

        // Sync with pivot data if provided
        $event->locations()->sync($locationIds);

        Log::info('Event locations synced', [
            'event_id' => $event->id,
            'location_count' => count($locationIds)
        ]);
    }

    /**
     * Validate event dates.
     */
    private function validateEventDates(array $data): void
    {
        if (isset($data['start_date']) && isset($data['end_date'])) {
            $startDate = new \DateTime($data['start_date']);
            $endDate = new \DateTime($data['end_date']);

            if ($startDate >= $endDate) {
                throw new \InvalidArgumentException('Event end date must be after start date.');
            }
        }
    }

    /**
     * Validate event type and locations consistency.
     */
    private function validateEventTypeConsistency(int $typeId, array $locationIds): void
    {
        $eventType = \App\Models\EventType::find($typeId);
        $typeCode = $eventType?->type_code;
        
        if ($typeCode === 'sede_unica' && count($locationIds) > 1) {
            throw new \InvalidArgumentException('Single location events can only have one location.');
        }

        if ($typeCode === 'multi_sede' && count($locationIds) <= 1) {
            throw new \InvalidArgumentException('Multi-location events must have more than one location.');
        }
    }

    // ==========================================
    // APPROVAL WORKFLOW METHODS
    // ==========================================

    /**
     * Determine the initial status for a new event based on user role and organization confidence.
     */
    private function determineInitialStatus(User $user): ?int
    {
        $organizationConfidence = $user->organization->confidence_level ?? 'medium';
        $userRole = $user->role?->role_code;

        switch ($userRole) {
            case 'platform_admin':
            case 'entity_admin':
                // Admins can publish directly for high confidence orgs
                $statusCode = $organizationConfidence === 'high' 
                    ? 'published' 
                    : 'approved_internal';
                break;

            case 'entity_manager':
                // Managers get internal approval automatically
                $statusCode = 'approved_internal';
                break;

            case 'entity_editor':
            default:
                // Editors and others need internal approval
                $statusCode = 'pending_internal_approval';
        }
        
        return EventStatus::where('status_code', $statusCode)->first()?->id;
    }

    /**
     * Check if a user should auto-approve internally.
     */
    private function shouldAutoApproveInternally(User $user): bool
    {
        $roleCode = $user->role?->role_code;
        return in_array($roleCode, ['platform_admin', 'entity_admin', 'entity_manager']);
    }

    /**
     * Automatically approve an event internally.
     */
    private function autoApproveInternally(Event $event, User $user): void
    {
        $approvedInternalStatus = EventStatus::where('status_code', 'approved_internal')->first();
        
        $event->update([
            'status_id' => $approvedInternalStatus?->id,
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        $event->addApprovalHistoryEntry('auto_approved_internal', $user->id, 'Automatically approved internally due to user privileges');
        $event->save();
    }

    /**
     * Check if an update requires re-approval.
     */
    private function updateRequiresReApproval(Event $event, array $data, User $user): bool
    {
        $roleCode = $user->role?->role_code;
        
        // Admins can update without re-approval
        if (in_array($roleCode, ['platform_admin', 'entity_admin'])) {
            return false;
        }

        // If event is not approved yet, no re-approval needed
        $statusCode = $event->status?->status_code;
        if (!in_array($statusCode, ['approved_internal', 'published'])) {
            return false;
        }

        // Check if critical fields are being changed
        $criticalFields = ['title', 'description', 'start_date', 'end_date', 'type_id', 'category_id'];
        
        foreach ($criticalFields as $field) {
            if (isset($data[$field]) && $data[$field] != $event->$field) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine status after an update that requires re-approval.
     */
    private function determineStatusAfterUpdate(Event $event, User $user): ?int
    {
        $statusCode = $event->status?->status_code;
        $roleCode = $user->role?->role_code;
        
        // If was published, go back to internal approval
        if ($statusCode === 'published') {
            $newStatusCode = $roleCode === 'entity_manager' 
                ? 'approved_internal' 
                : 'pending_internal_approval';
            
            return EventStatus::where('status_code', $newStatusCode)->first()?->id;
        }

        // Otherwise, use the same logic as initial status
        return $this->determineInitialStatus($user);
    }

    /**
     * Approve an event for internal use.
     */
    public function approveForInternal(Event $event, User $user, ?string $comment = null): Event
    {
        $statusCode = $event->status?->status_code;
        if (!in_array($statusCode, ['pending_internal_approval', 'requires_changes'])) {
            throw new \InvalidArgumentException('Event cannot be approved internally in its current status.');
        }
        
        $roleCode = $user->role?->role_code;
        if (!in_array($roleCode, ['platform_admin', 'entity_admin', 'entity_manager'])) {
            throw new \RuntimeException('User does not have permission to approve internally.');
        }

        return DB::transaction(function () use ($event, $user, $comment) {
            $approvedInternalStatus = EventStatus::where('status_code', 'approved_internal')->first();
            
            $event->update([
                'status_id' => $approvedInternalStatus?->id,
                'approved_by' => $user->id,
                'approved_at' => now(),
                'approval_comments' => $comment,
            ]);

            $event->addApprovalHistoryEntry('approved_internal', $user->id, $comment);
            $event->save();

            Log::info('Event approved internally', [
                'event_id' => $event->id,
                'approved_by' => $user->id
            ]);

            return $event->load(['creator', 'approver']);
        });
    }

    /**
     * Request public approval for an internally approved event.
     */
    public function requestPublicApproval(Event $event, User $user, ?string $comment = null): Event
    {
        $statusCode = $event->status?->status_code;
        if ($statusCode !== 'approved_internal') {
            throw new \InvalidArgumentException('Event cannot request public approval in its current status.');
        }

        return DB::transaction(function () use ($event, $user, $comment) {
            $pendingPublicStatus = EventStatus::where('status_code', 'pending_public_approval')->first();
            
            $event->update([
                'status_id' => $pendingPublicStatus?->id,
                'approval_comments' => $comment,
            ]);

            $event->addApprovalHistoryEntry('requested_public_approval', $user->id, $comment);
            $event->save();

            Log::info('Public approval requested for event', [
                'event_id' => $event->id,
                'requested_by' => $user->id
            ]);

            return $event->load(['creator', 'approver']);
        });
    }

    /**
     * Approve an event for public publication.
     */
    public function approveForPublic(Event $event, User $user, ?string $comment = null): Event
    {
        $statusCode = $event->status?->status_code;
        if ($statusCode !== 'pending_public_approval') {
            throw new \InvalidArgumentException('Event cannot be approved for public in its current status.');
        }
        
        $roleCode = $user->role?->role_code;
        if (!in_array($roleCode, ['platform_admin', 'entity_admin'])) {
            throw new \RuntimeException('Only admins can approve events for public publication.');
        }

        return DB::transaction(function () use ($event, $user, $comment) {
            $publishedStatus = EventStatus::where('status_code', 'published')->first();
            
            $event->update([
                'status_id' => $publishedStatus?->id,
                'approved_by' => $user->id,
                'approved_at' => now(),
                'approval_comments' => $comment,
            ]);

            $event->addApprovalHistoryEntry('approved_public', $user->id, $comment);
            $event->save();

            Log::info('Event approved for public publication', [
                'event_id' => $event->id,
                'approved_by' => $user->id
            ]);

            return $event->load(['creator', 'approver']);
        });
    }

    /**
     * Request changes to an event.
     */
    public function requestChanges(Event $event, User $user, string $comment): Event
    {
        $roleCode = $user->role?->role_code;
        if (!in_array($roleCode, ['platform_admin', 'entity_admin', 'entity_manager'])) {
            throw new \RuntimeException('User does not have permission to request changes.');
        }

        return DB::transaction(function () use ($event, $user, $comment) {
            $requiresChangesStatus = EventStatus::where('status_code', 'requires_changes')->first();
            
            $event->update([
                'status_id' => $requiresChangesStatus?->id,
                'approval_comments' => $comment,
                'approved_by' => null,
                'approved_at' => null,
            ]);

            $event->addApprovalHistoryEntry('requested_changes', $user->id, $comment);
            $event->save();

            Log::info('Changes requested for event', [
                'event_id' => $event->id,
                'requested_by' => $user->id
            ]);

            return $event->load(['creator', 'approver']);
        });
    }

    /**
     * Reject an event.
     */
    public function rejectEvent(Event $event, User $user, string $comment): Event
    {
        $roleCode = $user->role?->role_code;
        if (!in_array($roleCode, ['platform_admin', 'entity_admin', 'entity_manager'])) {
            throw new \RuntimeException('User does not have permission to reject events.');
        }

        return DB::transaction(function () use ($event, $user, $comment) {
            $rejectedStatus = EventStatus::where('status_code', 'rejected')->first();
            
            $event->update([
                'status_id' => $rejectedStatus?->id,
                'approval_comments' => $comment,
                'approved_by' => null,
                'approved_at' => null,
            ]);

            $event->addApprovalHistoryEntry('rejected', $user->id, $comment);
            $event->save();

            Log::info('Event rejected', [
                'event_id' => $event->id,
                'rejected_by' => $user->id
            ]);

            return $event->load(['creator', 'approver']);
        });
    }

    /**
     * Get events by approval status for workflow management.
     */
    public function getEventsByApprovalStatus(string $statusCode, array $filters = []): LengthAwarePaginator
    {
        $status = EventStatus::where('status_code', $statusCode)->first();
        
        $query = Event::with(['category', 'locations', 'creator', 'approver'])
                      ->where('status_id', $status?->id);

        // Apply additional filters
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['category_id'])) {
            $query->byCategory($filters['category_id']);
        }

        if (!empty($filters['created_by'])) {
            $query->where('created_by', $filters['created_by']);
        }

        $query->orderBy('created_at', 'desc');

        $perPage = $filters['per_page'] ?? 15;
        return $query->paginate($perPage);
    }

    /**
     * Get approval workflow statistics.
     */
    public function getApprovalStatistics(): array
    {
        $stats = [];
        $statusCodes = [
            'pending_internal_approval',
            'approved_internal', 
            'pending_public_approval',
            'published',
            'requires_changes',
            'rejected',
            'draft',
            'cancelled'
        ];
        
        foreach ($statusCodes as $statusCode) {
            $status = EventStatus::where('status_code', $statusCode)->first();
            $stats[$statusCode] = Event::where('status_id', $status?->id)->count();
        }
        
        return $stats;
    }
}
