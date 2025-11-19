<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DashboardWidget extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'chart_type',
        'data_source',
        'filters',
        'settings',
        'refresh_interval',
        'width',
        'height',
        'sort_order',
        'is_public',
        'is_active'
    ];

    protected $casts = [
        'data_source' => 'array',
        'filters' => 'array',
        'settings' => 'array',
        'width' => 'integer',
        'height' => 'integer',
        'sort_order' => 'integer',
        'is_public' => 'boolean',
        'is_active' => 'boolean'
    ];

    /**
     * Scope a query to only include active widgets.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include public widgets.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope a query to filter by type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Check if widget is chart type.
     */
    public function isChart()
    {
        return $this->type === 'chart';
    }

    /**
     * Check if widget is table type.
     */
    public function isTable()
    {
        return $this->type === 'table';
    }

    /**
     * Check if widget is metric type.
     */
    public function isMetric()
    {
        return $this->type === 'metric';
    }

    /**
     * Check if widget is KPI type.
     */
    public function isKpi()
    {
        return $this->type === 'kpi';
    }

    /**
     * Get refresh interval in seconds.
     */
    public function getRefreshIntervalInSeconds()
    {
        $intervals = [
            '1m' => 60,
            '5m' => 300,
            '15m' => 900,
            '30m' => 1800,
            '1h' => 3600
        ];

        return $intervals[$this->refresh_interval] ?? 300;
    }
}
