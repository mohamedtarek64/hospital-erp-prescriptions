<?php

namespace App\Http\Controllers;

use App\Models\Incident;
use App\Http\Requests\StoreIncidentRequest;
use App\Http\Requests\UpdateIncidentRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IncidentController extends Controller
{
    /**
     * Display a listing of incidents
     */
    public function index(Request $request): JsonResponse
    {
        $query = Incident::with([
            'reporter', 
            'assignee', 
            'department', 
            'patient', 
            'staff', 
            'creator', 
            'updater'
        ]);

        // Apply filters
        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        if ($request->filled('severity')) {
            $query->bySeverity($request->severity);
        }

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('reported_by')) {
            $query->where('reported_by', $request->reported_by);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('requires_follow_up')) {
            $query->where('requires_follow_up', $request->boolean('requires_follow_up'));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('incident_number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->where('incident_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('incident_date', '<=', $request->date_to);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'incident_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate results
        $perPage = $request->get('per_page', 15);
        $incidents = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $incidents,
            'message' => 'Incidents retrieved successfully'
        ]);
    }

    /**
     * Store a newly created incident
     */
    public function store(StoreIncidentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['reported_by'] = auth()->id();
        $data['created_by'] = auth()->id();
        $data['reported_date'] = now();

        $incident = Incident::create($data);

        return response()->json([
            'success' => true,
            'data' => $incident->load(['reporter', 'assignee', 'department', 'patient', 'staff']),
            'message' => 'Incident created successfully'
        ], 201);
    }

    /**
     * Display the specified incident
     */
    public function show(Incident $incident): JsonResponse
    {
        $incident->load([
            'reporter', 
            'assignee', 
            'department', 
            'patient', 
            'staff', 
            'creator', 
            'updater'
        ]);

        return response()->json([
            'success' => true,
            'data' => $incident,
            'message' => 'Incident retrieved successfully'
        ]);
    }

    /**
     * Update the specified incident
     */
    public function update(UpdateIncidentRequest $request, Incident $incident): JsonResponse
    {
        $data = $request->validated();
        $data['updated_by'] = auth()->id();

        $incident->update($data);

        return response()->json([
            'success' => true,
            'data' => $incident->load(['reporter', 'assignee', 'department', 'patient', 'staff', 'creator', 'updater']),
            'message' => 'Incident updated successfully'
        ]);
    }

    /**
     * Remove the specified incident
     */
    public function destroy(Incident $incident): JsonResponse
    {
        $incident->delete();

        return response()->json([
            'success' => true,
            'message' => 'Incident deleted successfully'
        ]);
    }

    /**
     * Get incident statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Incident::count(),
            'by_type' => Incident::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->get(),
            'by_severity' => Incident::selectRaw('severity, COUNT(*) as count')
                ->groupBy('severity')
                ->get(),
            'by_status' => Incident::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),
            'critical' => Incident::critical()->count(),
            'requiring_follow_up' => Incident::requiringFollowUp()->count(),
            'overdue_follow_up' => Incident::overdueFollowUp()->count(),
            'average_resolution_time' => Incident::whereNotNull('resolved_date')
                ->get()
                ->avg('resolution_time')
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Incident statistics retrieved successfully'
        ]);
    }

    /**
     * Get critical incidents
     */
    public function critical(): JsonResponse
    {
        $incidents = Incident::critical()
            ->with(['reporter', 'assignee', 'department'])
            ->orderBy('incident_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $incidents,
            'message' => 'Critical incidents retrieved successfully'
        ]);
    }

    /**
     * Get incidents requiring follow-up
     */
    public function requiringFollowUp(): JsonResponse
    {
        $incidents = Incident::requiringFollowUp()
            ->with(['reporter', 'assignee', 'department'])
            ->orderBy('follow_up_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $incidents,
            'message' => 'Incidents requiring follow-up retrieved successfully'
        ]);
    }

    /**
     * Get overdue follow-ups
     */
    public function overdueFollowUp(): JsonResponse
    {
        $incidents = Incident::overdueFollowUp()
            ->with(['reporter', 'assignee', 'department'])
            ->orderBy('follow_up_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $incidents,
            'message' => 'Overdue follow-ups retrieved successfully'
        ]);
    }

    /**
     * Assign incident to user
     */
    public function assign(Request $request, Incident $incident): JsonResponse
    {
        $request->validate([
            'assigned_to' => 'required|exists:users,id'
        ]);

        $incident->update([
            'assigned_to' => $request->assigned_to,
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $incident->load('assignee'),
            'message' => 'Incident assigned successfully'
        ]);
    }

    /**
     * Resolve incident
     */
    public function resolve(Request $request, Incident $incident): JsonResponse
    {
        $request->validate([
            'root_cause' => 'required|string',
            'corrective_action' => 'required|string',
            'preventive_action' => 'nullable|string'
        ]);

        $incident->update([
            'status' => 'resolved',
            'resolved_date' => now(),
            'root_cause' => $request->root_cause,
            'corrective_action' => $request->corrective_action,
            'preventive_action' => $request->preventive_action,
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $incident,
            'message' => 'Incident resolved successfully'
        ]);
    }

    /**
     * Close incident
     */
    public function close(Request $request, Incident $incident): JsonResponse
    {
        $request->validate([
            'follow_up_notes' => 'nullable|string'
        ]);

        $incident->update([
            'status' => 'closed',
            'follow_up_notes' => $request->follow_up_notes,
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $incident,
            'message' => 'Incident closed successfully'
        ]);
    }

    /**
     * Update incident status
     */
    public function updateStatus(Request $request, Incident $incident): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:reported,investigating,resolved,closed,escalated'
        ]);

        $incident->update([
            'status' => $request->status,
            'updated_by' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $incident,
            'message' => 'Incident status updated successfully'
        ]);
    }
}
