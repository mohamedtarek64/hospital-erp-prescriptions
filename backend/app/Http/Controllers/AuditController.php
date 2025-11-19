<?php

namespace App\Http\Controllers;

use App\Models\Audit;
use App\Http\Requests\StoreAuditRequest;
use App\Http\Requests\UpdateAuditRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuditController extends Controller
{
    /**
     * Display a listing of audits
     */
    public function index(Request $request): JsonResponse
    {
        $query = Audit::with([
            'standard', 
            'auditor', 
            'department', 
            'creator', 
            'updater'
        ]);

        // Apply filters
        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('scope')) {
            $query->byScope($request->scope);
        }

        if ($request->filled('auditor_id')) {
            $query->where('auditor_id', $request->auditor_id);
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('standard_id')) {
            $query->where('standard_id', $request->standard_id);
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
            $query->where('planned_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('planned_date', '<=', $request->date_to);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'planned_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate results
        $perPage = $request->get('per_page', 15);
        $audits = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $audits,
            'message' => 'Audits retrieved successfully'
        ]);
    }

    /**
     * Store a newly created audit
     */
    public function store(StoreAuditRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();

        $audit = Audit::create($data);

        return response()->json([
            'success' => true,
            'data' => $audit->load(['standard', 'auditor', 'department', 'creator']),
            'message' => 'Audit created successfully'
        ], 201);
    }

    /**
     * Display the specified audit
     */
    public function show(Audit $audit): JsonResponse
    {
        $audit->load([
            'standard', 
            'auditor', 
            'department', 
            'creator', 
            'updater'
        ]);

        return response()->json([
            'success' => true,
            'data' => $audit,
            'message' => 'Audit retrieved successfully'
        ]);
    }

    /**
     * Update the specified audit
     */
    public function update(UpdateAuditRequest $request, Audit $audit): JsonResponse
    {
        $data = $request->validated();
        $data['updated_by'] = auth()->id();

        $audit->update($data);

        return response()->json([
            'success' => true,
            'data' => $audit->load(['standard', 'auditor', 'department', 'creator', 'updater']),
            'message' => 'Audit updated successfully'
        ]);
    }

    /**
     * Remove the specified audit
     */
    public function destroy(Audit $audit): JsonResponse
    {
        $audit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Audit deleted successfully'
        ]);
    }

    /**
     * Get audit statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Audit::count(),
            'by_status' => Audit::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),
            'by_type' => Audit::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->get(),
            'by_scope' => Audit::selectRaw('scope, COUNT(*) as count')
                ->groupBy('scope')
                ->get(),
            'by_rating' => Audit::selectRaw('overall_rating, COUNT(*) as count')
                ->whereNotNull('overall_rating')
                ->groupBy('overall_rating')
                ->get(),
            'upcoming' => Audit::upcoming()->count(),
            'overdue' => Audit::overdue()->count(),
            'average_duration' => Audit::whereNotNull('start_date')
                ->whereNotNull('end_date')
                ->get()
                ->avg('duration')
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Audit statistics retrieved successfully'
        ]);
    }

    /**
     * Get upcoming audits
     */
    public function upcoming(): JsonResponse
    {
        $audits = Audit::upcoming()
            ->with(['standard', 'auditor', 'department'])
            ->orderBy('planned_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $audits,
            'message' => 'Upcoming audits retrieved successfully'
        ]);
    }

    /**
     * Get overdue audits
     */
    public function overdue(): JsonResponse
    {
        $audits = Audit::overdue()
            ->with(['standard', 'auditor', 'department'])
            ->orderBy('planned_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $audits,
            'message' => 'Overdue audits retrieved successfully'
        ]);
    }

    /**
     * Start an audit
     */
    public function start(Request $request, Audit $audit): JsonResponse
    {
        if ($audit->status !== 'planned') {
            return response()->json([
                'success' => false,
                'message' => 'Only planned audits can be started'
            ], 422);
        }

        $audit->update([
            'status' => 'in_progress',
            'start_date' => now(),
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $audit,
            'message' => 'Audit started successfully'
        ]);
    }

    /**
     * Complete an audit
     */
    public function complete(Request $request, Audit $audit): JsonResponse
    {
        $request->validate([
            'overall_rating' => 'required|in:excellent,good,satisfactory,needs_improvement,unsatisfactory',
            'summary' => 'required|string',
            'findings' => 'nullable|array',
            'recommendations' => 'nullable|array'
        ]);

        if ($audit->status !== 'in_progress') {
            return response()->json([
                'success' => false,
                'message' => 'Only in-progress audits can be completed'
            ], 422);
        }

        $audit->update([
            'status' => 'completed',
            'end_date' => now(),
            'overall_rating' => $request->overall_rating,
            'summary' => $request->summary,
            'findings' => $request->findings,
            'recommendations' => $request->recommendations,
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $audit,
            'message' => 'Audit completed successfully'
        ]);
    }

    /**
     * Update audit status
     */
    public function updateStatus(Request $request, Audit $audit): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:planned,in_progress,completed,cancelled,on_hold'
        ]);

        $audit->update([
            'status' => $request->status,
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $audit,
            'message' => 'Audit status updated successfully'
        ]);
    }
}
