<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'contact_person',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'tax_number',
        'license_number',
        'notes',
        'status',
        'credit_limit',
        'payment_terms_days'
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2'
    ];

    /**
     * Get the medicine inventory records for the supplier.
     */
    public function medicineInventory(): HasMany
    {
        return $this->hasMany(MedicineInventory::class);
    }

    /**
     * Get the purchase orders for the supplier.
     */
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    /**
     * Scope a query to only include active suppliers.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include inactive suppliers.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Scope a query to only include suspended suppliers.
     */
    public function scopeSuspended($query)
    {
        return $query->where('status', 'suspended');
    }

    /**
     * Get total outstanding amount for this supplier.
     */
    public function getOutstandingAmountAttribute(): float
    {
        return $this->purchaseOrders()
            ->where('status', '!=', 'cancelled')
            ->where('status', '!=', 'received')
            ->sum('total_amount');
    }

    /**
     * Check if supplier has exceeded credit limit.
     */
    public function hasExceededCreditLimit(): bool
    {
        return $this->outstanding_amount > $this->credit_limit;
    }

    /**
     * Get supplier performance rating.
     */
    public function getPerformanceRatingAttribute(): float
    {
        $totalOrders = $this->purchaseOrders()->count();
        if ($totalOrders === 0) return 0;

        $onTimeDeliveries = $this->purchaseOrders()
            ->where('status', 'received')
            ->whereColumn('actual_delivery_date', '<=', 'expected_delivery_date')
            ->count();

        return ($onTimeDeliveries / $totalOrders) * 100;
    }
}
