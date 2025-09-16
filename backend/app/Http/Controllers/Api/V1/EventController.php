<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\EventService;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Http\Resources\EventResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Events",
 *     description="Event management endpoints"
 * )
 */
class EventController extends Controller
{
    /**
     * Event service instance.
     */
    public function __construct(
        protected EventService $eventService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/events",
     *     summary="Get paginated list of events",
     *     tags={"Events"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, default=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, maximum=100, default=15)
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search term for filtering events",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by status",
     *         required=false,
     *         @OA\Schema(
     *             type="string",
     *             enum={"draft", "pending_internal_approval", "approved_internal", "pending_public_approval", "published", "requires_changes", "rejected", "cancelled"}
     *         )
     *     ),
     *     @OA\Parameter(
     *         name="type",
     *         in="query",
     *         description="Filter by event type",
     *         required=false,
     *         @OA\Schema(type="string", enum={"single_location", "multi_location", "virtual", "hybrid"})
     *     ),
     *     @OA\Parameter(
     *         name="category_id",
     *         in="query",
     *         description="Filter by category ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Filter by start date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="Filter by end date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="is_featured",
     *         in="query",
     *         description="Filter by featured status",
     *         required=false,
     *         @OA\Schema(type="boolean")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Events retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Event")),
     *             @OA\Property(property="current_page", type="integer", example=1),
     *             @OA\Property(property="last_page", type="integer", example=5),
     *             @OA\Property(property="per_page", type="integer", example=15),
     *             @OA\Property(property="total", type="integer", example=75)
     *         )
     *     )
     * )
     */
    public function index(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $filters = $request->only([
            'search', 'status', 'type', 'category_id', 
            'start_date', 'end_date', 'is_featured', 'per_page'
        ]);
        
        $events = $this->eventService->getEvents($filters);

        return EventResource::collection($events);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/events",
     *     summary="Create a new event",
     *     tags={"Events"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "description", "start_date", "end_date", "type", "category_id"},
     *             @OA\Property(property="title", type="string", example="Marketing Workshop"),
     *             @OA\Property(property="description", type="string", example="Learn advanced marketing strategies"),
     *             @OA\Property(property="start_date", type="string", format="date-time", example="2025-09-15 09:00:00"),
     *             @OA\Property(property="end_date", type="string", format="date-time", example="2025-09-15 17:00:00"),
     *             @OA\Property(property="type", type="string", enum={"single_location", "multi_location", "virtual", "hybrid"}),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="location_ids", type="array", @OA\Items(type="integer"), example={1, 2}),
     *             @OA\Property(property="max_capacity", type="integer", example=50),
     *             @OA\Property(property="registration_required", type="boolean", example=true),
     *             @OA\Property(property="registration_deadline", type="string", format="date-time", example="2025-09-10 23:59:59"),
     *             @OA\Property(property="contact_email", type="string", format="email", example="events@example.com"),
     *             @OA\Property(property="contact_phone", type="string", example="+1234567890"),
     *             @OA\Property(property="website_url", type="string", format="url", example="https://example.com/event"),
     *             @OA\Property(property="image_url", type="string", format="url", example="https://example.com/image.jpg"),
     *             @OA\Property(property="cta_text", type="string", example="Register Now"),
     *             @OA\Property(property="cta_link", type="string", format="url", example="https://example.com/register"),
     *             @OA\Property(property="is_featured", type="boolean", example=false),
     *             @OA\Property(property="tags", type="array", @OA\Items(type="string"), example={"workshop", "marketing"}),
     *             @OA\Property(property="notes", type="string", example="Internal notes about the event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Event created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event created successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function store(StoreEventRequest $request): JsonResponse
    {
        $user = Auth::user();
        $event = $this->eventService->createEvent($request->validated(), $user);

        return response()->json([
            'message' => 'Event created successfully',
            'data' => new EventResource($event)
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/events/{id}",
     *     summary="Get a specific event",
     *     tags={"Events"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Event ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Event retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event not found")
     *         )
     *     )
     * )
     */
    public function show(string $id): JsonResponse
    {
        $event = $this->eventService->getEvent((int) $id);

        return response()->json([
            'data' => new EventResource($event)
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/events/{id}",
     *     summary="Update an existing event",
     *     tags={"Events"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Event ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string", example="Updated Marketing Workshop"),
     *             @OA\Property(property="description", type="string", example="Updated description"),
     *             @OA\Property(property="start_date", type="string", format="date-time", example="2025-09-15 09:00:00"),
     *             @OA\Property(property="end_date", type="string", format="date-time", example="2025-09-15 17:00:00"),
     *             @OA\Property(property="type", type="string", enum={"single_location", "multi_location", "virtual", "hybrid"}),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="location_ids", type="array", @OA\Items(type="integer"), example={1, 2}),
     *             @OA\Property(property="max_capacity", type="integer", example=50),
     *             @OA\Property(property="registration_required", type="boolean", example=true),
     *             @OA\Property(property="registration_deadline", type="string", format="date-time", example="2025-09-10 23:59:59"),
     *             @OA\Property(property="contact_email", type="string", format="email", example="events@example.com"),
     *             @OA\Property(property="contact_phone", type="string", example="+1234567890"),
     *             @OA\Property(property="website_url", type="string", format="url", example="https://example.com/event"),
     *             @OA\Property(property="image_url", type="string", format="url", example="https://example.com/image.jpg"),
     *             @OA\Property(property="cta_text", type="string", example="Register Now"),
     *             @OA\Property(property="cta_link", type="string", format="url", example="https://example.com/register"),
     *             @OA\Property(property="is_featured", type="boolean", example=false),
     *             @OA\Property(property="tags", type="array", @OA\Items(type="string"), example={"workshop", "marketing"}),
     *             @OA\Property(property="notes", type="string", example="Internal notes about the event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Event updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event updated successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function update(UpdateEventRequest $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $event = $this->eventService->getEvent((int) $id);
        $updatedEvent = $this->eventService->updateEvent($event, $request->validated(), $user);

        return response()->json([
            'message' => 'Event updated successfully',
            'data' => new EventResource($updatedEvent)
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/events/{id}",
     *     summary="Delete an event",
     *     tags={"Events"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Event ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Event deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event not found")
     *         )
     *     )
     * )
     */
    public function destroy(string $id): JsonResponse
    {
        $event = $this->eventService->getEvent((int) $id);
        $this->eventService->deleteEvent($event);

        return response()->json([
            'message' => 'Event deleted successfully'
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/events/{id}/duplicate",
     *     summary="Duplicate an existing event",
     *     tags={"Events"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Event ID to duplicate",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string", example="Copy of Marketing Workshop"),
     *             @OA\Property(property="start_date", type="string", format="date-time", example="2025-10-15 09:00:00"),
     *             @OA\Property(property="end_date", type="string", format="date-time", example="2025-10-15 17:00:00")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Event duplicated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event duplicated successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event not found")
     *         )
     *     )
     * )
     */
    public function duplicate(Request $request, string $id): JsonResponse
    {
        $event = $this->eventService->getEvent((int) $id);
        $overrides = $request->only(['title', 'start_date', 'end_date', 'description']);
        
        $duplicatedEvent = $this->eventService->duplicateEvent($event, $overrides);

        return response()->json([
            'message' => 'Event duplicated successfully',
            'data' => new EventResource($duplicatedEvent)
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/events/statistics",
     *     summary="Get event statistics",
     *     tags={"Events"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Event statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="total", type="integer", example=100),
     *             @OA\Property(property="published", type="integer", example=75),
     *             @OA\Property(property="draft", type="integer", example=15),
     *             @OA\Property(property="cancelled", type="integer", example=5),
     *             @OA\Property(property="upcoming", type="integer", example=45),
     *             @OA\Property(property="featured", type="integer", example=10)
     *         )
     *     )
     * )
     */
    public function statistics(): JsonResponse
    {
        $statistics = $this->eventService->getEventStatistics();

        return response()->json($statistics);
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/events/{id}/toggle-featured",
     *     summary="Toggle event featured status",
     *     tags={"Events"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Event ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Featured status toggled successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Featured status updated successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event not found")
     *         )
     *     )
     * )
     */
    public function toggleFeatured(string $id): JsonResponse
    {
        $event = $this->eventService->getEvent((int) $id);
        $updatedEvent = $this->eventService->toggleFeaturedStatus($event);

        return response()->json([
            'message' => 'Featured status updated successfully',
            'data' => new EventResource($updatedEvent)
        ]);
    }
}
