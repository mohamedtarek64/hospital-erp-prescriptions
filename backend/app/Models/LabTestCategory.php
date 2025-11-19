<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LabTestCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status'
    ];

    /**
     * Get the lab tests for the category.
     */
    public function labTests(): HasMany
    {
        return $this->hasMany(LabTest::class, 'category_id');
    }

    /**
     * Scope a query to only include active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include inactive categories.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }
}
