<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bed extends Model
{
    use HasFactory;

    protected $fillable = [
        'ward_id',
        'bed_number',
        'bed_type',
        'status',
        'daily_rate',
        'amenities',
        'notes',
        'is_active'
    ];

    protected $casts = [
        'amenities' => 'array',
        'daily_rate' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    /**
     * Get the ward that owns the bed.
     */
    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    /**
     * Get the admissions for the bed.
     */
    public function admissions()
    {
        return $this->hasMany(Admission::class);
    }

    /**
     * Get the current admission for the bed.
     */
    public function currentAdmission()
    {
        return $this->hasOne(Admission::class)->where('status', 'admitted');
    }

    /**
     * Get the bed transfers from this bed.
     */
    public function transfersFrom()
    {
        return $this->hasMany(BedTransfer::class, 'from_bed_id');
    }

    /**
     * Get the bed transfers to this bed.
     */
    public function transfersTo()
    {
        return $this->hasMany(BedTransfer::class, 'to_bed_id');
    }

    /**
     * Scope a query to only include active beds.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include available beds.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope a query to only include occupied beds.
     */
    public function scopeOccupied($query)
    {
        return $query->where('status', 'occupied');
    }

    /**
     * Scope a query to filter by bed type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('bed_type', $type);
    }

    /**
     * Scope a query to filter by ward.
     */
    public function scopeOfWard($query, $wardId)
    {
        return $query->where('ward_id', $wardId);
    }

    /**
     * Check if bed is available.
     */
    public function isAvailable()
    {
        return $this->status === 'available';
    }

    /**
     * Check if bed is occupied.
     */
    public function isOccupied()
    {
        return $this->status === 'occupied';
    }

    /**
     * Check if bed is under maintenance.
     */
    public function isUnderMaintenance()
    {
        return $this->status === 'maintenance';
    }

    /**
     * Mark bed as occupied.
     */
    public function markAsOccupied()
    {
        $this->update(['status' => 'occupied']);
        $this->ward->updateBedCounts();
    }

    /**
     * Mark bed as available.
     */
    public function markAsAvailable()
    {
        $this->update(['status' => 'available']);
        $this->ward->updateBedCounts();
    }

    /**
     * Mark bed as under maintenance.
     */
    public function markAsMaintenance()
    {
        $this->update(['status' => 'maintenance']);
        $this->ward->updateBedCounts();
    }
}