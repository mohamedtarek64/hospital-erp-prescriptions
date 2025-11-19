<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EquipmentTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'transfer_type',
        'from_location',
        'to_location',
        'from_department',
        'to_department',
        'from_user_id',
        'to_user_id',
        'transfer_date',
        'reason',
        'notes',
        'status',
        'requested_by',
        'approved_by',
        'approved_at',
        'completed_at',
        'rejection_reason',
        'equipment_condition',
        'attachments'
    ];

    protected $casts = [
        'transfer_date' => 'datetime',
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
        'equipment_condition' => 'array',
        'attachments' => 'array'
    ];

    /**
     * Get the equipment that owns the transfer record.
     */
    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the user who requested the transfer.
     */
    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the user who approved the transfer.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who previously had the equipment.
     */
    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    /**
     * Get the user who will receive the equipment.
     */
    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
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
     * Scope a query to only include rejected transfers.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope a query to filter by transfer type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('transfer_type', $type);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transfer_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by requester.
     */
    public function scopeByRequester($query, $userId)
    {
        return $query->where('requested_by', $userId);
    }

    /**
     * Scope a query to filter by approver.
     */
    public function scopeByApprover($query, $userId)
    {
        return $query->where('approved_by', $userId);
    }

    /**
     * Check if transfer is pending.
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
     * Check if transfer is rejected.
     */
    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    /**
     * Get transfer type description.
     */
    public function getTransferTypeDescription()
    {
        $descriptions = [
            'location' => 'Location Transfer',
            'department' => 'Department Transfer',
            'person' => 'Person Transfer',
            'return_to_stock' => 'Return to Stock'
        ];

        return $descriptions[$this->transfer_type] ?? 'Unknown';
    }

    /**
     * Get status color.
     */
    public function getStatusColor()
    {
        $colors = [
            'pending' => 'yellow',
            'approved' => 'blue',
            'completed' => 'green',
            'rejected' => 'red'
        ];

        return $colors[$this->status] ?? 'gray';
    }

    /**
     * Get transfer summary.
     */
    public function getTransferSummary()
    {
        $summary = "Transfer from ";
        
        switch ($this->transfer_type) {
            case 'location':
                $summary .= "{$this->from_location} to {$this->to_location}";
                break;
            case 'department':
                $summary .= "{$this->from_department} to {$this->to_department}";
                break;
            case 'person':
                $summary .= ($this->fromUser->name ?? 'Unassigned') . " to " . ($this->toUser->name ?? 'Unassigned');
                break;
            case 'return_to_stock':
                $summary .= ($this->fromUser->name ?? 'Current Location') . " to Stock";
                break;
            default:
                $summary .= "Unknown to Unknown";
        }

        return $summary;
    }

    /**
     * Get approval time in hours.
     */
    public function getApprovalTime()
    {
        if ($this->approved_at && $this->created_at) {
            return $this->created_at->diffInHours($this->approved_at);
        }
        return null;
    }

    /**
     * Get completion time in hours.
     */
    public function getCompletionTime()
    {
        if ($this->completed_at && $this->approved_at) {
            return $this->approved_at->diffInHours($this->completed_at);
        }
        return null;
    }

    /**
     * Get total processing time in hours.
     */
    public function getTotalProcessingTime()
    {
        if ($this->completed_at && $this->created_at) {
            return $this->created_at->diffInHours($this->completed_at);
        }
        return null;
    }

    /**
     * Get formatted approval time.
     */
    public function getFormattedApprovalTime()
    {
        $time = $this->getApprovalTime();
        
        if ($time) {
            if ($time < 1) {
                return round($time * 60) . ' minutes';
            } elseif ($time < 24) {
                return round($time) . ' hours';
            } else {
                $days = floor($time / 24);
                $hours = $time % 24;
                return "{$days} days " . round($hours) . ' hours';
            }
        }
        
        return 'N/A';
    }

    /**
     * Get formatted completion time.
     */
    public function getFormattedCompletionTime()
    {
        $time = $this->getCompletionTime();
        
        if ($time) {
            if ($time < 1) {
                return round($time * 60) . ' minutes';
            } elseif ($time < 24) {
                return round($time) . ' hours';
            } else {
                $days = floor($time / 24);
                $hours = $time % 24;
                return "{$days} days " . round($hours) . ' hours';
            }
        }
        
        return 'N/A';
    }

    /**
     * Check if transfer is overdue.
     */
    public function isOverdue()
    {
        return $this->transfer_date && $this->transfer_date->isPast() && $this->status !== 'completed';
    }

    /**
     * Get days overdue.
     */
    public function getDaysOverdue()
    {
        if ($this->isOverdue()) {
            return $this->transfer_date->diffInDays(now());
        }
        return 0;
    }

    /**
     * Approve transfer.
     */
    public function approve($approvedBy)
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_at' => now()
        ]);
    }

    /**
     * Reject transfer.
     */
    public function reject($rejectedBy, $reason)
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $rejectedBy,
            'approved_at' => now(),
            'rejection_reason' => $reason
        ]);
    }

    /**
     * Complete transfer.
     */
    public function complete()
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);

        // Update equipment location/department/user
        $equipment = $this->equipment;
        $updateData = [];

        switch ($this->transfer_type) {
            case 'location':
                $updateData['location'] = $this->to_location;
                break;
            case 'department':
                $updateData['department'] = $this->to_department;
                break;
            case 'person':
                $updateData['assigned_to'] = $this->to_user_id;
                break;
            case 'return_to_stock':
                $updateData['assigned_to'] = null;
                $updateData['location'] = 'Stock';
                break;
        }

        if (!empty($updateData)) {
            $equipment->update($updateData);
        }
    }

    /**
     * Get transfer history for equipment.
     */
    public static function getEquipmentTransferHistory($equipmentId)
    {
        return static::where('equipment_id', $equipmentId)
            ->with(['requester', 'approver', 'fromUser', 'toUser'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get transfer statistics.
     */
    public static function getTransferStatistics($startDate = null, $endDate = null)
    {
        $query = static::query();

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        return [
            'total_transfers' => $query->count(),
            'pending_transfers' => $query->clone()->where('status', 'pending')->count(),
            'approved_transfers' => $query->clone()->where('status', 'approved')->count(),
            'completed_transfers' => $query->clone()->where('status', 'completed')->count(),
            'rejected_transfers' => $query->clone()->where('status', 'rejected')->count(),
            'average_approval_time' => $query->clone()
                ->whereNotNull('approved_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) as avg_time')
                ->value('avg_time'),
            'average_completion_time' => $query->clone()
                ->whereNotNull('completed_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, approved_at, completed_at)) as avg_time')
                ->value('avg_time'),
        ];
    }
}
