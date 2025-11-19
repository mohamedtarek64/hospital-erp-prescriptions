<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Diagnosis extends Model
{
    use HasFactory;

    protected $fillable = [
        'medical_record_id',
        'icd_code',
        'diagnosis_name',
        'severity',
        'status',
        'notes'
    ];

    /**
     * Get the medical record that owns the diagnosis.
     */
    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    /**
     * Scope a query to only include active diagnoses.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include resolved diagnoses.
     */
    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    /**
     * Scope a query to only include chronic diagnoses.
     */
    public function scopeChronic($query)
    {
        return $query->where('status', 'chronic');
    }
}
