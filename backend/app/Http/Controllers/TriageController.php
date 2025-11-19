<?php

namespace App\Http\Controllers;

use App\Models\TriageAssessment;
use App\Models\EmergencyCase;
use App\Services\EmergencyService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class TriageController extends Controller
{
    protected EmergencyService $emergencyService;

    public function __construct(EmergencyService $emergencyService)
    {
        $this->emergencyService = $emergencyService;
    }

    /**
     * Get all triage assessments
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $assessments = $this->emergencyService->getTriageAssessments($request->all());
            return response()->json($assessments);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create new triage assessment
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'patient_id' => 'required|exists:patients,id',
                'emergency_case_id' => 'nullable|exists:emergency_cases,id',
                'triage_level' => 'required|in:red,orange,yellow,green,blue',
                'vital_signs' => 'required|array',
                'vital_signs.blood_pressure' => 'nullable|array',
                'vital_signs.blood_pressure.systolic' => 'nullable|integer|min:50|max:300',
                'vital_signs.blood_pressure.diastolic' => 'nullable|integer|min:30|max:200',
                'vital_signs.heart_rate' => 'nullable|integer|min:30|max:250',
                'vital_signs.temperature' => 'nullable|numeric|min:30|max:45',
                'vital_signs.oxygen_saturation' => 'nullable|integer|min:50|max:100',
                'vital_signs.respiratory_rate' => 'nullable|integer|min:5|max:60',
                'symptoms' => 'required|string',
                'assessment_notes' => 'required|string',
                'assessed_by' => 'required|exists:staff,id',
                'pain_scale' => 'nullable|array',
                'pain_scale.score' => 'nullable|integer|min:0|max:10',
                'pain_scale.description' => 'nullable|string',
                'consciousness_level' => 'nullable|array',
                'consciousness_level.gcs_score' => 'nullable|integer|min:3|max:15',
                'consciousness_level.description' => 'nullable|string',
                'allergies' => 'nullable|string',
                'medications' => 'nullable|string',
                'medical_history' => 'nullable|string'
            ]);

            $assessment = $this->emergencyService->createTriageAssessment($validated);
            return response()->json($assessment, 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get specific triage assessment
     */
    public function show(TriageAssessment $triageAssessment): JsonResponse
    {
        try {
            $assessment = $this->emergencyService->getTriageAssessment($triageAssessment->id);
            return response()->json($assessment);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update triage assessment
     */
    public function update(Request $request, TriageAssessment $triageAssessment): JsonResponse
    {
        try {
            $validated = $request->validate([
                'triage_level' => 'sometimes|in:red,orange,yellow,green,blue',
                'vital_signs' => 'sometimes|array',
                'vital_signs.blood_pressure' => 'nullable|array',
                'vital_signs.blood_pressure.systolic' => 'nullable|integer|min:50|max:300',
                'vital_signs.blood_pressure.diastolic' => 'nullable|integer|min:30|max:200',
                'vital_signs.heart_rate' => 'nullable|integer|min:30|max:250',
                'vital_signs.temperature' => 'nullable|numeric|min:30|max:45',
                'vital_signs.oxygen_saturation' => 'nullable|integer|min:50|max:100',
                'vital_signs.respiratory_rate' => 'nullable|integer|min:5|max:60',
                'symptoms' => 'sometimes|string',
                'assessment_notes' => 'sometimes|string',
                'pain_scale' => 'nullable|array',
                'pain_scale.score' => 'nullable|integer|min:0|max:10',
                'pain_scale.description' => 'nullable|string',
                'consciousness_level' => 'nullable|array',
                'consciousness_level.gcs_score' => 'nullable|integer|min:3|max:15',
                'consciousness_level.description' => 'nullable|string',
                'allergies' => 'nullable|string',
                'medications' => 'nullable|string',
                'medical_history' => 'nullable|string'
            ]);

            $assessment = $this->emergencyService->updateTriageAssessment($triageAssessment->id, $validated);
            return response()->json($assessment);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get triage statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->emergencyService->getTriageStatistics();
            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get triage queue
     */
    public function queue(): JsonResponse
    {
        try {
            $queue = $this->emergencyService->getTriageQueue();
            return response()->json($queue);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get patient triage history
     */
    public function patientHistory(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'patient_id' => 'required|exists:patients,id'
            ]);

            $history = $this->emergencyService->getPatientTriageHistory($validated['patient_id']);
            return response()->json($history);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Calculate triage level based on vital signs
     */
    public function calculateTriageLevel(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'vital_signs' => 'required|array',
                'symptoms' => 'required|string',
                'pain_scale' => 'nullable|array',
                'consciousness_level' => 'nullable|array'
            ]);

            $triageLevel = $this->emergencyService->calculateTriageLevel($validated);
            return response()->json(['triage_level' => $triageLevel]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get critical patients requiring immediate attention
     */
    public function criticalPatients(): JsonResponse
    {
        try {
            $patients = $this->emergencyService->getCriticalPatients();
            return response()->json($patients);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete triage assessment
     */
    public function destroy(TriageAssessment $triageAssessment): JsonResponse
    {
        try {
            $this->emergencyService->deleteTriageAssessment($triageAssessment->id);
            return response()->json(['message' => 'Triage assessment deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
