<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'parent_category_id',
        'attributes',
        'depreciation_rate',
        'useful_life_years',
        'requires_maintenance',
        'requires_calibration',
        'requires_inspection',
        'icon',
        'color',
        'is_active'
    ];

    protected $casts = [
        'attributes' => 'array',
        'requires_maintenance' => 'boolean',
        'requires_calibration' => 'boolean',
        'requires_inspection' => 'boolean',
        'is_active' => 'boolean'
    ];

    /**
     * Get the parent category.
     */
    public function parentCategory(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'parent_category_id');
    }

    /**
     * Get the child categories.
     */
    public function childCategories(): HasMany
    {
        return $this->hasMany(AssetCategory::class, 'parent_category_id');
    }

    /**
     * Get the equipment in this category.
     */
    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class, 'category', 'code');
    }

    /**
     * Scope a query to only include active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include root categories (no parent).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_category_id');
    }

    /**
     * Get all descendants of this category.
     */
    public function descendants()
    {
        $descendants = collect();
        
        foreach ($this->childCategories as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->descendants());
        }
        
        return $descendants;
    }

    /**
     * Get all ancestors of this category.
     */
    public function ancestors()
    {
        $ancestors = collect();
        $current = $this->parentCategory;
        
        while ($current) {
            $ancestors->prepend($current);
            $current = $current->parentCategory;
        }
        
        return $ancestors;
    }

    /**
     * Get the full category path (e.g., "Medical > Diagnostic > X-Ray").
     */
    public function getFullPathAttribute()
    {
        $ancestors = $this->ancestors();
        $ancestors->push($this);
        
        return $ancestors->pluck('name')->join(' > ');
    }

    /**
     * Get the equipment count for this category.
     */
    public function getEquipmentCountAttribute()
    {
        return $this->equipment()->count();
    }

    /**
     * Get the active equipment count for this category.
     */
    public function getActiveEquipmentCountAttribute()
    {
        return $this->equipment()->active()->count();
    }

    /**
     * Get the total value of equipment in this category.
     */
    public function getTotalValueAttribute()
    {
        return $this->equipment()->sum('purchase_price');
    }

    /**
     * Get the current value of equipment in this category.
     */
    public function getCurrentValueAttribute()
    {
        $totalCurrentValue = 0;
        
        foreach ($this->equipment as $equipment) {
            $totalCurrentValue += $equipment->current_value ?? 0;
        }
        
        return $totalCurrentValue;
    }

    /**
     * Check if category has any equipment.
     */
    public function hasEquipment()
    {
        return $this->equipment()->exists();
    }

    /**
     * Check if category has any child categories.
     */
    public function hasChildren()
    {
        return $this->childCategories()->exists();
    }

    /**
     * Get maintenance requirements for this category.
     */
    public function getMaintenanceRequirementsAttribute()
    {
        return [
            'maintenance' => $this->requires_maintenance,
            'calibration' => $this->requires_calibration,
            'inspection' => $this->requires_inspection
        ];
    }
}
