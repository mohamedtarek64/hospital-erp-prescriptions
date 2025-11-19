<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EquipmentMaintenance extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'maintenance_type',
        'title',
        'description',
        'status',
        'priority',
        'scheduled_date',
        'started_at',
        'completed_at',
        'estimated_duration_hours',
        'actual_duration_hours',
        'estimated_cost',
        'actual_cost',
        'work_performed',
        'parts_replaced',
        'issues_found',
        'recommendations',
        'performed_by',
        'vendor_name',
        'vendor_contact',
        'work_order_number',
        'attachments',
        'notes',
        'created_by',
        'assigned_to'
    ];

    protected $casts = [
        'scheduled_date' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'estimated_duration_hours' => 'integer',
        'actual_duration_hours' => 'integer',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'attachments' => 'array'
    ];

    /**
     * Get the equipment that owns the maintenance record.
     */
    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the user who created the maintenance record.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user assigned to the maintenance.
     */
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Scope a query to only include scheduled maintenance.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope a query to only include in progress maintenance.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope a query to only include completed maintenance.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include overdue maintenance.
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue');
    }

    /**
     * Scope a query to filter by maintenance type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('maintenance_type', $type);
    }

    /**
     * Scope a query to filter by priority.
     */
    public function scopeOfPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('scheduled_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by assigned user.
     */
    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Check if maintenance is scheduled.
     */
    public function isScheduled()
    {
        return $this->status === 'scheduled';
    }

    /**
     * Check if maintenance is in progress.
     */
    public function isInProgress()
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if maintenance is completed.
     */
    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    /**
     * Check if maintenance is overdue.
     */
    public function isOverdue()
    {
        return $this->status === 'overdue' || 
               ($this->scheduled_date && $this->scheduled_date->isPast() && $this->status !== 'completed');
    }

    /**
     * Check if maintenance is cancelled.
     */
    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    /**
     * Get maintenance type description.
     */
    public function getMaintenanceTypeDescription()
    {
        $descriptions = [
            'preventive' => 'Preventive Maintenance',
            'corrective' => 'Corrective Maintenance',
            'emergency' => 'Emergency Repair',
            'calibration' => 'Calibration',
            'inspection' => 'Inspection'
        ];

        return $descriptions[$this->maintenance_type] ?? 'Unknown';
    }

    /**
     * Get priority description.
     */
    public function getPriorityDescription()
    {
        $descriptions = [
            'low' => 'Low Priority',
            'medium' => 'Medium Priority',
            'high' => 'High Priority',
            'critical' => 'Critical Priority'
        ];

        return $descriptions[$this->priority] ?? 'Unknown';
    }

    /**
     * Get status color.
     */
    public function getStatusColor()
    {
        $colors = [
            'scheduled' => 'blue',
            'in_progress' => 'yellow',
            'completed' => 'green',
            'cancelled' => 'gray',
            'overdue' => 'red'
        ];

        return $colors[$this->status] ?? 'gray';
    }

    /**
     * Get priority color.
     */
    public function getPriorityColor()
    {
        $colors = [
            'low' => 'green',
            'medium' => 'yellow',
            'high' => 'orange',
            'critical' => 'red'
        ];

        return $colors[$this->priority] ?? 'gray';
    }

    /**
     * Get actual duration in hours.
     */
    public function getActualDuration()
    {
        if ($this->started_at && $this->completed_at) {
            return $this->started_at->diffInHours($this->completed_at);
        }
        return null;
    }

    /**
     * Get formatted duration.
     */
    public function getFormattedDuration()
    {
        $duration = $this->actual_duration_hours ?? $this->getActualDuration();
        
        if ($duration) {
            $hours = floor($duration);
            $minutes = round(($duration - $hours) * 60);
            
            if ($hours > 0) {
                return "{$hours}h {$minutes}m";
            }
            return "{$minutes}m";
        }
        
        return 'N/A';
    }

    /**
     * Get cost variance.
     */
    public function getCostVariance()
    {
        if ($this->estimated_cost && $this->actual_cost) {
            return $this->actual_cost - $this->estimated_cost;
        }
        return null;
    }

    /**
     * Get cost variance percentage.
     */
    public function getCostVariancePercentage()
    {
        $variance = $this->getCostVariance();
        
        if ($variance && $this->estimated_cost) {
            return ($variance / $this->estimated_cost) * 100;
        }
        
        return null;
    }

    /**
     * Get duration variance.
     */
    public function getDurationVariance()
    {
        if ($this->estimated_duration_hours && $this->actual_duration_hours) {
            return $this->actual_duration_hours - $this->estimated_duration_hours;
        }
        return null;
    }

    /**
     * Get duration variance percentage.
     */
    public function getDurationVariancePercentage()
    {
        $variance = $this->getDurationVariance();
        
        if ($variance && $this->estimated_duration_hours) {
            return ($variance / $this->estimated_duration_hours) * 100;
        }
        
        return null;
    }

    /**
     * Check if maintenance is on time.
     */
    public function isOnTime()
    {
        if (!$this->scheduled_date || !$this->completed_at) {
            return null;
        }

        return $this->completed_at->lte($this->scheduled_date);
    }

    /**
     * Check if maintenance is within budget.
     */
    public function isWithinBudget()
    {
        if (!$this->estimated_cost || !$this->actual_cost) {
            return null;
        }

        return $this->actual_cost <= $this->estimated_cost;
    }

    /**
     * Get maintenance efficiency score.
     */
    public function getEfficiencyScore()
    {
        $score = 0;
        $factors = 0;

        // Time efficiency (40% weight)
        if ($this->isOnTime() !== null) {
            $score += $this->isOnTime() ? 40 : 0;
            $factors++;
        }

        // Cost efficiency (40% weight)
        if ($this->isWithinBudget() !== null) {
            $score += $this->isWithinBudget() ? 40 : 0;
            $factors++;
        }

        // Quality (20% weight) - based on whether issues were found
        if ($this->issues_found) {
            $score += 10; // Partial score if issues found
        } else {
            $score += 20; // Full score if no issues
        }
        $factors++;

        return $factors > 0 ? round($score / $factors) : 0;
    }

    /**
     * Get maintenance summary.
     */
    public function getSummary()
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'equipment' => $this->equipment->name ?? 'Unknown',
            'type' => $this->getMaintenanceTypeDescription(),
            'status' => $this->status,
            'priority' => $this->getPriorityDescription(),
            'scheduled_date' => $this->scheduled_date?->format('Y-m-d H:i'),
            'completed_date' => $this->completed_at?->format('Y-m-d H:i'),
            'duration' => $this->getFormattedDuration(),
            'cost' => $this->actual_cost ?? $this->estimated_cost,
            'assigned_to' => $this->assignedUser->name ?? 'Unassigned',
            'efficiency_score' => $this->getEfficiencyScore(),
        ];
    }

    /**
     * Mark maintenance as started.
     */
    public function markAsStarted()
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now()
        ]);
    }

    /**
     * Mark maintenance as completed.
     */
    public function markAsCompleted($actualCost = null, $actualDuration = null)
    {
        $updateData = [
            'status' => 'completed',
            'completed_at' => now()
        ];

        if ($actualCost !== null) {
            $updateData['actual_cost'] = $actualCost;
        }

        if ($actualDuration !== null) {
            $updateData['actual_duration_hours'] = $actualDuration;
        } else {
            $updateData['actual_duration_hours'] = $this->getActualDuration();
        }

        $this->update($updateData);

        // Update equipment's last maintenance date
        $this->equipment->update([
            'last_maintenance_date' => now(),
            'next_maintenance_date' => $this->equipment->maintenance_interval_days 
                ? now()->addDays($this->equipment->maintenance_interval_days) 
                : null
        ]);
    }

    /**
     * Mark maintenance as overdue.
     */
    public function markAsOverdue()
    {
        if ($this->scheduled_date && $this->scheduled_date->isPast() && $this->status === 'scheduled') {
            $this->update(['status' => 'overdue']);
        }
    }
}
