<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffTraining extends Model
{
    use HasFactory;

    protected $table = 'staff_training';

    protected $fillable = [
        'staff_id',
        'training_id',
        'status',
        'enrollment_date',
        'completion_date',
        'score',
        'result',
        'feedback',
        'assessment_results',
        'certification_date',
        'certification_expiry',
        'certification_valid',
        'notes',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'enrollment_date' => 'date',
        'completion_date' => 'date',
        'certification_date' => 'date',
        'certification_expiry' => 'date',
        'certification_valid' => 'boolean',
        'assessment_results' => 'array',
        'score' => 'decimal:2'
    ];

    /**
     * Get the staff member
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    /**
     * Get the training record
     */
    public function training(): BelongsTo
    {
        return $this->belongsTo(TrainingRecord::class, 'training_id');
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
     * Scope for records by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for completed trainings
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for passed trainings
     */
    public function scopePassed($query)
    {
        return $query->where('result', 'pass');
    }

    /**
     * Scope for failed trainings
     */
    public function scopeFailed($query)
    {
        return $query->where('result', 'fail');
    }

    /**
     * Scope for expired certifications
     */
    public function scopeExpiredCertification($query)
    {
        return $query->where('certification_expiry', '<', now())
            ->where('certification_valid', true);
    }

    /**
     * Scope for expiring certifications
     */
    public function scopeExpiringCertification($query, $days = 30)
    {
        return $query->where('certification_expiry', '<=', now()->addDays($days))
            ->where('certification_expiry', '>', now())
            ->where('certification_valid', true);
    }

    /**
     * Get training duration in days
     */
    public function getDurationAttribute(): ?int
    {
        if ($this->completion_date) {
            return $this->enrollment_date->diffInDays($this->completion_date);
        }

        return null;
    }

    /**
     * Check if certification is expired
     */
    public function isCertificationExpired(): bool
    {
        return $this->certification_expiry && 
               $this->certification_expiry < now() && 
               $this->certification_valid;
    }

    /**
     * Check if certification is expiring soon
     */
    public function isCertificationExpiringSoon(int $days = 30): bool
    {
        return $this->certification_expiry && 
               $this->certification_expiry <= now()->addDays($days) && 
               $this->certification_expiry > now() && 
               $this->certification_valid;
    }

    /**
     * Get days until certification expiry
     */
    public function getDaysUntilCertificationExpiryAttribute(): ?int
    {
        if ($this->certification_expiry) {
            return now()->diffInDays($this->certification_expiry, false);
        }

        return null;
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'enrolled' => 'blue',
            'in_progress' => 'yellow',
            'completed' => 'green',
            'failed' => 'red',
            'withdrawn' => 'gray',
            default => 'gray'
        };
    }

    /**
     * Get result color for UI
     */
    public function getResultColorAttribute(): string
    {
        return match($this->result) {
            'pass' => 'green',
            'fail' => 'red',
            'exempt' => 'blue',
            default => 'gray'
        };
    }

    /**
     * Get certification status color for UI
     */
    public function getCertificationStatusColorAttribute(): string
    {
        if (!$this->certification_expiry) {
            return 'gray';
        }

        if ($this->isCertificationExpired()) {
            return 'red';
        }

        if ($this->isCertificationExpiringSoon()) {
            return 'orange';
        }

        return 'green';
    }
}
