<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmergencyEquipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'quantity',
        'location',
        'status',
        'last_checked',
        'checked_by',
        'expiry_date',
        'description',
        'serial_number',
        'model',
        'manufacturer'
    ];

    protected $casts = [
        'last_checked' => 'datetime',
        'expiry_date' => 'date'
    ];

    /**
     * Get the staff member who last checked this equipment
     */
    public function checkedBy(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'checked_by');
    }

    /**
     * Check if equipment is available
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available' && $this->quantity > 0;
    }

    /**
     * Check if equipment needs maintenance
     */
    public function needsMaintenance(): bool
    {
        return $this->status === 'maintenance' || $this->status === 'out_of_order';
    }

    /**
     * Check if equipment is expired
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * Check if equipment is expiring soon (within 30 days)
     */
    public function isExpiringSoon(): bool
    {
        return $this->expiry_date && $this->expiry_date->isFuture() && $this->expiry_date->diffInDays(now()) <= 30;
    }

    /**
     * Get status color
     */
    public function getStatusColor(): string
    {
        return match($this->status) {
            'available' => 'green',
            'in_use' => 'blue',
            'maintenance' => 'yellow',
            'out_of_order' => 'red',
            'missing' => 'red',
            default => 'gray'
        };
    }

    /**
     * Get type description
     */
    public function getTypeDescription(): string
    {
        return match($this->type) {
            'medical' => 'Medical Equipment',
            'surgical' => 'Surgical Equipment',
            'diagnostic' => 'Diagnostic Equipment',
            'life_support' => 'Life Support Equipment',
            'transport' => 'Transport Equipment',
            'communication' => 'Communication Equipment',
            'safety' => 'Safety Equipment',
            default => 'Unknown'
        };
    }

    /**
     * Get equipment condition status
     */
    public function getConditionStatus(): string
    {
        if ($this->isExpired()) {
            return 'Expired';
        }
        
        if ($this->isExpiringSoon()) {
            return 'Expiring Soon';
        }
        
        if ($this->needsMaintenance()) {
            return 'Needs Maintenance';
        }
        
        if ($this->isAvailable()) {
            return 'Available';
        }
        
        return 'Unavailable';
    }

    /**
     * Get condition color
     */
    public function getConditionColor(): string
    {
        if ($this->isExpired()) {
            return 'red';
        }
        
        if ($this->isExpiringSoon()) {
            return 'orange';
        }
        
        if ($this->needsMaintenance()) {
            return 'yellow';
        }
        
        if ($this->isAvailable()) {
            return 'green';
        }
        
        return 'gray';
    }

    /**
     * Update equipment status
     */
    public function updateStatus(string $status, ?int $checkedBy = null): void
    {
        $this->update([
            'status' => $status,
            'last_checked' => now(),
            'checked_by' => $checkedBy
        ]);
    }

    /**
     * Check equipment availability by type and location
     */
    public static function getAvailableByTypeAndLocation(string $type, string $location): int
    {
        return self::where('type', $type)
                  ->where('location', $location)
                  ->where('status', 'available')
                  ->sum('quantity');
    }
}
