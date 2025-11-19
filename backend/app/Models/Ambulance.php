<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ambulance extends Model
{
    use HasFactory;

    protected $fillable = [
        'ambulance_number',
        'vehicle_number',
        'vehicle_type',
        'make',
        'model',
        'year',
        'color',
        'status',
        'current_location',
        'current_latitude',
        'current_longitude',
        'driver_id',
        'paramedic_id',
        'equipment',
        'medications',
        'last_maintenance_date',
        'next_maintenance_date',
        'total_mileage',
        'notes',
        'is_active'
    ];

    protected $casts = [
        'year' => 'integer',
        'current_latitude' => 'decimal:8',
        'current_longitude' => 'decimal:8',
        'equipment' => 'array',
        'medications' => 'array',
        'last_maintenance_date' => 'date',
        'next_maintenance_date' => 'date',
        'total_mileage' => 'integer',
        'is_active' => 'boolean'
    ];

    /**
     * Get the driver of the ambulance.
     */
    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Get the paramedic of the ambulance.
     */
    public function paramedic()
    {
        return $this->belongsTo(User::class, 'paramedic_id');
    }

    /**
     * Get the emergency cases for the ambulance.
     */
    public function emergencyCases()
    {
        return $this->hasMany(EmergencyCase::class);
    }

    /**
     * Get the dispatch records for the ambulance.
     */
    public function dispatches()
    {
        return $this->hasMany(AmbulanceDispatch::class);
    }

    /**
     * Scope a query to only include available ambulances.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope a query to only include busy ambulances.
     */
    public function scopeBusy($query)
    {
        return $query->where('status', 'busy');
    }

    /**
     * Scope a query to only include active ambulances.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by vehicle type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('vehicle_type', $type);
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeOfStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Check if ambulance is available.
     */
    public function isAvailable()
    {
        return $this->status === 'available';
    }

    /**
     * Check if ambulance is busy.
     */
    public function isBusy()
    {
        return $this->status === 'busy';
    }

    /**
     * Check if ambulance is under maintenance.
     */
    public function isUnderMaintenance()
    {
        return $this->status === 'maintenance';
    }

    /**
     * Check if ambulance is out of service.
     */
    public function isOutOfService()
    {
        return $this->status === 'out_of_service';
    }

    /**
     * Check if ambulance needs maintenance.
     */
    public function needsMaintenance()
    {
        return $this->next_maintenance_date && $this->next_maintenance_date->isPast();
    }

    /**
     * Check if ambulance is due for maintenance soon.
     */
    public function isDueForMaintenanceSoon($days = 7)
    {
        return $this->next_maintenance_date && $this->next_maintenance_date->diffInDays(now()) <= $days;
    }

    /**
     * Get current location coordinates.
     */
    public function getLocationCoordinates()
    {
        if ($this->current_latitude && $this->current_longitude) {
            return [
                'latitude' => $this->current_latitude,
                'longitude' => $this->current_longitude
            ];
        }
        return null;
    }

    /**
     * Update current location.
     */
    public function updateLocation($latitude, $longitude, $location = null)
    {
        $this->update([
            'current_latitude' => $latitude,
            'current_longitude' => $longitude,
            'current_location' => $location
        ]);
    }

    /**
     * Calculate distance to a point.
     */
    public function calculateDistanceTo($latitude, $longitude)
    {
        if (!$this->current_latitude || !$this->current_longitude) {
            return null;
        }

        $lat1 = deg2rad($this->current_latitude);
        $lon1 = deg2rad($this->current_longitude);
        $lat2 = deg2rad($latitude);
        $lon2 = deg2rad($longitude);

        $deltaLat = $lat2 - $lat1;
        $deltaLon = $lon2 - $lon1;

        $a = sin($deltaLat / 2) * sin($deltaLat / 2) +
             cos($lat1) * cos($lat2) *
             sin($deltaLon / 2) * sin($deltaLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return 6371 * $c; // Distance in kilometers
    }

    /**
     * Get equipment list.
     */
    public function getEquipmentList()
    {
        return $this->equipment ?? [];
    }

    /**
     * Get medications list.
     */
    public function getMedicationsList()
    {
        return $this->medications ?? [];
    }

    /**
     * Check if ambulance has specific equipment.
     */
    public function hasEquipment($equipment)
    {
        return in_array($equipment, $this->equipment ?? []);
    }

    /**
     * Check if ambulance has specific medication.
     */
    public function hasMedication($medication)
    {
        return in_array($medication, $this->medications ?? []);
    }

    /**
     * Get status color.
     */
    public function getStatusColor()
    {
        $colors = [
            'available' => 'green',
            'busy' => 'red',
            'maintenance' => 'yellow',
            'out_of_service' => 'gray'
        ];

        return $colors[$this->status] ?? 'gray';
    }

    /**
     * Get vehicle type color.
     */
    public function getVehicleTypeColor()
    {
        $colors = [
            'basic' => 'blue',
            'advanced' => 'green',
            'icu' => 'red',
            'neonatal' => 'purple'
        ];

        return $colors[$this->vehicle_type] ?? 'gray';
    }

    /**
     * Get current case.
     */
    public function getCurrentCase()
    {
        return $this->emergencyCases()
            ->whereIn('status', ['dispatched', 'en_route', 'arrived'])
            ->latest()
            ->first();
    }

    /**
     * Get today's cases count.
     */
    public function getTodayCasesCount()
    {
        return $this->emergencyCases()
            ->whereDate('created_at', today())
            ->count();
    }

    /**
     * Get this month's cases count.
     */
    public function getThisMonthCasesCount()
    {
        return $this->emergencyCases()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
    }
}
