<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'medical_record_id',
        'test_name',
        'test_type',
        'results',
        'normal_range',
        'status',
        'test_date'
    ];

    protected $casts = [
        'test_date' => 'date',
    ];

    /**
     * Get the medical record that owns the medical test.
     */
    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    /**
     * Scope a query to only include pending tests.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include completed tests.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include cancelled tests.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }
}
