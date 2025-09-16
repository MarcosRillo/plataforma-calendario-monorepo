<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        // Debug logging
        Log::info('RoleMiddleware received roles parameter', [
            'roles_raw' => $roles,
            'roles_type' => gettype($roles),
        ]);

        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        $allowedRoles = explode('|', $roles);

        Log::info('RoleMiddleware processing', [
            'user_role' => $user->role,
            'allowed_roles' => $allowedRoles,
            'roles_string' => $roles
        ]);

        // Check if user has one of the required roles
        if (!in_array($user->role, $allowedRoles)) {
            Log::warning('Access denied in RoleMiddleware', [
                'user_role' => $user->role,
                'allowed_roles' => $allowedRoles,
                'original_roles_string' => $roles
            ]);
            
            return response()->json([
                'message' => 'Access denied. Insufficient privileges.',
                'required_roles' => $allowedRoles,
                'user_role' => $user->role
            ], 403);
        }

        Log::info('Access granted in RoleMiddleware');
        return $next($request);
    }
}
