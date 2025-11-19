<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'ward_id',
        'room_number',
        'room_type', // e.g., single, double, triple, private, semi-private
        'capacity',
        'amenities', // JSON array of amenities
        'status', // e.g., available, occupied, maintenance, cleaning
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'capacity' => 'integer',
        'amenities' => 'array'
    ];

    /**
     * Get the ward that this room belongs to.
     */
    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    /**
     * Get the beds in this room.
     */
    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
    }

    /**
     * Get the admissions in this room.
     */
    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class);
    }

    /**
     * Get the housekeeping tasks for this room.
     */
    public function housekeepingTasks(): HasMany
    {
        return $this->hasMany(HousekeepingTask::class);
    }

    /**
     * Scope a query to only include available rooms.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope a query to only include rooms of a given type.
     */
    public function scopeType($query, $type)
    {
        return $query->where('room_type', $type);
    }

    /**
     * Scope a query to only include rooms in a given ward.
     */
    public function scopeInWard($query, $wardId)
    {
        return $query->where('ward_id', $wardId);
    }

    /**
     * Get the current occupancy rate.
     */
    public function getOccupancyRateAttribute(): float
    {
        $totalBeds = $this->beds()->count();
        $occupiedBeds = $this->beds()->where('status', 'occupied')->count();

        return $totalBeds > 0 ? ($occupiedBeds / $totalBeds) * 100 : 0;
    }

    /**
     * Get the available beds count.
     */
    public function getAvailableBedsCountAttribute(): int
    {
        return $this->beds()->where('status', 'available')->count();
    }

    /**
     * Get the occupied beds count.
     */
    public function getOccupiedBedsCountAttribute(): int
    {
        return $this->beds()->where('status', 'occupied')->count();
    }

    /**
     * Get the total beds count.
     */
    public function getTotalBedsCountAttribute(): int
    {
        return $this->beds()->count();
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'available' => 'green',
            'occupied' => 'red',
            'maintenance' => 'orange',
            'cleaning' => 'yellow',
            default => 'gray'
        };
    }

    /**
     * Get room type color for UI
     */
    public function getRoomTypeColorAttribute(): string
    {
        return match($this->room_type) {
            'single' => 'blue',
            'double' => 'green',
            'triple' => 'orange',
            'private' => 'purple',
            'semi-private' => 'pink',
            default => 'gray'
        };
    }

    /**
     * Get full room identifier
     */
    public function getFullIdentifierAttribute(): string
    {
        return $this->ward->name . ' - ' . $this->room_number;
    }
}
