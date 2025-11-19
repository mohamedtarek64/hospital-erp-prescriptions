<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LabRequestItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'lab_request_id',
        'lab_test_id',
        'lab_sample_id',
        'notes',
        'status',
        'started_at',
        'completed_at',
        'performed_by'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime'
    ];

    /**
     * Get the lab request that owns the item.
     */
    public function labRequest(): BelongsTo
    {
        return $this->belongsTo(LabRequest::class);
    }

    /**
     * Get the lab test that owns the item.
     */
    public function labTest(): BelongsTo
    {
        return $this->belongsTo(LabTest::class);
    }

    /**
     * Get the lab sample that owns the item.
     */
    public function labSample(): BelongsTo
    {
        return $this->belongsTo(LabSample::class);
    }

    /**
     * Get the user who performed the test.
     */
    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Get the lab results for the item.
     */
    public function results(): HasMany
    {
        return $this->hasMany(LabResult::class);
    }

    /**
     * Scope a query to only include pending items.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include in progress items.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope a query to only include completed items.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include cancelled items.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Check if item is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if item is in progress.
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if item is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if item is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Get processing time in hours.
     */
    public function getProcessingTimeHoursAttribute(): ?float
    {
        if ($this->started_at && $this->completed_at) {
            return $this->started_at->diffInHours($this->completed_at);
        }
        
        return null;
    }
}
