<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmergencyCase extends Model
{
    use HasFactory;

    protected $fillable = [
        'case_number',
        'patient_id',
        'patient_name',
        'patient_phone',
        'patient_age',
        'patient_gender',
        'emergency_description',
        'emergency_type',
        'severity_level',
        'location',
        'latitude',
        'longitude',
        'caller_name',
        'caller_phone',
        'caller_relationship',
        'call_received_at',
        'ambulance_dispatched_at',
        'ambulance_arrived_at',
        'patient_picked_up_at',
        'arrived_at_hospital_at',
        'status',
        'notes',
        'vital_signs',
        'treatment_given',
        'assigned_doctor_id',
        'assigned_nurse_id',
        'ambulance_id',
        'created_by'
    ];

    protected $casts = [
        'patient_age' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'call_received_at' => 'datetime',
        'ambulance_dispatched_at' => 'datetime',
        'ambulance_arrived_at' => 'datetime',
        'patient_picked_up_at' => 'datetime',
        'arrived_at_hospital_at' => 'datetime',
        'vital_signs' => 'array'
    ];

    /**
     * Get the patient that owns the emergency case.
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the assigned doctor.
     */
    public function assignedDoctor()
    {
        return $this->belongsTo(User::class, 'assigned_doctor_id');
    }

    /**
     * Get the assigned nurse.
     */
    public function assignedNurse()
    {
        return $this->belongsTo(User::class, 'assigned_nurse_id');
    }

    /**
     * Get the ambulance assigned to the case.
     */
    public function ambulance()
    {
        return $this->belongsTo(Ambulance::class);
    }

    /**
     * Get the user who created the case.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the dispatch record for the case.
     */
    public function dispatch()
    {
        return $this->hasOne(AmbulanceDispatch::class);
    }

    /**
     * Get the triage assessment for the case.
     */
    public function triageAssessment()
    {
        return $this->hasOne(TriageAssessment::class);
    }

    /**
     * Get the emergency contacts for the patient.
     */
    public function emergencyContacts()
    {
        return $this->hasMany(EmergencyContact::class, 'patient_id', 'patient_id');
    }

    /**
     * Scope a query to only include pending cases.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include dispatched cases.
     */
    public function scopeDispatched($query)
    {
        return $query->where('status', 'dispatched');
    }

    /**
     * Scope a query to only include en route cases.
     */
    public function scopeEnRoute($query)
    {
        return $query->where('status', 'en_route');
    }

    /**
     * Scope a query to only include arrived cases.
     */
    public function scopeArrived($query)
    {
        return $query->where('status', 'arrived');
    }

    /**
     * Scope a query to only include completed cases.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to filter by emergency type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('emergency_type', $type);
    }

    /**
     * Scope a query to filter by severity level.
     */
    public function scopeOfSeverity($query, $severity)
    {
        return $query->where('severity_level', $severity);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('call_received_at', [$startDate, $endDate]);
    }

    /**
     * Check if case is pending.
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if case is dispatched.
     */
    public function isDispatched()
    {
        return $this->status === 'dispatched';
    }

    /**
     * Check if case is en route.
     */
    public function isEnRoute()
    {
        return $this->status === 'en_route';
    }

    /**
     * Check if case is arrived.
     */
    public function isArrived()
    {
        return $this->status === 'arrived';
    }

    /**
     * Check if case is completed.
     */
    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    /**
     * Check if case is cancelled.
     */
    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    /**
     * Calculate response time in minutes.
     */
    public function getResponseTime()
    {
        if ($this->ambulance_arrived_at && $this->call_received_at) {
            return $this->call_received_at->diffInMinutes($this->ambulance_arrived_at);
        }
        return null;
    }

    /**
     * Calculate transport time in minutes.
     */
    public function getTransportTime()
    {
        if ($this->arrived_at_hospital_at && $this->patient_picked_up_at) {
            return $this->patient_picked_up_at->diffInMinutes($this->arrived_at_hospital_at);
        }
        return null;
    }

    /**
     * Calculate total time in minutes.
     */
    public function getTotalTime()
    {
        if ($this->arrived_at_hospital_at && $this->call_received_at) {
            return $this->call_received_at->diffInMinutes($this->arrived_at_hospital_at);
        }
        return null;
    }

    /**
     * Generate case number.
     */
    public static function generateCaseNumber()
    {
        $prefix = 'EMG';
        $year = now()->year;
        $month = now()->format('m');
        
        $lastCase = static::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastCase ? (intval(substr($lastCase->case_number, -4)) + 1) : 1;
        
        return $prefix . $year . $month . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get severity level color.
     */
    public function getSeverityColor()
    {
        $colors = [
            'critical' => 'red',
            'urgent' => 'orange',
            'moderate' => 'yellow',
            'minor' => 'green'
        ];

        return $colors[$this->severity_level] ?? 'gray';
    }

    /**
     * Get status color.
     */
    public function getStatusColor()
    {
        $colors = [
            'pending' => 'gray',
            'dispatched' => 'blue',
            'en_route' => 'yellow',
            'arrived' => 'green',
            'completed' => 'green',
            'cancelled' => 'red'
        ];

        return $colors[$this->status] ?? 'gray';
    }
}
