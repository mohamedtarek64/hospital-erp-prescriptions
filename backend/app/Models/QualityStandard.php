<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QualityStandard extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'category',
        'priority',
        'status',
        'requirements',
        'compliance_criteria',
        'effective_date',
        'review_date',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'requirements' => 'array',
        'compliance_criteria' => 'array',
        'effective_date' => 'date',
        'review_date' => 'date'
    ];

    /**
     * Get the user who created this standard
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this standard
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all audits for this standard
     */
    public function audits(): HasMany
    {
        return $this->hasMany(Audit::class, 'standard_id');
    }

    /**
     * Get all compliance records for this standard
     */
    public function complianceRecords(): HasMany
    {
        return $this->hasMany(ComplianceRecord::class, 'standard_id');
    }

    /**
     * Scope for active standards
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for standards by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for standards by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Get compliance rate for this standard
     */
    public function getComplianceRateAttribute(): float
    {
        $totalRecords = $this->complianceRecords()->count();
        if ($totalRecords === 0) {
            return 0;
        }

        $compliantRecords = $this->complianceRecords()
            ->where('compliance_status', 'compliant')
            ->count();

        return round(($compliantRecords / $totalRecords) * 100, 2);
    }

    /**
     * Check if standard is due for review
     */
    public function isDueForReview(): bool
    {
        return $this->review_date && $this->review_date <= now();
    }

    /**
     * Get days until review
     */
    public function getDaysUntilReviewAttribute(): ?int
    {
        if (!$this->review_date) {
            return null;
        }

        return now()->diffInDays($this->review_date, false);
    }
}
