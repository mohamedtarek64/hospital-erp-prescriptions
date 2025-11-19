<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'max_days_per_year',
        'requires_approval',
        'is_paid',
        'status'
    ];

    protected $casts = [
        'requires_approval' => 'boolean',
        'is_paid' => 'boolean'
    ];

    /**
     * Get the leave requests for the leave type.
     */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    /**
     * Scope a query to only include active leave types.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include inactive leave types.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Scope a query to only include paid leave types.
     */
    public function scopePaid($query)
    {
        return $query->where('is_paid', true);
    }

    /**
     * Scope a query to only include unpaid leave types.
     */
    public function scopeUnpaid($query)
    {
        return $query->where('is_paid', false);
    }

    /**
     * Scope a query to only include leave types that require approval.
     */
    public function scopeRequiresApproval($query)
    {
        return $query->where('requires_approval', true);
    }

    /**
     * Scope a query to only include leave types that don't require approval.
     */
    public function scopeNoApprovalRequired($query)
    {
        return $query->where('requires_approval', false);
    }

    /**
     * Check if leave type is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if leave type is paid.
     */
    public function isPaid(): bool
    {
        return $this->is_paid;
    }

    /**
     * Check if leave type requires approval.
     */
    public function requiresApproval(): bool
    {
        return $this->requires_approval;
    }
}