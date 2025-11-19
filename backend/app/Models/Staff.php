<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Staff extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'staff';

    protected $fillable = [
        'employee_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'position',
        'department_id',
        'hire_date',
        'employment_status',
        'salary',
        'emergency_contact_name',
        'emergency_contact_phone',
        'qualifications',
        'certifications',
        'skills',
        'notes',
        'is_active',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'hire_date' => 'date',
        'salary' => 'decimal:2',
        'qualifications' => 'array',
        'certifications' => 'array',
        'skills' => 'array',
        'is_active' => 'boolean'
    ];

    /**
     * Get the department
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * Get the user who created this staff record
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this staff record
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get staff training records
     */
    public function training(): HasMany
    {
        return $this->hasMany(StaffTraining::class, 'staff_id');
    }

    /**
     * Scope for active staff
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for staff by department
     */
    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope for staff by position
     */
    public function scopeByPosition($query, $position)
    {
        return $query->where('position', $position);
    }

    /**
     * Scope for staff by employment status
     */
    public function scopeByEmploymentStatus($query, $status)
    {
        return $query->where('employment_status', $status);
    }

    /**
     * Get full name
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Get age
     */
    public function getAgeAttribute(): ?int
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    /**
     * Get years of service
     */
    public function getYearsOfServiceAttribute(): ?float
    {
        return $this->hire_date ? $this->hire_date->diffInYears(now()) : null;
    }

    /**
     * Get employment status color for UI
     */
    public function getEmploymentStatusColorAttribute(): string
    {
        return match($this->employment_status) {
            'active' => 'green',
            'on_leave' => 'yellow',
            'terminated' => 'red',
            'resigned' => 'orange',
            'retired' => 'blue',
            'probation' => 'purple',
            default => 'gray'
        };
    }

    /**
     * Check if staff has expired certifications
     */
    public function hasExpiredCertifications(): bool
    {
        return $this->training()
            ->where('certification_expiry', '<', now())
            ->where('certification_valid', true)
            ->exists();
    }

    /**
     * Check if staff has expiring certifications
     */
    public function hasExpiringCertifications(int $days = 30): bool
    {
        return $this->training()
            ->where('certification_expiry', '<=', now()->addDays($days))
            ->where('certification_expiry', '>', now())
            ->where('certification_valid', true)
            ->exists();
    }

    /**
     * Get pending training count
     */
    public function getPendingTrainingCountAttribute(): int
    {
        return $this->training()
            ->whereIn('status', ['enrolled', 'in_progress'])
            ->count();
    }

    /**
     * Get completed training count
     */
    public function getCompletedTrainingCountAttribute(): int
    {
        return $this->training()
            ->where('status', 'completed')
            ->count();
    }

    /**
     * Get training pass rate
     */
    public function getTrainingPassRateAttribute(): float
    {
        $completedTraining = $this->training()
            ->where('status', 'completed')
            ->count();

        if ($completedTraining === 0) {
            return 0;
        }

        $passedTraining = $this->training()
            ->where('status', 'completed')
            ->where('result', 'pass')
            ->count();

        return round(($passedTraining / $completedTraining) * 100, 2);
    }
}