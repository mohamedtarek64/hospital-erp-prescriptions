<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BedTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'admission_id',
        'from_bed_id',
        'to_bed_id',
        'transfer_date',
        'transfer_reason',
        'notes',
        'transferred_by'
    ];

    protected $casts = [
        'transfer_date' => 'datetime'
    ];

    /**
     * Get the admission that owns the transfer.
     */
    public function admission()
    {
        return $this->belongsTo(Admission::class);
    }

    /**
     * Get the bed the patient was transferred from.
     */
    public function fromBed()
    {
        return $this->belongsTo(Bed::class, 'from_bed_id');
    }

    /**
     * Get the bed the patient was transferred to.
     */
    public function toBed()
    {
        return $this->belongsTo(Bed::class, 'to_bed_id');
    }

    /**
     * Get the user who performed the transfer.
     */
    public function transferredBy()
    {
        return $this->belongsTo(User::class, 'transferred_by');
    }

    /**
     * Scope a query to filter by admission.
     */
    public function scopeOfAdmission($query, $admissionId)
    {
        return $query->where('admission_id', $admissionId);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transfer_date', [$startDate, $endDate]);
    }
}
