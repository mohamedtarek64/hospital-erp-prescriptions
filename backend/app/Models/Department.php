<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'code',
        'head_id',
        'budget',
        'status'
    ];

    protected $casts = [
        'budget' => 'decimal:2'
    ];

    /**
     * Get the department head.
     */
    public function head(): BelongsTo
    {
        return $this->belongsTo(User::class, 'head_id');
    }

    /**
     * Get the employees for the department.
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    /**
     * Scope a query to only include active departments.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include inactive departments.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Get total employees count.
     */
    public function getTotalEmployeesAttribute(): int
    {
        return $this->employees()->count();
    }

    /**
     * Get active employees count.
     */
    public function getActiveEmployeesAttribute(): int
    {
        return $this->employees()->where('status', 'active')->count();
    }
}