<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LabSample extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'sample_number',
        'sample_type',
        'collection_notes',
        'collection_date',
        'received_date',
        'status',
        'rejection_reason',
        'collected_by',
        'received_by'
    ];

    protected $casts = [
        'collection_date' => 'datetime',
        'received_date' => 'datetime'
    ];

    /**
     * Get the patient that owns the sample.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the user who collected the sample.
     */
    public function collector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    /**
     * Get the user who received the sample.
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    /**
     * Get the lab request items for the sample.
     */
    public function labRequestItems(): HasMany
    {
        return $this->hasMany(LabRequestItem::class);
    }

    /**
     * Scope a query to only include collected samples.
     */
    public function scopeCollected($query)
    {
        return $query->where('status', 'collected');
    }

    /**
     * Scope a query to only include received samples.
     */
    public function scopeReceived($query)
    {
        return $query->where('status', 'received');
    }

    /**
     * Scope a query to only include processing samples.
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    /**
     * Scope a query to only include completed samples.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include rejected samples.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Check if sample is collected.
     */
    public function isCollected(): bool
    {
        return $this->status === 'collected';
    }

    /**
     * Check if sample is received.
     */
    public function isReceived(): bool
    {
        return $this->status === 'received';
    }

    /**
     * Check if sample is processing.
     */
    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    /**
     * Check if sample is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if sample is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Generate sample number.
     */
    public static function generateSampleNumber(): string
    {
        $prefix = 'SMP';
        $timestamp = now()->format('Ymd');
        $random = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        return "{$prefix}-{$timestamp}-{$random}";
    }
}
