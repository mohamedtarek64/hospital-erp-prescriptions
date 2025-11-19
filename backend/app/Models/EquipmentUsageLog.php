<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class EquipmentUsageLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'used_by',
        'usage_start',
        'usage_end',
        'purpose',
        'patient_id',
        'notes',
        'usage_data',
        'status'
    ];

    protected $casts = [
        'usage_start' => 'datetime',
        'usage_end' => 'datetime',
        'usage_data' => 'array'
    ];

    /**
     * Get the equipment that was used.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the user who used the equipment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    /**
     * Get the patient associated with this usage.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Scope a query to only include active usage logs.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include completed usage logs.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to filter by purpose.
     */
    public function scopeByPurpose($query, $purpose)
    {
        return $query->where('purpose', $purpose);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('usage_start', [$startDate, $endDate]);
    }

    /**
     * Get the duration of usage in minutes.
     */
    public function getDurationInMinutesAttribute(): ?int
    {
        if (!$this->usage_end) {
            return null;
        }

        return $this->usage_start->diffInMinutes($this->usage_end);
    }

    /**
     * Get the duration of usage in hours.
     */
    public function getDurationInHoursAttribute(): ?float
    {
        if (!$this->usage_end) {
            return null;
        }

        return round($this->usage_start->diffInMinutes($this->usage_end) / 60, 2);
    }

    /**
     * Check if the usage is currently active.
     */
    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active' && !$this->usage_end;
    }

    /**
     * Get the usage duration as a human-readable string.
     */
    public function getDurationStringAttribute(): string
    {
        if (!$this->usage_end) {
            return 'Ongoing';
        }

        $minutes = $this->duration_in_minutes;
        
        if ($minutes < 60) {
            return "{$minutes} minutes";
        }

        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        if ($remainingMinutes === 0) {
            return "{$hours} hours";
        }

        return "{$hours}h {$remainingMinutes}m";
    }

    /**
     * Boot method to handle model events.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($usageLog) {
            if (!$usageLog->usage_start) {
                $usageLog->usage_start = now();
            }
        });
    }
}
