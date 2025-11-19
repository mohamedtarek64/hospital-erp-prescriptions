<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'lab_request_item_id',
        'parameter_name',
        'result_value',
        'unit',
        'normal_range',
        'status',
        'comments',
        'verified_by',
        'verified_at'
    ];

    protected $casts = [
        'verified_at' => 'datetime'
    ];

    /**
     * Get the lab request item that owns the result.
     */
    public function labRequestItem(): BelongsTo
    {
        return $this->belongsTo(LabRequestItem::class);
    }

    /**
     * Get the user who verified the result.
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Scope a query to only include normal results.
     */
    public function scopeNormal($query)
    {
        return $query->where('status', 'normal');
    }

    /**
     * Scope a query to only include abnormal results.
     */
    public function scopeAbnormal($query)
    {
        return $query->where('status', 'abnormal');
    }

    /**
     * Scope a query to only include critical results.
     */
    public function scopeCritical($query)
    {
        return $query->where('status', 'critical');
    }

    /**
     * Scope a query to only include verified results.
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }

    /**
     * Scope a query to only include unverified results.
     */
    public function scopeUnverified($query)
    {
        return $query->whereNull('verified_at');
    }

    /**
     * Check if result is normal.
     */
    public function isNormal(): bool
    {
        return $this->status === 'normal';
    }

    /**
     * Check if result is abnormal.
     */
    public function isAbnormal(): bool
    {
        return $this->status === 'abnormal';
    }

    /**
     * Check if result is critical.
     */
    public function isCritical(): bool
    {
        return $this->status === 'critical';
    }

    /**
     * Check if result is verified.
     */
    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    /**
     * Check if result is unverified.
     */
    public function isUnverified(): bool
    {
        return $this->verified_at === null;
    }
}
