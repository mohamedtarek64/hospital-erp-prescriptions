<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'type',
        'category',
        'delivery_method',
        'instructor_id',
        'department_id',
        'scheduled_date',
        'completion_date',
        'duration',
        'max_participants',
        'participants',
        'learning_objectives',
        'assessment_criteria',
        'status',
        'pass_rate',
        'feedback',
        'attachments',
        'certification_required',
        'certification_expiry',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'completion_date' => 'date',
        'certification_expiry' => 'date',
        'participants' => 'array',
        'learning_objectives' => 'array',
        'assessment_criteria' => 'array',
        'attachments' => 'array',
        'certification_required' => 'boolean',
        'pass_rate' => 'decimal:2'
    ];

    /**
     * Get the instructor
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /**
     * Get the department
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * Get the user who created this training
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this training
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get staff training records
     */
    public function staffTraining(): HasMany
    {
        return $this->hasMany(StaffTraining::class, 'training_id');
    }

    /**
     * Scope for trainings by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for trainings by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for trainings by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for mandatory trainings
     */
    public function scopeMandatory($query)
    {
        return $query->where('type', 'mandatory');
    }

    /**
     * Scope for certification trainings
     */
    public function scopeCertification($query)
    {
        return $query->where('certification_required', true);
    }

    /**
     * Scope for upcoming trainings
     */
    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_date', '>=', now())
            ->whereIn('status', ['scheduled', 'in_progress']);
    }

    /**
     * Scope for overdue trainings
     */
    public function scopeOverdue($query)
    {
        return $query->where('scheduled_date', '<', now())
            ->whereIn('status', ['scheduled', 'in_progress']);
    }

    /**
     * Get training duration in hours
     */
    public function getDurationInHoursAttribute(): ?float
    {
        if ($this->duration) {
            $time = explode(':', $this->duration);
            return (float) $time[0] + ((float) $time[1] / 60);
        }

        return null;
    }

    /**
     * Get completion rate
     */
    public function getCompletionRateAttribute(): float
    {
        $totalParticipants = $this->staffTraining()->count();
        if ($totalParticipants === 0) {
            return 0;
        }

        $completedParticipants = $this->staffTraining()
            ->where('status', 'completed')
            ->count();

        return round(($completedParticipants / $totalParticipants) * 100, 2);
    }

    /**
     * Get pass rate
     */
    public function getPassRateAttribute(): float
    {
        $completedParticipants = $this->staffTraining()
            ->where('status', 'completed')
            ->count();

        if ($completedParticipants === 0) {
            return 0;
        }

        $passedParticipants = $this->staffTraining()
            ->where('status', 'completed')
            ->where('result', 'pass')
            ->count();

        return round(($passedParticipants / $completedParticipants) * 100, 2);
    }

    /**
     * Check if training is overdue
     */
    public function isOverdue(): bool
    {
        return $this->scheduled_date < now() && 
               in_array($this->status, ['scheduled', 'in_progress']);
    }

    /**
     * Check if certification is expired
     */
    public function isCertificationExpired(): bool
    {
        return $this->certification_required && 
               $this->certification_expiry && 
               $this->certification_expiry < now();
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'scheduled' => 'blue',
            'in_progress' => 'yellow',
            'completed' => 'green',
            'cancelled' => 'red',
            'postponed' => 'orange',
            default => 'gray'
        };
    }

    /**
     * Get type color for UI
     */
    public function getTypeColorAttribute(): string
    {
        return match($this->type) {
            'mandatory' => 'red',
            'certification' => 'blue',
            'safety' => 'orange',
            'orientation' => 'green',
            'refresher' => 'yellow',
            'specialized' => 'purple',
            default => 'gray'
        };
    }
}
