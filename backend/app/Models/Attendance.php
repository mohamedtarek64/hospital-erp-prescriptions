<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date',
        'check_in',
        'check_out',
        'break_start',
        'break_end',
        'total_hours',
        'overtime_hours',
        'status',
        'notes'
    ];

    protected $casts = [
        'date' => 'date',
        'check_in' => 'datetime:H:i',
        'check_out' => 'datetime:H:i',
        'break_start' => 'datetime:H:i',
        'break_end' => 'datetime:H:i'
    ];

    /**
     * Get the employee that owns the attendance.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Scope a query to only include present attendance.
     */
    public function scopePresent($query)
    {
        return $query->where('status', 'present');
    }

    /**
     * Scope a query to only include absent attendance.
     */
    public function scopeAbsent($query)
    {
        return $query->where('status', 'absent');
    }

    /**
     * Scope a query to only include late attendance.
     */
    public function scopeLate($query)
    {
        return $query->where('status', 'late');
    }

    /**
     * Scope a query to only include half day attendance.
     */
    public function scopeHalfDay($query)
    {
        return $query->where('status', 'half_day');
    }

    /**
     * Scope a query to only include on leave attendance.
     */
    public function scopeOnLeave($query)
    {
        return $query->where('status', 'on_leave');
    }

    /**
     * Scope a query to only include attendance for a specific date range.
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Check if attendance is present.
     */
    public function isPresent(): bool
    {
        return $this->status === 'present';
    }

    /**
     * Check if attendance is absent.
     */
    public function isAbsent(): bool
    {
        return $this->status === 'absent';
    }

    /**
     * Check if attendance is late.
     */
    public function isLate(): bool
    {
        return $this->status === 'late';
    }

    /**
     * Check if attendance is half day.
     */
    public function isHalfDay(): bool
    {
        return $this->status === 'half_day';
    }

    /**
     * Check if attendance is on leave.
     */
    public function isOnLeave(): bool
    {
        return $this->status === 'on_leave';
    }

    /**
     * Get total hours worked in hours.
     */
    public function getTotalHoursWorkedAttribute(): float
    {
        return $this->total_hours / 60; // Convert minutes to hours
    }

    /**
     * Get overtime hours worked in hours.
     */
    public function getOvertimeHoursWorkedAttribute(): float
    {
        return $this->overtime_hours / 60; // Convert minutes to hours
    }

    /**
     * Calculate total hours worked.
     */
    public function calculateTotalHours(): void
    {
        if ($this->check_in && $this->check_out) {
            $checkIn = \Carbon\Carbon::parse($this->date . ' ' . $this->check_in);
            $checkOut = \Carbon\Carbon::parse($this->date . ' ' . $this->check_out);
            
            $totalMinutes = $checkOut->diffInMinutes($checkIn);
            
            // Subtract break time if provided
            if ($this->break_start && $this->break_end) {
                $breakStart = \Carbon\Carbon::parse($this->date . ' ' . $this->break_start);
                $breakEnd = \Carbon\Carbon::parse($this->date . ' ' . $this->break_end);
                $breakMinutes = $breakEnd->diffInMinutes($breakStart);
                $totalMinutes -= $breakMinutes;
            }
            
            $this->total_hours = max(0, $totalMinutes);
            
            // Calculate overtime (assuming 8 hours = 480 minutes is standard)
            $standardHours = 480; // 8 hours in minutes
            $this->overtime_hours = max(0, $totalMinutes - $standardHours);
        }
    }
}