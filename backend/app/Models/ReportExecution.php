<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportExecution extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'user_id',
        'execution_type',
        'parameters',
        'filters',
        'status',
        'error_message',
        'total_records',
        'file_path',
        'file_name',
        'file_size',
        'started_at',
        'completed_at',
        'execution_time'
    ];

    protected $casts = [
        'parameters' => 'array',
        'filters' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'execution_time' => 'integer',
        'file_size' => 'integer',
        'total_records' => 'integer'
    ];

    /**
     * Get the report that owns the execution.
     */
    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    /**
     * Get the user that executed the report.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include pending executions.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include running executions.
     */
    public function scopeRunning($query)
    {
        return $query->where('status', 'running');
    }

    /**
     * Scope a query to only include completed executions.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include failed executions.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope a query to filter by execution type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('execution_type', $type);
    }

    /**
     * Check if execution is pending.
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if execution is running.
     */
    public function isRunning()
    {
        return $this->status === 'running';
    }

    /**
     * Check if execution is completed.
     */
    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    /**
     * Check if execution is failed.
     */
    public function isFailed()
    {
        return $this->status === 'failed';
    }

    /**
     * Mark execution as started.
     */
    public function markAsStarted()
    {
        $this->update([
            'status' => 'running',
            'started_at' => now()
        ]);
    }

    /**
     * Mark execution as completed.
     */
    public function markAsCompleted($totalRecords = null, $filePath = null, $fileName = null, $fileSize = null)
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'total_records' => $totalRecords,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'execution_time' => $this->started_at ? now()->diffInSeconds($this->started_at) : null
        ]);
    }

    /**
     * Mark execution as failed.
     */
    public function markAsFailed($errorMessage = null)
    {
        $this->update([
            'status' => 'failed',
            'completed_at' => now(),
            'error_message' => $errorMessage,
            'execution_time' => $this->started_at ? now()->diffInSeconds($this->started_at) : null
        ]);
    }
}
