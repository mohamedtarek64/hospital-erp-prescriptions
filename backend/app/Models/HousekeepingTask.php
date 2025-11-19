<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HousekeepingTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'bed_id',
        'task_type', // e.g., cleaning, maintenance, inspection, deep_clean
        'priority', // e.g., low, medium, high, urgent
        'status', // e.g., pending, in_progress, completed, cancelled
        'assigned_to',
        'completed_by',
        'due_date',
        'due_time',
        'completed_date',
        'completed_time',
        'notes',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'due_date' => 'date',
        'due_time' => 'datetime',
        'completed_date' => 'date',
        'completed_time' => 'datetime'
    ];

    /**
     * Get the room for this housekeeping task.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the bed for this housekeeping task.
     */
    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class);
    }

    /**
     * Get the user assigned to this task.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who completed this task.
     */
    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    /**
     * Scope a query to only include pending tasks.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include in-progress tasks.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope a query to only include completed tasks.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include tasks of a given priority.
     */
    public function scopePriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope a query to only include tasks of a given type.
     */
    public function scopeType($query, $type)
    {
        return $query->where('task_type', $type);
    }

    /**
     * Scope a query to only include overdue tasks.
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now()->toDateString())
            ->whereIn('status', ['pending', 'in_progress']);
    }

    /**
     * Check if task is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->due_date < now()->toDateString() && 
               in_array($this->status, ['pending', 'in_progress']);
    }

    /**
     * Check if task is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if task is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if task is in progress.
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Get the duration of the task in hours.
     */
    public function getDurationHoursAttribute(): ?int
    {
        if (!$this->completed_time || !$this->due_time) {
            return null;
        }

        return $this->due_time->diffInHours($this->completed_time);
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'in_progress' => 'blue',
            'completed' => 'green',
            'cancelled' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get priority color for UI
     */
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'low' => 'green',
            'medium' => 'yellow',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get task type color for UI
     */
    public function getTaskTypeColorAttribute(): string
    {
        return match($this->task_type) {
            'cleaning' => 'blue',
            'maintenance' => 'orange',
            'inspection' => 'purple',
            'deep_clean' => 'red',
            default => 'gray'
        };
    }
}
