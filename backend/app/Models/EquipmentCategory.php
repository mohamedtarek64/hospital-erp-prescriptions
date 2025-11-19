<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EquipmentCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'parent_category_id',
        'category_code',
        'sort_order',
        'is_active'
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active' => 'boolean'
    ];

    /**
     * Get the parent category.
     */
    public function parentCategory()
    {
        return $this->belongsTo(EquipmentCategory::class, 'parent_category_id');
    }

    /**
     * Get the child categories.
     */
    public function childCategories()
    {
        return $this->hasMany(EquipmentCategory::class, 'parent_category_id');
    }

    /**
     * Get the equipment in this category.
     */
    public function equipment()
    {
        return $this->hasMany(Equipment::class, 'category_id');
    }

    /**
     * Scope a query to only include active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include parent categories.
     */
    public function scopeParent($query)
    {
        return $query->whereNull('parent_category_id');
    }

    /**
     * Scope a query to only include child categories.
     */
    public function scopeChild($query)
    {
        return $query->whereNotNull('parent_category_id');
    }

    /**
     * Scope a query to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Check if category is active.
     */
    public function isActive()
    {
        return $this->is_active;
    }

    /**
     * Check if category is a parent category.
     */
    public function isParent()
    {
        return is_null($this->parent_category_id);
    }

    /**
     * Check if category is a child category.
     */
    public function isChild()
    {
        return !is_null($this->parent_category_id);
    }

    /**
     * Get equipment count in this category.
     */
    public function getEquipmentCount()
    {
        return $this->equipment()->count();
    }

    /**
     * Get active equipment count in this category.
     */
    public function getActiveEquipmentCount()
    {
        return $this->equipment()->where('status', 'active')->count();
    }

    /**
     * Get total value of equipment in this category.
     */
    public function getTotalValue()
    {
        return $this->equipment()->sum('purchase_price');
    }

    /**
     * Get category hierarchy path.
     */
    public function getHierarchyPath()
    {
        $path = [$this->name];
        $parent = $this->parentCategory;
        
        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parentCategory;
        }
        
        return implode(' > ', $path);
    }

    /**
     * Get all descendant categories.
     */
    public function getDescendants()
    {
        $descendants = collect();
        
        foreach ($this->childCategories as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->getDescendants());
        }
        
        return $descendants;
    }

    /**
     * Get all equipment in this category and its descendants.
     */
    public function getAllEquipment()
    {
        $equipment = $this->equipment;
        
        foreach ($this->getDescendants() as $descendant) {
            $equipment = $equipment->merge($descendant->equipment);
        }
        
        return $equipment;
    }

    /**
     * Check if category can be deleted.
     */
    public function canBeDeleted()
    {
        return $this->equipment()->count() === 0 && $this->childCategories()->count() === 0;
    }

    /**
     * Get category statistics.
     */
    public function getStatistics()
    {
        $allEquipment = $this->getAllEquipment();
        
        return [
            'total_equipment' => $allEquipment->count(),
            'active_equipment' => $allEquipment->where('status', 'active')->count(),
            'maintenance_equipment' => $allEquipment->where('status', 'maintenance')->count(),
            'out_of_service_equipment' => $allEquipment->where('status', 'out_of_service')->count(),
            'total_value' => $allEquipment->sum('purchase_price'),
            'average_value' => $allEquipment->avg('purchase_price'),
            'critical_equipment' => $allEquipment->where('is_critical', true)->count(),
        ];
    }
}
