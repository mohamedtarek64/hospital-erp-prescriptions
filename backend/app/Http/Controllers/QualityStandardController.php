<?php

namespace App\Http\Controllers;

use App\Models\QualityStandard;
use App\Http\Requests\StoreQualityStandardRequest;
use App\Http\Requests\UpdateQualityStandardRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class QualityStandardController extends Controller
{
    /**
     * Display a listing of quality standards
     */
    public function index(Request $request): JsonResponse
    {
        $query = QualityStandard::with(['creator', 'updater']);

        // Apply filters
        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('priority')) {
            $query->byPriority($request->priority);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate results
        $perPage = $request->get('per_page', 15);
        $standards = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $standards,
            'message' => 'Quality standards retrieved successfully'
        ]);
    }

    /**
     * Store a newly created quality standard
     */
    public function store(StoreQualityStandardRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();

        $standard = QualityStandard::create($data);

        return response()->json([
            'success' => true,
            'data' => $standard->load(['creator']),
            'message' => 'Quality standard created successfully'
        ], 201);
    }

    /**
     * Display the specified quality standard
     */
    public function show(QualityStandard $qualityStandard): JsonResponse
    {
        $qualityStandard->load([
            'creator', 
            'updater', 
            'audits', 
            'complianceRecords.department',
            'complianceRecords.staff'
        ]);

        return response()->json([
            'success' => true,
            'data' => $qualityStandard,
            'message' => 'Quality standard retrieved successfully'
        ]);
    }

    /**
     * Update the specified quality standard
     */
    public function update(UpdateQualityStandardRequest $request, QualityStandard $qualityStandard): JsonResponse
    {
        $data = $request->validated();
        $data['updated_by'] = auth()->id();

        $qualityStandard->update($data);

        return response()->json([
            'success' => true,
            'data' => $qualityStandard->load(['creator', 'updater']),
            'message' => 'Quality standard updated successfully'
        ]);
    }

    /**
     * Remove the specified quality standard
     */
    public function destroy(QualityStandard $qualityStandard): JsonResponse
    {
        // Check if standard has related records
        if ($qualityStandard->audits()->count() > 0 || $qualityStandard->complianceRecords()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete quality standard with existing audits or compliance records'
            ], 422);
        }

        $qualityStandard->delete();

        return response()->json([
            'success' => true,
            'message' => 'Quality standard deleted successfully'
        ]);
    }

    /**
     * Get quality standards statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => QualityStandard::count(),
            'active' => QualityStandard::active()->count(),
            'by_category' => QualityStandard::selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->get(),
            'by_priority' => QualityStandard::selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->get(),
            'due_for_review' => QualityStandard::where('review_date', '<=', now())->count(),
            'compliance_rate' => QualityStandard::with('complianceRecords')
                ->get()
                ->avg('compliance_rate')
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Quality standards statistics retrieved successfully'
        ]);
    }

    /**
     * Get standards due for review
     */
    public function dueForReview(): JsonResponse
    {
        $standards = QualityStandard::where('review_date', '<=', now())
            ->with(['creator', 'updater'])
            ->orderBy('review_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $standards,
            'message' => 'Standards due for review retrieved successfully'
        ]);
    }

    /**
     * Update standard status
     */
    public function updateStatus(Request $request, QualityStandard $qualityStandard): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:active,inactive,draft,archived'
        ]);

        $qualityStandard->update([
            'status' => $request->status,
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $qualityStandard,
            'message' => 'Quality standard status updated successfully'
        ]);
    }
}
