<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'medicine_id',
        'quantity_ordered',
        'quantity_received',
        'unit_price',
        'total_price',
        'expiry_date',
        'batch_number',
        'notes'
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2'
    ];

    /**
     * Get the purchase order that owns the item.
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /**
     * Get the medicine that owns the item.
     */
    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    /**
     * Check if item is fully received.
     */
    public function isFullyReceived(): bool
    {
        return $this->quantity_received >= $this->quantity_ordered;
    }

    /**
     * Check if item is partially received.
     */
    public function isPartiallyReceived(): bool
    {
        return $this->quantity_received > 0 && $this->quantity_received < $this->quantity_ordered;
    }

    /**
     * Check if item is not received.
     */
    public function isNotReceived(): bool
    {
        return $this->quantity_received === 0;
    }

    /**
     * Get remaining quantity to receive.
     */
    public function getRemainingQuantityAttribute(): int
    {
        return $this->quantity_ordered - $this->quantity_received;
    }

    /**
     * Get completion percentage.
     */
    public function getCompletionPercentageAttribute(): float
    {
        if ($this->quantity_ordered === 0) return 0;
        
        return ($this->quantity_received / $this->quantity_ordered) * 100;
    }

    /**
     * Update received quantity.
     */
    public function updateReceivedQuantity(int $quantity): bool
    {
        if ($quantity < 0 || $quantity > $this->quantity_ordered) {
            return false;
        }

        $this->update(['quantity_received' => $quantity]);
        return true;
    }
}
