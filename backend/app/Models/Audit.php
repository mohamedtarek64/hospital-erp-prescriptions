<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Audit extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'type',
        'scope',
        'status',
        'standard_id',
        'auditor_id',
        'department_id',
        'planned_date',
        'start_date',
        'end_date',
        'audit_team',
        'findings',
        'recommendations',
        'overall_rating',
        'summary',
        'attachments',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'planned_date' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
        'audit_team' => 'array',
        'findings' => 'array',
        'recommendations' => 'array',
        'attachments' => 'array'
    ];

    /**
     * Get the quality standard being audited
     */
    public function standard(): BelongsTo
    {
        return $this->belongsTo(QualityStandard::class, 'standard_id');
    }

    /**
     * Get the auditor
     */
    public function auditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'auditor_id');
    }

    /**
     * Get the department being audited
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * Get the user who created this audit
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this audit
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope for audits by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for audits by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for audits by scope
     */
    public function scopeByScope($query, $scope)
    {
        return $query->where('scope', $scope);
    }

    /**
     * Scope for upcoming audits
     */
    public function scopeUpcoming($query)
    {
        return $query->where('planned_date', '>=', now())
            ->where('status', 'planned');
    }

    /**
     * Scope for overdue audits
     */
    public function scopeOverdue($query)
    {
        return $query->where('planned_date', '<', now())
            ->whereIn('status', ['planned', 'in_progress']);
    }

    /**
     * Get audit duration in days
     */
    public function getDurationAttribute(): ?int
    {
        if ($this->start_date && $this->end_date) {
            return $this->start_date->diffInDays($this->end_date) + 1;
        }

        return null;
    }

    /**
     * Check if audit is overdue
     */
    public function isOverdue(): bool
    {
        return $this->planned_date < now() && 
               in_array($this->status, ['planned', 'in_progress']);
    }

    /**
     * Get audit progress percentage
     */
    public function getProgressAttribute(): int
    {
        switch ($this->status) {
            case 'planned':
                return 0;
            case 'in_progress':
                return 50;
            case 'completed':
                return 100;
            default:
                return 0;
        }
    }

    /**
     * Get rating color for UI
     */
    public function getRatingColorAttribute(): string
    {
        return match($this->overall_rating) {
            'excellent' => 'green',
            'good' => 'blue',
            'satisfactory' => 'yellow',
            'needs_improvement' => 'orange',
            'unsatisfactory' => 'red',
            default => 'gray'
        };
    }
}
