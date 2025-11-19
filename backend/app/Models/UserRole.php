<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'permissions',
        'is_system',
        'is_active',
        'sort_order'
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_system' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer'
    ];

    /**
     * Get the users that have this role.
     */
    public function users()
    {
        return $this->hasMany(User::class, 'role_id');
    }

    /**
     * Scope a query to only include active roles.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include system roles.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope a query to only include custom roles.
     */
    public function scopeCustom($query)
    {
        return $query->where('is_system', false);
    }

    /**
     * Scope a query to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('display_name');
    }

    /**
     * Check if role has a specific permission.
     */
    public function hasPermission($permission)
    {
        if (!$this->permissions) {
            return false;
        }

        return in_array($permission, $this->permissions);
    }

    /**
     * Check if role has any of the given permissions.
     */
    public function hasAnyPermission($permissions)
    {
        if (!$this->permissions) {
            return false;
        }

        return !empty(array_intersect($permissions, $this->permissions));
    }

    /**
     * Check if role has all of the given permissions.
     */
    public function hasAllPermissions($permissions)
    {
        if (!$this->permissions) {
            return false;
        }

        return empty(array_diff($permissions, $this->permissions));
    }

    /**
     * Add permission to role.
     */
    public function addPermission($permission)
    {
        $permissions = $this->permissions ?? [];
        
        if (!in_array($permission, $permissions)) {
            $permissions[] = $permission;
            $this->update(['permissions' => $permissions]);
        }

        return $this;
    }

    /**
     * Remove permission from role.
     */
    public function removePermission($permission)
    {
        $permissions = $this->permissions ?? [];
        
        $permissions = array_filter($permissions, function ($p) use ($permission) {
            return $p !== $permission;
        });

        $this->update(['permissions' => array_values($permissions)]);
        return $this;
    }

    /**
     * Sync permissions for role.
     */
    public function syncPermissions($permissions)
    {
        $this->update(['permissions' => $permissions]);
        return $this;
    }

    /**
     * Check if role is system role.
     */
    public function isSystem()
    {
        return $this->is_system;
    }

    /**
     * Check if role is active.
     */
    public function isActive()
    {
        return $this->is_active;
    }

    /**
     * Get permission count.
     */
    public function getPermissionCount()
    {
        return count($this->permissions ?? []);
    }

    /**
     * Get user count for this role.
     */
    public function getUserCount()
    {
        return $this->users()->count();
    }
}
