<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admission extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'bed_id',
        'doctor_id',
        'admission_number',
        'admission_date',
        'admission_time',
        'discharge_date',
        'discharge_time',
        'admission_type',
        'status',
        'admission_reason',
        'discharge_notes',
        'medical_notes',
        'vital_signs',
        'total_cost',
        'paid_amount',
        'balance',
        'admitted_by',
        'discharged_by'
    ];

    protected $casts = [
        'admission_date' => 'date',
        'discharge_date' => 'date',
        'admission_time' => 'datetime:H:i',
        'discharge_time' => 'datetime:H:i',
        'vital_signs' => 'array',
        'total_cost' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance' => 'decimal:2'
    ];

    /**
     * Get the patient that owns the admission.
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the bed for the admission.
     */
    public function bed()
    {
        return $this->belongsTo(Bed::class);
    }

    /**
     * Get the doctor for the admission.
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the user who admitted the patient.
     */
    public function admittedBy()
    {
        return $this->belongsTo(User::class, 'admitted_by');
    }

    /**
     * Get the user who discharged the patient.
     */
    public function dischargedBy()
    {
        return $this->belongsTo(User::class, 'discharged_by');
    }

    /**
     * Get the bed transfers for the admission.
     */
    public function bedTransfers()
    {
        return $this->hasMany(BedTransfer::class);
    }

    /**
     * Get the visitor logs for the admission.
     */
    public function visitorLogs()
    {
        return $this->hasMany(VisitorLog::class);
    }

    /**
     * Scope a query to only include active admissions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'admitted');
    }

    /**
     * Scope a query to only include discharged admissions.
     */
    public function scopeDischarged($query)
    {
        return $query->where('status', 'discharged');
    }

    /**
     * Scope a query to filter by admission type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('admission_type', $type);
    }

    /**
     * Scope a query to filter by patient.
     */
    public function scopeOfPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    /**
     * Scope a query to filter by doctor.
     */
    public function scopeOfDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    /**
     * Check if admission is active.
     */
    public function isActive()
    {
        return $this->status === 'admitted';
    }

    /**
     * Check if admission is discharged.
     */
    public function isDischarged()
    {
        return $this->status === 'discharged';
    }

    /**
     * Check if admission is transferred.
     */
    public function isTransferred()
    {
        return $this->status === 'transferred';
    }

    /**
     * Calculate length of stay in days.
     */
    public function getLengthOfStay()
    {
        $endDate = $this->discharge_date ?? now()->toDateString();
        return \Carbon\Carbon::parse($this->admission_date)->diffInDays($endDate);
    }

    /**
     * Calculate total cost based on length of stay.
     */
    public function calculateTotalCost()
    {
        $lengthOfStay = $this->getLengthOfStay();
        $dailyRate = $this->bed->daily_rate ?? 0;
        $this->total_cost = $lengthOfStay * $dailyRate;
        $this->balance = $this->total_cost - $this->paid_amount;
        $this->save();
    }

    /**
     * Discharge the patient.
     */
    public function discharge($dischargeNotes = null, $dischargedBy = null)
    {
        $this->update([
            'status' => 'discharged',
            'discharge_date' => now()->toDateString(),
            'discharge_time' => now()->toTimeString(),
            'discharge_notes' => $dischargeNotes,
            'discharged_by' => $dischargedBy ?? auth()->id()
        ]);

        // Mark bed as available
        $this->bed->markAsAvailable();

        // Calculate final cost
        $this->calculateTotalCost();
    }

    /**
     * Generate admission number.
     */
    public static function generateAdmissionNumber()
    {
        $prefix = 'ADM';
        $year = now()->year;
        $month = now()->format('m');
        
        $lastAdmission = static::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastAdmission ? (intval(substr($lastAdmission->admission_number, -4)) + 1) : 1;
        
        return $prefix . $year . $month . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}