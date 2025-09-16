<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventStatus;
use App\Models\User;
use App\Services\EventService;
use App\Http\Resources\EventResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

/**
 * @OA\Tag(
 *     name="Event Approval",
 *     description="Event approval workflow management endpoints"
 * )
 */
class EventApprovalController extends Controller
{
    /**
     * Event service instance.
     */
    public function __construct(
        protected EventService $eventService
    ) {}

    /**
     * @OA\Post(
     *     path="/api/v1/events/{event}/approve",
     *     summary="Approve event (unified endpoint that determines workflow automatically)",
     *     tags={"Event Approval"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="event",
     *         in="path",
     *         description="Event ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="comments", type="string", description="Optional approval comments", example="Event approved after review")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Event approved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Evento aprobado exitosamente"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="event_id", type="integer", example=3),
     *                 @OA\Property(property="previous_status", type="string", example="pending_internal_approval"),
     *                 @OA\Property(property="new_status", type="string", example="approved_internal"),
     *                 @OA\Property(property="action_by", type="string", example="Ana García"),
     *                 @OA\Property(property="comments", type="string", example="Event approved after review")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Permission denied",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function approve(Request $request, Event $event): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();
            $comments = $request->input('comments');

            // Get current status to determine appropriate workflow action
            $previousStatus = $event->status->status_code;

            // Determine the appropriate approval action based on current status
            switch ($previousStatus) {
                case 'pending_internal_approval':
                    $approvedEvent = $this->eventService->approveForInternal($event, $user, $comments);
                    $newStatus = 'approved_internal';
                    $message = 'Evento aprobado internamente exitosamente';
                    break;

                case 'approved_internal':
                    // From approved_internal, next step is to request public approval
                    $approvedEvent = $this->eventService->requestPublicApproval($event, $user, $comments);
                    $newStatus = 'pending_public_approval';
                    $message = 'Solicitud de aprobación pública enviada exitosamente';
                    break;

                case 'pending_public_approval':
                    $approvedEvent = $this->eventService->approveForPublic($event, $user, $comments);
                    $newStatus = 'published';
                    $message = 'Evento aprobado para publicación exitosamente';
                    break;

                default:
                    throw new \InvalidArgumentException('El evento no puede ser aprobado en su estado actual: ' . $previousStatus);
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'event_id' => $event->id,
                    'previous_status' => $previousStatus,
                    'new_status' => $newStatus,
                    'action_by' => $user->name,
                    'comments' => $comments,
                ]
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado',
                'error' => $e->getMessage()
            ], 403);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Operación inválida',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/v1/events/{event}/approve-internal",
     *     summary="Approve event for internal use",
     *     tags={"Event Approval"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="event",
     *         in="path",
     *         description="Event ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="comment", type="string", description="Optional approval comment", example="Event looks good for internal publication")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Event approved internally",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event approved internally successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Event cannot be approved internally",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event cannot be approved internally in its current status"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Insufficient permissions",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="User does not have permission to approve internally"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function approveInternal(Request $request, Event $event): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();
            $comment = $request->input('comment');

            $approvedEvent = $this->eventService->approveForInternal($event, $user, $comment);

            return response()->json([
                'message' => 'Event approved internally successfully',
                'data' => new EventResource($approvedEvent)
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => 'Permission denied',
                'error' => $e->getMessage()
            ], 403);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => 'Invalid operation',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/v1/events/{event}/request-public",
     *     summary="Request public approval for an internally approved event",
     *     tags={"Event Approval"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="event",
     *         in="path",
     *         description="Event ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="comment", type="string", description="Optional request comment", example="Ready for public publication")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Public approval requested successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Public approval requested successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Event cannot request public approval",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event cannot request public approval in its current status"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function requestPublic(Request $request, Event $event): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();
            $comment = $request->input('comment');

            $updatedEvent = $this->eventService->requestPublicApproval($event, $user, $comment);

            return response()->json([
                'message' => 'Public approval requested successfully',
                'data' => new EventResource($updatedEvent)
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => 'Invalid operation',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/v1/events/{event}/approve-public",
     *     summary="Approve event for public publication",
     *     tags={"Event Approval"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="event",
     *         in="path",
     *         description="Event ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="comment", type="string", description="Optional approval comment", example="Approved for public publication")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Event approved for public publication",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event approved for public publication successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Event cannot be approved for public",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Event cannot be approved for public in its current status"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Insufficient permissions",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Only admins can approve events for public publication"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function approvePublic(Request $request, Event $event): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();
            $comment = $request->input('comment');

            $approvedEvent = $this->eventService->approveForPublic($event, $user, $comment);

            return response()->json([
                'message' => 'Event approved for public publication successfully',
                'data' => new EventResource($approvedEvent)
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => 'Permission denied',
                'error' => $e->getMessage()
            ], 403);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => 'Invalid operation',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/v1/events/{event}/request-changes",
     *     summary="Request changes to an event",
     *     tags={"Event Approval"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="event",
     *         in="path",
     *         description="Event ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"reason"},
     *             @OA\Property(property="reason", type="string", description="Required detailed description of what changes are needed", example="Please update the event description with more details and add location information"),
     *             @OA\Property(property="comments", type="string", description="Optional additional comments", example="Contact us if you need clarification")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Changes requested successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Cambios solicitados exitosamente"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="event_id", type="integer", example=3),
     *                 @OA\Property(property="previous_status", type="string", example="pending_internal_approval"),
     *                 @OA\Property(property="new_status", type="string", example="requires_changes"),
     *                 @OA\Property(property="action_by", type="string", example="Ana García"),
     *                 @OA\Property(property="reason", type="string", example="Please update description"),
     *                 @OA\Property(property="comments", type="string", example="Additional comments")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="The reason field is required"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Insufficient permissions",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="User does not have permission to request changes"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function requestChanges(Request $request, Event $event): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:20|max:1000',
            'comments' => 'nullable|string|max:1000'
        ]);

        try {
            /** @var User $user */
            $user = Auth::user();
            $reason = $request->input('reason');
            $comments = $request->input('comments');

            // Get previous status
            $previousStatus = $event->status->status_code;

            // Use reason as the comment for the service (maintaining backward compatibility)
            $updatedEvent = $this->eventService->requestChanges($event, $user, $reason);

            return response()->json([
                'success' => true,
                'message' => 'Cambios solicitados exitosamente',
                'data' => [
                    'event_id' => $event->id,
                    'previous_status' => $previousStatus,
                    'new_status' => 'requires_changes',
                    'action_by' => $user->name,
                    'reason' => $reason,
                    'comments' => $comments,
                ]
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado',
                'error' => $e->getMessage()
            ], 403);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/v1/events/{event}/reject",
     *     summary="Reject an event",
     *     tags={"Event Approval"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="event",
     *         in="path",
     *         description="Event ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"reason"},
     *             @OA\Property(property="reason", type="string", description="Required reason explaining why the event is rejected", example="Event does not meet publication standards"),
     *             @OA\Property(property="comments", type="string", description="Optional additional comments", example="Please contact us for clarification")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Event rejected successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Evento rechazado exitosamente"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="event_id", type="integer", example=3),
     *                 @OA\Property(property="previous_status", type="string", example="pending_internal_approval"),
     *                 @OA\Property(property="new_status", type="string", example="rejected"),
     *                 @OA\Property(property="action_by", type="string", example="Ana García"),
     *                 @OA\Property(property="reason", type="string", example="Event does not meet standards"),
     *                 @OA\Property(property="comments", type="string", example="Additional comments")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="The reason field is required"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Insufficient permissions",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="User does not have permission to reject events"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function reject(Request $request, Event $event): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:10|max:1000',
            'comments' => 'nullable|string|max:1000'
        ]);

        try {
            /** @var User $user */
            $user = Auth::user();
            $reason = $request->input('reason');
            $comments = $request->input('comments');

            // Get previous status
            $previousStatus = $event->status->status_code;

            // Use reason as the comment for the service (maintaining backward compatibility)
            $rejectedEvent = $this->eventService->rejectEvent($event, $user, $reason);

            return response()->json([
                'success' => true,
                'message' => 'Evento rechazado exitosamente',
                'data' => [
                    'event_id' => $event->id,
                    'previous_status' => $previousStatus,
                    'new_status' => 'rejected',
                    'action_by' => $user->name,
                    'reason' => $reason,
                    'comments' => $comments,
                ]
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado',
                'error' => $e->getMessage()
            ], 403);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/v1/events/approval-status/{status}",
     *     summary="Get events by approval status",
     *     tags={"Event Approval"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="status",
     *         in="path",
     *         description="Approval status",
     *         required=true,
     *         @OA\Schema(
     *             type="string",
     *             enum={"draft", "pending_internal_approval", "approved_internal", "pending_public_approval", "published", "requires_changes", "rejected", "cancelled"}
     *         )
     *     ),
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
     *         description="Search term",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="category_id",
     *         in="query",
     *         description="Filter by category ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="created_by",
     *         in="query",
     *         description="Filter by creator user ID",
     *         required=false,
     *         @OA\Schema(type="integer")
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
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid status",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Invalid approval status"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function getEventsByStatus(Request $request, string $status): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $request->merge(['status' => $status]);
        
        $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in([
                    'draft',
                    'pending_internal_approval',
                    'approved_internal',
                    'pending_public_approval',
                    'published',
                    'requires_changes',
                    'rejected',
                    'cancelled'
                ])
            ],
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'search' => 'string|max:255',
            'category_id' => 'integer|exists:categories,id',
            'created_by' => 'integer|exists:users,id'
        ]);

        $filters = $request->only(['search', 'category_id', 'created_by', 'per_page']);
        $events = $this->eventService->getEventsByApprovalStatus($status, $filters);

        return EventResource::collection($events);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/events/approval/statistics",
     *     summary="Get approval workflow statistics",
     *     tags={"Event Approval"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Approval statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="pending_internal_approval", type="integer", example=12),
     *             @OA\Property(property="approved_internal", type="integer", example=25),
     *             @OA\Property(property="pending_public_approval", type="integer", example=8),
     *             @OA\Property(property="published", type="integer", example=45),
     *             @OA\Property(property="requires_changes", type="integer", example=3),
     *             @OA\Property(property="rejected", type="integer", example=2),
     *             @OA\Property(property="draft", type="integer", example=15),
     *             @OA\Property(property="cancelled", type="integer", example=1)
     *         )
     *     )
     * )
     */
    public function getApprovalStatistics(): JsonResponse
    {
        $statistics = $this->eventService->getApprovalStatistics();

        return response()->json($statistics);
    }
}
