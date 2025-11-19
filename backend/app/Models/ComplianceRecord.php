<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplianceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'standard_id',
        'department_id',
        'staff_id',
        'compliance_status',
        'assessment_date',
        'next_assessment_date',
        'assessment_notes',
        'evidence',
        'gaps',
        'action_plan',
        'priority',
        'target_completion_date',
        'status',
        'assessed_by',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'assessment_date' => 'date',
        'next_assessment_date' => 'date',
        'target_completion_date' => 'date',
        'evidence' => 'array',
        'gaps' => 'array',
        'action_plan' => 'array'
    ];

    /**
     * Get the quality standard
     */
    public function standard(): BelongsTo
    {
        return $this->belongsTo(QualityStandard::class, 'standard_id');
    }

    /**
     * Get the department
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * Get the staff member
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    /**
     * Get the assessor
     */
    public function assessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assessed_by');
    }

    /**
     * Get the user who created this record
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this record
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope for records by compliance status
     */
    public function scopeByComplianceStatus($query, $status)
    {
        return $query->where('compliance_status', $status);
    }

    /**
     * Scope for records by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for records by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope for non-compliant records
     */
    public function scopeNonCompliant($query)
    {
        return $query->where('compliance_status', 'non_compliant');
    }

    /**
     * Scope for overdue records
     */
    public function scopeOverdue($query)
    {
        return $query->where('next_assessment_date', '<', now())
            ->where('status', '!=', 'completed');
    }

    /**
     * Scope for records due for assessment
     */
    public function scopeDueForAssessment($query)
    {
        return $query->where('next_assessment_date', '<=', now()->addDays(30))
            ->where('status', '!=', 'completed');
    }

    /**
     * Check if record is overdue
     */
    public function isOverdue(): bool
    {
        return $this->next_assessment_date < now() && 
               $this->status !== 'completed';
    }

    /**
     * Check if record is due for assessment
     */
    public function isDueForAssessment(): bool
    {
        return $this->next_assessment_date <= now()->addDays(30) && 
               $this->status !== 'completed';
    }

    /**
     * Get days until next assessment
     */
    public function getDaysUntilAssessmentAttribute(): int
    {
        return now()->diffInDays($this->next_assessment_date, false);
    }

    /**
     * Get compliance status color for UI
     */
    public function getComplianceStatusColorAttribute(): string
    {
        return match($this->compliance_status) {
            'compliant' => 'green',
            'partially_compliant' => 'yellow',
            'non_compliant' => 'red',
            'not_applicable' => 'gray',
            default => 'gray'
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'open' => 'blue',
            'in_progress' => 'yellow',
            'completed' => 'green',
            'overdue' => 'red',
            'cancelled' => 'gray',
            default => 'gray'
        };
    }

    /**
     * Get priority color for UI
     */
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'low' => 'green',
            'medium' => 'yellow',
            'high' => 'orange',
            'critical' => 'red',
            default => 'gray'
        };
    }
}
