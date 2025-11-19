<?php

namespace App\Services;

use App\Models\MaintenanceSchedule;
use App\Models\MaintenanceRecord;
use App\Models\Equipment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MaintenanceService
{
    /**
     * Create new maintenance schedule.
     */
    public function createSchedule(array $data): MaintenanceSchedule
    {
        return DB::transaction(function () use ($data) {
            $schedule = MaintenanceSchedule::create($data);

            // Calculate next due date if recurring
            if ($schedule->is_recurring) {
                $nextDue = $schedule->calculateNextDueDate();
                if ($nextDue) {
                    $schedule->update(['next_due' => $nextDue]);
                }
            }

            return $schedule;
        });
    }

    /**
     * Update maintenance schedule.
     */
    public function updateSchedule(MaintenanceSchedule $schedule, array $data): MaintenanceSchedule
    {
        return DB::transaction(function () use ($schedule, $data) {
            $schedule->update($data);

            // Recalculate next due date if frequency changed
            if (isset($data['frequency']) || isset($data['interval_days'])) {
                if ($schedule->is_recurring) {
                    $nextDue = $schedule->calculateNextDueDate();
                    if ($nextDue) {
                        $schedule->update(['next_due' => $nextDue]);
                    }
                }
            }

            return $schedule->fresh();
        });
    }

    /**
     * Delete maintenance schedule.
     */
    public function deleteSchedule(MaintenanceSchedule $schedule): void
    {
        DB::transaction(function () use ($schedule) {
            // Cancel any related maintenance records that are in progress
            $schedule->maintenanceRecords()
                ->where('status', 'in_progress')
                ->update(['status' => 'cancelled']);

            $schedule->delete();
        });
    }

    /**
     * Create new maintenance record.
     */
    public function createRecord(array $data): MaintenanceRecord
    {
        return DB::transaction(function () use ($data) {
            $record = MaintenanceRecord::create($data);

            // Update equipment condition if provided
            if (isset($data['equipment_condition_after'])) {
                $record->equipment->update([
                    'condition' => $data['equipment_condition_after']
                ]);
            }

            // Update related maintenance schedule if provided
            if ($record->maintenance_schedule_id) {
                $schedule = $record->maintenanceSchedule;
                $schedule->markCompleted(
                    $data['cost'] ?? null,
                    $record->duration_hours,
                    $data['work_performed'] ?? null
                );
            }

            return $record;
        });
    }

    /**
     * Update maintenance record.
     */
    public function updateRecord(MaintenanceRecord $record, array $data): MaintenanceRecord
    {
        return DB::transaction(function () use ($record, $data) {
            $record->update($data);

            // Update equipment condition if provided
            if (isset($data['equipment_condition_after'])) {
                $record->equipment->update([
                    'condition' => $data['equipment_condition_after']
                ]);
            }

            return $record->fresh();
        });
    }

    /**
     * Delete maintenance record.
     */
    public function deleteRecord(MaintenanceRecord $record): void
    {
        DB::transaction(function () use ($record) {
            // If this record was linked to a schedule, update the schedule status
            if ($record->maintenance_schedule_id) {
                $schedule = $record->maintenanceSchedule;
                if ($schedule->status === 'completed') {
                    $schedule->update(['status' => 'scheduled']);
                }
            }

            $record->delete();
        });
    }

    /**
     * Get maintenance statistics.
     */
    public function getMaintenanceStatistics(): array
    {
        $totalSchedules = MaintenanceSchedule::count();
        $completedSchedules = MaintenanceSchedule::where('status', 'completed')->count();
        $overdueSchedules = MaintenanceSchedule::overdue()->count();
        $dueSoonSchedules = MaintenanceSchedule::dueSoon(7)->count();

        $totalRecords = MaintenanceRecord::count();
        $completedRecords = MaintenanceRecord::completed()->count();
        $inProgressRecords = MaintenanceRecord::where('status', 'in_progress')->count();

        $totalMaintenanceCost = MaintenanceRecord::sum('cost');
        $averageMaintenanceCost = $completedRecords > 0 
            ? $totalMaintenanceCost / $completedRecords 
            : 0;

        $totalMaintenanceTime = MaintenanceRecord::completed()
            ->get()
            ->sum('duration_hours');

        $averageMaintenanceTime = $completedRecords > 0 
            ? $totalMaintenanceTime / $completedRecords 
            : 0;

        // Maintenance by type
        $maintenanceByType = MaintenanceRecord::select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->get()
            ->pluck('count', 'type');

        // Maintenance by priority
        $maintenanceByPriority = MaintenanceSchedule::select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->get()
            ->pluck('count', 'priority');

        // Equipment with most maintenance
        $equipmentMaintenanceCount = MaintenanceRecord::select('equipment_id', DB::raw('count(*) as count'))
            ->with('equipment:id,name')
            ->groupBy('equipment_id')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Maintenance efficiency
        $efficiencyData = $this->calculateMaintenanceEfficiency();

        return [
            'schedules' => [
                'total' => $totalSchedules,
                'completed' => $completedSchedules,
                'overdue' => $overdueSchedules,
                'due_soon' => $dueSoonSchedules,
                'completion_rate' => $totalSchedules > 0 ? round(($completedSchedules / $totalSchedules) * 100, 2) : 0
            ],
            'records' => [
                'total' => $totalRecords,
                'completed' => $completedRecords,
                'in_progress' => $inProgressRecords,
                'completion_rate' => $totalRecords > 0 ? round(($completedRecords / $totalRecords) * 100, 2) : 0
            ],
            'costs' => [
                'total' => $totalMaintenanceCost,
                'average' => $averageMaintenanceCost
            ],
            'time' => [
                'total_hours' => $totalMaintenanceTime,
                'average_hours' => $averageMaintenanceTime
            ],
            'by_type' => $maintenanceByType,
            'by_priority' => $maintenanceByPriority,
            'equipment_maintenance_count' => $equipmentMaintenanceCount,
            'efficiency' => $efficiencyData
        ];
    }

    /**
     * Get calendar data for maintenance.
     */
    public function getCalendarData(string $startDate, string $endDate): array
    {
        $schedules = MaintenanceSchedule::whereBetween('due_date', [$startDate, $endDate])
            ->with(['equipment:id,name', 'assignedTechnician:id,name'])
            ->get();

        $records = MaintenanceRecord::whereBetween('maintenance_date', [$startDate, $endDate])
            ->with(['equipment:id,name', 'performedBy:id,name'])
            ->get();

        $calendarData = [];

        // Add schedules
        foreach ($schedules as $schedule) {
            $calendarData[] = [
                'id' => 'schedule_' . $schedule->id,
                'title' => $schedule->title,
                'start' => $schedule->due_date->format('Y-m-d'),
                'end' => $schedule->due_date->format('Y-m-d'),
                'type' => 'schedule',
                'status' => $schedule->status,
                'priority' => $schedule->priority,
                'equipment' => $schedule->equipment->name,
                'assigned_to' => $schedule->assignedTechnician?->name,
                'color' => $this->getEventColor($schedule->status, $schedule->priority)
            ];
        }

        // Add records
        foreach ($records as $record) {
            $calendarData[] = [
                'id' => 'record_' . $record->id,
                'title' => $record->title,
                'start' => $record->maintenance_date->format('Y-m-d'),
                'end' => $record->maintenance_date->format('Y-m-d'),
                'type' => 'record',
                'status' => $record->status,
                'equipment' => $record->equipment->name,
                'performed_by' => $record->performedBy->name,
                'color' => $this->getEventColor($record->status)
            ];
        }

        return $calendarData;
    }

    /**
     * Calculate maintenance efficiency metrics.
     */
    private function calculateMaintenanceEfficiency(): array
    {
        $records = MaintenanceRecord::completed()->get();
        
        $onTimeCount = 0;
        $withinBudgetCount = 0;
        $noIssuesCount = 0;
        $totalRecords = $records->count();

        foreach ($records as $record) {
            if ($record->wasCompletedOnTime() === true) {
                $onTimeCount++;
            }
            if ($record->wasCompletedWithinBudget() === true) {
                $withinBudgetCount++;
            }
            if (empty(trim($record->issues_found ?? ''))) {
                $noIssuesCount++;
            }
        }

        return [
            'on_time_rate' => $totalRecords > 0 ? round(($onTimeCount / $totalRecords) * 100, 2) : 0,
            'within_budget_rate' => $totalRecords > 0 ? round(($withinBudgetCount / $totalRecords) * 100, 2) : 0,
            'no_issues_rate' => $totalRecords > 0 ? round(($noIssuesCount / $totalRecords) * 100, 2) : 0,
            'overall_efficiency' => $totalRecords > 0 ? round((($onTimeCount + $withinBudgetCount + $noIssuesCount) / ($totalRecords * 3)) * 100, 2) : 0
        ];
    }

    /**
     * Get event color for calendar.
     */
    private function getEventColor(string $status, string $priority = null): string
    {
        if ($priority === 'critical') {
            return '#dc2626'; // red-600
        }

        return match($status) {
            'completed' => '#16a34a', // green-600
            'in_progress' => '#ea580c', // orange-600
            'scheduled' => '#2563eb', // blue-600
            'overdue' => '#dc2626', // red-600
            'cancelled' => '#6b7280', // gray-500
            default => '#6b7280' // gray-500
        };
    }

    /**
     * Generate maintenance reports.
     */
    public function generateMaintenanceReport(array $filters = []): array
    {
        $query = MaintenanceRecord::with(['equipment', 'performedBy', 'supervisedBy']);

        // Apply filters
        if (isset($filters['date_from'])) {
            $query->where('maintenance_date', '>=', $filters['date_from']);
        }
        if (isset($filters['date_to'])) {
            $query->where('maintenance_date', '<=', $filters['date_to']);
        }
        if (isset($filters['equipment_id'])) {
            $query->where('equipment_id', $filters['equipment_id']);
        }
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        $records = $query->get();

        $report = [
            'summary' => [
                'total_records' => $records->count(),
                'total_cost' => $records->sum('cost'),
                'total_time' => $records->sum('duration_hours'),
                'average_cost' => $records->count() > 0 ? $records->sum('cost') / $records->count() : 0,
                'average_time' => $records->count() > 0 ? $records->sum('duration_hours') / $records->count() : 0
            ],
            'by_type' => $records->groupBy('type')->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'total_cost' => $group->sum('cost'),
                    'total_time' => $group->sum('duration_hours')
                ];
            }),
            'by_equipment' => $records->groupBy('equipment.name')->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'total_cost' => $group->sum('cost'),
                    'total_time' => $group->sum('duration_hours')
                ];
            }),
            'by_performer' => $records->groupBy('performedBy.name')->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'total_cost' => $group->sum('cost'),
                    'total_time' => $group->sum('duration_hours')
                ];
            }),
            'records' => $records
        ];

        return $report;
    }

    /**
     * Schedule preventive maintenance for equipment.
     */
    public function schedulePreventiveMaintenance(Equipment $equipment, array $scheduleData): MaintenanceSchedule
    {
        $defaultData = [
            'equipment_id' => $equipment->id,
            'type' => 'preventive',
            'frequency' => 'monthly',
            'priority' => 'medium',
            'is_recurring' => true
        ];

        $data = array_merge($defaultData, $scheduleData);
        
        return $this->createSchedule($data);
    }

    /**
     * Get maintenance alerts.
     */
    public function getMaintenanceAlerts(): array
    {
        $alerts = [];

        // Overdue maintenance
        $overdue = MaintenanceSchedule::overdue()->with('equipment')->get();
        if ($overdue->count() > 0) {
            $alerts[] = [
                'type' => 'overdue',
                'title' => 'Overdue Maintenance',
                'message' => "{$overdue->count()} maintenance tasks are overdue",
                'count' => $overdue->count(),
                'priority' => 'high',
                'data' => $overdue
            ];
        }

        // Due soon maintenance
        $dueSoon = MaintenanceSchedule::dueSoon(3)->with('equipment')->get();
        if ($dueSoon->count() > 0) {
            $alerts[] = [
                'type' => 'due_soon',
                'title' => 'Maintenance Due Soon',
                'message' => "{$dueSoon->count()} maintenance tasks are due within 3 days",
                'count' => $dueSoon->count(),
                'priority' => 'medium',
                'data' => $dueSoon
            ];
        }

        // Critical priority maintenance
        $critical = MaintenanceSchedule::where('priority', 'critical')
            ->where('status', 'scheduled')
            ->with('equipment')
            ->get();
        if ($critical->count() > 0) {
            $alerts[] = [
                'type' => 'critical',
                'title' => 'Critical Maintenance',
                'message' => "{$critical->count()} critical maintenance tasks are scheduled",
                'count' => $critical->count(),
                'priority' => 'high',
                'data' => $critical
            ];
        }

        return $alerts;
    }
}
