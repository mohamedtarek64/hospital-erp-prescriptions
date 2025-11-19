<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'maintenance_schedule_id',
        'type',
        'title',
        'description',
        'maintenance_date',
        'start_time',
        'end_time',
        'status',
        'performed_by',
        'supervised_by',
        'cost',
        'work_performed',
        'parts_used',
        'issues_found',
        'recommendations',
        'equipment_condition_before',
        'equipment_condition_after',
        'measurements',
        'photos',
        'documents',
        'requires_follow_up',
        'follow_up_notes',
        'next_maintenance_due'
    ];

    protected $casts = [
        'maintenance_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'cost' => 'decimal:2',
        'measurements' => 'array',
        'photos' => 'array',
        'documents' => 'array',
        'requires_follow_up' => 'boolean',
        'next_maintenance_due' => 'date'
    ];

    /**
     * Get the equipment that owns the maintenance record.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the maintenance schedule that owns the maintenance record.
     */
    public function maintenanceSchedule(): BelongsTo
    {
        return $this->belongsTo(MaintenanceSchedule::class);
    }

    /**
     * Get the user who performed the maintenance.
     */
    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Get the user who supervised the maintenance.
     */
    public function supervisedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervised_by');
    }

    /**
     * Scope a query to only include completed maintenance.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include maintenance by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include maintenance by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('maintenance_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include maintenance requiring follow-up.
     */
    public function scopeRequiringFollowUp($query)
    {
        return $query->where('requires_follow_up', true);
    }

    /**
     * Get the duration of maintenance in hours.
     */
    public function getDurationHoursAttribute()
    {
        if (!$this->start_time || !$this->end_time) {
            return null;
        }

        return $this->start_time->diffInHours($this->end_time);
    }

    /**
     * Get the duration of maintenance in minutes.
     */
    public function getDurationMinutesAttribute()
    {
        if (!$this->start_time || !$this->end_time) {
            return null;
        }

        return $this->start_time->diffInMinutes($this->end_time);
    }

    /**
     * Get maintenance status color for UI.
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'completed' => 'green',
            'in_progress' => 'orange',
            'cancelled' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get maintenance type color for UI.
     */
    public function getTypeColorAttribute()
    {
        return match($this->type) {
            'preventive' => 'blue',
            'corrective' => 'orange',
            'calibration' => 'purple',
            'inspection' => 'green',
            'repair' => 'red',
            default => 'gray'
        };
    }

    /**
     * Check if maintenance was completed on time.
     */
    public function wasCompletedOnTime()
    {
        if (!$this->maintenanceSchedule || !$this->end_time) {
            return null;
        }

        $scheduledEndTime = $this->maintenance_date->setTimeFromTimeString($this->start_time->format('H:i:s'))
            ->addHours($this->maintenanceSchedule->estimated_duration_hours ?? 1);

        return $this->end_time <= $scheduledEndTime;
    }

    /**
     * Check if maintenance was completed within budget.
     */
    public function wasCompletedWithinBudget()
    {
        if (!$this->maintenanceSchedule || !$this->cost) {
            return null;
        }

        return $this->cost <= ($this->maintenanceSchedule->estimated_cost ?? 0);
    }

    /**
     * Get the efficiency score for this maintenance.
     */
    public function getEfficiencyScoreAttribute()
    {
        $score = 0;
        $factors = 0;

        // Time efficiency
        if ($this->wasCompletedOnTime() !== null) {
            $score += $this->wasCompletedOnTime() ? 1 : 0;
            $factors++;
        }

        // Cost efficiency
        if ($this->wasCompletedWithinBudget() !== null) {
            $score += $this->wasCompletedWithinBudget() ? 1 : 0;
            $factors++;
        }

        // Quality (no issues found)
        if ($this->issues_found) {
            $score += empty(trim($this->issues_found)) ? 1 : 0;
            $factors++;
        }

        return $factors > 0 ? round(($score / $factors) * 100) : null;
    }

    /**
     * Get formatted duration string.
     */
    public function getFormattedDurationAttribute()
    {
        if (!$this->duration_hours) {
            return 'N/A';
        }

        $hours = floor($this->duration_hours);
        $minutes = ($this->duration_hours - $hours) * 60;

        if ($hours > 0 && $minutes > 0) {
            return "{$hours}h " . round($minutes) . "m";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } else {
            return round($minutes) . "m";
        }
    }
}
