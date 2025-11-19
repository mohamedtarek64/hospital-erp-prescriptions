<?php

namespace App\Services;

use App\Models\CriticalAlert;
use App\Models\EmergencyCase;
use App\Models\Patient;
use App\Models\Staff;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;

class AlertService
{
    /**
     * Create a new critical alert
     */
    public function createAlert(array $data): CriticalAlert
    {
        DB::beginTransaction();
        try {
            $alert = CriticalAlert::create($data);

            // Send notifications to relevant staff
            $this->sendAlertNotifications($alert);

            DB::commit();
            return $alert->load(['patient', 'emergencyCase', 'creator']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create critical alert: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all critical alerts
     */
    public function getAlerts(array $filters = []): array
    {
        $query = CriticalAlert::with(['patient', 'emergencyCase', 'creator', 'acknowledgedBy']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (isset($filters['alert_type'])) {
            $query->where('alert_type', $filters['alert_type']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $perPage = $filters['per_page'] ?? 15;
        $alerts = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'alerts' => $alerts->items(),
            'pagination' => [
                'current_page' => $alerts->currentPage(),
                'last_page' => $alerts->lastPage(),
                'per_page' => $alerts->perPage(),
                'total' => $alerts->total()
            ]
        ];
    }

    /**
     * Get active alerts
     */
    public function getActiveAlerts(): array
    {
        return CriticalAlert::where('status', 'active')
            ->with(['patient', 'emergencyCase', 'creator'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get overdue alerts
     */
    public function getOverdueAlerts(): array
    {
        $alerts = CriticalAlert::where('status', 'active')
            ->with(['patient', 'emergencyCase', 'creator'])
            ->get()
            ->filter(function($alert) {
                return $alert->isOverdue();
            })
            ->sortBy('created_at')
            ->values()
            ->toArray();

        return $alerts;
    }

    /**
     * Acknowledge alert
     */
    public function acknowledgeAlert(int $alertId, int $acknowledgedBy): CriticalAlert
    {
        $alert = CriticalAlert::findOrFail($alertId);
        $alert->acknowledge($acknowledgedBy);
        
        return $alert->load(['patient', 'emergencyCase', 'creator', 'acknowledgedBy']);
    }

    /**
     * Resolve alert
     */
    public function resolveAlert(int $alertId): CriticalAlert
    {
        $alert = CriticalAlert::findOrFail($alertId);
        $alert->resolve();
        
        return $alert->load(['patient', 'emergencyCase', 'creator', 'acknowledgedBy']);
    }

    /**
     * Dismiss alert
     */
    public function dismissAlert(int $alertId): CriticalAlert
    {
        $alert = CriticalAlert::findOrFail($alertId);
        $alert->dismiss();
        
        return $alert->load(['patient', 'emergencyCase', 'creator', 'acknowledgedBy']);
    }

    /**
     * Get alert statistics
     */
    public function getAlertStatistics(): array
    {
        $today = now()->format('Y-m-d');
        $thisWeek = now()->subWeek();
        $thisMonth = now()->subMonth();

        return [
            'today' => [
                'total_alerts' => CriticalAlert::whereDate('created_at', $today)->count(),
                'active_alerts' => CriticalAlert::whereDate('created_at', $today)
                    ->where('status', 'active')
                    ->count(),
                'critical_alerts' => CriticalAlert::whereDate('created_at', $today)
                    ->where('priority', 'critical')
                    ->count(),
                'resolved_alerts' => CriticalAlert::whereDate('created_at', $today)
                    ->where('status', 'resolved')
                    ->count()
            ],
            'this_week' => [
                'total_alerts' => CriticalAlert::where('created_at', '>=', $thisWeek)->count(),
                'average_response_time' => $this->calculateAverageResponseTime($thisWeek->format('Y-m-d'), now()->format('Y-m-d'))
            ],
            'this_month' => [
                'total_alerts' => CriticalAlert::where('created_at', '>=', $thisMonth)->count(),
                'alerts_by_type' => CriticalAlert::where('created_at', '>=', $thisMonth)
                    ->selectRaw('alert_type, count(*) as count')
                    ->groupBy('alert_type')
                    ->pluck('count', 'alert_type'),
                'alerts_by_priority' => CriticalAlert::where('created_at', '>=', $thisMonth)
                    ->selectRaw('priority, count(*) as count')
                    ->groupBy('priority')
                    ->pluck('count', 'priority')
            ]
        ];
    }

    /**
     * Get alert analytics
     */
    public function getAlertAnalytics(array $filters = []): array
    {
        $dateFrom = $filters['date_from'] ?? now()->subDays(30)->format('Y-m-d');
        $dateTo = $filters['date_to'] ?? now()->format('Y-m-d');

        $alerts = CriticalAlert::whereBetween('created_at', [$dateFrom, $dateTo]);

        return [
            'total_alerts' => $alerts->count(),
            'alerts_by_type' => $alerts->selectRaw('alert_type, count(*) as count')
                ->groupBy('alert_type')
                ->pluck('count', 'alert_type'),
            'alerts_by_priority' => $alerts->selectRaw('priority, count(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority'),
            'alerts_by_status' => $alerts->selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'average_response_time' => $this->calculateAverageResponseTime($dateFrom, $dateTo),
            'alerts_by_hour' => $this->getAlertsByHour($dateFrom, $dateTo),
            'alerts_by_day' => $this->getAlertsByDay($dateFrom, $dateTo)
        ];
    }

    /**
     * Create patient critical alert
     */
    public function createPatientCriticalAlert(int $patientId, string $message, array $metadata = []): CriticalAlert
    {
        $patient = Patient::findOrFail($patientId);
        
        return $this->createAlert([
            'alert_type' => 'patient_critical',
            'patient_id' => $patientId,
            'title' => 'Critical Patient Alert',
            'message' => $message,
            'priority' => 'critical',
            'created_by' => auth()->id(),
            'metadata' => $metadata
        ]);
    }

    /**
     * Create equipment failure alert
     */
    public function createEquipmentFailureAlert(string $equipmentName, string $message): CriticalAlert
    {
        return $this->createAlert([
            'alert_type' => 'equipment_failure',
            'title' => 'Equipment Failure Alert',
            'message' => "Equipment failure: {$equipmentName} - {$message}",
            'priority' => 'high',
            'created_by' => auth()->id(),
            'metadata' => ['equipment_name' => $equipmentName]
        ]);
    }

    /**
     * Create staff shortage alert
     */
    public function createStaffShortageAlert(string $department, int $requiredStaff, int $availableStaff): CriticalAlert
    {
        return $this->createAlert([
            'alert_type' => 'staff_shortage',
            'title' => 'Staff Shortage Alert',
            'message' => "Staff shortage in {$department}: Required {$requiredStaff}, Available {$availableStaff}",
            'priority' => 'high',
            'created_by' => auth()->id(),
            'metadata' => [
                'department' => $department,
                'required_staff' => $requiredStaff,
                'available_staff' => $availableStaff
            ]
        ]);
    }

    /**
     * Create ambulance delay alert
     */
    public function createAmbulanceDelayAlert(int $emergencyCaseId, string $reason): CriticalAlert
    {
        return $this->createAlert([
            'alert_type' => 'ambulance_delay',
            'emergency_case_id' => $emergencyCaseId,
            'title' => 'Ambulance Delay Alert',
            'message' => "Ambulance delay for emergency case: {$reason}",
            'priority' => 'high',
            'created_by' => auth()->id(),
            'metadata' => ['delay_reason' => $reason]
        ]);
    }

    /**
     * Create system error alert
     */
    public function createSystemErrorAlert(string $systemName, string $errorMessage): CriticalAlert
    {
        return $this->createAlert([
            'alert_type' => 'system_error',
            'title' => 'System Error Alert',
            'message' => "System error in {$systemName}: {$errorMessage}",
            'priority' => 'medium',
            'created_by' => auth()->id(),
            'metadata' => [
                'system_name' => $systemName,
                'error_message' => $errorMessage
            ]
        ]);
    }

    /**
     * Send alert notifications to relevant staff
     */
    private function sendAlertNotifications(CriticalAlert $alert): void
    {
        try {
            // Get emergency staff on duty
            $emergencyStaff = Staff::whereHas('emergencyStaffSchedules', function($query) {
                $query->where('shift_date', now()->format('Y-m-d'))
                      ->whereIn('status', ['confirmed', 'in_progress'])
                      ->whereIn('shift_type', ['day', 'evening', 'night', 'on_call']);
            })->get();

            // Send notifications based on alert priority
            foreach ($emergencyStaff as $staff) {
                $this->sendNotificationToStaff($staff, $alert);
            }

            // For critical alerts, also notify administrators
            if ($alert->priority === 'critical') {
                $administrators = Staff::where('role', 'admin')->get();
                foreach ($administrators as $admin) {
                    $this->sendNotificationToStaff($admin, $alert);
                }
            }

        } catch (\Exception $e) {
            Log::error('Failed to send alert notifications: ' . $e->getMessage());
        }
    }

    /**
     * Send notification to individual staff member
     */
    private function sendNotificationToStaff(Staff $staff, CriticalAlert $alert): void
    {
        try {
            // Here you would implement actual notification sending
            // This could be email, SMS, push notification, etc.
            Log::info("Alert notification sent to staff {$staff->id}: {$alert->title}");
        } catch (\Exception $e) {
            Log::error("Failed to send notification to staff {$staff->id}: " . $e->getMessage());
        }
    }

    /**
     * Calculate average response time for alerts
     */
    private function calculateAverageResponseTime(string $dateFrom, string $dateTo): ?float
    {
        $alerts = CriticalAlert::whereBetween('created_at', [$dateFrom, $dateTo])
            ->whereNotNull('acknowledged_at')
            ->get();

        if ($alerts->isEmpty()) {
            return null;
        }

        $totalMinutes = $alerts->sum(function($alert) {
            return $alert->getResponseTime() ?? 0;
        });

        return round($totalMinutes / $alerts->count(), 2);
    }

    /**
     * Get alerts by hour
     */
    private function getAlertsByHour(string $dateFrom, string $dateTo): array
    {
        return CriticalAlert::whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('HOUR(created_at) as hour, count(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->pluck('count', 'hour')
            ->toArray();
    }

    /**
     * Get alerts by day
     */
    private function getAlertsByDay(string $dateFrom, string $dateTo): array
    {
        return CriticalAlert::whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->toArray();
    }

    /**
     * Auto-resolve old alerts
     */
    public function autoResolveOldAlerts(): int
    {
        $oldAlerts = CriticalAlert::where('status', 'active')
            ->where('created_at', '<', now()->subHours(24))
            ->where('priority', 'low')
            ->get();

        $resolvedCount = 0;
        foreach ($oldAlerts as $alert) {
            $alert->resolve();
            $resolvedCount++;
        }

        return $resolvedCount;
    }

    /**
     * Get alert trends
     */
    public function getAlertTrends(int $days = 30): array
    {
        $dateFrom = now()->subDays($days)->format('Y-m-d');
        $dateTo = now()->format('Y-m-d');

        $alerts = CriticalAlert::whereBetween('created_at', [$dateFrom, $dateTo]);

        return [
            'daily_trends' => $this->getAlertsByDay($dateFrom, $dateTo),
            'hourly_trends' => $this->getAlertsByHour($dateFrom, $dateTo),
            'type_trends' => $alerts->selectRaw('alert_type, count(*) as count')
                ->groupBy('alert_type')
                ->pluck('count', 'alert_type'),
            'priority_trends' => $alerts->selectRaw('priority, count(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority')
        ];
    }
}
