<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserDashboardLayout extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'dashboard_name',
        'layout',
        'settings',
        'is_default'
    ];

    protected $casts = [
        'layout' => 'array',
        'settings' => 'array',
        'is_default' => 'boolean'
    ];

    /**
     * Get the user that owns the dashboard layout.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include default layouts.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope a query to filter by dashboard name.
     */
    public function scopeOfDashboard($query, $dashboardName)
    {
        return $query->where('dashboard_name', $dashboardName);
    }

    /**
     * Set as default dashboard layout.
     */
    public function setAsDefault()
    {
        // Remove default from other layouts for this user
        static::where('user_id', $this->user_id)
            ->where('id', '!=', $this->id)
            ->update(['is_default' => false]);

        // Set this as default
        $this->update(['is_default' => true]);
    }
}
