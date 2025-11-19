<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\Bed;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdmissionController extends Controller
{
    /**
     * Display a listing of admissions.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Admission::with(['patient', 'bed.ward', 'doctor', 'admittedBy']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('admission_type')) {
                $query->where('admission_type', $request->admission_type);
            }

            if ($request->has('patient_id')) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('doctor_id')) {
                $query->where('doctor_id', $request->doctor_id);
            }

            if ($request->has('ward_id')) {
                $query->whereHas('bed', function ($q) use ($request) {
                    $q->where('ward_id', $request->ward_id);
                });
            }

            if ($request->has('date_from')) {
                $query->whereDate('admission_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('admission_date', '<=', $request->date_to);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('admission_number', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($patientQuery) use ($search) {
                          $patientQuery->where('name', 'like', "%{$search}%")
                                     ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            $admissions = $query->orderBy('admission_date', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $admissions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load admissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created admission.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:users,id',
            'bed_id' => 'required|exists:beds,id',
            'doctor_id' => 'required|exists:users,id',
            'admission_date' => 'required|date',
            'admission_time' => 'required|date_format:H:i',
            'admission_type' => 'required|in:emergency,planned,transfer',
            'admission_reason' => 'nullable|string',
            'medical_notes' => 'nullable|string',
            'vital_signs' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Check if bed is available
            $bed = Bed::findOrFail($request->bed_id);
            if (!$bed->isAvailable()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Selected bed is not available'
                ], 400);
            }

            // Check if patient is already admitted
            $existingAdmission = Admission::where('patient_id', $request->patient_id)
                ->where('status', 'admitted')
                ->first();

            if ($existingAdmission) {
                return response()->json([
                    'success' => false,
                    'message' => 'Patient is already admitted'
                ], 400);
            }

            $admission = Admission::create([
                'patient_id' => $request->patient_id,
                'bed_id' => $request->bed_id,
                'doctor_id' => $request->doctor_id,
                'admission_number' => Admission::generateAdmissionNumber(),
                'admission_date' => $request->admission_date,
                'admission_time' => $request->admission_time,
                'admission_type' => $request->admission_type,
                'admission_reason' => $request->admission_reason,
                'medical_notes' => $request->medical_notes,
                'vital_signs' => $request->vital_signs,
                'admitted_by' => auth()->id()
            ]);

            // Mark bed as occupied
            $bed->markAsOccupied();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Patient admitted successfully',
                'data' => $admission->load(['patient', 'bed.ward', 'doctor', 'admittedBy'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to admit patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified admission.
     */
    public function show(Admission $admission): JsonResponse
    {
        $admission->load([
            'patient', 
            'bed.ward', 
            'doctor', 
            'admittedBy', 
            'dischargedBy',
            'bedTransfers.fromBed.ward',
            'bedTransfers.toBed.ward',
            'visitorLogs'
        ]);

        return response()->json([
            'success' => true,
            'data' => $admission
        ]);
    }

    /**
     * Update the specified admission.
     */
    public function update(Request $request, Admission $admission): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'admission_reason' => 'nullable|string',
            'medical_notes' => 'nullable|string',
            'vital_signs' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Only allow updates for active admissions
            if (!$admission->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update non-active admission'
                ], 400);
            }

            $admission->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Admission updated successfully',
                'data' => $admission->load(['patient', 'bed.ward', 'doctor'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update admission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Discharge patient.
     */
    public function discharge(Request $request, Admission $admission): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'discharge_notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            if (!$admission->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Patient is not currently admitted'
                ], 400);
            }

            $admission->discharge($request->discharge_notes, auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Patient discharged successfully',
                'data' => $admission->load(['patient', 'bed.ward', 'doctor', 'dischargedBy'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to discharge patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transfer patient to another bed.
     */
    public function transfer(Request $request, Admission $admission): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'to_bed_id' => 'required|exists:beds,id',
            'transfer_reason' => 'required|string',
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
            if (!$admission->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Patient is not currently admitted'
                ], 400);
            }

            $toBed = Bed::findOrFail($request->to_bed_id);
            if (!$toBed->isAvailable()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Target bed is not available'
                ], 400);
            }

            DB::beginTransaction();

            // Create transfer record
            $admission->bedTransfers()->create([
                'from_bed_id' => $admission->bed_id,
                'to_bed_id' => $request->to_bed_id,
                'transfer_date' => now(),
                'transfer_reason' => $request->transfer_reason,
                'notes' => $request->notes,
                'transferred_by' => auth()->id()
            ]);

            // Update admission
            $oldBed = $admission->bed;
            $admission->update(['bed_id' => $request->to_bed_id]);

            // Update bed statuses
            $oldBed->markAsAvailable();
            $toBed->markAsOccupied();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Patient transferred successfully',
                'data' => $admission->load(['patient', 'bed.ward', 'doctor'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to transfer patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get admission analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'total_admissions' => Admission::where('admission_date', '>=', $startDate)->count(),
                'active_admissions' => Admission::active()->count(),
                'discharged_admissions' => Admission::discharged()->where('discharge_date', '>=', $startDate)->count(),
                'emergency_admissions' => Admission::where('admission_date', '>=', $startDate)->ofType('emergency')->count(),
                'planned_admissions' => Admission::where('admission_date', '>=', $startDate)->ofType('planned')->count(),
                'transfer_admissions' => Admission::where('admission_date', '>=', $startDate)->ofType('transfer')->count(),
                'average_length_of_stay' => Admission::discharged()
                    ->where('discharge_date', '>=', $startDate)
                    ->get()
                    ->avg(function ($admission) {
                        return $admission->getLengthOfStay();
                    }),
                'admission_types' => Admission::where('admission_date', '>=', $startDate)
                    ->selectRaw('admission_type, COUNT(*) as count')
                    ->groupBy('admission_type')
                    ->get(),
                'daily_admissions' => Admission::where('admission_date', '>=', $startDate)
                    ->selectRaw('DATE(admission_date) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get(),
                'ward_admissions' => Admission::with('bed.ward')
                    ->where('admission_date', '>=', $startDate)
                    ->selectRaw('bed_id, COUNT(*) as count')
                    ->groupBy('bed_id')
                    ->get()
                    ->map(function ($admission) {
                        return [
                            'ward' => $admission->bed->ward->name ?? 'Unknown',
                            'count' => $admission->count
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