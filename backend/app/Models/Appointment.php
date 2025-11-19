<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'patient_id',
        'doctor_id',
        'department_id',
        'appointment_date',
        'status',
        'type',
        'reason',
        'notes',
        'diagnosis',
        'treatment_plan',
        'consultation_fee',
        'payment_status',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'appointment_date' => 'datetime',
        'consultation_fee' => 'decimal:2',
    ];

    /**
     * Get the patient that owns the appointment.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the doctor that owns the appointment.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the department that owns the appointment.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the user who created this appointment.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this appointment.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the appointment status in Arabic.
     */
    public function getStatusInArabicAttribute(): string
    {
        $statuses = [
            'scheduled' => 'مجدول',
            'confirmed' => 'مؤكد',
            'in_progress' => 'قيد التنفيذ',
            'completed' => 'مكتمل',
            'cancelled' => 'ملغي',
            'no_show' => 'لم يحضر'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * Get the appointment type in Arabic.
     */
    public function getTypeInArabicAttribute(): string
    {
        $types = [
            'consultation' => 'استشارة',
            'follow_up' => 'متابعة',
            'emergency' => 'طوارئ',
            'routine_checkup' => 'فحص روتيني',
            'specialist' => 'أخصائي'
        ];

        return $types[$this->type] ?? $this->type;
    }

    /**
     * Scope a query to only include appointments for today.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('appointment_date', today());
    }

    /**
     * Scope a query to only include appointments for a specific doctor.
     */
    public function scopeForDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    /**
     * Scope a query to only include appointments for a specific patient.
     */
    public function scopeForPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    /**
     * Scope a query to only include appointments with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'patient_id',
        'doctor_id',
        'department_id',
        'appointment_date',
        'appointment_time',
        'status',
        'type',
        'reason',
        'notes',
        'diagnosis',
        'prescription',
        'fee',
        'payment_status',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'appointment_date' => 'datetime',
        'appointment_time' => 'datetime',
        'fee' => 'decimal:2',
    ];

    /**
