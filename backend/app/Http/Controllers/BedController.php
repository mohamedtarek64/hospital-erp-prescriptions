<?php

namespace App\Http\Controllers;

use App\Models\Bed;
use App\Models\Ward;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class BedController extends Controller
{
    /**
     * Display a listing of beds.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Bed::with(['ward', 'currentAdmission.patient']);

            // Apply filters
            if ($request->has('ward_id')) {
                $query->where('ward_id', $request->ward_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('bed_type')) {
                $query->where('bed_type', $request->bed_type);
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('bed_number', 'like', "%{$search}%")
                      ->orWhereHas('ward', function ($wardQuery) use ($search) {
                          $wardQuery->where('name', 'like', "%{$search}%");
                      });
                });
            }

            $beds = $query->orderBy('ward_id')->orderBy('bed_number')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $beds
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load beds',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created bed.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ward_id' => 'required|exists:wards,id',
            'bed_number' => 'required|string|max:255',
            'bed_type' => 'required|in:single,double,icu,emergency',
            'daily_rate' => 'nullable|numeric|min:0',
            'amenities' => 'nullable|array',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check if bed number already exists in the ward
            $existingBed = Bed::where('ward_id', $request->ward_id)
                ->where('bed_number', $request->bed_number)
                ->first();

            if ($existingBed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bed number already exists in this ward'
                ], 400);
            }

            $bed = Bed::create($request->all());

            // Update ward bed counts
            $bed->ward->updateBedCounts();

            return response()->json([
                'success' => true,
                'message' => 'Bed created successfully',
                'data' => $bed->load(['ward'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create bed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified bed.
     */
    public function show(Bed $bed): JsonResponse
    {
        $bed->load(['ward', 'admissions.patient', 'currentAdmission.patient', 'transfersFrom', 'transfersTo']);

        return response()->json([
            'success' => true,
            'data' => $bed
        ]);
    }

    /**
     * Update the specified bed.
     */
    public function update(Request $request, Bed $bed): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bed_number' => 'sometimes|required|string|max:255',
            'bed_type' => 'sometimes|required|in:single,double,icu,emergency',
            'daily_rate' => 'nullable|numeric|min:0',
            'amenities' => 'nullable|array',
            'notes' => 'nullable|string',
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
            // Check if bed number already exists in the ward (excluding current bed)
            if ($request->has('bed_number') && $request->bed_number !== $bed->bed_number) {
                $existingBed = Bed::where('ward_id', $bed->ward_id)
                    ->where('bed_number', $request->bed_number)
                    ->where('id', '!=', $bed->id)
                    ->first();

                if ($existingBed) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Bed number already exists in this ward'
                    ], 400);
                }
            }

            $bed->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Bed updated successfully',
                'data' => $bed->load(['ward'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update bed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified bed.
     */
    public function destroy(Bed $bed): JsonResponse
    {
        try {
            // Check if bed is currently occupied
            if ($bed->isOccupied()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete occupied bed'
                ], 400);
            }

            $ward = $bed->ward;
            $bed->delete();

            // Update ward bed counts
            $ward->updateBedCounts();

            return response()->json([
                'success' => true,
                'message' => 'Bed deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete bed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update bed status.
     */
    public function updateStatus(Request $request, Bed $bed): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:available,occupied,maintenance,reserved'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $oldStatus = $bed->status;
            $bed->update(['status' => $request->status]);

            // Update ward bed counts
            $bed->ward->updateBedCounts();

            return response()->json([
                'success' => true,
                'message' => "Bed status updated from {$oldStatus} to {$request->status}",
                'data' => $bed->load(['ward'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update bed status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bed analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $analytics = [
                'total_beds' => Bed::count(),
                'available_beds' => Bed::available()->count(),
                'occupied_beds' => Bed::occupied()->count(),
                'maintenance_beds' => Bed::where('status', 'maintenance')->count(),
                'reserved_beds' => Bed::where('status', 'reserved')->count(),
                'bed_types' => Bed::selectRaw('bed_type, COUNT(*) as count')
                    ->groupBy('bed_type')
                    ->get(),
                'ward_distribution' => Bed::with('ward')
                    ->selectRaw('ward_id, COUNT(*) as count, SUM(CASE WHEN status = "occupied" THEN 1 ELSE 0 END) as occupied')
                    ->groupBy('ward_id')
                    ->get()
                    ->map(function ($bed) {
                        return [
                            'ward' => $bed->ward->name ?? 'Unknown',
                            'total_beds' => $bed->count,
                            'occupied_beds' => $bed->occupied
                        ];
                    })
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