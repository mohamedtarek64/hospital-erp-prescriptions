<?php

namespace App\Http\Controllers;

use App\Models\ComplianceRecord;
use App\Http\Requests\StoreComplianceRecordRequest;
use App\Http\Requests\UpdateComplianceRecordRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ComplianceRecordController extends Controller
{
    /**
     * Display a listing of compliance records
     */
    public function index(Request $request): JsonResponse
    {
        $query = ComplianceRecord::with([
            'standard', 
            'department', 
            'staff', 
            'assessor', 
            'creator', 
            'updater'
        ]);

        // Apply filters
        if ($request->filled('standard_id')) {
            $query->where('standard_id', $request->standard_id);
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }

        if ($request->filled('compliance_status')) {
            $query->byComplianceStatus($request->compliance_status);
        }

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('priority')) {
            $query->byPriority($request->priority);
        }

        if ($request->filled('assessed_by')) {
            $query->where('assessed_by', $request->assessed_by);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('standard', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Date range filter
        if ($request->filled('assessment_date_from')) {
            $query->where('assessment_date', '>=', $request->assessment_date_from);
        }

        if ($request->filled('assessment_date_to')) {
            $query->where('assessment_date', '<=', $request->assessment_date_to);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'assessment_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate results
        $perPage = $request->get('per_page', 15);
        $records = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $records,
            'message' => 'Compliance records retrieved successfully'
        ]);
    }

    /**
     * Store a newly created compliance record
     */
    public function store(StoreComplianceRecordRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['assessed_by'] = auth()->id();
        $data['created_by'] = auth()->id();

        $record = ComplianceRecord::create($data);

        return response()->json([
            'success' => true,
            'data' => $record->load(['standard', 'department', 'staff', 'assessor']),
            'message' => 'Compliance record created successfully'
        ], 201);
    }

    /**
     * Display the specified compliance record
     */
    public function show(ComplianceRecord $complianceRecord): JsonResponse
    {
        $complianceRecord->load([
            'standard', 
            'department', 
            'staff', 
            'assessor', 
            'creator', 
            'updater'
        ]);

        return response()->json([
            'success' => true,
            'data' => $complianceRecord,
            'message' => 'Compliance record retrieved successfully'
        ]);
    }

    /**
     * Update the specified compliance record
     */
    public function update(UpdateComplianceRecordRequest $request, ComplianceRecord $complianceRecord): JsonResponse
    {
        $data = $request->validated();
        $data['updated_by'] = auth()->id();

        $complianceRecord->update($data);

        return response()->json([
            'success' => true,
            'data' => $complianceRecord->load(['standard', 'department', 'staff', 'assessor', 'creator', 'updater']),
            'message' => 'Compliance record updated successfully'
        ]);
    }

    /**
     * Remove the specified compliance record
     */
    public function destroy(ComplianceRecord $complianceRecord): JsonResponse
    {
        $complianceRecord->delete();

        return response()->json([
            'success' => true,
            'message' => 'Compliance record deleted successfully'
        ]);
    }

    /**
     * Get compliance statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => ComplianceRecord::count(),
            'by_compliance_status' => ComplianceRecord::selectRaw('compliance_status, COUNT(*) as count')
                ->groupBy('compliance_status')
                ->get(),
            'by_status' => ComplianceRecord::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),
            'by_priority' => ComplianceRecord::selectRaw('priority, COUNT(*) as count')
                ->whereNotNull('priority')
                ->groupBy('priority')
                ->get(),
            'non_compliant' => ComplianceRecord::nonCompliant()->count(),
            'overdue' => ComplianceRecord::overdue()->count(),
            'due_for_assessment' => ComplianceRecord::dueForAssessment()->count(),
            'overall_compliance_rate' => ComplianceRecord::where('compliance_status', 'compliant')
                ->count() / max(ComplianceRecord::count(), 1) * 100
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Compliance statistics retrieved successfully'
        ]);
    }

    /**
     * Get non-compliant records
     */
    public function nonCompliant(): JsonResponse
    {
        $records = ComplianceRecord::nonCompliant()
            ->with(['standard', 'department', 'staff', 'assessor'])
            ->orderBy('assessment_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $records,
            'message' => 'Non-compliant records retrieved successfully'
        ]);
    }

    /**
     * Get overdue records
     */
    public function overdue(): JsonResponse
    {
        $records = ComplianceRecord::overdue()
            ->with(['standard', 'department', 'staff', 'assessor'])
            ->orderBy('next_assessment_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $records,
            'message' => 'Overdue compliance records retrieved successfully'
        ]);
    }

    /**
     * Get records due for assessment
     */
    public function dueForAssessment(): JsonResponse
    {
        $records = ComplianceRecord::dueForAssessment()
            ->with(['standard', 'department', 'staff', 'assessor'])
            ->orderBy('next_assessment_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $records,
            'message' => 'Records due for assessment retrieved successfully'
        ]);
    }

    /**
     * Update compliance status
     */
    public function updateComplianceStatus(Request $request, ComplianceRecord $complianceRecord): JsonResponse
    {
        $request->validate([
            'compliance_status' => 'required|in:compliant,non_compliant,partially_compliant,not_applicable',
            'assessment_notes' => 'nullable|string',
            'evidence' => 'nullable|array',
            'gaps' => 'nullable|array',
            'action_plan' => 'nullable|array'
        ]);

        $complianceRecord->update([
            'compliance_status' => $request->compliance_status,
            'assessment_notes' => $request->assessment_notes,
            'evidence' => $request->evidence,
            'gaps' => $request->gaps,
            'action_plan' => $request->action_plan,
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $complianceRecord,
            'message' => 'Compliance status updated successfully'
        ]);
    }

    /**
     * Update record status
     */
    public function updateStatus(Request $request, ComplianceRecord $complianceRecord): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,completed,overdue,cancelled'
        ]);

        $complianceRecord->update([
            'status' => $request->status,
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $complianceRecord,
            'message' => 'Compliance record status updated successfully'
        ]);
    }

    /**
     * Schedule next assessment
     */
    public function scheduleNextAssessment(Request $request, ComplianceRecord $complianceRecord): JsonResponse
    {
        $request->validate([
            'next_assessment_date' => 'required|date|after:today'
        ]);

        $complianceRecord->update([
            'next_assessment_date' => $request->next_assessment_date,
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $complianceRecord,
            'message' => 'Next assessment scheduled successfully'
        ]);
    }
}
