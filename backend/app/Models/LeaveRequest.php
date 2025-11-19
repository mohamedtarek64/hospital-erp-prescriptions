<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'total_days',
        'reason',
        'status',
        'approved_by',
        'approved_at',
        'approval_notes',
        'rejection_reason'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime'
    ];

    /**
     * Get the employee that owns the leave request.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the leave type that owns the leave request.
     */
    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    /**
     * Get the user who approved the leave request.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope a query to only include pending leave requests.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved leave requests.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include rejected leave requests.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope a query to only include cancelled leave requests.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope a query to only include leave requests for a specific date range.
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
              ->orWhereBetween('end_date', [$startDate, $endDate])
              ->orWhere(function ($subQ) use ($startDate, $endDate) {
                  $subQ->where('start_date', '<=', $startDate)
                       ->where('end_date', '>=', $endDate);
              });
        });
    }

    /**
     * Check if leave request is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if leave request is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if leave request is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if leave request is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if leave request is currently active.
     */
    public function isActive(): bool
    {
        return $this->isApproved() && 
               $this->start_date <= now() && 
               $this->end_date >= now();
    }

    /**
     * Check if leave request is in the future.
     */
    public function isFuture(): bool
    {
        return $this->start_date > now();
    }

    /**
     * Check if leave request is in the past.
     */
    public function isPast(): bool
    {
        return $this->end_date < now();
    }

    /**
     * Approve the leave request.
     */
    public function approve($userId, $notes = null): bool
    {
        if (!$this->isPending()) {
            return false;
        }

        $this->update([
            'status' => 'approved',
            'approved_by' => $userId,
            'approved_at' => now(),
            'approval_notes' => $notes
        ]);

        return true;
    }

    /**
     * Reject the leave request.
     */
    public function reject($userId, $reason = null): bool
    {
        if (!$this->isPending()) {
            return false;
        }

        $this->update([
            'status' => 'rejected',
            'approved_by' => $userId,
            'approved_at' => now(),
            'rejection_reason' => $reason
        ]);

        return true;
    }

    /**
     * Cancel the leave request.
     */
    public function cancel(): bool
    {
        if (!$this->isPending() && !$this->isApproved()) {
            return false;
        }

        $this->update(['status' => 'cancelled']);
        return true;
    }
}