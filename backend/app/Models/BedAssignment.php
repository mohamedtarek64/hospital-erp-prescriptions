<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BedAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'admission_id',
        'bed_id',
        'assigned_date',
        'assigned_time',
        'released_date',
        'released_time',
        'reason', // e.g., discharge, transfer, maintenance
        'notes',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'assigned_date' => 'date',
        'assigned_time' => 'datetime',
        'released_date' => 'date',
        'released_time' => 'datetime'
    ];

    /**
     * Get the admission for this bed assignment.
     */
    public function admission(): BelongsTo
    {
        return $this->belongsTo(Admission::class);
    }

    /**
     * Get the bed for this bed assignment.
     */
    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }

    /**
     * Scope a query to only include active assignments.
     */
    public function scopeActive($query)
    {
        return $query->whereNull('released_date');
    }

    /**
     * Scope a query to only include released assignments.
     */
    public function scopeReleased($query)
    {
        return $query->whereNotNull('released_date');
    }

    /**
     * Scope a query to only include assignments for a given bed.
     */
    public function scopeForBed($query, $bedId)
    {
        return $query->where('bed_id', $bedId);
    }

    /**
     * Scope a query to only include assignments for a given admission.
     */
    public function scopeForAdmission($query, $admissionId)
    {
        return $query->where('admission_id', $admissionId);
    }

    /**
     * Check if assignment is currently active.
     */
    public function isActive(): bool
    {
        return is_null($this->released_date);
    }

    /**
     * Check if assignment is released.
     */
    public function isReleased(): bool
    {
        return !is_null($this->released_date);
    }

    /**
     * Get the duration of the assignment in days.
     */
    public function getDurationDaysAttribute(): int
    {
        $endDate = $this->released_date ?? now()->toDateString();
        $startDate = $this->assigned_date;

        return $startDate->diffInDays($endDate);
    }

    /**
     * Get the duration of the assignment in hours.
     */
    public function getDurationHoursAttribute(): int
    {
        $endDateTime = $this->released_time ?? now();
        $startDateTime = $this->assigned_time;

        return $startDateTime->diffInHours($endDateTime);
    }

    /**
     * Get reason color for UI
     */
    public function getReasonColorAttribute(): string
    {
        return match($this->reason) {
            'discharge' => 'green',
            'transfer' => 'blue',
            'maintenance' => 'orange',
            'cleaning' => 'yellow',
            default => 'gray'
        };
    }
}
