<?php

namespace App\Http\Controllers;

use App\Models\LabSample;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class LabSampleController extends Controller
{
    /**
     * Display a listing of lab samples.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = LabSample::with(['patient', 'collector', 'receiver']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('sample_type')) {
                $query->where('sample_type', $request->sample_type);
            }

            if ($request->has('patient_id')) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('date_from')) {
                $query->whereDate('collection_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('collection_date', '<=', $request->date_to);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('sample_number', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($patientQuery) use ($search) {
                          $patientQuery->where('name', 'like', "%{$search}%")
                                     ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            $samples = $query->orderBy('collection_date', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $samples
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load lab samples',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created lab sample.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:users,id',
            'sample_type' => 'required|string|max:255',
            'collection_notes' => 'nullable|string',
            'collection_date' => 'required|date',
            'received_date' => 'nullable|date|after_or_equal:collection_date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $sample = LabSample::create([
                'patient_id' => $request->patient_id,
                'sample_number' => LabSample::generateSampleNumber(),
                'sample_type' => $request->sample_type,
                'collection_notes' => $request->collection_notes,
                'collection_date' => $request->collection_date,
                'received_date' => $request->received_date ?? $request->collection_date,
                'collected_by' => auth()->id(),
                'received_by' => $request->received_date ? auth()->id() : null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Lab sample created successfully',
                'data' => $sample->load(['patient', 'collector', 'receiver'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create lab sample',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified lab sample.
     */
    public function show(LabSample $labSample): JsonResponse
    {
        $labSample->load(['patient', 'collector', 'receiver', 'labRequestItems.labRequest', 'labRequestItems.labTest']);

        return response()->json([
            'success' => true,
            'data' => $labSample
        ]);
    }

    /**
     * Update the specified lab sample.
     */
    public function update(Request $request, LabSample $labSample): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sample_type' => 'sometimes|required|string|max:255',
            'collection_notes' => 'nullable|string',
            'collection_date' => 'sometimes|required|date',
            'received_date' => 'nullable|date|after_or_equal:collection_date',
            'status' => 'sometimes|in:collected,received,processing,completed,rejected',
            'rejection_reason' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();

            // Set received_by if status is being changed to received
            if ($request->has('status') && $request->status === 'received' && $labSample->status !== 'received') {
                $data['received_by'] = auth()->id();
                $data['received_date'] = $request->received_date ?? now();
            }

            $labSample->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Lab sample updated successfully',
                'data' => $labSample->load(['patient', 'collector', 'receiver'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update lab sample',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified lab sample.
     */
    public function destroy(LabSample $labSample): JsonResponse
    {
        try {
            // Check if sample is already processing or completed
            if ($labSample->isProcessing() || $labSample->isCompleted()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete lab sample that is processing or completed'
                ], 400);
            }

            $labSample->delete();

            return response()->json([
                'success' => true,
                'message' => 'Lab sample deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete lab sample',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sample types.
     */
    public function getSampleTypes(): JsonResponse
    {
        try {
            $sampleTypes = LabSample::select('sample_type')
                ->distinct()
                ->orderBy('sample_type')
                ->pluck('sample_type');

            return response()->json([
                'success' => true,
                'data' => $sampleTypes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load sample types',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lab sample analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'total_samples' => LabSample::where('collection_date', '>=', $startDate)->count(),
                'collected_samples' => LabSample::where('collection_date', '>=', $startDate)->collected()->count(),
                'received_samples' => LabSample::where('collection_date', '>=', $startDate)->received()->count(),
                'processing_samples' => LabSample::where('collection_date', '>=', $startDate)->processing()->count(),
                'completed_samples' => LabSample::where('collection_date', '>=', $startDate)->completed()->count(),
                'rejected_samples' => LabSample::where('collection_date', '>=', $startDate)->rejected()->count(),
                'sample_types' => LabSample::where('collection_date', '>=', $startDate)
                    ->selectRaw('sample_type, COUNT(*) as count')
                    ->groupBy('sample_type')
                    ->orderBy('count', 'desc')
                    ->get(),
                'daily_collections' => LabSample::where('collection_date', '>=', $startDate)
                    ->selectRaw('DATE(collection_date) as date, COUNT(*) as count')
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
