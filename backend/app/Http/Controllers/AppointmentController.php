<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    /**
     * Display a listing of appointments.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Appointment::with(['patient', 'doctor', 'department', 'createdBy', 'updatedBy']);

            // Search functionality
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('appointment_id', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($patientQuery) use ($search) {
                          $patientQuery->where('first_name', 'like', "%{$search}%")
                                      ->orWhere('last_name', 'like', "%{$search}%")
                                      ->orWhere('patient_id', 'like', "%{$search}%");
                      })
                      ->orWhereHas('doctor', function ($doctorQuery) use ($search) {
                          $doctorQuery->where('name', 'like', "%{$search}%");
                      });
                });
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }

            // Filter by type
            if ($request->has('type')) {
                $query->where('type', $request->get('type'));
            }

            // Filter by doctor
            if ($request->has('doctor_id')) {
                $query->where('doctor_id', $request->get('doctor_id'));
            }

            // Filter by patient
            if ($request->has('patient_id')) {
                $query->where('patient_id', $request->get('patient_id'));
            }

            // Filter by date range
            if ($request->has('date_from')) {
                $query->whereDate('appointment_date', '>=', $request->get('date_from'));
            }

            if ($request->has('date_to')) {
                $query->whereDate('appointment_date', '<=', $request->get('date_to'));
            }

            // Sort
            $sortBy = $request->get('sort_by', 'appointment_date');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $appointments = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $appointments,
                'message' => 'Appointments retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving appointments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created appointment.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'patient_id' => 'required|exists:patients,id',
                'doctor_id' => 'required|exists:users,id',
                'department_id' => 'nullable|exists:departments,id',
                'appointment_date' => 'required|date|after:now',
                'type' => 'required|in:consultation,follow_up,emergency,routine_checkup,specialist',
                'reason' => 'nullable|string',
                'notes' => 'nullable|string',
                'consultation_fee' => 'nullable|numeric|min:0',
                'payment_status' => 'nullable|in:pending,paid,partial,waived'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Generate unique appointment ID
            $appointmentId = 'APT' . str_pad(Appointment::count() + 1, 6, '0', STR_PAD_LEFT);

            $appointment = Appointment::create([
                'appointment_id' => $appointmentId,
                'patient_id' => $request->patient_id,
                'doctor_id' => $request->doctor_id,
                'department_id' => $request->department_id,
                'appointment_date' => $request->appointment_date,
                'type' => $request->type,
                'reason' => $request->reason,
                'notes' => $request->notes,
                'consultation_fee' => $request->consultation_fee,
                'payment_status' => $request->payment_status ?? 'pending',
                'created_by' => auth()->id(),
                'updated_by' => auth()->id()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $appointment->load(['patient', 'doctor', 'department', 'createdBy', 'updatedBy']),
                'message' => 'Appointment created successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error creating appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified appointment.
     */
    public function show(Appointment $appointment): JsonResponse
    {
        try {
            $appointment->load(['patient', 'doctor', 'department', 'createdBy', 'updatedBy']);

            return response()->json([
                'success' => true,
                'data' => $appointment,
                'message' => 'Appointment retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified appointment.
     */
    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'patient_id' => 'sometimes|required|exists:patients,id',
                'doctor_id' => 'sometimes|required|exists:users,id',
                'department_id' => 'nullable|exists:departments,id',
                'appointment_date' => 'sometimes|required|date',
                'status' => 'sometimes|required|in:scheduled,confirmed,in_progress,completed,cancelled,no_show',
                'type' => 'sometimes|required|in:consultation,follow_up,emergency,routine_checkup,specialist',
                'reason' => 'nullable|string',
                'notes' => 'nullable|string',
                'diagnosis' => 'nullable|string',
                'treatment_plan' => 'nullable|string',
                'consultation_fee' => 'nullable|numeric|min:0',
                'payment_status' => 'nullable|in:pending,paid,partial,waived'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $appointment->update(array_merge(
                $request->only([
                    'patient_id', 'doctor_id', 'department_id', 'appointment_date',
                    'status', 'type', 'reason', 'notes', 'diagnosis',
                    'treatment_plan', 'consultation_fee', 'payment_status'
                ]),
                ['updated_by' => auth()->id()]
            ));

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $appointment->load(['patient', 'doctor', 'department', 'createdBy', 'updatedBy']),
                'message' => 'Appointment updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error updating appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified appointment.
     */
    public function destroy(Appointment $appointment): JsonResponse
    {
        try {
            DB::beginTransaction();

            $appointment->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Appointment deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error deleting appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get today's appointments.
     */
    public function today(Request $request): JsonResponse
    {
        try {
            $query = Appointment::with(['patient', 'doctor', 'department'])
                ->today();

            // Filter by doctor if provided
            if ($request->has('doctor_id')) {
                $query->forDoctor($request->get('doctor_id'));
            }

            // Filter by status if provided
            if ($request->has('status')) {
                $query->withStatus($request->get('status'));
            }

            $appointments = $query->orderBy('appointment_date', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $appointments,
                'message' => 'Today\'s appointments retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving today\'s appointments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get appointment statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_appointments' => Appointment::count(),
                'today_appointments' => Appointment::today()->count(),
                'pending_appointments' => Appointment::where('status', 'scheduled')->count(),
                'completed_appointments' => Appointment::where('status', 'completed')->count(),
                'cancelled_appointments' => Appointment::where('status', 'cancelled')->count(),
                'appointments_by_type' => Appointment::selectRaw('type, COUNT(*) as count')
                    ->groupBy('type')
                    ->pluck('count', 'type'),
                'appointments_by_status' => Appointment::selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->pluck('count', 'status'),
                'recent_appointments' => Appointment::with(['patient', 'doctor'])
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Appointment statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving appointment statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}
