<?php

namespace App\Http\Controllers;

use App\Models\EmergencyCase;
use App\Models\Ambulance;
use App\Models\AmbulanceDispatch;
use App\Models\TriageAssessment;
use App\Models\EmergencyContact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EmergencyController extends Controller
{
    /**
     * Get emergency dashboard data.
     */
    public function dashboard(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '24'); // hours
            $startDate = now()->subHours($period);

            $dashboardData = [
                'overview' => [
                    'total_cases' => EmergencyCase::where('call_received_at', '>=', $startDate)->count(),
                    'pending_cases' => EmergencyCase::pending()->where('call_received_at', '>=', $startDate)->count(),
                    'dispatched_cases' => EmergencyCase::dispatched()->where('call_received_at', '>=', $startDate)->count(),
                    'completed_cases' => EmergencyCase::completed()->where('call_received_at', '>=', $startDate)->count(),
                    'available_ambulances' => Ambulance::available()->active()->count(),
                    'busy_ambulances' => Ambulance::busy()->active()->count(),
                ],
                'response_times' => [
                    'average_response_time' => $this->getAverageResponseTime($startDate),
                    'average_transport_time' => $this->getAverageTransportTime($startDate),
                    'average_total_time' => $this->getAverageTotalTime($startDate),
                ],
                'case_types' => EmergencyCase::where('call_received_at', '>=', $startDate)
                    ->selectRaw('emergency_type, COUNT(*) as count')
                    ->groupBy('emergency_type')
                    ->get(),
                'severity_levels' => EmergencyCase::where('call_received_at', '>=', $startDate)
                    ->selectRaw('severity_level, COUNT(*) as count')
                    ->groupBy('severity_level')
                    ->get(),
                'recent_cases' => EmergencyCase::with(['patient', 'ambulance', 'assignedDoctor'])
                    ->where('call_received_at', '>=', $startDate)
                    ->latest('call_received_at')
                    ->limit(10)
                    ->get(),
                'ambulance_status' => Ambulance::active()
                    ->selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $dashboardData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load emergency dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get emergency cases with filtering.
     */
    public function getCases(Request $request): JsonResponse
    {
        try {
            $query = EmergencyCase::with(['patient', 'ambulance', 'assignedDoctor', 'assignedNurse']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('emergency_type')) {
                $query->where('emergency_type', $request->emergency_type);
            }

            if ($request->has('severity_level')) {
                $query->where('severity_level', $request->severity_level);
            }

            if ($request->has('date_from')) {
                $query->where('call_received_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('call_received_at', '<=', $request->date_to);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('case_number', 'like', "%{$search}%")
                      ->orWhere('patient_name', 'like', "%{$search}%")
                      ->orWhere('patient_phone', 'like', "%{$search}%")
                      ->orWhere('emergency_description', 'like', "%{$search}%");
                });
            }

            $cases = $query->latest('call_received_at')->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $cases
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load emergency cases',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new emergency case.
     */
    public function createCase(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'patient_name' => 'required|string|max:255',
                'patient_phone' => 'required|string|max:20',
                'patient_age' => 'nullable|integer|min:0|max:150',
                'patient_gender' => 'nullable|in:male,female,other',
                'emergency_description' => 'required|string',
                'emergency_type' => 'required|string|max:255',
                'severity_level' => 'required|in:critical,urgent,moderate,minor',
                'location' => 'required|string|max:255',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'caller_name' => 'nullable|string|max:255',
                'caller_phone' => 'nullable|string|max:20',
                'caller_relationship' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $caseData = $request->all();
            $caseData['case_number'] = EmergencyCase::generateCaseNumber();
            $caseData['call_received_at'] = now();
            $caseData['created_by'] = auth()->id();

            $case = EmergencyCase::create($caseData);

            return response()->json([
                'success' => true,
                'message' => 'Emergency case created successfully',
                'data' => $case->load(['patient', 'ambulance', 'assignedDoctor', 'assignedNurse'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create emergency case',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update emergency case.
     */
    public function updateCase(Request $request, $id): JsonResponse
    {
        try {
            $case = EmergencyCase::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'patient_name' => 'sometimes|string|max:255',
                'patient_phone' => 'sometimes|string|max:20',
                'patient_age' => 'nullable|integer|min:0|max:150',
                'patient_gender' => 'nullable|in:male,female,other',
                'emergency_description' => 'sometimes|string',
                'emergency_type' => 'sometimes|string|max:255',
                'severity_level' => 'sometimes|in:critical,urgent,moderate,minor',
                'location' => 'sometimes|string|max:255',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'status' => 'sometimes|in:pending,dispatched,en_route,arrived,completed,cancelled',
                'notes' => 'nullable|string',
                'vital_signs' => 'nullable|array',
                'treatment_given' => 'nullable|string',
                'assigned_doctor_id' => 'nullable|exists:users,id',
                'assigned_nurse_id' => 'nullable|exists:users,id',
                'ambulance_id' => 'nullable|exists:ambulances,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $case->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Emergency case updated successfully',
                'data' => $case->load(['patient', 'ambulance', 'assignedDoctor', 'assignedNurse'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update emergency case',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dispatch ambulance to emergency case.
     */
    public function dispatchAmbulance(Request $request, $caseId): JsonResponse
    {
        try {
            $case = EmergencyCase::findOrFail($caseId);

            if ($case->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Case is not in pending status'
                ], 400);
            }

            $validator = Validator::make($request->all(), [
                'ambulance_id' => 'required|exists:ambulances,id',
                'dispatch_notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $ambulance = Ambulance::findOrFail($request->ambulance_id);

            if (!$ambulance->isAvailable()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ambulance is not available'
                ], 400);
            }

            DB::beginTransaction();

            // Update case status
            $case->update([
                'status' => 'dispatched',
                'ambulance_id' => $request->ambulance_id,
                'ambulance_dispatched_at' => now()
            ]);

            // Update ambulance status
            $ambulance->update(['status' => 'busy']);

            // Create dispatch record
            $dispatch = AmbulanceDispatch::create([
                'emergency_case_id' => $case->id,
                'ambulance_id' => $request->ambulance_id,
                'dispatched_by' => auth()->id(),
                'dispatch_time' => now(),
                'status' => 'dispatched',
                'dispatch_notes' => $request->dispatch_notes
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ambulance dispatched successfully',
                'data' => [
                    'case' => $case->load(['patient', 'ambulance', 'assignedDoctor', 'assignedNurse']),
                    'dispatch' => $dispatch
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to dispatch ambulance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update dispatch status.
     */
    public function updateDispatchStatus(Request $request, $dispatchId): JsonResponse
    {
        try {
            $dispatch = AmbulanceDispatch::findOrFail($dispatchId);

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:acknowledged,en_route,on_scene,transporting,completed,cancelled',
                'notes' => 'nullable|string',
                'cancellation_reason' => 'required_if:status,cancelled|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = [
                'status' => $request->status,
                'notes' => $request->notes
            ];

            // Set appropriate timestamp based on status
            switch ($request->status) {
                case 'acknowledged':
                    $updateData['acknowledged_time'] = now();
                    break;
                case 'en_route':
                    $updateData['en_route_time'] = now();
                    break;
                case 'on_scene':
                    $updateData['arrived_at_scene_time'] = now();
                    break;
                case 'transporting':
                    $updateData['departed_from_scene_time'] = now();
                    break;
                case 'completed':
                    $updateData['arrived_at_hospital_time'] = now();
                    $updateData['completed_time'] = now();
                    break;
                case 'cancelled':
                    $updateData['cancellation_reason'] = $request->cancellation_reason;
                    $updateData['cancelled_by'] = auth()->id();
                    break;
            }

            $dispatch->update($updateData);

            // Update case status if needed
            if (in_array($request->status, ['completed', 'cancelled'])) {
                $dispatch->emergencyCase->update(['status' => $request->status]);
                
                // Make ambulance available if completed or cancelled
                $dispatch->ambulance->update(['status' => 'available']);
            }

            // Calculate and update times
            $dispatch->updateResponseTime();
            $dispatch->updateTransportTime();
            $dispatch->updateTotalTime();

            return response()->json([
                'success' => true,
                'message' => 'Dispatch status updated successfully',
                'data' => $dispatch->load(['emergencyCase', 'ambulance', 'dispatcher'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update dispatch status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available ambulances for dispatch.
     */
    public function getAvailableAmbulances(Request $request): JsonResponse
    {
        try {
            $query = Ambulance::available()->active()->with(['driver', 'paramedic']);

            if ($request->has('vehicle_type')) {
                $query->where('vehicle_type', $request->vehicle_type);
            }

            if ($request->has('latitude') && $request->has('longitude')) {
                $latitude = $request->latitude;
                $longitude = $request->longitude;

                $ambulances = $query->get()->map(function ($ambulance) use ($latitude, $longitude) {
                    $distance = $ambulance->calculateDistanceTo($latitude, $longitude);
                    $ambulance->distance_km = $distance;
                    return $ambulance;
                })->sortBy('distance_km');
            } else {
                $ambulances = $query->get();
            }

            return response()->json([
                'success' => true,
                'data' => $ambulances
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load available ambulances',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get emergency case statistics.
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $statistics = [
                'total_cases' => EmergencyCase::where('call_received_at', '>=', $startDate)->count(),
                'cases_by_type' => EmergencyCase::where('call_received_at', '>=', $startDate)
                    ->selectRaw('emergency_type, COUNT(*) as count')
                    ->groupBy('emergency_type')
                    ->get(),
                'cases_by_severity' => EmergencyCase::where('call_received_at', '>=', $startDate)
                    ->selectRaw('severity_level, COUNT(*) as count')
                    ->groupBy('severity_level')
                    ->get(),
                'cases_by_status' => EmergencyCase::where('call_received_at', '>=', $startDate)
                    ->selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->get(),
                'response_times' => [
                    'average' => $this->getAverageResponseTime($startDate),
                    'min' => $this->getMinResponseTime($startDate),
                    'max' => $this->getMaxResponseTime($startDate),
                ],
                'daily_cases' => EmergencyCase::where('call_received_at', '>=', $startDate)
                    ->selectRaw('DATE(call_received_at) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $statistics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get average response time.
     */
    private function getAverageResponseTime($startDate)
    {
        return AmbulanceDispatch::where('dispatch_time', '>=', $startDate)
            ->whereNotNull('response_time_minutes')
            ->avg('response_time_minutes');
    }

    /**
     * Get average transport time.
     */
    private function getAverageTransportTime($startDate)
    {
        return AmbulanceDispatch::where('dispatch_time', '>=', $startDate)
            ->whereNotNull('transport_time_minutes')
            ->avg('transport_time_minutes');
    }

    /**
     * Get average total time.
     */
    private function getAverageTotalTime($startDate)
    {
        return AmbulanceDispatch::where('dispatch_time', '>=', $startDate)
            ->whereNotNull('total_time_minutes')
            ->avg('total_time_minutes');
    }

    /**
     * Get minimum response time.
     */
    private function getMinResponseTime($startDate)
    {
        return AmbulanceDispatch::where('dispatch_time', '>=', $startDate)
            ->whereNotNull('response_time_minutes')
            ->min('response_time_minutes');
    }

    /**
     * Get maximum response time.
     */
    private function getMaxResponseTime($startDate)
    {
        return AmbulanceDispatch::where('dispatch_time', '>=', $startDate)
            ->whereNotNull('response_time_minutes')
            ->max('response_time_minutes');
    }
}