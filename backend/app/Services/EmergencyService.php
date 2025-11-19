<?php

namespace App\Services;

use App\Models\EmergencyCase;
use App\Models\Ambulance;
use App\Models\TriageAssessment;
use App\Models\EmergencyStaffSchedule;
use App\Models\EmergencyEquipment;
use App\Models\CriticalAlert;
use App\Models\Patient;
use App\Models\Staff;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class EmergencyService
{
    /**
     * Get emergency dashboard data
     */
    public function getDashboardData(): array
    {
        $activeCases = EmergencyCase::whereIn('status', ['pending', 'dispatched', 'en_route', 'on_scene', 'transporting'])
            ->with(['patient', 'ambulance', 'triageAssessment'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $availableAmbulances = Ambulance::where('status', 'available')
            ->with(['driver', 'paramedic'])
            ->get();

        $criticalAlerts = CriticalAlert::where('status', 'active')
            ->with(['patient', 'emergencyCase', 'creator'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $triageQueue = TriageAssessment::whereHas('emergencyCase', function($query) {
                $query->whereIn('status', ['pending', 'dispatched', 'en_route']);
            })
            ->with(['patient', 'emergencyCase', 'assessor'])
            ->orderBy('triage_level', 'asc')
            ->orderBy('assessed_at', 'asc')
            ->get();

        $stats = $this->getStatistics();

        return [
            'active_cases' => $activeCases,
            'available_ambulances' => $availableAmbulances,
            'critical_alerts' => $criticalAlerts,
            'triage_queue' => $triageQueue,
            'statistics' => $stats
        ];
    }

    /**
     * Get emergency cases with filters
     */
    public function getEmergencyCases(array $filters = []): array
    {
        $query = EmergencyCase::with(['patient', 'ambulance', 'dispatcher', 'triageAssessment']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (isset($filters['emergency_type'])) {
            $query->where('emergency_type', $filters['emergency_type']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('case_number', 'like', "%{$search}%")
                  ->orWhere('caller_name', 'like', "%{$search}%")
                  ->orWhere('caller_phone', 'like', "%{$search}%")
                  ->orWhereHas('patient', function($patientQuery) use ($search) {
                      $patientQuery->where('first_name', 'like', "%{$search}%")
                                  ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = $filters['per_page'] ?? 15;
        $cases = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'cases' => $cases->items(),
            'pagination' => [
                'current_page' => $cases->currentPage(),
                'last_page' => $cases->lastPage(),
                'per_page' => $cases->perPage(),
                'total' => $cases->total()
            ]
        ];
    }

    /**
     * Create new emergency case
     */
    public function createEmergencyCase(array $data): EmergencyCase
    {
        DB::beginTransaction();
        try {
            $data['case_number'] = EmergencyCase::generateCaseNumber();
            $data['dispatched_by'] = auth()->id();

            $case = EmergencyCase::create($data);

            // Create critical alert if priority is critical
            if ($data['priority'] === 'critical') {
                CriticalAlert::create([
                    'alert_type' => 'patient_critical',
                    'patient_id' => $data['patient_id'],
                    'emergency_case_id' => $case->id,
                    'title' => 'Critical Emergency Case',
                    'message' => "Critical emergency case {$case->case_number} requires immediate attention",
                    'priority' => 'critical',
                    'created_by' => auth()->id()
                ]);
            }

            DB::commit();
            return $case->load(['patient', 'ambulance', 'dispatcher']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create emergency case: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get specific emergency case
     */
    public function getEmergencyCase(int $id): EmergencyCase
    {
        return EmergencyCase::with(['patient', 'ambulance', 'dispatcher', 'triageAssessment', 'criticalAlerts'])
            ->findOrFail($id);
    }

    /**
     * Update emergency case
     */
    public function updateEmergencyCase(int $id, array $data): EmergencyCase
    {
        $case = EmergencyCase::findOrFail($id);
        $case->update($data);
        return $case->load(['patient', 'ambulance', 'dispatcher', 'triageAssessment']);
    }

    /**
     * Dispatch ambulance to emergency case
     */
    public function dispatchAmbulance(int $caseId, array $data): EmergencyCase
    {
        DB::beginTransaction();
        try {
            $case = EmergencyCase::findOrFail($caseId);
            $ambulance = Ambulance::findOrFail($data['ambulance_id']);

            // Check if ambulance is available
            if (!$ambulance->isAvailable()) {
                throw new \Exception('Ambulance is not available');
            }

            // Update case
            $case->update([
                'assigned_ambulance_id' => $data['ambulance_id'],
                'dispatched_by' => $data['dispatched_by'],
                'status' => 'dispatched',
                'dispatch_time' => now()
            ]);

            // Update ambulance status
            $ambulance->update(['status' => 'dispatched']);

            DB::commit();
            return $case->load(['patient', 'ambulance', 'dispatcher']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to dispatch ambulance: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Complete emergency case
     */
    public function completeEmergencyCase(int $id): EmergencyCase
    {
        DB::beginTransaction();
        try {
            $case = EmergencyCase::findOrFail($id);
            
            $case->update([
                'status' => 'completed',
                'hospital_arrival_time' => now()
            ]);

            // Update ambulance status if assigned
            if ($case->assigned_ambulance_id) {
                $ambulance = Ambulance::find($case->assigned_ambulance_id);
                if ($ambulance) {
                    $ambulance->update(['status' => 'available']);
                }
            }

            DB::commit();
            return $case->load(['patient', 'ambulance', 'dispatcher']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to complete emergency case: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get emergency analytics
     */
    public function getAnalytics(array $filters = []): array
    {
        $dateFrom = $filters['date_from'] ?? now()->subDays(30)->format('Y-m-d');
        $dateTo = $filters['date_to'] ?? now()->format('Y-m-d');

        $cases = EmergencyCase::whereBetween('created_at', [$dateFrom, $dateTo]);

        $analytics = [
            'total_cases' => $cases->count(),
            'cases_by_priority' => $cases->selectRaw('priority, count(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority'),
            'cases_by_type' => $cases->selectRaw('emergency_type, count(*) as count')
                ->groupBy('emergency_type')
                ->pluck('count', 'emergency_type'),
            'cases_by_status' => $cases->selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'average_response_time' => $this->calculateAverageResponseTime($dateFrom, $dateTo),
            'cases_by_hour' => $this->getCasesByHour($dateFrom, $dateTo),
            'cases_by_day' => $this->getCasesByDay($dateFrom, $dateTo)
        ];

        return $analytics;
    }

    /**
     * Get active emergency cases
     */
    public function getActiveCases(): array
    {
        return EmergencyCase::whereIn('status', ['pending', 'dispatched', 'en_route', 'on_scene', 'transporting'])
            ->with(['patient', 'ambulance', 'triageAssessment'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get emergency statistics
     */
    public function getStatistics(): array
    {
        $today = now()->format('Y-m-d');
        $thisWeek = now()->subWeek();
        $thisMonth = now()->subMonth();

        return [
            'today' => [
                'total_cases' => EmergencyCase::whereDate('created_at', $today)->count(),
                'active_cases' => EmergencyCase::whereDate('created_at', $today)
                    ->whereIn('status', ['pending', 'dispatched', 'en_route', 'on_scene', 'transporting'])
                    ->count(),
                'critical_cases' => EmergencyCase::whereDate('created_at', $today)
                    ->where('priority', 'critical')
                    ->count()
            ],
            'this_week' => [
                'total_cases' => EmergencyCase::where('created_at', '>=', $thisWeek)->count(),
                'average_response_time' => $this->calculateAverageResponseTime($thisWeek->format('Y-m-d'), now()->format('Y-m-d'))
            ],
            'this_month' => [
                'total_cases' => EmergencyCase::where('created_at', '>=', $thisMonth)->count(),
                'most_common_type' => EmergencyCase::where('created_at', '>=', $thisMonth)
                    ->selectRaw('emergency_type, count(*) as count')
                    ->groupBy('emergency_type')
                    ->orderBy('count', 'desc')
                    ->first()
            ]
        ];
    }

    /**
     * Calculate average response time
     */
    private function calculateAverageResponseTime(string $dateFrom, string $dateTo): ?float
    {
        $cases = EmergencyCase::whereBetween('created_at', [$dateFrom, $dateTo])
            ->whereNotNull('dispatch_time')
            ->whereNotNull('arrival_time')
            ->get();

        if ($cases->isEmpty()) {
            return null;
        }

        $totalMinutes = $cases->sum(function($case) {
            return $case->getResponseTime() ?? 0;
        });

        return round($totalMinutes / $cases->count(), 2);
    }

    /**
     * Get cases by hour
     */
    private function getCasesByHour(string $dateFrom, string $dateTo): array
    {
        return EmergencyCase::whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('HOUR(created_at) as hour, count(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->pluck('count', 'hour')
            ->toArray();
    }

    /**
     * Get cases by day
     */
    private function getCasesByDay(string $dateFrom, string $dateTo): array
    {
        return EmergencyCase::whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->toArray();
    }

    // Ambulance methods
    public function getAmbulances(array $filters = []): array
    {
        $query = Ambulance::with(['driver', 'paramedic']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $ambulances = $query->orderBy('vehicle_number')->paginate($perPage);

        return [
            'ambulances' => $ambulances->items(),
            'pagination' => [
                'current_page' => $ambulances->currentPage(),
                'last_page' => $ambulances->lastPage(),
                'per_page' => $ambulances->perPage(),
                'total' => $ambulances->total()
            ]
        ];
    }

    public function createAmbulance(array $data): Ambulance
    {
        return Ambulance::create($data);
    }

    public function getAmbulance(int $id): Ambulance
    {
        return Ambulance::with(['driver', 'paramedic', 'emergencyCases'])->findOrFail($id);
    }

    public function updateAmbulance(int $id, array $data): Ambulance
    {
        $ambulance = Ambulance::findOrFail($id);
        $ambulance->update($data);
        return $ambulance->load(['driver', 'paramedic']);
    }

    public function updateAmbulanceLocation(int $id, array $data): Ambulance
    {
        $ambulance = Ambulance::findOrFail($id);
        $ambulance->updateLocation($data['latitude'], $data['longitude'], $data['address'] ?? null);
        return $ambulance->load(['driver', 'paramedic']);
    }

    public function getAvailableAmbulances(array $filters = []): array
    {
        $query = Ambulance::where('status', 'available')->with(['driver', 'paramedic']);

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['capacity'])) {
            $query->where('capacity', '>=', $filters['capacity']);
        }

        return $query->get()->toArray();
    }

    public function getFleetStatus(): array
    {
        $ambulances = Ambulance::all();
        
        return [
            'total' => $ambulances->count(),
            'available' => $ambulances->where('status', 'available')->count(),
            'dispatched' => $ambulances->where('status', 'dispatched')->count(),
            'on_scene' => $ambulances->where('status', 'on_scene')->count(),
            'transporting' => $ambulances->where('status', 'transporting')->count(),
            'maintenance' => $ambulances->where('status', 'maintenance')->count(),
            'out_of_service' => $ambulances->where('status', 'out_of_service')->count()
        ];
    }

    public function getAmbulanceMaintenanceSchedule(int $id): array
    {
        $ambulance = Ambulance::findOrFail($id);
        
        return [
            'last_maintenance' => $ambulance->last_maintenance,
            'next_maintenance' => $ambulance->next_maintenance,
            'needs_maintenance' => $ambulance->needsMaintenance()
        ];
    }

    public function scheduleAmbulanceMaintenance(int $id, array $data): array
    {
        $ambulance = Ambulance::findOrFail($id);
        
        $ambulance->update([
            'next_maintenance' => $data['scheduled_date'],
            'notes' => $data['notes'] ?? $ambulance->notes
        ]);

        return [
            'message' => 'Maintenance scheduled successfully',
            'next_maintenance' => $ambulance->next_maintenance
        ];
    }

    public function getAmbulanceUtilization(int $id): array
    {
        $ambulance = Ambulance::findOrFail($id);
        $cases = $ambulance->emergencyCases()->where('created_at', '>=', now()->subDays(30))->get();

        return [
            'total_cases' => $cases->count(),
            'average_response_time' => $cases->avg(function($case) {
                return $case->getResponseTime();
            }),
            'utilization_rate' => $this->calculateUtilizationRate($ambulance, $cases)
        ];
    }

    private function calculateUtilizationRate(Ambulance $ambulance, $cases): float
    {
        $totalMinutes = 30 * 24 * 60; // 30 days in minutes
        $usedMinutes = $cases->sum(function($case) {
            return $case->getTotalResponseTime() ?? 0;
        });

        return round(($usedMinutes / $totalMinutes) * 100, 2);
    }

    public function deleteAmbulance(int $id): void
    {
        $ambulance = Ambulance::findOrFail($id);
        
        // Check if ambulance has active cases
        $activeCases = $ambulance->emergencyCases()->whereIn('status', ['dispatched', 'en_route', 'on_scene', 'transporting'])->count();
        
        if ($activeCases > 0) {
            throw new \Exception('Cannot delete ambulance with active emergency cases');
        }

        $ambulance->delete();
    }

    // Triage methods
    public function getTriageAssessments(array $filters = []): array
    {
        $query = TriageAssessment::with(['patient', 'emergencyCase', 'assessor']);

        if (isset($filters['triage_level'])) {
            $query->where('triage_level', $filters['triage_level']);
        }

        if (isset($filters['patient_id'])) {
            $query->where('patient_id', $filters['patient_id']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $assessments = $query->orderBy('assessed_at', 'desc')->paginate($perPage);

        return [
            'assessments' => $assessments->items(),
            'pagination' => [
                'current_page' => $assessments->currentPage(),
                'last_page' => $assessments->lastPage(),
                'per_page' => $assessments->perPage(),
                'total' => $assessments->total()
            ]
        ];
    }

    public function createTriageAssessment(array $data): TriageAssessment
    {
        $data['assessed_at'] = now();
        return TriageAssessment::create($data);
    }

    public function getTriageAssessment(int $id): TriageAssessment
    {
        return TriageAssessment::with(['patient', 'emergencyCase', 'assessor'])->findOrFail($id);
    }

    public function updateTriageAssessment(int $id, array $data): TriageAssessment
    {
        $assessment = TriageAssessment::findOrFail($id);
        $assessment->update($data);
        return $assessment->load(['patient', 'emergencyCase', 'assessor']);
    }

    public function getTriageStatistics(): array
    {
        $today = now()->format('Y-m-d');
        
        return [
            'today' => [
                'total_assessments' => TriageAssessment::whereDate('assessed_at', $today)->count(),
                'by_level' => TriageAssessment::whereDate('assessed_at', $today)
                    ->selectRaw('triage_level, count(*) as count')
                    ->groupBy('triage_level')
                    ->pluck('count', 'triage_level')
            ],
            'critical_patients' => TriageAssessment::where('triage_level', 'red')
                ->whereDate('assessed_at', $today)
                ->count()
        ];
    }

    public function getTriageQueue(): array
    {
        return TriageAssessment::whereHas('emergencyCase', function($query) {
                $query->whereIn('status', ['pending', 'dispatched', 'en_route']);
            })
            ->with(['patient', 'emergencyCase', 'assessor'])
            ->orderBy('triage_level', 'asc')
            ->orderBy('assessed_at', 'asc')
            ->get()
            ->toArray();
    }

    public function getPatientTriageHistory(int $patientId): array
    {
        return TriageAssessment::where('patient_id', $patientId)
            ->with(['emergencyCase', 'assessor'])
            ->orderBy('assessed_at', 'desc')
            ->get()
            ->toArray();
    }

    public function calculateTriageLevel(array $data): string
    {
        $vitalSigns = $data['vital_signs'];
        $symptoms = strtolower($data['symptoms']);
        
        // Check for immediate life threats (Red)
        if (isset($vitalSigns['heart_rate']) && ($vitalSigns['heart_rate'] < 40 || $vitalSigns['heart_rate'] > 180)) {
            return 'red';
        }
        
        if (isset($vitalSigns['oxygen_saturation']) && $vitalSigns['oxygen_saturation'] < 85) {
            return 'red';
        }
        
        if (strpos($symptoms, 'cardiac arrest') !== false || strpos($symptoms, 'unconscious') !== false) {
            return 'red';
        }

        // Check for high priority conditions (Orange)
        if (isset($vitalSigns['heart_rate']) && ($vitalSigns['heart_rate'] < 50 || $vitalSigns['heart_rate'] > 150)) {
            return 'orange';
        }
        
        if (isset($vitalSigns['oxygen_saturation']) && $vitalSigns['oxygen_saturation'] < 90) {
            return 'orange';
        }
        
        if (strpos($symptoms, 'chest pain') !== false || strpos($symptoms, 'difficulty breathing') !== false) {
            return 'orange';
        }

        // Check for moderate priority (Yellow)
        if (isset($vitalSigns['temperature']) && ($vitalSigns['temperature'] < 35 || $vitalSigns['temperature'] > 39)) {
            return 'yellow';
        }
        
        if (strpos($symptoms, 'pain') !== false || strpos($symptoms, 'fever') !== false) {
            return 'yellow';
        }

        // Default to green for stable patients
        return 'green';
    }

    public function getCriticalPatients(): array
    {
        return TriageAssessment::where('triage_level', 'red')
            ->whereHas('emergencyCase', function($query) {
                $query->whereIn('status', ['pending', 'dispatched', 'en_route', 'on_scene']);
            })
            ->with(['patient', 'emergencyCase', 'assessor'])
            ->orderBy('assessed_at', 'asc')
            ->get()
            ->toArray();
    }

    public function deleteTriageAssessment(int $id): void
    {
        TriageAssessment::findOrFail($id)->delete();
    }
}
