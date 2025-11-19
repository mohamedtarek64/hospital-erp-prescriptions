<?php

namespace App\Http\Controllers;

use App\Models\LabRequest;
use App\Models\LabRequestItem;
use App\Models\LabTest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class LabRequestController extends Controller
{
    /**
     * Display a listing of lab requests.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = LabRequest::with(['patient', 'doctor', 'creator', 'items.labTest']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }

            if ($request->has('patient_id')) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('doctor_id')) {
                $query->where('doctor_id', $request->doctor_id);
            }

            if ($request->has('date_from')) {
                $query->whereDate('request_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('request_date', '<=', $request->date_to);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('request_number', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($patientQuery) use ($search) {
                          $patientQuery->where('name', 'like', "%{$search}%")
                                     ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            $labRequests = $query->orderBy('request_date', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $labRequests
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load lab requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created lab request.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:users,id',
            'doctor_id' => 'required|exists:users,id',
            'request_date' => 'required|date',
            'clinical_notes' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'priority' => 'required|in:routine,urgent,stat',
            'items' => 'required|array|min:1',
            'items.*.lab_test_id' => 'required|exists:lab_tests,id',
            'items.*.notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create lab request
            $labRequest = LabRequest::create([
                'patient_id' => $request->patient_id,
                'doctor_id' => $request->doctor_id,
                'request_number' => LabRequest::generateRequestNumber(),
                'request_date' => $request->request_date,
                'clinical_notes' => $request->clinical_notes,
                'diagnosis' => $request->diagnosis,
                'priority' => $request->priority,
                'created_by' => auth()->id()
            ]);

            // Create lab request items
            foreach ($request->items as $item) {
                $labRequest->items()->create([
                    'lab_test_id' => $item['lab_test_id'],
                    'notes' => $item['notes'] ?? null
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lab request created successfully',
                'data' => $labRequest->load(['patient', 'doctor', 'items.labTest', 'creator'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create lab request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified lab request.
     */
    public function show(LabRequest $labRequest): JsonResponse
    {
        $labRequest->load(['patient', 'doctor', 'creator', 'items.labTest', 'items.labSample', 'items.results']);

        return response()->json([
            'success' => true,
            'data' => $labRequest
        ]);
    }

    /**
     * Update the specified lab request.
     */
    public function update(Request $request, LabRequest $labRequest): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'clinical_notes' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'priority' => 'sometimes|in:routine,urgent,stat',
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $labRequest->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Lab request updated successfully',
                'data' => $labRequest->load(['patient', 'doctor', 'items.labTest'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update lab request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified lab request.
     */
    public function destroy(LabRequest $labRequest): JsonResponse
    {
        try {
            // Check if request is already in progress or completed
            if ($labRequest->isInProgress() || $labRequest->isCompleted()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete lab request that is in progress or completed'
                ], 400);
            }

            $labRequest->delete();

            return response()->json([
                'success' => true,
                'message' => 'Lab request deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete lab request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update lab request item status.
     */
    public function updateItemStatus(Request $request, LabRequestItem $labRequestItem): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'started_at' => 'nullable|date',
            'completed_at' => 'nullable|date',
            'performed_by' => 'nullable|exists:users,id'
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

            // Set started_at if status is being changed to in_progress
            if ($request->status === 'in_progress' && $labRequestItem->status !== 'in_progress') {
                $data['started_at'] = $request->started_at ?? now();
                $data['performed_by'] = $request->performed_by ?? auth()->id();
            }

            // Set completed_at if status is being changed to completed
            if ($request->status === 'completed' && $labRequestItem->status !== 'completed') {
                $data['completed_at'] = $request->completed_at ?? now();
            }

            $labRequestItem->update($data);

            // Update lab request status based on items
            $this->updateLabRequestStatus($labRequestItem->labRequest);

            return response()->json([
                'success' => true,
                'message' => 'Lab request item status updated successfully',
                'data' => $labRequestItem->load(['labTest', 'labSample', 'performer'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update lab request item status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update lab request status based on items.
     */
    private function updateLabRequestStatus(LabRequest $labRequest): void
    {
        $items = $labRequest->items;
        $totalItems = $items->count();
        $completedItems = $items->where('status', 'completed')->count();
        $cancelledItems = $items->where('status', 'cancelled')->count();
        $inProgressItems = $items->where('status', 'in_progress')->count();

        if ($completedItems === $totalItems) {
            $labRequest->update(['status' => 'completed']);
        } elseif ($inProgressItems > 0 || $completedItems > 0) {
            $labRequest->update(['status' => 'in_progress']);
        } elseif ($cancelledItems === $totalItems) {
            $labRequest->update(['status' => 'cancelled']);
        } else {
            $labRequest->update(['status' => 'pending']);
        }
    }

    /**
     * Get lab request analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'total_requests' => LabRequest::where('request_date', '>=', $startDate)->count(),
                'pending_requests' => LabRequest::where('request_date', '>=', $startDate)->pending()->count(),
                'in_progress_requests' => LabRequest::where('request_date', '>=', $startDate)->inProgress()->count(),
                'completed_requests' => LabRequest::where('request_date', '>=', $startDate)->completed()->count(),
                'cancelled_requests' => LabRequest::where('request_date', '>=', $startDate)->cancelled()->count(),
                'urgent_requests' => LabRequest::where('request_date', '>=', $startDate)->urgent()->count(),
                'stat_requests' => LabRequest::where('request_date', '>=', $startDate)->stat()->count(),
                'completion_rate' => LabRequest::where('request_date', '>=', $startDate)->count() > 0 
                    ? (LabRequest::where('request_date', '>=', $startDate)->completed()->count() / LabRequest::where('request_date', '>=', $startDate)->count()) * 100 
                    : 0,
                'top_tests' => DB::table('lab_request_items')
                    ->join('lab_tests', 'lab_request_items.lab_test_id', '=', 'lab_tests.id')
                    ->join('lab_requests', 'lab_request_items.lab_request_id', '=', 'lab_requests.id')
                    ->where('lab_requests.request_date', '>=', $startDate)
                    ->selectRaw('lab_tests.name, COUNT(*) as count')
                    ->groupBy('lab_tests.id', 'lab_tests.name')
                    ->orderBy('count', 'desc')
                    ->limit(10)
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
