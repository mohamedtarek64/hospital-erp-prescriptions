<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use App\Models\Diagnosis;
use App\Models\Prescription;
use App\Models\MedicalTest;
use App\Models\MedicalAttachment;
use App\Services\MedicalRecordService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MedicalRecordController extends Controller
{
    protected $medicalRecordService;

    public function __construct(MedicalRecordService $medicalRecordService)
    {
        $this->medicalRecordService = $medicalRecordService;
    }

    /**
     * Display a listing of medical records.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MedicalRecord::with(['patient', 'doctor', 'diagnoses', 'prescriptions', 'medicalTests']);

        // Filter by patient
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        // Filter by doctor
        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $medicalRecords = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $medicalRecords
        ]);
    }

    /**
     * Store a newly created medical record.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:users,id',
            'doctor_id' => 'required|exists:users,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'chief_complaint' => 'nullable|string',
            'examination_notes' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'follow_up_date' => 'nullable|date|after:today',
            'diagnoses' => 'nullable|array',
            'diagnoses.*.icd_code' => 'nullable|string',
            'diagnoses.*.diagnosis_name' => 'required|string',
            'diagnoses.*.severity' => 'required|in:mild,moderate,severe,critical',
            'diagnoses.*.notes' => 'nullable|string',
            'prescriptions' => 'nullable|array',
            'prescriptions.*.medication_name' => 'required|string',
            'prescriptions.*.dosage' => 'required|string',
            'prescriptions.*.frequency' => 'required|string',
            'prescriptions.*.duration' => 'required|string',
            'prescriptions.*.instructions' => 'nullable|string',
            'medical_tests' => 'nullable|array',
            'medical_tests.*.test_name' => 'required|string',
            'medical_tests.*.test_type' => 'required|string',
            'medical_tests.*.normal_range' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $medicalRecord = $this->medicalRecordService->createMedicalRecord($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Medical record created successfully',
                'data' => $medicalRecord->load(['patient', 'doctor', 'diagnoses', 'prescriptions', 'medicalTests'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create medical record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified medical record.
     */
    public function show(MedicalRecord $medicalRecord): JsonResponse
    {
        $medicalRecord->load(['patient', 'doctor', 'appointment', 'diagnoses', 'prescriptions', 'medicalTests', 'attachments.uploader']);

        return response()->json([
            'success' => true,
            'data' => $medicalRecord
        ]);
    }

    /**
     * Update the specified medical record.
     */
    public function update(Request $request, MedicalRecord $medicalRecord): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'chief_complaint' => 'nullable|string',
            'examination_notes' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'follow_up_date' => 'nullable|date',
            'status' => 'nullable|in:active,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $medicalRecord->update($request->only([
                'chief_complaint',
                'examination_notes',
                'diagnosis',
                'treatment_plan',
                'follow_up_date',
                'status'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Medical record updated successfully',
                'data' => $medicalRecord->load(['patient', 'doctor', 'diagnoses', 'prescriptions', 'medicalTests'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update medical record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified medical record.
     */
    public function destroy(MedicalRecord $medicalRecord): JsonResponse
    {
        try {
            // Delete associated files
            foreach ($medicalRecord->attachments as $attachment) {
                Storage::delete($attachment->file_path);
            }

            $medicalRecord->delete();

            return response()->json([
                'success' => true,
                'message' => 'Medical record deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete medical record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get patient medical history.
     */
    public function getPatientHistory($patientId): JsonResponse
    {
        $medicalRecords = MedicalRecord::where('patient_id', $patientId)
            ->with(['doctor', 'diagnoses', 'prescriptions', 'medicalTests'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $medicalRecords
        ]);
    }

    /**
     * Upload medical record attachment.
     */
    public function uploadAttachment(Request $request, MedicalRecord $medicalRecord): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('medical_attachments', $fileName, 'public');

            $attachment = $medicalRecord->attachments()->create([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                'data' => $attachment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload file',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
