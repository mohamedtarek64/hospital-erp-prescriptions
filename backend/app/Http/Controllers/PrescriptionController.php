<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\MedicalRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PrescriptionController extends Controller
{
    /**
     * Display a listing of prescriptions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Prescription::with(['medicalRecord.patient', 'medicalRecord.doctor']);

        // Filter by medical record
        if ($request->has('medical_record_id')) {
            $query->where('medical_record_id', $request->medical_record_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by medication name
        if ($request->has('medication_name')) {
            $query->where('medication_name', 'like', '%' . $request->medication_name . '%');
        }

        $prescriptions = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $prescriptions
        ]);
    }

    /**
     * Store a newly created prescription.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'medical_record_id' => 'required|exists:medical_records,id',
            'medication_name' => 'required|string|max:255',
            'dosage' => 'required|string|max:255',
            'frequency' => 'required|string|max:255',
            'duration' => 'required|string|max:255',
            'instructions' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $prescription = Prescription::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Prescription created successfully',
                'data' => $prescription->load(['medicalRecord.patient', 'medicalRecord.doctor'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified prescription.
     */
    public function show(Prescription $prescription): JsonResponse
    {
        $prescription->load(['medicalRecord.patient', 'medicalRecord.doctor']);

        return response()->json([
            'success' => true,
            'data' => $prescription
        ]);
    }

    /**
     * Update the specified prescription.
     */
    public function update(Request $request, Prescription $prescription): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'medication_name' => 'sometimes|required|string|max:255',
            'dosage' => 'sometimes|required|string|max:255',
            'frequency' => 'sometimes|required|string|max:255',
            'duration' => 'sometimes|required|string|max:255',
            'instructions' => 'nullable|string',
            'status' => 'sometimes|in:active,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $prescription->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Prescription updated successfully',
                'data' => $prescription->load(['medicalRecord.patient', 'medicalRecord.doctor'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified prescription.
     */
    public function destroy(Prescription $prescription): JsonResponse
    {
        try {
            $prescription->delete();

            return response()->json([
                'success' => true,
                'message' => 'Prescription deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active prescriptions for a patient.
     */
    public function getActivePrescriptions($patientId): JsonResponse
    {
        $prescriptions = Prescription::whereHas('medicalRecord', function ($query) use ($patientId) {
            $query->where('patient_id', $patientId);
        })
        ->where('status', 'active')
        ->with(['medicalRecord.doctor'])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $prescriptions
        ]);
    }
}
