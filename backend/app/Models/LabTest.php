<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LabTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'code',
        'description',
        'price',
        'turnaround_time_hours',
        'preparation_instructions',
        'normal_range',
        'unit',
        'status'
    ];

    protected $casts = [
        'price' => 'decimal:2'
    ];

    /**
     * Get the category that owns the lab test.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(LabTestCategory::class, 'category_id');
    }

    /**
     * Get the lab request items for the lab test.
     */
    public function labRequestItems(): HasMany
    {
        return $this->hasMany(LabRequestItem::class);
    }

    /**
     * Scope a query to only include active lab tests.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include inactive lab tests.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Get the turnaround time in days.
     */
    public function getTurnaroundTimeDaysAttribute(): float
    {
        return $this->turnaround_time_hours / 24;
    }
}
