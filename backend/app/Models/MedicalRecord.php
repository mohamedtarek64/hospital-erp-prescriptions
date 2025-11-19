<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MedicalRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'appointment_id',
        'chief_complaint',
        'examination_notes',
        'diagnosis',
        'treatment_plan',
        'follow_up_date',
        'status'
    ];

    protected $casts = [
        'follow_up_date' => 'date',
    ];

    /**
     * Get the patient that owns the medical record.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the doctor that owns the medical record.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the appointment associated with the medical record.
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * Get the diagnoses for the medical record.
     */
    public function diagnoses(): HasMany
    {
        return $this->hasMany(Diagnosis::class);
    }

    /**
     * Get the prescriptions for the medical record.
     */
    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    /**
     * Get the medical tests for the medical record.
     */
    public function medicalTests(): HasMany
    {
        return $this->hasMany(MedicalTest::class);
    }

    /**
     * Get the attachments for the medical record.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(MedicalAttachment::class);
    }

    /**
     * Scope a query to only include active records.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include completed records.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
