<?php

namespace App\Http\Controllers;

use App\Models\Ambulance;
use App\Models\EmergencyCase;
use App\Models\AmbulanceDispatch;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class AmbulanceController extends Controller
{
    /**
     * Get ambulances with filtering.
     */
    public function getAmbulances(Request $request): JsonResponse
    {
        try {
            $query = Ambulance::with(['driver', 'paramedic']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('vehicle_type')) {
                $query->where('vehicle_type', $request->vehicle_type);
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('ambulance_number', 'like', "%{$search}%")
                      ->orWhere('vehicle_number', 'like', "%{$search}%")
                      ->orWhere('make', 'like', "%{$search}%")
                      ->orWhere('model', 'like', "%{$search}%");
                });
            }

            $ambulances = $query->latest()->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $ambulances
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load ambulances',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new ambulance.
     */
    public function createAmbulance(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'ambulance_number' => 'required|string|max:255|unique:ambulances',
                'vehicle_number' => 'required|string|max:255|unique:ambulances',
                'vehicle_type' => 'required|string|max:255',
                'make' => 'nullable|string|max:255',
                'model' => 'nullable|string|max:255',
                'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
                'color' => 'nullable|string|max:255',
                'driver_id' => 'nullable|exists:users,id',
                'paramedic_id' => 'nullable|exists:users,id',
                'equipment' => 'nullable|array',
                'medications' => 'nullable|array',
                'last_maintenance_date' => 'nullable|date',
                'next_maintenance_date' => 'nullable|date|after:last_maintenance_date',
                'total_mileage' => 'nullable|integer|min:0',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $ambulance = Ambulance::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Ambulance created successfully',
                'data' => $ambulance->load(['driver', 'paramedic'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create ambulance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update ambulance.
     */
    public function updateAmbulance(Request $request, $id): JsonResponse
    {
        try {
            $ambulance = Ambulance::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'ambulance_number' => 'sometimes|string|max:255|unique:ambulances,ambulance_number,' . $id,
                'vehicle_number' => 'sometimes|string|max:255|unique:ambulances,vehicle_number,' . $id,
                'vehicle_type' => 'sometimes|string|max:255',
                'make' => 'nullable|string|max:255',
                'model' => 'nullable|string|max:255',
                'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
                'color' => 'nullable|string|max:255',
                'status' => 'sometimes|in:available,busy,maintenance,out_of_service',
                'current_location' => 'nullable|string|max:255',
                'current_latitude' => 'nullable|numeric|between:-90,90',
                'current_longitude' => 'nullable|numeric|between:-180,180',
                'driver_id' => 'nullable|exists:users,id',
                'paramedic_id' => 'nullable|exists:users,id',
                'equipment' => 'nullable|array',
                'medications' => 'nullable|array',
                'last_maintenance_date' => 'nullable|date',
                'next_maintenance_date' => 'nullable|date|after:last_maintenance_date',
                'total_mileage' => 'nullable|integer|min:0',
                'notes' => 'nullable|string',
                'is_active' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $ambulance->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Ambulance updated successfully',
                'data' => $ambulance->load(['driver', 'paramedic'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update ambulance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update ambulance location.
     */
    public function updateLocation(Request $request, $id): JsonResponse
    {
        try {
            $ambulance = Ambulance::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'current_latitude' => 'required|numeric|between:-90,90',
                'current_longitude' => 'required|numeric|between:-180,180',
                'current_location' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $ambulance->updateLocation(
                $request->current_latitude,
                $request->current_longitude,
                $request->current_location
            );

            return response()->json([
                'success' => true,
                'message' => 'Ambulance location updated successfully',
                'data' => $ambulance
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update ambulance location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ambulance details.
     */
    public function getAmbulance($id): JsonResponse
    {
        try {
            $ambulance = Ambulance::with(['driver', 'paramedic', 'emergencyCases' => function ($query) {
                $query->latest()->limit(10);
            }])->findOrFail($id);

            // Add additional data
            $ambulance->current_case = $ambulance->getCurrentCase();
            $ambulance->today_cases_count = $ambulance->getTodayCasesCount();
            $ambulance->this_month_cases_count = $ambulance->getThisMonthCasesCount();

            return response()->json([
                'success' => true,
                'data' => $ambulance
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load ambulance details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ambulance statistics.
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $statistics = [
                'total_ambulances' => Ambulance::count(),
                'active_ambulances' => Ambulance::active()->count(),
                'available_ambulances' => Ambulance::available()->active()->count(),
                'busy_ambulances' => Ambulance::busy()->active()->count(),
                'maintenance_ambulances' => Ambulance::where('status', 'maintenance')->active()->count(),
                'out_of_service_ambulances' => Ambulance::where('status', 'out_of_service')->active()->count(),
                'ambulances_by_type' => Ambulance::active()
                    ->selectRaw('vehicle_type, COUNT(*) as count')
                    ->groupBy('vehicle_type')
                    ->get(),
                'ambulances_by_status' => Ambulance::active()
                    ->selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->get(),
                'maintenance_due' => Ambulance::active()
                    ->where('next_maintenance_date', '<=', now()->addDays(7))
                    ->count(),
                'top_performing_ambulances' => Ambulance::active()
                    ->withCount(['emergencyCases' => function ($query) use ($startDate) {
                        $query->where('created_at', '>=', $startDate);
                    }])
                    ->orderBy('emergency_cases_count', 'desc')
                    ->limit(5)
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $statistics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load ambulance statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ambulance maintenance schedule.
     */
    public function getMaintenanceSchedule(Request $request): JsonResponse
    {
        try {
            $query = Ambulance::active()->whereNotNull('next_maintenance_date');

            if ($request->has('due_soon')) {
                $days = $request->get('days', 7);
                $query->where('next_maintenance_date', '<=', now()->addDays($days));
            }

            if ($request->has('overdue')) {
                $query->where('next_maintenance_date', '<', now());
            }

            $ambulances = $query->orderBy('next_maintenance_date')->get();

            return response()->json([
                'success' => true,
                'data' => $ambulances
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load maintenance schedule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update maintenance schedule.
     */
    public function updateMaintenance(Request $request, $id): JsonResponse
    {
        try {
            $ambulance = Ambulance::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'last_maintenance_date' => 'nullable|date',
                'next_maintenance_date' => 'required|date|after:last_maintenance_date',
                'total_mileage' => 'nullable|integer|min:0',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $ambulance->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Maintenance schedule updated successfully',
                'data' => $ambulance
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update maintenance schedule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ambulance equipment and medications.
     */
    public function getInventory($id): JsonResponse
    {
        try {
            $ambulance = Ambulance::findOrFail($id);

            $inventory = [
                'equipment' => $ambulance->getEquipmentList(),
                'medications' => $ambulance->getMedicationsList(),
                'equipment_count' => count($ambulance->getEquipmentList()),
                'medications_count' => count($ambulance->getMedicationsList()),
            ];

            return response()->json([
                'success' => true,
                'data' => $inventory
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load ambulance inventory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update ambulance inventory.
     */
    public function updateInventory(Request $request, $id): JsonResponse
    {
        try {
            $ambulance = Ambulance::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'equipment' => 'nullable|array',
                'medications' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $ambulance->update($request->only(['equipment', 'medications']));

            return response()->json([
                'success' => true,
                'message' => 'Ambulance inventory updated successfully',
                'data' => [
                    'equipment' => $ambulance->getEquipmentList(),
                    'medications' => $ambulance->getMedicationsList(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update ambulance inventory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete ambulance.
     */
    public function deleteAmbulance($id): JsonResponse
    {
        try {
            $ambulance = Ambulance::findOrFail($id);

            // Check if ambulance has active cases
            $activeCases = $ambulance->emergencyCases()
                ->whereIn('status', ['dispatched', 'en_route', 'arrived'])
                ->count();

            if ($activeCases > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete ambulance with active cases'
                ], 400);
            }

            $ambulance->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ambulance deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete ambulance',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}