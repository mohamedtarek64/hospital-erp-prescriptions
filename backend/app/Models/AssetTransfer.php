<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'transfer_type',
        'from_location',
        'to_location',
        'from_department',
        'to_department',
        'from_user',
        'to_user',
        'transfer_date',
        'status',
        'reason',
        'notes',
        'requested_by',
        'approved_by',
        'approved_at',
        'completed_at',
        'condition_checklist',
        'attachments'
    ];

    protected $casts = [
        'transfer_date' => 'date',
        'approved_at' => 'date',
        'completed_at' => 'date',
        'condition_checklist' => 'array',
        'attachments' => 'array'
    ];

    /**
     * Get the equipment that owns the asset transfer.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the user who requested the transfer.
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the user who approved the transfer.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope a query to only include pending transfers.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved transfers.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include completed transfers.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include transfers by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('transfer_type', $type);
    }

    /**
     * Scope a query to only include transfers by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transfer_date', [$startDate, $endDate]);
    }

    /**
     * Check if transfer is pending approval.
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if transfer is approved.
     */
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    /**
     * Check if transfer is completed.
     */
    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    /**
     * Check if transfer is cancelled.
     */
    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    /**
     * Get transfer status color for UI.
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'approved' => 'blue',
            'completed' => 'green',
            'cancelled' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get transfer type color for UI.
     */
    public function getTypeColorAttribute()
    {
        return match($this->transfer_type) {
            'internal' => 'blue',
            'external' => 'orange',
            'return' => 'green',
            'disposal' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get days since transfer was requested.
     */
    public function getDaysSinceRequestedAttribute()
    {
        return $this->created_at->diffInDays(now());
    }

    /**
     * Get days since transfer was approved.
     */
    public function getDaysSinceApprovedAttribute()
    {
        if (!$this->approved_at) {
            return null;
        }

        return $this->approved_at->diffInDays(now());
    }

    /**
     * Get the transfer summary.
     */
    public function getTransferSummaryAttribute()
    {
        $summary = "Transfer from {$this->from_location} to {$this->to_location}";
        
        if ($this->from_department && $this->to_department) {
            $summary .= " ({$this->from_department} → {$this->to_department})";
        }

        return $summary;
    }

    /**
     * Approve the transfer.
     */
    public function approve($approvedBy)
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_at' => now()->toDateString()
        ]);
    }

    /**
     * Complete the transfer.
     */
    public function complete($conditionChecklist = null, $attachments = null)
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now()->toDateString(),
            'condition_checklist' => $conditionChecklist ?? $this->condition_checklist,
            'attachments' => $attachments ?? $this->attachments
        ]);

        // Update equipment location and department
        $this->equipment->update([
            'location' => $this->to_location,
            'department' => $this->to_department,
            'assigned_to' => $this->to_user
        ]);
    }

    /**
     * Cancel the transfer.
     */
    public function cancel($reason = null)
    {
        $this->update([
            'status' => 'cancelled',
            'notes' => $reason ? ($this->notes . "\n\nCancelled: " . $reason) : $this->notes
        ]);
    }

    /**
     * Get the transfer timeline.
     */
    public function getTimelineAttribute()
    {
        $timeline = [];

        $timeline[] = [
            'date' => $this->created_at,
            'action' => 'Requested',
            'user' => $this->requestedBy->name ?? 'Unknown',
            'description' => 'Transfer requested'
        ];

        if ($this->approved_at) {
            $timeline[] = [
                'date' => $this->approved_at,
                'action' => 'Approved',
                'user' => $this->approvedBy->name ?? 'Unknown',
                'description' => 'Transfer approved'
            ];
        }

        if ($this->completed_at) {
            $timeline[] = [
                'date' => $this->completed_at,
                'action' => 'Completed',
                'user' => 'System',
                'description' => 'Transfer completed'
            ];
        }

        return collect($timeline)->sortBy('date');
    }
}
