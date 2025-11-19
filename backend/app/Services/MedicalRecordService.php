<?php

namespace App\Services;

use App\Models\MedicalRecord;
use App\Models\Diagnosis;
use App\Models\Prescription;
use App\Models\MedicalTest;
use Illuminate\Support\Facades\DB;

class MedicalRecordService
{
    /**
     * Create a new medical record with related data.
     */
    public function createMedicalRecord(array $data): MedicalRecord
    {
        return DB::transaction(function () use ($data) {
            // Create the medical record
            $medicalRecord = MedicalRecord::create([
                'patient_id' => $data['patient_id'],
                'doctor_id' => $data['doctor_id'],
                'appointment_id' => $data['appointment_id'] ?? null,
                'chief_complaint' => $data['chief_complaint'] ?? null,
                'examination_notes' => $data['examination_notes'] ?? null,
                'diagnosis' => $data['diagnosis'] ?? null,
                'treatment_plan' => $data['treatment_plan'] ?? null,
                'follow_up_date' => $data['follow_up_date'] ?? null,
            ]);

            // Create diagnoses if provided
            if (isset($data['diagnoses']) && is_array($data['diagnoses'])) {
                foreach ($data['diagnoses'] as $diagnosisData) {
                    $medicalRecord->diagnoses()->create([
                        'icd_code' => $diagnosisData['icd_code'] ?? null,
                        'diagnosis_name' => $diagnosisData['diagnosis_name'],
                        'severity' => $diagnosisData['severity'],
                        'notes' => $diagnosisData['notes'] ?? null,
                    ]);
                }
            }

            // Create prescriptions if provided
            if (isset($data['prescriptions']) && is_array($data['prescriptions'])) {
                foreach ($data['prescriptions'] as $prescriptionData) {
                    $medicalRecord->prescriptions()->create([
                        'medication_name' => $prescriptionData['medication_name'],
                        'dosage' => $prescriptionData['dosage'],
                        'frequency' => $prescriptionData['frequency'],
                        'duration' => $prescriptionData['duration'],
                        'instructions' => $prescriptionData['instructions'] ?? null,
                    ]);
                }
            }

            // Create medical tests if provided
            if (isset($data['medical_tests']) && is_array($data['medical_tests'])) {
                foreach ($data['medical_tests'] as $testData) {
                    $medicalRecord->medicalTests()->create([
                        'test_name' => $testData['test_name'],
                        'test_type' => $testData['test_type'],
                        'normal_range' => $testData['normal_range'] ?? null,
                    ]);
                }
            }

            return $medicalRecord->load(['patient', 'doctor', 'diagnoses', 'prescriptions', 'medicalTests']);
        });
    }

    /**
     * Get medical record statistics.
     */
    public function getStatistics(): array
    {
        return [
            'total_records' => MedicalRecord::count(),
            'active_records' => MedicalRecord::where('status', 'active')->count(),
            'completed_records' => MedicalRecord::where('status', 'completed')->count(),
            'total_diagnoses' => Diagnosis::count(),
            'total_prescriptions' => Prescription::count(),
            'total_tests' => MedicalTest::count(),
            'pending_tests' => MedicalTest::where('status', 'pending')->count(),
            'completed_tests' => MedicalTest::where('status', 'completed')->count(),
        ];
    }

    /**
     * Get patient medical history summary.
     */
    public function getPatientHistorySummary($patientId): array
    {
        $medicalRecords = MedicalRecord::where('patient_id', $patientId)
            ->with(['doctor', 'diagnoses', 'prescriptions', 'medicalTests'])
            ->orderBy('created_at', 'desc')
            ->get();

        $summary = [
            'total_visits' => $medicalRecords->count(),
            'last_visit' => $medicalRecords->first()?->created_at,
            'active_diagnoses' => $medicalRecords->flatMap->diagnoses->where('status', 'active')->count(),
            'chronic_conditions' => $medicalRecords->flatMap->diagnoses->where('status', 'chronic')->count(),
            'active_prescriptions' => $medicalRecords->flatMap->prescriptions->where('status', 'active')->count(),
            'pending_tests' => $medicalRecords->flatMap->medicalTests->where('status', 'pending')->count(),
            'recent_diagnoses' => $medicalRecords->flatMap->diagnoses->take(5),
            'recent_prescriptions' => $medicalRecords->flatMap->prescriptions->take(5),
        ];

        return $summary;
    }

    /**
     * Search medical records.
     */
    public function searchMedicalRecords(array $filters): \Illuminate\Database\Eloquent\Collection
    {
        $query = MedicalRecord::with(['patient', 'doctor', 'diagnoses', 'prescriptions']);

        if (isset($filters['patient_name'])) {
            $query->whereHas('patient', function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['patient_name'] . '%');
            });
        }

        if (isset($filters['doctor_name'])) {
            $query->whereHas('doctor', function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['doctor_name'] . '%');
            });
        }

        if (isset($filters['diagnosis'])) {
            $query->whereHas('diagnoses', function ($q) use ($filters) {
                $q->where('diagnosis_name', 'like', '%' . $filters['diagnosis'] . '%');
            });
        }

        if (isset($filters['medication'])) {
            $query->whereHas('prescriptions', function ($q) use ($filters) {
                $q->where('medication_name', 'like', '%' . $filters['medication'] . '%');
            });
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }
}
