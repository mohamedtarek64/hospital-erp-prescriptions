<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitorLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'admission_id',
        'visitor_name',
        'visitor_phone',
        'relationship',
        'visit_date',
        'check_in_time',
        'check_out_time',
        'purpose',
        'notes',
        'logged_by'
    ];

    protected $casts = [
        'visit_date' => 'datetime',
        'check_in_time' => 'datetime:H:i',
        'check_out_time' => 'datetime:H:i'
    ];

    /**
     * Get the admission that owns the visitor log.
     */
    public function admission()
    {
        return $this->belongsTo(Admission::class);
    }

    /**
     * Get the user who logged the visit.
     */
    public function loggedBy()
    {
        return $this->belongsTo(User::class, 'logged_by');
    }

    /**
     * Scope a query to filter by admission.
     */
    public function scopeOfAdmission($query, $admissionId)
    {
        return $query->where('admission_id', $admissionId);
    }

    /**
     * Scope a query to filter by visitor name.
     */
    public function scopeOfVisitor($query, $visitorName)
    {
        return $query->where('visitor_name', 'like', "%{$visitorName}%");
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('visit_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include active visits (not checked out).
     */
    public function scopeActive($query)
    {
        return $query->whereNull('check_out_time');
    }

    /**
     * Check if visit is active.
     */
    public function isActive()
    {
        return is_null($this->check_out_time);
    }

    /**
     * Calculate visit duration in minutes.
     */
    public function getVisitDuration()
    {
        if ($this->check_out_time) {
            return $this->check_in_time->diffInMinutes($this->check_out_time);
        }
        return $this->check_in_time->diffInMinutes(now());
    }

    /**
     * Check out visitor.
     */
    public function checkOut()
    {
        $this->update(['check_out_time' => now()]);
    }
}
