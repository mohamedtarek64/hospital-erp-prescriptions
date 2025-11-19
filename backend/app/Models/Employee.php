<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employee_id',
        'department_id',
        'position',
        'job_title',
        'hire_date',
        'termination_date',
        'salary',
        'employment_type',
        'work_schedule',
        'status',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'notes'
    ];

    protected $casts = [
        'hire_date' => 'date',
        'termination_date' => 'date',
        'salary' => 'decimal:2'
    ];

    /**
     * Get the user that owns the employee.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the department that owns the employee.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the attendance records for the employee.
     */
    public function attendance(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get the leave requests for the employee.
     */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    /**
     * Get the payroll records for the employee.
     */
    public function payroll(): HasMany
    {
        return $this->hasMany(Payroll::class);
    }

    /**
     * Scope a query to only include active employees.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include inactive employees.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Scope a query to only include terminated employees.
     */
    public function scopeTerminated($query)
    {
        return $query->where('status', 'terminated');
    }

    /**
     * Scope a query to only include employees on leave.
     */
    public function scopeOnLeave($query)
    {
        return $query->where('status', 'on_leave');
    }

    /**
     * Scope a query to only include full-time employees.
     */
    public function scopeFullTime($query)
    {
        return $query->where('employment_type', 'full_time');
    }

    /**
     * Scope a query to only include part-time employees.
     */
    public function scopePartTime($query)
    {
        return $query->where('employment_type', 'part_time');
    }

    /**
     * Check if employee is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if employee is terminated.
     */
    public function isTerminated(): bool
    {
        return $this->status === 'terminated';
    }

    /**
     * Check if employee is on leave.
     */
    public function isOnLeave(): bool
    {
        return $this->status === 'on_leave';
    }

    /**
     * Get years of service.
     */
    public function getYearsOfServiceAttribute(): int
    {
        return $this->hire_date->diffInYears(now());
    }

    /**
     * Generate employee ID.
     */
    public static function generateEmployeeId(): string
    {
        $prefix = 'EMP';
        $timestamp = now()->format('Ymd');
        $random = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        return "{$prefix}-{$timestamp}-{$random}";
    }
}