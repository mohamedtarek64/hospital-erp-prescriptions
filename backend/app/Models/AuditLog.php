<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'table_name',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'url',
        'method',
        'description',
        'metadata'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array'
    ];

    /**
     * Get the user that owns the audit log.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to filter by user.
     */
    public function scopeOfUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to filter by action.
     */
    public function scopeOfAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope a query to filter by model type.
     */
    public function scopeOfModel($query, $modelType)
    {
        return $query->where('model_type', $modelType);
    }

    /**
     * Scope a query to filter by table name.
     */
    public function scopeOfTable($query, $tableName)
    {
        return $query->where('table_name', $tableName);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by IP address.
     */
    public function scopeOfIp($query, $ipAddress)
    {
        return $query->where('ip_address', $ipAddress);
    }

    /**
     * Get the model that was affected.
     */
    public function getModelAttribute()
    {
        if ($this->model_type && $this->model_id) {
            return $this->model_type::find($this->model_id);
        }
        return null;
    }

    /**
     * Get formatted old values.
     */
    public function getFormattedOldValues()
    {
        if (!$this->old_values) {
            return 'No previous values';
        }

        return json_encode($this->old_values, JSON_PRETTY_PRINT);
    }

    /**
     * Get formatted new values.
     */
    public function getFormattedNewValues()
    {
        if (!$this->new_values) {
            return 'No new values';
        }

        return json_encode($this->new_values, JSON_PRETTY_PRINT);
    }

    /**
     * Get changes summary.
     */
    public function getChangesSummary()
    {
        if (!$this->old_values || !$this->new_values) {
            return 'No changes detected';
        }

        $changes = [];
        foreach ($this->new_values as $key => $newValue) {
            $oldValue = $this->old_values[$key] ?? null;
            if ($oldValue !== $newValue) {
                $changes[] = "{$key}: {$oldValue} → {$newValue}";
            }
        }

        return implode(', ', $changes);
    }

    /**
     * Check if log is for create action.
     */
    public function isCreate()
    {
        return $this->action === 'create';
    }

    /**
     * Check if log is for update action.
     */
    public function isUpdate()
    {
        return $this->action === 'update';
    }

    /**
     * Check if log is for delete action.
     */
    public function isDelete()
    {
        return $this->action === 'delete';
    }

    /**
     * Check if log is for login action.
     */
    public function isLogin()
    {
        return $this->action === 'login';
    }

    /**
     * Check if log is for logout action.
     */
    public function isLogout()
    {
        return $this->action === 'logout';
    }

    /**
     * Get user agent browser info.
     */
    public function getBrowserInfo()
    {
        if (!$this->user_agent) {
            return 'Unknown';
        }

        $browser = 'Unknown';
        $version = '';

        if (preg_match('/Chrome\/([0-9.]+)/', $this->user_agent, $matches)) {
            $browser = 'Chrome';
            $version = $matches[1];
        } elseif (preg_match('/Firefox\/([0-9.]+)/', $this->user_agent, $matches)) {
            $browser = 'Firefox';
            $version = $matches[1];
        } elseif (preg_match('/Safari\/([0-9.]+)/', $this->user_agent, $matches)) {
            $browser = 'Safari';
            $version = $matches[1];
        } elseif (preg_match('/Edge\/([0-9.]+)/', $this->user_agent, $matches)) {
            $browser = 'Edge';
            $version = $matches[1];
        }

        return $version ? "{$browser} {$version}" : $browser;
    }
}
