<?php

namespace App\Http\Controllers;

use App\Models\Ward;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class WardController extends Controller
{
    /**
     * Display a listing of wards.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Ward::with(['nurseInCharge', 'department', 'beds']);

            // Apply filters
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('ward_type', 'like', "%{$search}%");
                });
            }

            if ($request->has('ward_type')) {
                $query->where('ward_type', $request->ward_type);
            }

            if ($request->has('department_id')) {
                $query->where('department_id', $request->department_id);
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($request->has('has_available_beds')) {
                if ($request->boolean('has_available_beds')) {
                    $query->where('available_beds', '>', 0);
                }
            }

            $wards = $query->orderBy('name')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $wards
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load wards',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created ward.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'ward_type' => 'required|in:general,icu,emergency,maternity,pediatric,surgical',
            'floor' => 'nullable|string|max:255',
            'building' => 'nullable|string|max:255',
            'daily_rate' => 'nullable|numeric|min:0',
            'nurse_in_charge_id' => 'nullable|exists:users,id',
            'department_id' => 'nullable|exists:departments,id',
            'amenities' => 'nullable|array',
            'visiting_hours' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $ward = Ward::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Ward created successfully',
                'data' => $ward->load(['nurseInCharge', 'department', 'beds'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create ward',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified ward.
     */
    public function show(Ward $ward): JsonResponse
    {
        $ward->load(['nurseInCharge', 'department', 'beds', 'admissions.patient', 'wardRounds.doctor']);

        return response()->json([
            'success' => true,
            'data' => $ward
        ]);
    }

    /**
     * Update the specified ward.
     */
    public function update(Request $request, Ward $ward): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'ward_type' => 'sometimes|required|in:general,icu,emergency,maternity,pediatric,surgical',
            'floor' => 'nullable|string|max:255',
            'building' => 'nullable|string|max:255',
            'daily_rate' => 'nullable|numeric|min:0',
            'nurse_in_charge_id' => 'nullable|exists:users,id',
            'department_id' => 'nullable|exists:departments,id',
            'amenities' => 'nullable|array',
            'visiting_hours' => 'nullable|array',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $ward->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Ward updated successfully',
                'data' => $ward->load(['nurseInCharge', 'department', 'beds'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update ward',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified ward.
     */
    public function destroy(Ward $ward): JsonResponse
    {
        try {
            // Check if ward has beds
            if ($ward->beds()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete ward with existing beds'
                ], 400);
            }

            $ward->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ward deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete ward',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get ward analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'total_wards' => Ward::count(),
                'active_wards' => Ward::active()->count(),
                'total_beds' => Ward::sum('total_beds'),
                'available_beds' => Ward::sum('available_beds'),
                'occupied_beds' => Ward::sum('occupied_beds'),
                'occupancy_rate' => Ward::sum('total_beds') > 0 
                    ? (Ward::sum('occupied_beds') / Ward::sum('total_beds')) * 100 
                    : 0,
                'ward_types' => Ward::selectRaw('ward_type, COUNT(*) as count, SUM(total_beds) as total_beds, SUM(occupied_beds) as occupied_beds')
                    ->groupBy('ward_type')
                    ->get(),
                'department_wards' => Ward::with('department')
                    ->selectRaw('department_id, COUNT(*) as count, SUM(total_beds) as total_beds')
                    ->groupBy('department_id')
                    ->get()
                    ->map(function ($ward) {
                        return [
                            'department' => $ward->department->name ?? 'No Department',
                            'count' => $ward->count,
                            'total_beds' => $ward->total_beds
                        ];
                    }),
                'daily_occupancy' => Ward::selectRaw('DATE(updated_at) as date, SUM(occupied_beds) as occupied, SUM(total_beds) as total')
                    ->where('updated_at', '>=', $startDate)
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

    /**
     * Get available beds for a ward.
     */
    public function getAvailableBeds(Ward $ward): JsonResponse
    {
        try {
            $availableBeds = $ward->beds()->available()->get();

            return response()->json([
                'success' => true,
                'data' => $availableBeds
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load available beds',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}