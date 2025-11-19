<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CriticalAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'alert_type',
        'patient_id',
        'emergency_case_id',
        'title',
        'message',
        'priority',
        'status',
        'created_by',
        'acknowledged_by',
        'acknowledged_at',
        'resolved_at',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime'
    ];

    /**
     * Get the patient for this alert
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the emergency case for this alert
     */
    public function emergencyCase(): BelongsTo
    {
        return $this->belongsTo(EmergencyCase::class);
    }

    /**
     * Get the staff member who created this alert
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'created_by');
    }

    /**
     * Get the staff member who acknowledged this alert
     */
    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'acknowledged_by');
    }

    /**
     * Get alert type description
     */
    public function getAlertTypeDescription(): string
    {
        return match($this->alert_type) {
            'patient_critical' => 'Patient Critical Condition',
            'equipment_failure' => 'Equipment Failure',
            'staff_shortage' => 'Staff Shortage',
            'ambulance_delay' => 'Ambulance Delay',
            'system_error' => 'System Error',
            'security_breach' => 'Security Breach',
            'fire' => 'Fire Emergency',
            'power_outage' => 'Power Outage',
            'other' => 'Other Emergency',
            default => 'Unknown'
        };
    }

    /**
     * Get priority color
     */
    public function getPriorityColor(): string
    {
        return match($this->priority) {
            'critical' => 'red',
            'high' => 'orange',
            'medium' => 'yellow',
            'low' => 'green',
            default => 'gray'
        };
    }

    /**
     * Get status color
     */
    public function getStatusColor(): string
    {
        return match($this->status) {
            'active' => 'red',
            'acknowledged' => 'yellow',
            'resolved' => 'green',
            'dismissed' => 'gray',
            default => 'gray'
        };
    }

    /**
     * Get alert type color
     */
    public function getAlertTypeColor(): string
    {
        return match($this->alert_type) {
            'patient_critical' => 'red',
            'equipment_failure' => 'orange',
            'staff_shortage' => 'yellow',
            'ambulance_delay' => 'blue',
            'system_error' => 'purple',
            'security_breach' => 'red',
            'fire' => 'red',
            'power_outage' => 'orange',
            'other' => 'gray',
            default => 'gray'
        };
    }

    /**
     * Check if alert is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if alert is acknowledged
     */
    public function isAcknowledged(): bool
    {
        return $this->status === 'acknowledged';
    }

    /**
     * Check if alert is resolved
     */
    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }

    /**
     * Get response time in minutes
     */
    public function getResponseTime(): ?int
    {
        if (!$this->acknowledged_at) {
            return null;
        }
        
        return $this->created_at->diffInMinutes($this->acknowledged_at);
    }

    /**
     * Get resolution time in minutes
     */
    public function getResolutionTime(): ?int
    {
        if (!$this->resolved_at) {
            return null;
        }
        
        return $this->created_at->diffInMinutes($this->resolved_at);
    }

    /**
     * Acknowledge alert
     */
    public function acknowledge(int $acknowledgedBy): void
    {
        $this->update([
            'status' => 'acknowledged',
            'acknowledged_by' => $acknowledgedBy,
            'acknowledged_at' => now()
        ]);
    }

    /**
     * Resolve alert
     */
    public function resolve(): void
    {
        $this->update([
            'status' => 'resolved',
            'resolved_at' => now()
        ]);
    }

    /**
     * Dismiss alert
     */
    public function dismiss(): void
    {
        $this->update([
            'status' => 'dismissed'
        ]);
    }

    /**
     * Get alert age in minutes
     */
    public function getAgeInMinutes(): int
    {
        return $this->created_at->diffInMinutes(now());
    }

    /**
     * Check if alert is overdue (older than expected response time)
     */
    public function isOverdue(): bool
    {
        $expectedResponseTime = match($this->priority) {
            'critical' => 5, // 5 minutes
            'high' => 15,    // 15 minutes
            'medium' => 30,  // 30 minutes
            'low' => 60,     // 60 minutes
            default => 30
        };
        
        return $this->getAgeInMinutes() > $expectedResponseTime && $this->isActive();
    }
}
