<?php

namespace App\Services;

use App\Models\Admission;
use App\Models\Patient;
use App\Models\Bed;
use App\Models\BedAssignment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdmissionManagementService
{
    /**
     * Get admissions with filters and pagination.
     */
    public function getAdmissions(array $filters = [])
    {
        $query = Admission::with([
            'patient',
            'bed.room.ward',
            'referringDoctor',
            'bedAssignments'
        ]);

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['admission_type'])) {
            $query->where('admission_type', $filters['admission_type']);
        }

        if (isset($filters['ward_id'])) {
            $query->whereHas('bed.room', function ($q) use ($filters) {
                $q->where('ward_id', $filters['ward_id']);
            });
        }

        if (isset($filters['patient_id'])) {
            $query->where('patient_id', $filters['patient_id']);
        }

        if (isset($filters['referring_doctor_id'])) {
            $query->where('referring_doctor_id', $filters['referring_doctor_id']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('admission_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('admission_date', '<=', $filters['date_to']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('patient', function ($patientQuery) use ($search) {
                    $patientQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                })
                ->orWhere('diagnosis', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'admission_date';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Apply pagination
        $perPage = $filters['per_page'] ?? 15;
        return $query->paginate($perPage);
    }

    /**
     * Create a new admission.
     */
    public function createAdmission(array $data): Admission
    {
        return DB::transaction(function () use ($data) {
            // Validate patient exists
            $patient = Patient::findOrFail($data['patient_id']);

            // Check if patient already has an active admission
            $existingAdmission = Admission::where('patient_id', $data['patient_id'])
                ->where('status', 'active')
                ->first();

            if ($existingAdmission) {
                throw new \Exception('Patient already has an active admission');
            }

            // Validate bed is available
            $bed = Bed::findOrFail($data['bed_id']);
            if ($bed->status !== 'available') {
                throw new \Exception('Selected bed is not available');
            }

            // Create admission
            $admission = Admission::create($data);

            // Update bed status
            $bed->update(['status' => 'occupied']);

            // Create bed assignment
            BedAssignment::create([
                'admission_id' => $admission->id,
                'bed_id' => $bed->id,
                'assigned_date' => $data['admission_date'],
                'assigned_time' => $data['admission_time'],
                'created_by' => $data['created_by'] ?? null
            ]);

            $admission->load(['patient', 'bed.room.ward', 'referringDoctor']);

            return $admission;
        });
    }

    /**
     * Get admission with detailed information.
     */
    public function getAdmissionWithDetails(Admission $admission): Admission
    {
        return $admission->load([
            'patient',
            'bed.room.ward',
            'referringDoctor',
            'bedAssignments'
        ]);
    }

    /**
     * Update admission information.
     */
    public function updateAdmission(Admission $admission, array $data): Admission
    {
        return DB::transaction(function () use ($admission, $data) {
            // If changing bed, handle bed transfer
            if (isset($data['bed_id']) && $data['bed_id'] !== $admission->bed_id) {
                $this->transferPatient($admission, [
                    'new_bed_id' => $data['bed_id'],
                    'reason' => 'bed_change',
                    'notes' => $data['transfer_notes'] ?? 'Bed changed during admission update'
                ]);
            }

            $admission->update($data);
            $admission->load(['patient', 'bed.room.ward', 'referringDoctor']);

            return $admission;
        });
    }

    /**
     * Delete admission.
     */
    public function deleteAdmission(Admission $admission): void
    {
        DB::transaction(function () use ($admission) {
            // Only allow deletion of discharged admissions
            if ($admission->status !== 'discharged') {
                throw new \Exception('Cannot delete active admission. Please discharge patient first.');
            }

            // Release bed assignments
            $admission->bedAssignments()->update([
                'released_date' => now()->toDateString(),
                'released_time' => now(),
                'reason' => 'admission_deleted'
            ]);

            $admission->delete();
        });
    }

    /**
     * Discharge a patient.
     */
    public function dischargePatient(Admission $admission, array $data): Admission
    {
        return DB::transaction(function () use ($admission, $data) {
            if ($admission->status !== 'active') {
                throw new \Exception('Only active admissions can be discharged');
            }

            $dischargeDate = $data['discharge_date'] ?? now()->toDateString();
            $dischargeTime = $data['discharge_time'] ?? now();

            // Update admission
            $admission->update([
                'status' => 'discharged',
                'discharge_date' => $dischargeDate,
                'discharge_time' => $dischargeTime,
                'discharge_notes' => $data['discharge_notes'] ?? null
            ]);

            // Update bed status
            $admission->bed->update(['status' => 'available']);

            // Release current bed assignment
            $currentAssignment = BedAssignment::where('admission_id', $admission->id)
                ->whereNull('released_date')
                ->first();

            if ($currentAssignment) {
                $currentAssignment->update([
                    'released_date' => $dischargeDate,
                    'released_time' => $dischargeTime,
                    'reason' => 'discharge',
                    'notes' => $data['discharge_notes'] ?? null
                ]);
            }

            $admission->load(['patient', 'bed.room.ward', 'referringDoctor']);

            return $admission;
        });
    }

    /**
     * Transfer a patient to another bed.
     */
    public function transferPatient(Admission $admission, array $data): Admission
    {
        return DB::transaction(function () use ($admission, $data) {
            if ($admission->status !== 'active') {
                throw new \Exception('Only active admissions can be transferred');
            }

            $newBed = Bed::findOrFail($data['new_bed_id']);
            if ($newBed->status !== 'available') {
                throw new \Exception('Target bed is not available');
            }

            $transferDate = $data['transfer_date'] ?? now()->toDateString();
            $transferTime = $data['transfer_time'] ?? now();

            // Release current bed assignment
            $currentAssignment = BedAssignment::where('admission_id', $admission->id)
                ->whereNull('released_date')
                ->first();

            if ($currentAssignment) {
                $currentAssignment->update([
                    'released_date' => $transferDate,
                    'released_time' => $transferTime,
                    'reason' => $data['reason'] ?? 'transfer',
                    'notes' => $data['notes'] ?? null
                ]);
            }

            // Update admission with new bed
            $admission->update(['bed_id' => $newBed->id]);

            // Update bed statuses
            $admission->bed->update(['status' => 'available']);
            $newBed->update(['status' => 'occupied']);

            // Create new bed assignment
            BedAssignment::create([
                'admission_id' => $admission->id,
                'bed_id' => $newBed->id,
                'assigned_date' => $transferDate,
                'assigned_time' => $transferTime,
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'] ?? null
            ]);

            $admission->load(['patient', 'bed.room.ward', 'referringDoctor']);

            return $admission;
        });
    }

    /**
     * Get admission statistics.
     */
    public function getAdmissionStatistics(array $filters = [])
    {
        $query = Admission::query();

        // Apply date filters
        if (isset($filters['date_from'])) {
            $query->whereDate('admission_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('admission_date', '<=', $filters['date_to']);
        }

        // Apply ward filter
        if (isset($filters['ward_id'])) {
            $query->whereHas('bed.room', function ($q) use ($filters) {
                $q->where('ward_id', $filters['ward_id']);
            });
        }

        $totalAdmissions = $query->count();
        $activeAdmissions = (clone $query)->where('status', 'active')->count();
        $dischargedAdmissions = (clone $query)->where('status', 'discharged')->count();
        $transferredAdmissions = (clone $query)->where('status', 'transferred')->count();

        // Get admissions by type
        $admissionsByType = (clone $query)->selectRaw('admission_type, COUNT(*) as count')
            ->groupBy('admission_type')
            ->pluck('count', 'admission_type')
            ->toArray();

        // Get average length of stay
        $averageLengthOfStay = (clone $query)->where('status', 'discharged')
            ->selectRaw('AVG(DATEDIFF(discharge_date, admission_date)) as avg_length')
            ->value('avg_length');

        // Get admissions by ward
        $admissionsByWard = (clone $query)->join('beds', 'admissions.bed_id', '=', 'beds.id')
            ->join('rooms', 'beds.room_id', '=', 'rooms.id')
            ->join('wards', 'rooms.ward_id', '=', 'wards.id')
            ->selectRaw('wards.name as ward_name, COUNT(*) as count')
            ->groupBy('wards.id', 'wards.name')
            ->pluck('count', 'ward_name')
            ->toArray();

        return [
            'total_admissions' => $totalAdmissions,
            'active_admissions' => $activeAdmissions,
            'discharged_admissions' => $dischargedAdmissions,
            'transferred_admissions' => $transferredAdmissions,
            'admissions_by_type' => $admissionsByType,
            'admissions_by_ward' => $admissionsByWard,
            'average_length_of_stay' => round($averageLengthOfStay ?? 0, 2)
        ];
    }

    /**
     * Get admissions by ward.
     */
    public function getAdmissionsByWard(array $filters = [])
    {
        $query = Admission::with(['patient', 'bed.room.ward', 'referringDoctor'])
            ->where('status', 'active');

        if (isset($filters['ward_id'])) {
            $query->whereHas('bed.room', function ($q) use ($filters) {
                $q->where('ward_id', $filters['ward_id']);
            });
        }

        return $query->get()->groupBy('bed.room.ward.name');
    }

    /**
     * Get patient admission history.
     */
    public function getPatientAdmissionHistory(Patient $patient)
    {
        return Admission::with(['bed.room.ward', 'referringDoctor'])
            ->where('patient_id', $patient->id)
            ->orderBy('admission_date', 'desc')
            ->get();
    }

    /**
     * Get admission trends.
     */
    public function getAdmissionTrends(array $filters = [])
    {
        $days = $filters['days'] ?? 30;
        $startDate = Carbon::now()->subDays($days);

        $admissions = Admission::where('admission_date', '>=', $startDate)
            ->selectRaw('DATE(admission_date) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $discharges = Admission::where('discharge_date', '>=', $startDate)
            ->where('status', 'discharged')
            ->selectRaw('DATE(discharge_date) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'admissions' => $admissions,
            'discharges' => $discharges,
            'period' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => Carbon::now()->toDateString(),
                'days' => $days
            ]
        ];
    }
}
