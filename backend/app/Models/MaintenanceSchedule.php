<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaintenanceSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'type',
        'title',
        'description',
        'scheduled_date',
        'due_date',
        'frequency',
        'interval_days',
        'status',
        'priority',
        'assigned_technician_id',
        'estimated_cost',
        'actual_cost',
        'estimated_duration_hours',
        'actual_duration_hours',
        'maintenance_notes',
        'checklist_items',
        'required_parts',
        'last_completed',
        'next_due',
        'is_recurring'
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'due_date' => 'date',
        'last_completed' => 'date',
        'next_due' => 'date',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'checklist_items' => 'array',
        'required_parts' => 'array',
        'is_recurring' => 'boolean'
    ];

    /**
     * Get the equipment that owns the maintenance schedule.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the technician assigned to the maintenance schedule.
     */
    public function assignedTechnician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }

    /**
     * Get the maintenance records for the schedule.
     */
    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(MaintenanceRecord::class);
    }

    /**
     * Scope a query to only include scheduled maintenance.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope a query to only include overdue maintenance.
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now()->toDateString())
                    ->whereIn('status', ['scheduled', 'in_progress']);
    }

    /**
     * Scope a query to only include maintenance due soon.
     */
    public function scopeDueSoon($query, $days = 7)
    {
        return $query->where('due_date', '<=', now()->addDays($days)->toDateString())
                    ->where('status', 'scheduled');
    }

    /**
     * Scope a query to only include maintenance by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include maintenance by priority.
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope a query to only include recurring maintenance.
     */
    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    /**
     * Check if maintenance is overdue.
     */
    public function isOverdue()
    {
        return $this->due_date < now()->toDateString() && 
               in_array($this->status, ['scheduled', 'in_progress']);
    }

    /**
     * Check if maintenance is due soon.
     */
    public function isDueSoon($days = 7)
    {
        return $this->due_date <= now()->addDays($days)->toDateString() && 
               $this->status === 'scheduled';
    }

    /**
     * Get days until due.
     */
    public function getDaysUntilDueAttribute()
    {
        return $this->due_date->diffInDays(now(), false);
    }

    /**
     * Get maintenance status color for UI.
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'scheduled' => 'blue',
            'in_progress' => 'orange',
            'completed' => 'green',
            'cancelled' => 'gray',
            'overdue' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get maintenance priority color for UI.
     */
    public function getPriorityColorAttribute()
    {
        return match($this->priority) {
            'low' => 'green',
            'medium' => 'yellow',
            'high' => 'orange',
            'critical' => 'red',
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
            default => 'gray'
        };
    }

    /**
     * Calculate next due date based on frequency.
     */
    public function calculateNextDueDate()
    {
        if (!$this->is_recurring) {
            return null;
        }

        $baseDate = $this->last_completed ?? $this->due_date;
        
        return match($this->frequency) {
            'daily' => $baseDate->addDay(),
            'weekly' => $baseDate->addWeek(),
            'monthly' => $baseDate->addMonth(),
            'quarterly' => $baseDate->addMonths(3),
            'annually' => $baseDate->addYear(),
            'custom' => $baseDate->addDays($this->interval_days ?? 30),
            default => $baseDate->addMonth()
        };
    }

    /**
     * Mark maintenance as completed and schedule next if recurring.
     */
    public function markCompleted($actualCost = null, $actualDuration = null, $notes = null)
    {
        $this->update([
            'status' => 'completed',
            'actual_cost' => $actualCost ?? $this->actual_cost,
            'actual_duration_hours' => $actualDuration ?? $this->actual_duration_hours,
            'maintenance_notes' => $notes ?? $this->maintenance_notes,
            'last_completed' => now()->toDateString()
        ]);

        if ($this->is_recurring) {
            $nextDue = $this->calculateNextDueDate();
            if ($nextDue) {
                $this->update([
                    'next_due' => $nextDue,
                    'due_date' => $nextDue,
                    'status' => 'scheduled'
                ]);
            }
        }
    }
}
