<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'type',
        'parameters',
        'filters',
        'columns',
        'query_type',
        'query',
        'file_format',
        'is_scheduled',
        'schedule_frequency',
        'schedule_time',
        'recipients',
        'is_public',
        'is_active'
    ];

    protected $casts = [
        'parameters' => 'array',
        'filters' => 'array',
        'columns' => 'array',
        'recipients' => 'array',
        'is_scheduled' => 'boolean',
        'is_public' => 'boolean',
        'is_active' => 'boolean',
        'schedule_time' => 'datetime:H:i'
    ];

    /**
     * Get the category that owns the report.
     */
    public function category()
    {
        return $this->belongsTo(ReportCategory::class, 'category_id');
    }

    /**
     * Get the executions for the report.
     */
    public function executions()
    {
        return $this->hasMany(ReportExecution::class);
    }

    /**
     * Scope a query to only include active reports.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include public reports.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope a query to only include scheduled reports.
     */
    public function scopeScheduled($query)
    {
        return $query->where('is_scheduled', true);
    }

    /**
     * Scope a query to filter by type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Get the latest execution for the report.
     */
    public function latestExecution()
    {
        return $this->hasOne(ReportExecution::class)->latest();
    }

    /**
     * Check if report is dashboard type.
     */
    public function isDashboard()
    {
        return $this->type === 'dashboard';
    }

    /**
     * Check if report is detailed type.
     */
    public function isDetailed()
    {
        return $this->type === 'detailed';
    }

    /**
     * Check if report is summary type.
     */
    public function isSummary()
    {
        return $this->type === 'summary';
    }

    /**
     * Check if report is custom type.
     */
    public function isCustom()
    {
        return $this->type === 'custom';
    }
}
