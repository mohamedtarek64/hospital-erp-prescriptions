<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TriageAssessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'emergency_case_id',
        'assessed_by',
        'assessment_time',
        'triage_level',
        'chief_complaint',
        'symptoms_description',
        'vital_signs',
        'consciousness_level',
        'pain_scale',
        'allergies',
        'medications',
        'medical_history',
        'mechanism_of_injury',
        'assessment_notes',
        'recommended_action',
        'assigned_doctor_id',
        'priority_order',
        'treatment_started_at',
        'treatment_completed_at'
    ];

    protected $casts = [
        'assessment_time' => 'datetime',
        'vital_signs' => 'array',
        'treatment_started_at' => 'datetime',
        'treatment_completed_at' => 'datetime'
    ];

    /**
     * Get the emergency case for this triage assessment.
     */
    public function emergencyCase()
    {
        return $this->belongsTo(EmergencyCase::class);
    }

    /**
     * Get the user who performed the assessment.
     */
    public function assessor()
    {
        return $this->belongsTo(User::class, 'assessed_by');
    }

    /**
     * Get the assigned doctor.
     */
    public function assignedDoctor()
    {
        return $this->belongsTo(User::class, 'assigned_doctor_id');
    }

    /**
     * Scope a query to filter by triage level.
     */
    public function scopeOfLevel($query, $level)
    {
        return $query->where('triage_level', $level);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('assessment_time', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by assessor.
     */
    public function scopeByAssessor($query, $assessorId)
    {
        return $query->where('assessed_by', $assessorId);
    }

    /**
     * Scope a query to order by priority.
     */
    public function scopeByPriority($query)
    {
        return $query->orderByRaw("CAST(triage_level AS UNSIGNED) ASC");
    }

    /**
     * Check if triage level is critical (1).
     */
    public function isCritical()
    {
        return $this->triage_level === '1';
    }

    /**
     * Check if triage level is very urgent (2).
     */
    public function isVeryUrgent()
    {
        return $this->triage_level === '2';
    }

    /**
     * Check if triage level is urgent (3).
     */
    public function isUrgent()
    {
        return $this->triage_level === '3';
    }

    /**
     * Check if triage level is less urgent (4).
     */
    public function isLessUrgent()
    {
        return $this->triage_level === '4';
    }

    /**
     * Check if triage level is non-urgent (5).
     */
    public function isNonUrgent()
    {
        return $this->triage_level === '5';
    }

    /**
     * Get triage level description.
     */
    public function getTriageLevelDescription()
    {
        $descriptions = [
            '1' => 'Immediate (Critical)',
            '2' => 'Very Urgent',
            '3' => 'Urgent',
            '4' => 'Less Urgent',
            '5' => 'Non-Urgent'
        ];

        return $descriptions[$this->triage_level] ?? 'Unknown';
    }

    /**
     * Get triage level color.
     */
    public function getTriageLevelColor()
    {
        $colors = [
            '1' => 'red',
            '2' => 'orange',
            '3' => 'yellow',
            '4' => 'blue',
            '5' => 'green'
        ];

        return $colors[$this->triage_level] ?? 'gray';
    }

    /**
     * Get consciousness level description.
     */
    public function getConsciousnessLevelDescription()
    {
        $descriptions = [
            'A' => 'Alert',
            'V' => 'Voice',
            'P' => 'Pain',
            'U' => 'Unresponsive'
        ];

        return $descriptions[$this->consciousness_level] ?? 'Unknown';
    }

    /**
     * Get pain scale description.
     */
    public function getPainScaleDescription()
    {
        if (!$this->pain_scale) {
            return 'Not assessed';
        }

        $descriptions = [
            '0' => 'No pain',
            '1-3' => 'Mild pain',
            '4-6' => 'Moderate pain',
            '7-10' => 'Severe pain'
        ];

        $scale = intval($this->pain_scale);
        
        if ($scale === 0) return $descriptions['0'];
        if ($scale >= 1 && $scale <= 3) return $descriptions['1-3'];
        if ($scale >= 4 && $scale <= 6) return $descriptions['4-6'];
        if ($scale >= 7 && $scale <= 10) return $descriptions['7-10'];
        
        return 'Unknown';
    }

    /**
     * Get pain scale color.
     */
    public function getPainScaleColor()
    {
        if (!$this->pain_scale) {
            return 'gray';
        }

        $scale = intval($this->pain_scale);
        
        if ($scale === 0) return 'green';
        if ($scale >= 1 && $scale <= 3) return 'yellow';
        if ($scale >= 4 && $scale <= 6) return 'orange';
        if ($scale >= 7 && $scale <= 10) return 'red';
        
        return 'gray';
    }

    /**
     * Get vital signs formatted.
     */
    public function getFormattedVitalSigns()
    {
        if (!$this->vital_signs) {
            return 'Not recorded';
        }

        $formatted = [];
        
        if (isset($this->vital_signs['blood_pressure'])) {
            $formatted[] = "BP: {$this->vital_signs['blood_pressure']}";
        }
        
        if (isset($this->vital_signs['heart_rate'])) {
            $formatted[] = "HR: {$this->vital_signs['heart_rate']} bpm";
        }
        
        if (isset($this->vital_signs['temperature'])) {
            $formatted[] = "Temp: {$this->vital_signs['temperature']}°C";
        }
        
        if (isset($this->vital_signs['oxygen_saturation'])) {
            $formatted[] = "SpO2: {$this->vital_signs['oxygen_saturation']}%";
        }
        
        if (isset($this->vital_signs['respiratory_rate'])) {
            $formatted[] = "RR: {$this->vital_signs['respiratory_rate']} /min";
        }

        return implode(', ', $formatted);
    }

    /**
     * Check if vital signs are normal.
     */
    public function areVitalSignsNormal()
    {
        if (!$this->vital_signs) {
            return null;
        }

        $normalRanges = [
            'blood_pressure' => ['systolic' => [90, 140], 'diastolic' => [60, 90]],
            'heart_rate' => [60, 100],
            'temperature' => [36.1, 37.2],
            'oxygen_saturation' => [95, 100],
            'respiratory_rate' => [12, 20]
        ];

        foreach ($this->vital_signs as $sign => $value) {
            if (isset($normalRanges[$sign])) {
                $range = $normalRanges[$sign];
                
                if ($sign === 'blood_pressure') {
                    // Handle blood pressure format (e.g., "120/80")
                    if (strpos($value, '/') !== false) {
                        [$systolic, $diastolic] = explode('/', $value);
                        if ($systolic < $range['systolic'][0] || $systolic > $range['systolic'][1] ||
                            $diastolic < $range['diastolic'][0] || $diastolic > $range['diastolic'][1]) {
                            return false;
                        }
                    }
                } else {
                    if ($value < $range[0] || $value > $range[1]) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * Get treatment duration in minutes.
     */
    public function getTreatmentDuration()
    {
        if ($this->treatment_started_at && $this->treatment_completed_at) {
            return $this->treatment_started_at->diffInMinutes($this->treatment_completed_at);
        }
        return null;
    }

    /**
     * Get formatted treatment duration.
     */
    public function getFormattedTreatmentDuration()
    {
        $duration = $this->getTreatmentDuration();
        if ($duration) {
            $hours = floor($duration / 60);
            $minutes = $duration % 60;
            
            if ($hours > 0) {
                return "{$hours}h {$minutes}m";
            }
            return "{$minutes}m";
        }
        return 'N/A';
    }

    /**
     * Check if treatment is in progress.
     */
    public function isTreatmentInProgress()
    {
        return $this->treatment_started_at && !$this->treatment_completed_at;
    }

    /**
     * Check if treatment is completed.
     */
    public function isTreatmentCompleted()
    {
        return $this->treatment_started_at && $this->treatment_completed_at;
    }

    /**
     * Get recommended action description.
     */
    public function getRecommendedActionDescription()
    {
        $descriptions = [
            'immediate_treatment' => 'Immediate Treatment Required',
            'observation' => 'Observation',
            'referral' => 'Referral to Specialist',
            'discharge' => 'Discharge',
            'admission' => 'Admission Required'
        ];

        return $descriptions[$this->recommended_action] ?? 'Not specified';
    }
}