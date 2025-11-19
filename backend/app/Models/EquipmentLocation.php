<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EquipmentLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'department_id',
        'floor',
        'room',
        'responsible_person_id',
        'description',
        'coordinates',
        'is_active'
    ];

    protected $casts = [
        'coordinates' => 'array',
        'is_active' => 'boolean'
    ];

    /**
     * Get the department that owns the location.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the responsible person for this location.
     */
    public function responsiblePerson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_person_id');
    }

    /**
     * Get all equipment in this location.
     */
    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class, 'location_id');
    }

    /**
     * Scope a query to only include active locations.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by location type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Get the full location path.
     */
    public function getFullPathAttribute(): string
    {
        $path = [];
        
        if ($this->department) {
            $path[] = $this->department->name;
        }
        
        if ($this->floor) {
            $path[] = "Floor {$this->floor}";
        }
        
        if ($this->room) {
            $path[] = "Room {$this->room}";
        }
        
        $path[] = $this->name;
        
        return implode(' - ', $path);
    }

    /**
     * Get equipment count in this location.
     */
    public function getEquipmentCountAttribute(): int
    {
        return $this->equipment()->count();
    }
}
