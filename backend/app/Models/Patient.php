<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'phone',
        'email',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'medical_history',
        'allergies',
        'blood_type',
        'insurance_provider',
        'insurance_number',
        'status',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'medical_history' => 'array',
        'allergies' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'full_name',
        'age',
        'age_group'
    ];

    protected $hidden = [
        'deleted_at'
    ];

    // Constants for status
    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_DECEASED = 'deceased';

    // Constants for gender
    const GENDER_MALE = 'male';
    const GENDER_FEMALE = 'female';
    const GENDER_OTHER = 'other';

    // Constants for blood types
    const BLOOD_TYPES = [
        'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
    ];

    /**
     * Get the medical records for the patient.
     */
    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    /**
     * Get the prescriptions for the patient.
     */
    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    /**
     * Get the appointments for the patient.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the admissions for the patient.
     */
    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class);
    }

    /**
     * Get the invoices for the patient.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get the lab requests for the patient.
     */
    public function labRequests(): HasMany
    {
        return $this->hasMany(LabRequest::class);
    }

    /**
     * Get the user who created this patient record.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this patient record.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the patient's full name.
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Get the patient's age.
     */
    public function getAgeAttribute(): int
    {
        return $this->date_of_birth ? $this->date_of_birth->age : 0;
    }

    /**
     * Get the patient's age group.
     */
    public function getAgeGroupAttribute(): string
    {
        $age = $this->age;
        
        if ($age <= 18) return '0-18';
        if ($age <= 35) return '19-35';
        if ($age <= 50) return '36-50';
        if ($age <= 65) return '51-65';
        
        return '65+';
    }

    /**
     * Scope for active patients.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope for patients by gender.
     */
    public function scopeByGender(Builder $query, string $gender): Builder
    {
        return $query->where('gender', $gender);
    }

    /**
     * Scope for patients by blood type.
     */
    public function scopeByBloodType(Builder $query, string $bloodType): Builder
    {
        return $query->where('blood_type', $bloodType);
    }

    /**
     * Scope for patients by age group.
     */
    public function scopeByAgeGroup(Builder $query, string $ageGroup): Builder
    {
        switch ($ageGroup) {
            case '0-18':
                return $query->whereRaw('TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 0 AND 18');
            case '19-35':
                return $query->whereRaw('TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 19 AND 35');
            case '36-50':
                return $query->whereRaw('TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 36 AND 50');
            case '51-65':
                return $query->whereRaw('TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 51 AND 65');
            case '65+':
                return $query->whereRaw('TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) > 65');
            default:
                return $query;
        }
    }

    /**
     * Scope for searching patients.
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('patient_id', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
        });
    }

    /**
     * Get patient statistics.
     */
    public static function getStatistics(): array
    {
        return [
            'total_patients' => self::count(),
            'active_patients' => self::active()->count(),
            'inactive_patients' => self::where('status', self::STATUS_INACTIVE)->count(),
            'deceased_patients' => self::where('status', self::STATUS_DECEASED)->count(),
            'male_patients' => self::byGender(self::GENDER_MALE)->count(),
            'female_patients' => self::byGender(self::GENDER_FEMALE)->count(),
            'patients_by_age_group' => [
                '0-18' => self::byAgeGroup('0-18')->count(),
                '19-35' => self::byAgeGroup('19-35')->count(),
                '36-50' => self::byAgeGroup('36-50')->count(),
                '51-65' => self::byAgeGroup('51-65')->count(),
                '65+' => self::byAgeGroup('65+')->count(),
            ],
            'patients_by_blood_type' => self::selectRaw('blood_type, COUNT(*) as count')
                ->whereNotNull('blood_type')
                ->groupBy('blood_type')
                ->pluck('count', 'blood_type')
                ->toArray(),
            'recent_patients' => self::with(['createdBy'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
        ];
    }

    /**
     * Generate unique patient ID.
     */
    public static function generatePatientId(): string
    {
        $count = self::count() + 1;
        return 'PAT-' . str_pad($count, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Check if patient has critical allergies.
     */
    public function hasCriticalAllergies(): bool
    {
        if (!$this->allergies) {
            return false;
        }

        $criticalAllergies = ['penicillin', 'sulfa', 'latex', 'iodine'];
        
        foreach ($this->allergies as $allergy) {
            if (in_array(strtolower($allergy), $criticalAllergies)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get patient's last visit date.
     */
    public function getLastVisitDate(): ?Carbon
    {
        $lastAppointment = $this->appointments()
            ->where('status', 'completed')
            ->orderBy('appointment_date', 'desc')
            ->first();

        return $lastAppointment ? $lastAppointment->appointment_date : null;
    }

    /**
     * Check if patient is due for follow-up.
     */
    public function isDueForFollowUp(int $daysThreshold = 30): bool
    {
        $lastVisit = $this->getLastVisitDate();
        
        if (!$lastVisit) {
            return false;
        }

        return $lastVisit->addDays($daysThreshold)->isPast();
    }

    /**
     * Get patient's insurance information.
     */
    public function getInsuranceInfo(): array
    {
        return [
            'provider' => $this->insurance_provider,
            'number' => $this->insurance_number,
            'has_insurance' => !empty($this->insurance_provider) && !empty($this->insurance_number)
        ];
    }

    /**
     * Get patient's emergency contact information.
     */
    public function getEmergencyContactInfo(): array
    {
        return [
            'name' => $this->emergency_contact_name,
            'phone' => $this->emergency_contact_phone,
            'has_emergency_contact' => !empty($this->emergency_contact_name) && !empty($this->emergency_contact_phone)
        ];
    }

    /**
     * Boot method to handle model events.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($patient) {
            if (empty($patient->patient_id)) {
                $patient->patient_id = self::generatePatientId();
            }
        });

        static::updating(function ($patient) {
            $patient->updated_by = auth()->id();
        });
    }
}