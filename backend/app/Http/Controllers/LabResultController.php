<?php

namespace App\Http\Controllers;

use App\Models\LabResult;
use App\Models\LabRequestItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class LabResultController extends Controller
{
    /**
     * Display a listing of lab results.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = LabResult::with(['labRequestItem.labRequest.patient', 'labRequestItem.labTest', 'verifier']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('lab_request_item_id')) {
                $query->where('lab_request_item_id', $request->lab_request_item_id);
            }

            if ($request->has('verified')) {
                if ($request->verified === 'true') {
                    $query->verified();
                } else {
                    $query->unverified();
                }
            }

            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('parameter_name', 'like', "%{$search}%")
                      ->orWhere('result_value', 'like', "%{$search}%")
                      ->orWhereHas('labRequestItem.labRequest.patient', function ($patientQuery) use ($search) {
                          $patientQuery->where('name', 'like', "%{$search}%");
                      });
                });
            }

            $results = $query->orderBy('created_at', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load lab results',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created lab result.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'lab_request_item_id' => 'required|exists:lab_request_items,id',
            'parameter_name' => 'required|string|max:255',
            'result_value' => 'nullable|string',
            'unit' => 'nullable|string|max:255',
            'normal_range' => 'nullable|string',
            'status' => 'required|in:normal,abnormal,critical',
            'comments' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = LabResult::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Lab result created successfully',
                'data' => $result->load(['labRequestItem.labRequest.patient', 'labRequestItem.labTest'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create lab result',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified lab result.
     */
    public function show(LabResult $labResult): JsonResponse
    {
        $labResult->load(['labRequestItem.labRequest.patient', 'labRequestItem.labTest', 'verifier']);

        return response()->json([
            'success' => true,
            'data' => $labResult
        ]);
    }

    /**
     * Update the specified lab result.
     */
    public function update(Request $request, LabResult $labResult): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'parameter_name' => 'sometimes|required|string|max:255',
            'result_value' => 'nullable|string',
            'unit' => 'nullable|string|max:255',
            'normal_range' => 'nullable|string',
            'status' => 'sometimes|in:normal,abnormal,critical',
            'comments' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $labResult->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Lab result updated successfully',
                'data' => $labResult->load(['labRequestItem.labRequest.patient', 'labRequestItem.labTest', 'verifier'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update lab result',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified lab result.
     */
    public function destroy(LabResult $labResult): JsonResponse
    {
        try {
            // Check if result is already verified
            if ($labResult->isVerified()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete verified lab result'
                ], 400);
            }

            $labResult->delete();

            return response()->json([
                'success' => true,
                'message' => 'Lab result deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete lab result',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify lab result.
     */
    public function verify(Request $request, LabResult $labResult): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'comments' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $labResult->update([
                'verified_by' => auth()->id(),
                'verified_at' => now(),
                'comments' => $request->comments ?? $labResult->comments
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Lab result verified successfully',
                'data' => $labResult->load(['labRequestItem.labRequest.patient', 'labRequestItem.labTest', 'verifier'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify lab result',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk create lab results for a request item.
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'lab_request_item_id' => 'required|exists:lab_request_items,id',
            'results' => 'required|array|min:1',
            'results.*.parameter_name' => 'required|string|max:255',
            'results.*.result_value' => 'nullable|string',
            'results.*.unit' => 'nullable|string|max:255',
            'results.*.normal_range' => 'nullable|string',
            'results.*.status' => 'required|in:normal,abnormal,critical',
            'results.*.comments' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $results = [];
            foreach ($request->results as $resultData) {
                $resultData['lab_request_item_id'] = $request->lab_request_item_id;
                $results[] = LabResult::create($resultData);
            }

            return response()->json([
                'success' => true,
                'message' => 'Lab results created successfully',
                'data' => $results
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create lab results',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lab result analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'total_results' => LabResult::where('created_at', '>=', $startDate)->count(),
                'normal_results' => LabResult::where('created_at', '>=', $startDate)->normal()->count(),
                'abnormal_results' => LabResult::where('created_at', '>=', $startDate)->abnormal()->count(),
                'critical_results' => LabResult::where('created_at', '>=', $startDate)->critical()->count(),
                'verified_results' => LabResult::where('created_at', '>=', $startDate)->verified()->count(),
                'unverified_results' => LabResult::where('created_at', '>=', $startDate)->unverified()->count(),
                'verification_rate' => LabResult::where('created_at', '>=', $startDate)->count() > 0 
                    ? (LabResult::where('created_at', '>=', $startDate)->verified()->count() / LabResult::where('created_at', '>=', $startDate)->count()) * 100 
                    : 0,
                'daily_results' => LabResult::where('created_at', '>=', $startDate)
                    ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
