<?php

use App\Http\Controllers\Api\V1\AdminAppearanceController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EventApprovalController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\PublicEventController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->group(function () {
    // Authentication
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Events - specific routes first, then resource routes
        Route::get('events/statistics', [EventController::class, 'statistics']);
        Route::patch('events/{id}/toggle-featured', [EventController::class, 'toggleFeatured']);

        // Event Approval Workflow Routes
        Route::patch('events/{id}/approve', [EventController::class, 'approve']);
        Route::patch('events/{id}/request-public', [EventController::class, 'requestPublicApproval']);
        Route::patch('events/{id}/publish', [EventController::class, 'publish']);
        Route::patch('events/{id}/request-changes', [EventController::class, 'requestChanges']);
        Route::patch('events/{id}/reject', [EventController::class, 'reject']);

        // Legacy approval routes (keep for backward compatibility)
        Route::get('events/approval/statistics', [EventApprovalController::class, 'getApprovalStatistics']);
        Route::post('events/{event}/approve', [EventApprovalController::class, 'approve']);
        Route::post('events/{event}/reject', [EventApprovalController::class, 'reject']);
        Route::post('events/{event}/request-changes', [EventApprovalController::class, 'requestChanges']);

        Route::apiResource('events', EventController::class);

        // Categories - specific routes first, then resource routes
        Route::get('categories/active', [CategoryController::class, 'active']);
        Route::apiResource('categories', CategoryController::class);

        // Locations - specific routes first, then resource routes
        Route::get('locations/active', [LocationController::class, 'active']);
        Route::apiResource('locations', LocationController::class);

        // Dashboard (Entity Admin/Staff only)
        Route::prefix('dashboard')->group(function () {
            Route::get('events/summary', [DashboardController::class, 'eventsSummary']);
            Route::get('events', [DashboardController::class, 'events']);
        });

        // Event Detail (for dashboard modal)
        Route::get('events/{id}/detail', [DashboardController::class, 'eventDetail']);

        // Admin
        Route::prefix('admin')->group(function () {
            Route::apiResource('appearance', AdminAppearanceController::class);
        });
    });

    // Public routes (no authentication required)
    Route::prefix('public')->group(function () {
        // Events
        Route::get('events', [PublicEventController::class, 'index']);
        Route::get('events/upcoming', [PublicEventController::class, 'upcoming']);
        Route::get('events/featured', [PublicEventController::class, 'featured']);
        Route::get('events/search', [PublicEventController::class, 'search']);
        Route::get('events/calendar/{year}/{month}', [PublicEventController::class, 'calendarMonth']);
        Route::get('events/date-range', [PublicEventController::class, 'dateRange']);
        Route::get('events/category/{categoryId}', [PublicEventController::class, 'byCategory']);
        Route::get('events/{id}', [PublicEventController::class, 'show']);
        
        // Categories
        Route::get('categories', [PublicEventController::class, 'categories']);
    });

    // Legacy public routes (keep for backward compatibility)
    Route::get('events/public', [EventController::class, 'publicIndex']);
    Route::get('categories/public', [CategoryController::class, 'publicIndex']);
});
