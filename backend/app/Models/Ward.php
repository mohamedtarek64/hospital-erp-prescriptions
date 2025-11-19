<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ward extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'ward_type',
        'floor',
        'building',
        'total_beds',
        'available_beds',
        'occupied_beds',
        'daily_rate',
        'nurse_in_charge_id',
        'department_id',
        'amenities',
        'visiting_hours',
        'is_active'
    ];

    protected $casts = [
        'amenities' => 'array',
        'visiting_hours' => 'array',
        'daily_rate' => 'decimal:2',
        'total_beds' => 'integer',
        'available_beds' => 'integer',
        'occupied_beds' => 'integer',
        'is_active' => 'boolean'
    ];

    /**
     * Get the nurse in charge of the ward.
     */
    public function nurseInCharge()
    {
        return $this->belongsTo(User::class, 'nurse_in_charge_id');
    }

    /**
     * Get the department that owns the ward.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the beds for the ward.
     */
    public function beds()
    {
        return $this->hasMany(Bed::class);
    }

    /**
     * Get the admissions for the ward.
     */
    public function admissions()
    {
        return $this->hasManyThrough(Admission::class, Bed::class);
    }

    /**
     * Get the ward rounds for the ward.
     */
    public function wardRounds()
    {
        return $this->hasMany(WardRound::class);
    }

    /**
     * Scope a query to only include active wards.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by ward type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('ward_type', $type);
    }

    /**
     * Scope a query to filter by department.
     */
    public function scopeOfDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Update bed counts.
     */
    public function updateBedCounts()
    {
        $this->total_beds = $this->beds()->count();
        $this->occupied_beds = $this->beds()->where('status', 'occupied')->count();
        $this->available_beds = $this->total_beds - $this->occupied_beds;
        $this->save();
    }

    /**
     * Check if ward has available beds.
     */
    public function hasAvailableBeds()
    {
        return $this->available_beds > 0;
    }

    /**
     * Get occupancy rate.
     */
    public function getOccupancyRate()
    {
        return $this->total_beds > 0 ? ($this->occupied_beds / $this->total_beds) * 100 : 0;
    }
}