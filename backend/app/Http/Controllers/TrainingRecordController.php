<?php

namespace App\Http\Controllers;

use App\Models\TrainingRecord;
use App\Http\Requests\StoreTrainingRecordRequest;
use App\Http\Requests\UpdateTrainingRecordRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TrainingRecordController extends Controller
{
    /**
     * Display a listing of training records
     */
    public function index(Request $request): JsonResponse
    {
        $query = TrainingRecord::with([
            'instructor', 
            'department', 
            'creator', 
            'updater',
            'staffTraining.staff'
        ]);

        // Apply filters
        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('delivery_method')) {
            $query->where('delivery_method', $request->delivery_method);
        }

        if ($request->filled('instructor_id')) {
            $query->where('instructor_id', $request->instructor_id);
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('certification_required')) {
            $query->where('certification_required', $request->boolean('certification_required'));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->where('scheduled_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('scheduled_date', '<=', $request->date_to);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'scheduled_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate results
        $perPage = $request->get('per_page', 15);
        $trainings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $trainings,
            'message' => 'Training records retrieved successfully'
        ]);
    }

    /**
     * Store a newly created training record
     */
    public function store(StoreTrainingRecordRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();

        $training = TrainingRecord::create($data);

        return response()->json([
            'success' => true,
            'data' => $training->load(['instructor', 'department', 'creator']),
            'message' => 'Training record created successfully'
        ], 201);
    }

    /**
     * Display the specified training record
     */
    public function show(TrainingRecord $trainingRecord): JsonResponse
    {
        $trainingRecord->load([
            'instructor', 
            'department', 
            'creator', 
            'updater',
            'staffTraining.staff'
        ]);

        return response()->json([
            'success' => true,
            'data' => $trainingRecord,
            'message' => 'Training record retrieved successfully'
        ]);
    }

    /**
     * Update the specified training record
     */
    public function update(UpdateTrainingRecordRequest $request, TrainingRecord $trainingRecord): JsonResponse
    {
        $data = $request->validated();
        $data['updated_by'] = auth()->id();

        $trainingRecord->update($data);

        return response()->json([
            'success' => true,
            'data' => $trainingRecord->load(['instructor', 'department', 'creator', 'updater']),
            'message' => 'Training record updated successfully'
        ]);
    }

    /**
     * Remove the specified training record
     */
    public function destroy(TrainingRecord $trainingRecord): JsonResponse
    {
        $trainingRecord->delete();

        return response()->json([
            'success' => true,
            'message' => 'Training record deleted successfully'
        ]);
    }

    /**
     * Get training statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => TrainingRecord::count(),
            'by_type' => TrainingRecord::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->get(),
            'by_category' => TrainingRecord::selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->get(),
            'by_status' => TrainingRecord::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),
            'by_delivery_method' => TrainingRecord::selectRaw('delivery_method, COUNT(*) as count')
                ->groupBy('delivery_method')
                ->get(),
            'mandatory' => TrainingRecord::mandatory()->count(),
            'certification' => TrainingRecord::certification()->count(),
            'upcoming' => TrainingRecord::upcoming()->count(),
            'overdue' => TrainingRecord::overdue()->count(),
            'average_pass_rate' => TrainingRecord::whereNotNull('pass_rate')
                ->avg('pass_rate')
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Training statistics retrieved successfully'
        ]);
    }

    /**
     * Get upcoming trainings
     */
    public function upcoming(): JsonResponse
    {
        $trainings = TrainingRecord::upcoming()
            ->with(['instructor', 'department'])
            ->orderBy('scheduled_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $trainings,
            'message' => 'Upcoming trainings retrieved successfully'
        ]);
    }

    /**
     * Get overdue trainings
     */
    public function overdue(): JsonResponse
    {
        $trainings = TrainingRecord::overdue()
            ->with(['instructor', 'department'])
            ->orderBy('scheduled_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $trainings,
            'message' => 'Overdue trainings retrieved successfully'
        ]);
    }

    /**
     * Get mandatory trainings
     */
    public function mandatory(): JsonResponse
    {
        $trainings = TrainingRecord::mandatory()
            ->with(['instructor', 'department'])
            ->orderBy('scheduled_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $trainings,
            'message' => 'Mandatory trainings retrieved successfully'
        ]);
    }

    /**
     * Get certification trainings
     */
    public function certification(): JsonResponse
    {
        $trainings = TrainingRecord::certification()
            ->with(['instructor', 'department'])
            ->orderBy('scheduled_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $trainings,
            'message' => 'Certification trainings retrieved successfully'
        ]);
    }

    /**
     * Start training
     */
    public function start(Request $request, TrainingRecord $trainingRecord): JsonResponse
    {
        if ($trainingRecord->status !== 'scheduled') {
            return response()->json([
                'success' => false,
                'message' => 'Only scheduled trainings can be started'
            ], 422);
        }

        $trainingRecord->update([
            'status' => 'in_progress',
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $trainingRecord,
            'message' => 'Training started successfully'
        ]);
    }

    /**
     * Complete training
     */
    public function complete(Request $request, TrainingRecord $trainingRecord): JsonResponse
    {
        $request->validate([
            'pass_rate' => 'nullable|numeric|min:0|max:100',
            'feedback' => 'nullable|string'
        ]);

        if ($trainingRecord->status !== 'in_progress') {
            return response()->json([
                'success' => false,
                'message' => 'Only in-progress trainings can be completed'
            ], 422);
        }

        $trainingRecord->update([
            'status' => 'completed',
            'completion_date' => now(),
            'pass_rate' => $request->pass_rate,
            'feedback' => $request->feedback,
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $trainingRecord,
            'message' => 'Training completed successfully'
        ]);
    }

    /**
     * Update training status
     */
    public function updateStatus(Request $request, TrainingRecord $trainingRecord): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:scheduled,in_progress,completed,cancelled,postponed'
        ]);

        $trainingRecord->update([
            'status' => $request->status,
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $trainingRecord,
            'message' => 'Training status updated successfully'
        ]);
    }

    /**
     * Enroll staff in training
     */
    public function enrollStaff(Request $request, TrainingRecord $trainingRecord): JsonResponse
    {
        $request->validate([
            'staff_ids' => 'required|array',
            'staff_ids.*' => 'exists:staff,id'
        ]);

        $enrolledCount = 0;
        foreach ($request->staff_ids as $staffId) {
            $existing = $trainingRecord->staffTraining()
                ->where('staff_id', $staffId)
                ->first();

            if (!$existing) {
                $trainingRecord->staffTraining()->create([
                    'staff_id' => $staffId,
                    'status' => 'enrolled',
                    'enrollment_date' => now(),
                    'created_by' => auth()->id()
                ]);
                $enrolledCount++;
            }
        }

        return response()->json([
            'success' => true,
            'data' => ['enrolled_count' => $enrolledCount],
            'message' => "Successfully enrolled {$enrolledCount} staff members"
        ]);
    }
}
