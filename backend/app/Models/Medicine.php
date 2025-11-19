<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicine_id',
        'name',
        'generic_name',
        'brand_name',
        'description',
        'category',
        'manufacturer',
        'dosage_form',
        'strength',
        'unit',
        'quantity_in_stock',
        'minimum_stock_level',
        'maximum_stock_level',
        'unit_price',
        'selling_price',
        'expiry_date',
        'batch_number',
        'storage_conditions',
        'side_effects',
        'contraindications',
        'drug_interactions',
        'requires_prescription',
        'is_controlled_substance',
        'status',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'requires_prescription' => 'boolean',
        'is_controlled_substance' => 'boolean',
        'expiry_date' => 'date',
        'unit_price' => 'decimal:2',
        'selling_price' => 'decimal:2'
    ];

    /**
     * Get the inventory records for the medicine.
     */
    public function inventory(): HasMany
    {
        return $this->hasMany(MedicineInventory::class);
    }

    /**
     * Get the purchase order items for the medicine.
     */
    public function purchaseOrderItems(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    /**
     * Get the prescription dispensing records for the medicine.
     */
    public function prescriptionDispensing(): HasMany
    {
        return $this->hasMany(PrescriptionDispensing::class);
    }

    /**
     * Get the user who created the medicine.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the medicine.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope a query to only include active medicines.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include medicines that are low in stock.
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity_in_stock', '<=', 'minimum_stock_level');
    }

    /**
     * Scope a query to only include medicines that are out of stock.
     */
    public function scopeOutOfStock($query)
    {
        return $query->where('quantity_in_stock', 0);
    }

    /**
     * Scope a query to only include expired medicines.
     */
    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    /**
     * Scope a query to only include medicines expiring soon.
     */
    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->whereBetween('expiry_date', [now(), now()->addDays($days)]);
    }

    /**
     * Check if medicine is low in stock.
     */
    public function isLowStock(): bool
    {
        return $this->quantity_in_stock <= $this->minimum_stock_level;
    }

    /**
     * Check if medicine is out of stock.
     */
    public function isOutOfStock(): bool
    {
        return $this->quantity_in_stock <= 0;
    }

    /**
     * Check if medicine is expired.
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date < now();
    }

    /**
     * Check if medicine is expiring soon.
     */
    public function isExpiringSoon($days = 30): bool
    {
        return $this->expiry_date && 
               $this->expiry_date > now() && 
               $this->expiry_date <= now()->addDays($days);
    }

    /**
     * Get stock status.
     */
    public function getStockStatusAttribute(): string
    {
        if ($this->isOutOfStock()) {
            return 'out_of_stock';
        }
        
        if ($this->isLowStock()) {
            return 'low_stock';
        }
        
        if ($this->isExpired()) {
            return 'expired';
        }
        
        if ($this->isExpiringSoon()) {
            return 'expiring_soon';
        }
        
        return 'available';
    }

    /**
     * Generate medicine ID.
     */
    public static function generateMedicineId(): string
    {
        $prefix = 'MED';
        $timestamp = now()->format('Ymd');
        $random = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        return "{$prefix}-{$timestamp}-{$random}";
    }
}