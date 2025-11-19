<?php

namespace App\Http\Controllers;

use App\Models\AnalyticsEvent;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get analytics dashboard data
     */
    public function getDashboardData(Request $request): JsonResponse
    {
        try {
            $data = $this->analyticsService->getDashboardAnalytics($request->all());
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch analytics data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get patient analytics
     */
    public function getPatientAnalytics(Request $request): JsonResponse
    {
        try {
            $data = $this->analyticsService->getPatientAnalytics($request->all());
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch patient analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get financial analytics
     */
    public function getFinancialAnalytics(Request $request): JsonResponse
    {
        try {
            $data = $this->analyticsService->getFinancialAnalytics($request->all());
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch financial analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get operational analytics
     */
    public function getOperationalAnalytics(Request $request): JsonResponse
    {
        try {
            $data = $this->analyticsService->getOperationalAnalytics($request->all());
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch operational analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Track analytics event
     */
    public function trackEvent(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'event_type' => 'required|string|max:255',
            'event_name' => 'required|string|max:255',
            'event_data' => 'nullable|array',
            'session_id' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $event = $this->analyticsService->trackEvent($request->all());
            return response()->json([
                'success' => true,
                'data' => $event
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get custom analytics report
     */
    public function getCustomReport(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'report_type' => 'required|string',
            'date_range' => 'required|array',
            'filters' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $this->analyticsService->generateCustomReport($request->all());
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate custom report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get real-time analytics
     */
    public function getRealTimeAnalytics(): JsonResponse
    {
        try {
            $data = $this->analyticsService->getRealTimeAnalytics();
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch real-time analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
