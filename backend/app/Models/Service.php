<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'code',
        'price',
        'tax_rate',
        'description',
        'status'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'tax_rate' => 'decimal:2'
    ];

    /**
     * Get the category that owns the service.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    /**
     * Get the invoice items for the service.
     */
    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Scope a query to only include active services.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include inactive services.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Get the price with tax.
     */
    public function getPriceWithTaxAttribute(): float
    {
        return $this->price + ($this->price * $this->tax_rate / 100);
    }

    /**
     * Get the tax amount.
     */
    public function getTaxAmountAttribute(): float
    {
        return $this->price * $this->tax_rate / 100;
    }
}
