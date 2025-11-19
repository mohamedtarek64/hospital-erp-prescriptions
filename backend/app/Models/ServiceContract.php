<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class ServiceContract extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'vendor_id',
        'contract_number',
        'contract_type',
        'start_date',
        'end_date',
        'cost',
        'payment_terms',
        'terms',
        'contact_person',
        'contact_phone',
        'contact_email',
        'status',
        'notes',
        'contract_details',
        'created_by'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'cost' => 'decimal:2',
        'contract_details' => 'array'
    ];

    /**
     * Get the equipment associated with this contract.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the vendor for this contract.
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'vendor_id');
    }

    /**
     * Get the user who created this contract.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include active contracts.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include expired contracts.
     */
    public function scopeExpired($query)
    {
        return $query->where('status', 'expired')
                    ->orWhere('end_date', '<', now());
    }

    /**
     * Scope a query to filter by contract type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('contract_type', $type);
    }

    /**
     * Scope a query to filter contracts expiring soon.
     */
    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->where('end_date', '<=', now()->addDays($days))
                    ->where('end_date', '>', now())
                    ->where('status', 'active');
    }

    /**
     * Check if the contract is active.
     */
    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active' && 
               $this->start_date <= now() && 
               $this->end_date >= now();
    }

    /**
     * Check if the contract is expired.
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->end_date < now() || $this->status === 'expired';
    }

    /**
     * Check if the contract is expiring soon.
     */
    public function getIsExpiringSoonAttribute(): bool
    {
        return $this->is_active && 
               $this->end_date <= now()->addDays(30) && 
               $this->end_date > now();
    }

    /**
     * Get the contract duration in days.
     */
    public function getDurationInDaysAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date);
    }

    /**
     * Get the days remaining until expiration.
     */
    public function getDaysUntilExpirationAttribute(): int
    {
        if ($this->is_expired) {
            return 0;
        }

        return now()->diffInDays($this->end_date, false);
    }

    /**
     * Get the contract status with color for UI.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'active' => $this->is_expiring_soon ? 'warning' : 'success',
            'expired' => 'danger',
            'cancelled' => 'secondary',
            'pending' => 'info',
            default => 'secondary'
        };
    }

    /**
     * Get the contract value per day.
     */
    public function getValuePerDayAttribute(): float
    {
        if ($this->duration_in_days === 0) {
            return 0;
        }

        return round($this->cost / $this->duration_in_days, 2);
    }

    /**
     * Boot method to handle model events.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($contract) {
            if (!$contract->contract_number) {
                $contract->contract_number = 'SC-' . strtoupper(uniqid());
            }
        });

        static::updating(function ($contract) {
            // Auto-expire contracts past their end date
            if ($contract->end_date < now() && $contract->status === 'active') {
                $contract->status = 'expired';
            }
        });
    }
}
