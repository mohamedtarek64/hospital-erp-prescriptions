<?php

namespace App\Http\Controllers;

use App\Models\EquipmentMaintenance;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class MaintenanceController extends Controller
{
    /**
     * Display a listing of maintenance records.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = EquipmentMaintenance::with(['equipment', 'assignedUser', 'creator']);

        // Apply filters
            if ($request->filled('equipment_id')) {
            $query->where('equipment_id', $request->equipment_id);
        }

            if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

            if ($request->filled('maintenance_type')) {
                $query->where('maintenance_type', $request->maintenance_type);
            }

            if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

            if ($request->filled('assigned_to')) {
                $query->where('assigned_to', $request->assigned_to);
            }

            if ($request->filled('date_from')) {
                $query->where('scheduled_date', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->where('scheduled_date', '<=', $request->date_to);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%')
                      ->orWhere('description', 'like', '%' . $search . '%')
                      ->orWhere('work_order_number', 'like', '%' . $search . '%')
                      ->orWhereHas('equipment', function ($equipmentQuery) use ($search) {
                          $equipmentQuery->where('name', 'like', '%' . $search . '%')
                                        ->orWhere('serial_number', 'like', '%' . $search . '%');
                      });
                });
        }

        // Apply sorting
            $sortBy = $request->get('sort_by', 'scheduled_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

            $maintenance = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
                'data' => $maintenance,
                'message' => 'Maintenance records retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve maintenance records: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created maintenance record.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
            'equipment_id' => 'required|exists:equipment,id',
                'maintenance_type' => 'required|in:preventive,corrective,emergency,calibration,inspection',
            'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:scheduled,in_progress,completed,cancelled,overdue',
                'priority' => 'required|in:low,medium,high,critical',
                'scheduled_date' => 'required|date',
                'estimated_duration_hours' => 'nullable|integer|min:1',
                'estimated_cost' => 'nullable|numeric|min:0',
                'assigned_to' => 'nullable|exists:users,id',
                'vendor_name' => 'nullable|string|max:255',
                'vendor_contact' => 'nullable|string|max:255',
                'work_order_number' => 'nullable|string|max:255',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $maintenance = EquipmentMaintenance::create([
                ...$request->validated(),
                'created_by' => auth()->id()
            ]);

            $maintenance->load(['equipment', 'assignedUser', 'creator']);

        return response()->json([
            'success' => true,
                'data' => $maintenance,
                'message' => 'Maintenance record created successfully'
        ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create maintenance record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified maintenance record.
     */
    public function show(EquipmentMaintenance $maintenance): JsonResponse
    {
        try {
            $maintenance->load(['equipment', 'assignedUser', 'creator']);

        return response()->json([
            'success' => true,
                'data' => $maintenance,
                'message' => 'Maintenance record retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve maintenance record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified maintenance record.
     */
    public function update(Request $request, EquipmentMaintenance $maintenance): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'equipment_id' => 'sometimes|exists:equipment,id',
                'maintenance_type' => 'sometimes|in:preventive,corrective,emergency,calibration,inspection',
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'status' => 'sometimes|in:scheduled,in_progress,completed,cancelled,overdue',
                'priority' => 'sometimes|in:low,medium,high,critical',
                'scheduled_date' => 'sometimes|date',
                'started_at' => 'nullable|date',
                'completed_at' => 'nullable|date',
                'estimated_duration_hours' => 'nullable|integer|min:1',
                'actual_duration_hours' => 'nullable|integer|min:1',
                'estimated_cost' => 'nullable|numeric|min:0',
                'actual_cost' => 'nullable|numeric|min:0',
            'work_performed' => 'nullable|string',
                'parts_replaced' => 'nullable|string',
            'issues_found' => 'nullable|string',
            'recommendations' => 'nullable|string',
                'performed_by' => 'nullable|string|max:255',
                'vendor_name' => 'nullable|string|max:255',
                'vendor_contact' => 'nullable|string|max:255',
                'work_order_number' => 'nullable|string|max:255',
                'attachments' => 'nullable|array',
                'notes' => 'nullable|string',
                'assigned_to' => 'nullable|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $maintenance->update($request->validated());
            $maintenance->load(['equipment', 'assignedUser', 'creator']);

        return response()->json([
            'success' => true,
                'data' => $maintenance,
                'message' => 'Maintenance record updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update maintenance record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified maintenance record.
     */
    public function destroy(EquipmentMaintenance $maintenance): JsonResponse
    {
        try {
            $maintenance->delete();

        return response()->json([
            'success' => true,
            'message' => 'Maintenance record deleted successfully'
        ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete maintenance record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Start maintenance.
     */
    public function start(EquipmentMaintenance $maintenance): JsonResponse
    {
        try {
            if ($maintenance->status !== 'scheduled') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only scheduled maintenance can be started'
                ], 422);
            }

            $maintenance->markAsStarted();
            $maintenance->load(['equipment', 'assignedUser', 'creator']);

            return response()->json([
                'success' => true,
                'data' => $maintenance,
                'message' => 'Maintenance started successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start maintenance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete maintenance.
     */
    public function complete(Request $request, EquipmentMaintenance $maintenance): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'actual_cost' => 'nullable|numeric|min:0',
                'actual_duration_hours' => 'nullable|integer|min:1',
                'work_performed' => 'nullable|string',
                'parts_replaced' => 'nullable|string',
                'issues_found' => 'nullable|string',
                'recommendations' => 'nullable|string',
                'performed_by' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $maintenance->markAsCompleted(
                $request->actual_cost,
                $request->actual_duration_hours
            );

            // Update additional fields if provided
            $updateData = $request->only([
                'work_performed',
                'parts_replaced',
                'issues_found',
                'recommendations',
                'performed_by'
            ]);

            if (!empty($updateData)) {
                $maintenance->update($updateData);
            }

            $maintenance->load(['equipment', 'assignedUser', 'creator']);

        return response()->json([
            'success' => true,
                'data' => $maintenance,
                'message' => 'Maintenance completed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete maintenance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark maintenance as overdue.
     */
    public function markOverdue(EquipmentMaintenance $maintenance): JsonResponse
    {
        try {
            $maintenance->markAsOverdue();
            $maintenance->load(['equipment', 'assignedUser', 'creator']);

        return response()->json([
            'success' => true,
                'data' => $maintenance,
                'message' => 'Maintenance marked as overdue'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark maintenance as overdue: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get maintenance dashboard data.
     */
    public function dashboard(): JsonResponse
    {
        try {
            $stats = [
                'total_maintenance' => EquipmentMaintenance::count(),
                'scheduled_maintenance' => EquipmentMaintenance::scheduled()->count(),
                'in_progress_maintenance' => EquipmentMaintenance::inProgress()->count(),
                'completed_maintenance' => EquipmentMaintenance::completed()->count(),
                'overdue_maintenance' => EquipmentMaintenance::overdue()->count(),
                'total_cost' => EquipmentMaintenance::sum('actual_cost') ?? 0,
                'average_duration' => EquipmentMaintenance::whereNotNull('actual_duration_hours')
                    ->avg('actual_duration_hours') ?? 0
            ];

            // Recent maintenance
            $recentMaintenance = EquipmentMaintenance::with(['equipment', 'assignedUser'])
                ->latest()
                ->limit(10)
                ->get();

            // Maintenance by type
            $maintenanceByType = EquipmentMaintenance::selectRaw('maintenance_type, COUNT(*) as count')
                ->groupBy('maintenance_type')
                ->get()
                ->keyBy('maintenance_type');

            // Maintenance by priority
            $maintenanceByPriority = EquipmentMaintenance::selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->get()
                ->keyBy('priority');

            // Upcoming maintenance
            $upcomingMaintenance = EquipmentMaintenance::with(['equipment', 'assignedUser'])
                ->scheduled()
                ->where('scheduled_date', '>=', now())
                ->orderBy('scheduled_date')
                ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
                'data' => [
                    'statistics' => $stats,
                    'recent_maintenance' => $recentMaintenance,
                    'maintenance_by_type' => $maintenanceByType,
                    'maintenance_by_priority' => $maintenanceByPriority,
                    'upcoming_maintenance' => $upcomingMaintenance
                ],
                'message' => 'Maintenance dashboard data retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve maintenance dashboard data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get maintenance statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $startDate = $request->get('start_date', now()->subYear());
            $endDate = $request->get('end_date', now());

            $query = EquipmentMaintenance::whereBetween('created_at', [$startDate, $endDate]);

            $statistics = [
                'total_records' => $query->count(),
                'completed_records' => $query->clone()->completed()->count(),
                'overdue_records' => $query->clone()->overdue()->count(),
                'total_cost' => $query->clone()->sum('actual_cost') ?? 0,
                'average_cost' => $query->clone()->avg('actual_cost') ?? 0,
                'average_duration' => $query->clone()->whereNotNull('actual_duration_hours')
                    ->avg('actual_duration_hours') ?? 0,
                'efficiency_score' => $query->clone()->completed()
                    ->get()
                    ->avg('efficiency_score') ?? 0,
                'by_type' => $query->clone()->selectRaw('maintenance_type, COUNT(*) as count, AVG(actual_cost) as avg_cost')
                    ->groupBy('maintenance_type')
                    ->get(),
                'by_priority' => $query->clone()->selectRaw('priority, COUNT(*) as count')
                    ->groupBy('priority')
                    ->get(),
                'monthly_trend' => $query->clone()->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count, SUM(actual_cost) as total_cost')
                    ->groupBy('month')
                    ->orderBy('month')
                    ->get()
            ];

        return response()->json([
            'success' => true,
                'data' => $statistics,
                'message' => 'Maintenance statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve maintenance statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update maintenance status.
     */
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'maintenance_ids' => 'required|array',
                'maintenance_ids.*' => 'exists:equipment_maintenance,id',
                'status' => 'required|in:scheduled,in_progress,completed,cancelled,overdue'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updated = EquipmentMaintenance::whereIn('id', $request->maintenance_ids)
                ->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
                'data' => ['updated_count' => $updated],
                'message' => "Successfully updated {$updated} maintenance records"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk update maintenance: ' . $e->getMessage()
            ], 500);
        }
    }
}