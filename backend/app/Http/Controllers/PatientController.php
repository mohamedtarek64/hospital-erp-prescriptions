<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    /**
     * Display a listing of patients.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Patient::with(['createdBy', 'updatedBy']);

            // Search functionality
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('patient_id', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }

            // Filter by gender
            if ($request->has('gender')) {
                $query->where('gender', $request->get('gender'));
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $patients = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $patients,
                'message' => 'Patients retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving patients: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created patient.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'date_of_birth' => 'required|date|before:today',
                'gender' => 'required|in:male,female,other',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'address' => 'nullable|string',
                'emergency_contact_name' => 'nullable|string|max:255',
                'emergency_contact_phone' => 'nullable|string|max:20',
                'medical_history' => 'nullable|array',
                'allergies' => 'nullable|array',
                'blood_type' => 'nullable|string|max:10',
                'insurance_provider' => 'nullable|string|max:255',
                'insurance_number' => 'nullable|string|max:255',
                'status' => 'nullable|in:active,inactive,deceased'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Generate unique patient ID
            $patientId = 'PAT-' . str_pad(Patient::count() + 1, 6, '0', STR_PAD_LEFT);

            $patient = Patient::create([
                'patient_id' => $patientId,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'phone' => $request->phone,
                'email' => $request->email,
                'address' => $request->address,
                'emergency_contact_name' => $request->emergency_contact_name,
                'emergency_contact_phone' => $request->emergency_contact_phone,
                'medical_history' => $request->medical_history,
                'allergies' => $request->allergies,
                'blood_type' => $request->blood_type,
                'insurance_provider' => $request->insurance_provider,
                'insurance_number' => $request->insurance_number,
                'status' => $request->status ?? 'active',
                'created_by' => auth()->id(),
                'updated_by' => auth()->id()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $patient->load(['createdBy', 'updatedBy']),
                'message' => 'Patient created successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error creating patient: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified patient.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $patient = Patient::with([
                'createdBy', 
                'updatedBy', 
                'medicalRecords', 
                'prescriptions', 
                'appointments', 
                'admissions'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $patient,
                'message' => 'Patient retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Patient not found'
            ], 404);
        }
    }

    /**
     * Update the specified patient.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $patient = Patient::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'first_name' => 'sometimes|required|string|max:255',
                'last_name' => 'sometimes|required|string|max:255',
                'date_of_birth' => 'sometimes|required|date|before:today',
                'gender' => 'sometimes|required|in:male,female,other',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'address' => 'nullable|string',
                'emergency_contact_name' => 'nullable|string|max:255',
                'emergency_contact_phone' => 'nullable|string|max:20',
                'medical_history' => 'nullable|array',
                'allergies' => 'nullable|array',
                'blood_type' => 'nullable|string|max:10',
                'insurance_provider' => 'nullable|string|max:255',
                'insurance_number' => 'nullable|string|max:255',
                'status' => 'nullable|in:active,inactive,deceased'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $patient->update([
                ...$request->only([
                    'first_name', 'last_name', 'date_of_birth', 'gender',
                    'phone', 'email', 'address', 'emergency_contact_name',
                    'emergency_contact_phone', 'medical_history', 'allergies',
                    'blood_type', 'insurance_provider', 'insurance_number', 'status'
                ]),
                'updated_by' => auth()->id()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $patient->load(['createdBy', 'updatedBy']),
                'message' => 'Patient updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error updating patient: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified patient.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $patient = Patient::findOrFail($id);

            // Check if patient has related records
            if ($patient->medicalRecords()->count() > 0 || 
                $patient->prescriptions()->count() > 0 || 
                $patient->appointments()->count() > 0 || 
                $patient->admissions()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete patient with existing medical records'
                ], 400);
            }

            $patient->delete();

            return response()->json([
                'success' => true,
                'message' => 'Patient deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting patient: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get patient statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_patients' => Patient::count(),
                'active_patients' => Patient::where('status', 'active')->count(),
                'inactive_patients' => Patient::where('status', 'inactive')->count(),
                'deceased_patients' => Patient::where('status', 'deceased')->count(),
                'male_patients' => Patient::where('gender', 'male')->count(),
                'female_patients' => Patient::where('gender', 'female')->count(),
                'patients_by_month' => Patient::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
                    ->whereYear('created_at', date('Y'))
                    ->groupBy('month')
                    ->orderBy('month')
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Patient statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving patient statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search patients with advanced filters.
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = Patient::with(['createdBy', 'updatedBy']);

            // Search functionality
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('patient_id', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }

            // Filter by gender
            if ($request->has('gender')) {
                $query->where('gender', $request->get('gender'));
            }

            // Filter by blood type
            if ($request->has('blood_type')) {
                $query->where('blood_type', $request->get('blood_type'));
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $patients = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $patients,
                'message' => 'Patients retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving patients: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get patient medical history.
     */
    public function medicalHistory(string $id): JsonResponse
    {
        try {
            $patient = Patient::with([
                'medicalRecords.doctor',
                'prescriptions.medicine',
                'appointments.doctor'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'patient' => $patient,
                    'medical_records' => $patient->medicalRecords,
                    'prescriptions' => $patient->prescriptions,
                    'appointments' => $patient->appointments
                ],
                'message' => 'Patient medical history retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving patient medical history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get patient appointments.
     */
    public function appointments(string $id): JsonResponse
    {
        try {
            $patient = Patient::findOrFail($id);
            $appointments = $patient->appointments()
                ->with(['doctor', 'department'])
                ->orderBy('appointment_date', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $appointments,
                'message' => 'Patient appointments retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving patient appointments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get patient prescriptions.
     */
    public function prescriptions(string $id): JsonResponse
    {
        try {
            $patient = Patient::findOrFail($id);
            $prescriptions = $patient->prescriptions()
                ->with(['medicine', 'doctor'])
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $prescriptions,
                'message' => 'Patient prescriptions retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving patient prescriptions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get patient invoices.
     */
    public function invoices(string $id): JsonResponse
    {
        try {
            $patient = Patient::findOrFail($id);
            $invoices = $patient->invoices()
                ->with(['invoiceItems.service'])
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $invoices,
                'message' => 'Patient invoices retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving patient invoices: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get patient lab requests.
     */
    public function labRequests(string $id): JsonResponse
    {
        try {
            $patient = Patient::findOrFail($id);
            $labRequests = $patient->labRequests()
                ->with(['labTests', 'doctor'])
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $labRequests,
                'message' => 'Patient lab requests retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving patient lab requests: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update patient emergency contact.
     */
    public function updateEmergencyContact(Request $request, string $id): JsonResponse
    {
        try {
            $patient = Patient::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'emergency_contact_name' => 'required|string|max:255',
                'emergency_contact_phone' => 'required|string|max:20'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $patient->update([
                'emergency_contact_name' => $request->emergency_contact_name,
                'emergency_contact_phone' => $request->emergency_contact_phone,
                'updated_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'data' => $patient,
                'message' => 'Emergency contact updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating emergency contact: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export patients data.
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $query = Patient::with(['createdBy', 'updatedBy']);

            // Apply filters if provided
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }

            if ($request->has('gender')) {
                $query->where('gender', $request->get('gender'));
            }

            if ($request->has('blood_type')) {
                $query->where('blood_type', $request->get('blood_type'));
            }

            $patients = $query->orderBy('created_at', 'desc')->get();

            // Format data for export
            $exportData = $patients->map(function ($patient) {
                return [
                    'Patient ID' => $patient->patient_id,
                    'Full Name' => $patient->full_name,
                    'Date of Birth' => $patient->date_of_birth?->format('Y-m-d'),
                    'Age' => $patient->age,
                    'Gender' => ucfirst($patient->gender),
                    'Phone' => $patient->phone,
                    'Email' => $patient->email,
                    'Blood Type' => $patient->blood_type,
                    'Status' => ucfirst($patient->status),
                    'Emergency Contact' => $patient->emergency_contact_name,
                    'Emergency Phone' => $patient->emergency_contact_phone,
                    'Insurance Provider' => $patient->insurance_provider,
                    'Insurance Number' => $patient->insurance_number,
                    'Created At' => $patient->created_at?->format('Y-m-d H:i:s'),
                    'Updated At' => $patient->updated_at?->format('Y-m-d H:i:s')
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $exportData,
                'message' => 'Patients data exported successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error exporting patients data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import patients data.
     */
    public function import(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'patients' => 'required|array',
                'patients.*.first_name' => 'required|string|max:255',
                'patients.*.last_name' => 'required|string|max:255',
                'patients.*.date_of_birth' => 'required|date|before:today',
                'patients.*.gender' => 'required|in:male,female,other',
                'patients.*.phone' => 'nullable|string|max:20',
                'patients.*.email' => 'nullable|email|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $importedPatients = [];
            $errors = [];

            foreach ($request->patients as $index => $patientData) {
                try {
                    // Check if patient already exists
                    $existingPatient = Patient::where('email', $patientData['email'])
                        ->orWhere('phone', $patientData['phone'])
                        ->first();

                    if ($existingPatient) {
                        $errors[] = "Row " . ($index + 1) . ": Patient already exists";
                        continue;
                    }

                    $patient = Patient::create([
                        ...$patientData,
                        'status' => $patientData['status'] ?? 'active',
                        'created_by' => auth()->id(),
                        'updated_by' => auth()->id()
                    ]);

                    $importedPatients[] = $patient;
                } catch (\Exception $e) {
                    $errors[] = "Row " . ($index + 1) . ": " . $e->getMessage();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'imported_count' => count($importedPatients),
                    'error_count' => count($errors),
                    'imported_patients' => $importedPatients,
                    'errors' => $errors
                ],
                'message' => 'Patients import completed'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error importing patients: ' . $e->getMessage()
            ], 500);
        }
    }
}
