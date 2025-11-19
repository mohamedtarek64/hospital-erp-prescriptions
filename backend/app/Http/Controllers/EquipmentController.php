<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\EquipmentCategory;
use App\Models\EquipmentMaintenance;
use App\Models\EquipmentTransfer;
use App\Models\EquipmentIssue;
use App\Models\AssetDepreciation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EquipmentController extends Controller
{
    /**
     * Display a listing of equipment.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Equipment::with(['category', 'assignedUser', 'creator']);

        // Apply filters
            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

            if ($request->filled('location')) {
                $query->where('location', 'like', '%' . $request->location . '%');
            }

            if ($request->filled('department')) {
                $query->where('department', 'like', '%' . $request->department . '%');
            }

            if ($request->filled('assigned_to')) {
                $query->where('assigned_to', $request->assigned_to);
            }

            if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                      ->orWhere('model', 'like', '%' . $search . '%')
                      ->orWhere('serial_number', 'like', '%' . $search . '%')
                      ->orWhere('asset_tag', 'like', '%' . $search . '%');
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $equipment = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
                'data' => $equipment,
                'message' => 'Equipment retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve equipment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created equipment.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'category_id' => 'required|exists:equipment_categories,id',
            'name' => 'required|string|max:255',
                'model' => 'nullable|string|max:255',
                'serial_number' => 'nullable|string|max:255|unique:equipment',
                'asset_tag' => 'nullable|string|max:255|unique:equipment',
                'manufacturer' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
                'purchase_cost' => 'nullable|numeric|min:0',
                'warranty_expiry' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
                'status' => 'required|in:active,inactive,maintenance,retired',
                'condition' => 'nullable|in:excellent,good,fair,poor',
            'assigned_to' => 'nullable|exists:users,id',
                'notes' => 'nullable|string',
                'maintenance_interval_days' => 'nullable|integer|min:1',
                'last_maintenance_date' => 'nullable|date',
                'next_maintenance_date' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $equipment = Equipment::create([
                ...$request->validated(),
                'created_by' => auth()->id()
            ]);

            $equipment->load(['category', 'assignedUser', 'creator']);

        return response()->json([
            'success' => true,
                'data' => $equipment,
                'message' => 'Equipment created successfully'
        ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create equipment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified equipment.
     */
    public function show(Equipment $equipment): JsonResponse
    {
        try {
        $equipment->load([
                'category',
            'assignedUser',
                'creator',
                'maintenanceRecords',
                'transfers',
                'issues',
                'depreciation'
            ]);

            // Get equipment statistics
            $stats = [
                'total_maintenance' => $equipment->maintenanceRecords()->count(),
                'pending_maintenance' => $equipment->maintenanceRecords()->where('status', 'scheduled')->count(),
                'overdue_maintenance' => $equipment->maintenanceRecords()->where('status', 'overdue')->count(),
                'total_issues' => $equipment->issues()->count(),
                'open_issues' => $equipment->issues()->where('status', 'open')->count(),
                'total_transfers' => $equipment->transfers()->count(),
                'current_book_value' => $equipment->depreciation?->book_value ?? $equipment->purchase_cost
            ];

        return response()->json([
            'success' => true,
                'data' => $equipment,
                'statistics' => $stats,
                'message' => 'Equipment retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve equipment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified equipment.
     */
    public function update(Request $request, Equipment $equipment): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'category_id' => 'sometimes|exists:equipment_categories,id',
                'name' => 'sometimes|string|max:255',
                'model' => 'nullable|string|max:255',
                'serial_number' => 'nullable|string|max:255|unique:equipment,serial_number,' . $equipment->id,
                'asset_tag' => 'nullable|string|max:255|unique:equipment,asset_tag,' . $equipment->id,
                'manufacturer' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
                'purchase_cost' => 'nullable|numeric|min:0',
                'warranty_expiry' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
                'status' => 'sometimes|in:active,inactive,maintenance,retired',
                'condition' => 'nullable|in:excellent,good,fair,poor',
            'assigned_to' => 'nullable|exists:users,id',
                'notes' => 'nullable|string',
                'maintenance_interval_days' => 'nullable|integer|min:1',
                'last_maintenance_date' => 'nullable|date',
                'next_maintenance_date' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $equipment->update($request->validated());
            $equipment->load(['category', 'assignedUser', 'creator']);

        return response()->json([
            'success' => true,
                'data' => $equipment,
                'message' => 'Equipment updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update equipment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified equipment.
     */
    public function destroy(Equipment $equipment): JsonResponse
    {
        try {
            // Check if equipment has related records
            $hasMaintenance = $equipment->maintenanceRecords()->exists();
            $hasTransfers = $equipment->transfers()->exists();
            $hasIssues = $equipment->issues()->exists();

            if ($hasMaintenance || $hasTransfers || $hasIssues) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete equipment with existing maintenance records, transfers, or issues'
                ], 422);
            }

            $equipment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Equipment deleted successfully'
        ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete equipment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get equipment dashboard data.
     */
    public function dashboard(): JsonResponse
    {
        try {
            $stats = [
                'total_equipment' => Equipment::count(),
                'active_equipment' => Equipment::where('status', 'active')->count(),
                'maintenance_equipment' => Equipment::where('status', 'maintenance')->count(),
                'retired_equipment' => Equipment::where('status', 'retired')->count(),
                'overdue_maintenance' => EquipmentMaintenance::overdue()->count(),
                'pending_transfers' => EquipmentTransfer::pending()->count(),
                'open_issues' => EquipmentIssue::where('status', 'open')->count(),
                'total_value' => Equipment::sum('purchase_cost'),
                'depreciated_value' => AssetDepreciation::sum('book_value')
            ];

            // Recent activities
            $recentActivities = [
                'recent_maintenance' => EquipmentMaintenance::with('equipment')
                    ->latest()
                    ->limit(5)
                    ->get(),
                'recent_transfers' => EquipmentTransfer::with('equipment')
                    ->latest()
                    ->limit(5)
                    ->get(),
                'recent_issues' => EquipmentIssue::with('equipment')
                    ->latest()
                    ->limit(5)
                    ->get()
            ];

            // Equipment by status
            $equipmentByStatus = Equipment::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get()
                ->keyBy('status');

            // Equipment by category
            $equipmentByCategory = Equipment::with('category')
                ->selectRaw('category_id, COUNT(*) as count')
                ->groupBy('category_id')
                ->get()
                ->map(function ($item) {
                    return [
                        'category' => $item->category->name ?? 'Unknown',
                        'count' => $item->count
                    ];
                });

        return response()->json([
            'success' => true,
                'data' => [
                    'statistics' => $stats,
                    'recent_activities' => $recentActivities,
                    'equipment_by_status' => $equipmentByStatus,
                    'equipment_by_category' => $equipmentByCategory
                ],
                'message' => 'Dashboard data retrieved successfully'
            ]);

        } catch (\Exception $e) {
        return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get equipment maintenance history.
     */
    public function maintenanceHistory(Equipment $equipment): JsonResponse
    {
        try {
            $maintenanceHistory = $equipment->maintenanceRecords()
                ->with(['assignedUser', 'creator'])
                ->orderBy('scheduled_date', 'desc')
                ->get();

        return response()->json([
            'success' => true,
                'data' => $maintenanceHistory,
                'message' => 'Maintenance history retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve maintenance history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get equipment transfer history.
     */
    public function transferHistory(Equipment $equipment): JsonResponse
    {
        try {
            $transferHistory = $equipment->transfers()
                ->with(['requester', 'approver', 'fromUser', 'toUser'])
                ->orderBy('created_at', 'desc')
                ->get();

        return response()->json([
            'success' => true,
                'data' => $transferHistory,
                'message' => 'Transfer history retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve transfer history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get equipment issues.
     */
    public function issues(Equipment $equipment): JsonResponse
    {
        try {
            $issues = $equipment->issues()
                ->with(['reportedBy', 'assignedTo'])
                ->orderBy('created_at', 'desc')
                ->get();

        return response()->json([
            'success' => true,
                'data' => $issues,
                'message' => 'Equipment issues retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve equipment issues: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get equipment depreciation information.
     */
    public function depreciation(Equipment $equipment): JsonResponse
    {
        try {
            $depreciation = $equipment->depreciation;
            
            if (!$depreciation) {
                return response()->json([
                    'success' => false,
                    'message' => 'No depreciation information found for this equipment'
                ], 404);
            }

            $depreciationData = [
                'depreciation' => $depreciation,
                'schedule' => $depreciation->getDepreciationSchedule(),
                'statistics' => AssetDepreciation::getEquipmentDepreciationStats($equipment->id)
            ];

        return response()->json([
            'success' => true,
                'data' => $depreciationData,
                'message' => 'Depreciation information retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve depreciation information: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update equipment status.
     */
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'equipment_ids' => 'required|array',
                'equipment_ids.*' => 'exists:equipment,id',
                'status' => 'required|in:active,inactive,maintenance,retired'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updated = Equipment::whereIn('id', $request->equipment_ids)
                ->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
                'data' => ['updated_count' => $updated],
                'message' => "Successfully updated {$updated} equipment records"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk update equipment: ' . $e->getMessage()
            ], 500);
        }
    }
}