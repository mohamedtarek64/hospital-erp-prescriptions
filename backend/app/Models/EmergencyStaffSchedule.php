<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmergencyStaffSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'shift_date',
        'shift_type',
        'start_time',
        'end_time',
        'status',
        'assigned_by',
        'notes'
    ];

    protected $casts = [
        'shift_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i'
    ];

    /**
     * Get the staff member for this schedule
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * Get the staff member who assigned this schedule
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'assigned_by');
    }

    /**
     * Get shift duration in hours
     */
    public function getShiftDuration(): float
    {
        $start = \Carbon\Carbon::parse($this->shift_date . ' ' . $this->start_time);
        $end = \Carbon\Carbon::parse($this->shift_date . ' ' . $this->end_time);
        
        // Handle overnight shifts
        if ($end->lessThan($start)) {
            $end->addDay();
        }
        
        return $start->diffInHours($end);
    }

    /**
     * Check if shift is currently active
     */
    public function isActive(): bool
    {
        $now = now();
        $shiftStart = \Carbon\Carbon::parse($this->shift_date . ' ' . $this->start_time);
        $shiftEnd = \Carbon\Carbon::parse($this->shift_date . ' ' . $this->end_time);
        
        // Handle overnight shifts
        if ($shiftEnd->lessThan($shiftStart)) {
            $shiftEnd->addDay();
        }
        
        return $now->between($shiftStart, $shiftEnd) && $this->status === 'in_progress';
    }

    /**
     * Check if shift is upcoming
     */
    public function isUpcoming(): bool
    {
        $now = now();
        $shiftStart = \Carbon\Carbon::parse($this->shift_date . ' ' . $this->start_time);
        
        return $shiftStart->isFuture() && $this->status === 'scheduled';
    }

    /**
     * Get shift type description
     */
    public function getShiftTypeDescription(): string
    {
        return match($this->shift_type) {
            'day' => 'Day Shift (6:00 AM - 6:00 PM)',
            'evening' => 'Evening Shift (6:00 PM - 2:00 AM)',
            'night' => 'Night Shift (10:00 PM - 6:00 AM)',
            'on_call' => 'On-Call',
            'standby' => 'Standby',
            default => 'Unknown'
        };
    }

    /**
     * Get status color
     */
    public function getStatusColor(): string
    {
        return match($this->status) {
            'scheduled' => 'blue',
            'confirmed' => 'green',
            'in_progress' => 'yellow',
            'completed' => 'green',
            'sick_off' => 'red',
            'no_show' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get shift type color
     */
    public function getShiftTypeColor(): string
    {
        return match($this->shift_type) {
            'day' => 'yellow',
            'evening' => 'orange',
            'night' => 'blue',
            'on_call' => 'purple',
            'standby' => 'green',
            default => 'gray'
        };
    }

    /**
     * Check if staff is available for emergency
     */
    public function isAvailableForEmergency(): bool
    {
        return in_array($this->status, ['scheduled', 'confirmed', 'in_progress']) && 
               in_array($this->shift_type, ['day', 'evening', 'night', 'on_call']);
    }
}
