<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'supplier_id',
        'order_date',
        'expected_delivery_date',
        'actual_delivery_date',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'notes',
        'created_by',
        'approved_by',
        'approved_at'
    ];

    protected $casts = [
        'order_date' => 'date',
        'expected_delivery_date' => 'date',
        'actual_delivery_date' => 'date',
        'approved_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2'
    ];

    /**
     * Get the supplier that owns the purchase order.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the purchase order items for the purchase order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    /**
     * Get the user who created the purchase order.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who approved the purchase order.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope a query to only include pending purchase orders.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved purchase orders.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include ordered purchase orders.
     */
    public function scopeOrdered($query)
    {
        return $query->where('status', 'ordered');
    }

    /**
     * Scope a query to only include received purchase orders.
     */
    public function scopeReceived($query)
    {
        return $query->where('status', 'received');
    }

    /**
     * Scope a query to only include cancelled purchase orders.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope a query to only include overdue purchase orders.
     */
    public function scopeOverdue($query)
    {
        return $query->where('expected_delivery_date', '<', now())
                    ->whereIn('status', ['approved', 'ordered']);
    }

    /**
     * Check if purchase order is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->expected_delivery_date && 
               $this->expected_delivery_date < now() && 
               in_array($this->status, ['approved', 'ordered']);
    }

    /**
     * Check if purchase order can be approved.
     */
    public function canBeApproved(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if purchase order can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'approved', 'ordered']);
    }

    /**
     * Check if purchase order can be received.
     */
    public function canBeReceived(): bool
    {
        return $this->status === 'ordered';
    }

    /**
     * Approve the purchase order.
     */
    public function approve($userId): bool
    {
        if (!$this->canBeApproved()) {
            return false;
        }

        $this->update([
            'status' => 'approved',
            'approved_by' => $userId,
            'approved_at' => now()
        ]);

        return true;
    }

    /**
     * Cancel the purchase order.
     */
    public function cancel(): bool
    {
        if (!$this->canBeCancelled()) {
            return false;
        }

        $this->update(['status' => 'cancelled']);
        return true;
    }

    /**
     * Mark purchase order as received.
     */
    public function markAsReceived(): bool
    {
        if (!$this->canBeReceived()) {
            return false;
        }

        $this->update([
            'status' => 'received',
            'actual_delivery_date' => now()
        ]);

        return true;
    }

    /**
     * Generate order number.
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'PO';
        $timestamp = now()->format('Ymd');
        $random = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        return "{$prefix}-{$timestamp}-{$random}";
    }
}
