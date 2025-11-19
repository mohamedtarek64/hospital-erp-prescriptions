<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AmbulanceDispatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'emergency_case_id',
        'ambulance_id',
        'dispatched_by',
        'dispatch_time',
        'acknowledged_time',
        'en_route_time',
        'arrived_at_scene_time',
        'departed_from_scene_time',
        'arrived_at_hospital_time',
        'completed_time',
        'status',
        'dispatch_notes',
        'scene_notes',
        'transport_notes',
        'response_time_minutes',
        'transport_time_minutes',
        'total_time_minutes',
        'distance_km',
        'cancellation_reason',
        'cancelled_by'
    ];

    protected $casts = [
        'dispatch_time' => 'datetime',
        'acknowledged_time' => 'datetime',
        'en_route_time' => 'datetime',
        'arrived_at_scene_time' => 'datetime',
        'departed_from_scene_time' => 'datetime',
        'arrived_at_hospital_time' => 'datetime',
        'completed_time' => 'datetime',
        'response_time_minutes' => 'integer',
        'transport_time_minutes' => 'integer',
        'total_time_minutes' => 'integer',
        'distance_km' => 'decimal:2'
    ];

    /**
     * Get the emergency case for this dispatch.
     */
    public function emergencyCase()
    {
        return $this->belongsTo(EmergencyCase::class);
    }

    /**
     * Get the ambulance for this dispatch.
     */
    public function ambulance()
    {
        return $this->belongsTo(Ambulance::class);
    }

    /**
     * Get the user who dispatched this case.
     */
    public function dispatcher()
    {
        return $this->belongsTo(User::class, 'dispatched_by');
    }

    /**
     * Get the user who cancelled this dispatch.
     */
    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    /**
     * Scope a query to only include dispatched records.
     */
    public function scopeDispatched($query)
    {
        return $query->where('status', 'dispatched');
    }

    /**
     * Scope a query to only include acknowledged records.
     */
    public function scopeAcknowledged($query)
    {
        return $query->where('status', 'acknowledged');
    }

    /**
     * Scope a query to only include en route records.
     */
    public function scopeEnRoute($query)
    {
        return $query->where('status', 'en_route');
    }

    /**
     * Scope a query to only include on scene records.
     */
    public function scopeOnScene($query)
    {
        return $query->where('status', 'on_scene');
    }

    /**
     * Scope a query to only include transporting records.
     */
    public function scopeTransporting($query)
    {
        return $query->where('status', 'transporting');
    }

    /**
     * Scope a query to only include completed records.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include cancelled records.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('dispatch_time', [$startDate, $endDate]);
    }

    /**
     * Check if dispatch is dispatched.
     */
    public function isDispatched()
    {
        return $this->status === 'dispatched';
    }

    /**
     * Check if dispatch is acknowledged.
     */
    public function isAcknowledged()
    {
        return $this->status === 'acknowledged';
    }

    /**
     * Check if dispatch is en route.
     */
    public function isEnRoute()
    {
        return $this->status === 'en_route';
    }

    /**
     * Check if dispatch is on scene.
     */
    public function isOnScene()
    {
        return $this->status === 'on_scene';
    }

    /**
     * Check if dispatch is transporting.
     */
    public function isTransporting()
    {
        return $this->status === 'transporting';
    }

    /**
     * Check if dispatch is completed.
     */
    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    /**
     * Check if dispatch is cancelled.
     */
    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    /**
     * Calculate response time in minutes.
     */
    public function calculateResponseTime()
    {
        if ($this->arrived_at_scene_time && $this->dispatch_time) {
            return $this->dispatch_time->diffInMinutes($this->arrived_at_scene_time);
        }
        return null;
    }

    /**
     * Calculate transport time in minutes.
     */
    public function calculateTransportTime()
    {
        if ($this->arrived_at_hospital_time && $this->departed_from_scene_time) {
            return $this->departed_from_scene_time->diffInMinutes($this->arrived_at_hospital_time);
        }
        return null;
    }

    /**
     * Calculate total time in minutes.
     */
    public function calculateTotalTime()
    {
        if ($this->completed_time && $this->dispatch_time) {
            return $this->dispatch_time->diffInMinutes($this->completed_time);
        }
        return null;
    }

    /**
     * Update response time.
     */
    public function updateResponseTime()
    {
        $responseTime = $this->calculateResponseTime();
        if ($responseTime) {
            $this->update(['response_time_minutes' => $responseTime]);
        }
    }

    /**
     * Update transport time.
     */
    public function updateTransportTime()
    {
        $transportTime = $this->calculateTransportTime();
        if ($transportTime) {
            $this->update(['transport_time_minutes' => $transportTime]);
        }
    }

    /**
     * Update total time.
     */
    public function updateTotalTime()
    {
        $totalTime = $this->calculateTotalTime();
        if ($totalTime) {
            $this->update(['total_time_minutes' => $totalTime]);
        }
    }

    /**
     * Get status color.
     */
    public function getStatusColor()
    {
        $colors = [
            'dispatched' => 'blue',
            'acknowledged' => 'yellow',
            'en_route' => 'orange',
            'on_scene' => 'purple',
            'transporting' => 'indigo',
            'completed' => 'green',
            'cancelled' => 'red'
        ];

        return $colors[$this->status] ?? 'gray';
    }

    /**
     * Get formatted response time.
     */
    public function getFormattedResponseTime()
    {
        if ($this->response_time_minutes) {
            $hours = floor($this->response_time_minutes / 60);
            $minutes = $this->response_time_minutes % 60;
            
            if ($hours > 0) {
                return "{$hours}h {$minutes}m";
            }
            return "{$minutes}m";
        }
        return 'N/A';
    }

    /**
     * Get formatted transport time.
     */
    public function getFormattedTransportTime()
    {
        if ($this->transport_time_minutes) {
            $hours = floor($this->transport_time_minutes / 60);
            $minutes = $this->transport_time_minutes % 60;
            
            if ($hours > 0) {
                return "{$hours}h {$minutes}m";
            }
            return "{$minutes}m";
        }
        return 'N/A';
    }

    /**
     * Get formatted total time.
     */
    public function getFormattedTotalTime()
    {
        if ($this->total_time_minutes) {
            $hours = floor($this->total_time_minutes / 60);
            $minutes = $this->total_time_minutes % 60;
            
            if ($hours > 0) {
                return "{$hours}h {$minutes}m";
            }
            return "{$minutes}m";
        }
        return 'N/A';
    }

    /**
     * Get formatted distance.
     */
    public function getFormattedDistance()
    {
        if ($this->distance_km) {
            return number_format($this->distance_km, 2) . ' km';
        }
        return 'N/A';
    }
}
