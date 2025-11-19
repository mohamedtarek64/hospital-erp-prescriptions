<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Incident extends Model
{
    use HasFactory;

    protected $fillable = [
        'incident_number',
        'title',
        'description',
        'type',
        'severity',
        'status',
        'reported_by',
        'assigned_to',
        'department_id',
        'patient_id',
        'staff_id',
        'incident_date',
        'reported_date',
        'resolved_date',
        'immediate_action',
        'root_cause',
        'corrective_action',
        'preventive_action',
        'witnesses',
        'attachments',
        'requires_follow_up',
        'follow_up_date',
        'follow_up_notes',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'incident_date' => 'datetime',
        'reported_date' => 'datetime',
        'resolved_date' => 'datetime',
        'follow_up_date' => 'date',
        'witnesses' => 'array',
        'attachments' => 'array',
        'requires_follow_up' => 'boolean'
    ];

    /**
     * Boot method to generate incident number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($incident) {
            if (empty($incident->incident_number)) {
                $incident->incident_number = 'INC-' . date('Y') . '-' . str_pad(
                    static::whereYear('created_at', date('Y'))->count() + 1,
                    4,
                    '0',
                    STR_PAD_LEFT
                );
            }
        });
    }

    /**
     * Get the user who reported this incident
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    /**
     * Get the user assigned to this incident
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the department
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * Get the patient (if applicable)
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    /**
     * Get the staff member (if applicable)
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    /**
     * Get the user who created this incident
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this incident
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope for incidents by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for incidents by severity
     */
    public function scopeBySeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope for incidents by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for critical incidents
     */
    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    /**
     * Scope for incidents requiring follow-up
     */
    public function scopeRequiringFollowUp($query)
    {
        return $query->where('requires_follow_up', true);
    }

    /**
     * Scope for overdue follow-ups
     */
    public function scopeOverdueFollowUp($query)
    {
        return $query->where('requires_follow_up', true)
            ->where('follow_up_date', '<', now())
            ->whereIn('status', ['reported', 'investigating']);
    }

    /**
     * Get resolution time in hours
     */
    public function getResolutionTimeAttribute(): ?float
    {
        if ($this->resolved_date) {
            return $this->reported_date->diffInHours($this->resolved_date);
        }

        return null;
    }

    /**
     * Check if incident is overdue
     */
    public function isOverdue(): bool
    {
        return $this->requires_follow_up && 
               $this->follow_up_date && 
               $this->follow_up_date < now() &&
               in_array($this->status, ['reported', 'investigating']);
    }

    /**
     * Get severity color for UI
     */
    public function getSeverityColorAttribute(): string
    {
        return match($this->severity) {
            'low' => 'green',
            'medium' => 'yellow',
            'high' => 'orange',
            'critical' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'reported' => 'blue',
            'investigating' => 'yellow',
            'resolved' => 'green',
            'closed' => 'gray',
            'escalated' => 'red',
            default => 'gray'
        };
    }
}
