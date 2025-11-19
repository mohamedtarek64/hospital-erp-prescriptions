<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicineInventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicine_id',
        'batch_number',
        'quantity',
        'min_stock_level',
        'max_stock_level',
        'expiry_date',
        'manufacturing_date',
        'purchase_price',
        'selling_price',
        'supplier_id',
        'status',
        'location',
        'notes'
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'manufacturing_date' => 'date',
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2'
    ];

    /**
     * Get the medicine that owns the inventory record.
     */
    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    /**
     * Get the supplier that owns the inventory record.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Scope a query to only include available inventory.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope a query to only include low stock inventory.
     */
    public function scopeLowStock($query)
    {
        return $query->where('status', 'low_stock');
    }

    /**
     * Scope a query to only include out of stock inventory.
     */
    public function scopeOutOfStock($query)
    {
        return $query->where('status', 'out_of_stock');
    }

    /**
     * Scope a query to only include expired inventory.
     */
    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    /**
     * Scope a query to only include inventory expiring soon.
     */
    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->whereBetween('expiry_date', [now(), now()->addDays($days)]);
    }

    /**
     * Check if inventory is low in stock.
     */
    public function isLowStock(): bool
    {
        return $this->quantity <= $this->min_stock_level;
    }

    /**
     * Check if inventory is out of stock.
     */
    public function isOutOfStock(): bool
    {
        return $this->quantity <= 0;
    }

    /**
     * Check if inventory is expired.
     */
    public function isExpired(): bool
    {
        return $this->expiry_date < now();
    }

    /**
     * Check if inventory is expiring soon.
     */
    public function isExpiringSoon($days = 30): bool
    {
        return $this->expiry_date > now() && 
               $this->expiry_date <= now()->addDays($days);
    }

    /**
     * Update inventory status based on quantity and expiry date.
     */
    public function updateStatus(): void
    {
        if ($this->isExpired()) {
            $this->status = 'expired';
        } elseif ($this->isOutOfStock()) {
            $this->status = 'out_of_stock';
        } elseif ($this->isLowStock()) {
            $this->status = 'low_stock';
        } else {
            $this->status = 'available';
        }
        
        $this->save();
    }

    /**
     * Reduce inventory quantity.
     */
    public function reduceQuantity(int $amount): bool
    {
        if ($this->quantity >= $amount) {
            $this->quantity -= $amount;
            $this->updateStatus();
            return true;
        }
        
        return false;
    }

    /**
     * Add inventory quantity.
     */
    public function addQuantity(int $amount): void
    {
        $this->quantity += $amount;
        $this->updateStatus();
    }
}
