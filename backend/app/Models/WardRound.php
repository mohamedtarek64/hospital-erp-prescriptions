<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WardRound extends Model
{
    use HasFactory;

    protected $fillable = [
        'ward_id',
        'doctor_id',
        'round_date',
        'round_time',
        'notes',
        'patients_visited',
        'observations',
        'created_by'
    ];

    protected $casts = [
        'round_date' => 'date',
        'round_time' => 'datetime:H:i',
        'patients_visited' => 'array',
        'observations' => 'array'
    ];

    /**
     * Get the ward that owns the round.
     */
    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    /**
     * Get the doctor who performed the round.
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the user who created the round.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to filter by ward.
     */
    public function scopeOfWard($query, $wardId)
    {
        return $query->where('ward_id', $wardId);
    }

    /**
     * Scope a query to filter by doctor.
     */
    public function scopeOfDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('round_date', [$startDate, $endDate]);
    }
}
