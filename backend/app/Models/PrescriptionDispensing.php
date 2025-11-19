<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrescriptionDispensing extends Model
{
    use HasFactory;

    protected $fillable = [
        'prescription_id',
        'medicine_id',
        'quantity_dispensed',
        'batch_number',
        'dispensed_by',
        'dispensed_at',
        'notes'
    ];

    protected $casts = [
        'dispensed_at' => 'datetime'
    ];

    /**
     * Get the prescription that owns the dispensing record.
     */
    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    /**
     * Get the medicine that owns the dispensing record.
     */
    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    /**
     * Get the user who dispensed the medicine.
     */
    public function dispenser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dispensed_by');
    }

    /**
     * Scope a query to only include dispensings for a specific date.
     */
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('dispensed_at', $date);
    }

    /**
     * Scope a query to only include dispensings for a date range.
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('dispensed_at', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include dispensings by a specific user.
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('dispensed_by', $userId);
    }

    /**
     * Get total value of dispensed medicine.
     */
    public function getTotalValueAttribute(): float
    {
        return $this->quantity_dispensed * $this->medicine->selling_price;
    }
}
