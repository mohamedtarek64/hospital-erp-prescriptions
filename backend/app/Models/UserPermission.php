<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'module',
        'action',
        'is_system',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];

    /**
     * Scope a query to only include active permissions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include system permissions.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope a query to filter by module.
     */
    public function scopeOfModule($query, $module)
    {
        return $query->where('module', $module);
    }

    /**
     * Scope a query to filter by action.
     */
    public function scopeOfAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope a query to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('display_name');
    }

    /**
     * Check if permission is system permission.
     */
    public function isSystem()
    {
        return $this->is_system;
    }

    /**
     * Check if permission is active.
     */
    public function isActive()
    {
        return $this->is_active;
    }

    /**
     * Get full permission name.
     */
    public function getFullName()
    {
        return $this->module . '.' . $this->action;
    }

    /**
     * Get permission groups by module.
     */
    public static function getGroupedByModule()
    {
        return static::active()
            ->ordered()
            ->get()
            ->groupBy('module');
    }
}
