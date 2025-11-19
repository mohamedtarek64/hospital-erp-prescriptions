<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipment_number',
        'name',
        'description',
        'category_id',
        'manufacturer',
        'model',
        'serial_number',
        'asset_tag',
        'purchase_date',
        'purchase_price',
        'supplier',
        'warranty_period',
        'warranty_expiry',
        'location',
        'department',
        'status',
        'condition',
        'expected_lifespan_years',
        'last_maintenance_date',
        'next_maintenance_date',
        'maintenance_interval_days',
        'maintenance_notes',
        'specifications',
        'accessories',
        'notes',
        'requires_calibration',
        'last_calibration_date',
        'next_calibration_date',
        'calibration_certificate',
        'is_critical',
        'is_portable',
        'assigned_to',
        'created_by'
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'purchase_price' => 'decimal:2',
        'warranty_expiry' => 'date',
        'expected_lifespan_years' => 'integer',
        'last_maintenance_date' => 'date',
        'next_maintenance_date' => 'date',
        'maintenance_interval_days' => 'integer',
        'specifications' => 'array',
        'accessories' => 'array',
        'requires_calibration' => 'boolean',
        'last_calibration_date' => 'date',
        'next_calibration_date' => 'date',
        'is_critical' => 'boolean',
        'is_portable' => 'boolean'
    ];

    /**
     * Get the category that owns the equipment.
     */
    public function category()
    {
        return $this->belongsTo(EquipmentCategory::class, 'category_id');
    }

    /**
     * Get the user assigned to the equipment.
     */
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who created the equipment record.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the maintenance records for the equipment.
     */
    public function maintenanceRecords()
    {
        return $this->hasMany(EquipmentMaintenance::class);
    }

    /**
     * Get the transfer records for the equipment.
     */
    public function transfers()
    {
        return $this->hasMany(EquipmentTransfer::class);
    }

    /**
     * Get the issues reported for the equipment.
     */
    public function issues()
    {
        return $this->hasMany(EquipmentIssue::class);
    }

    /**
     * Get the depreciation record for the equipment.
     */
    public function depreciation()
    {
        return $this->hasOne(AssetDepreciation::class);
    }

    /**
     * Scope a query to only include active equipment.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include equipment under maintenance.
     */
    public function scopeMaintenance($query)
    {
        return $query->where('status', 'maintenance');
    }

    /**
     * Scope a query to only include out of service equipment.
     */
    public function scopeOutOfService($query)
    {
        return $query->where('status', 'out_of_service');
    }

    /**
     * Scope a query to only include critical equipment.
     */
    public function scopeCritical($query)
    {
        return $query->where('is_critical', true);
    }

    /**
     * Scope a query to only include portable equipment.
     */
    public function scopePortable($query)
    {
        return $query->where('is_portable', true);
    }

    /**
     * Scope a query to filter by category.
     */
    public function scopeOfCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope a query to filter by location.
     */
    public function scopeAtLocation($query, $location)
    {
        return $query->where('location', $location);
    }

    /**
     * Scope a query to filter by department.
     */
    public function scopeInDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    /**
     * Scope a query to filter by assigned user.
     */
    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope a query to filter by condition.
     */
    public function scopeInCondition($query, $condition)
    {
        return $query->where('condition', $condition);
    }

    /**
     * Scope a query to filter equipment due for maintenance.
     */
    public function scopeDueForMaintenance($query, $days = 7)
    {
        return $query->where('next_maintenance_date', '<=', now()->addDays($days));
    }

    /**
     * Scope a query to filter equipment due for calibration.
     */
    public function scopeDueForCalibration($query, $days = 7)
    {
        return $query->where('requires_calibration', true)
                    ->where('next_calibration_date', '<=', now()->addDays($days));
    }

    /**
     * Check if equipment is active.
     */
    public function isActive()
    {
        return $this->status === 'active';
    }

    /**
     * Check if equipment is under maintenance.
     */
    public function isUnderMaintenance()
    {
        return $this->status === 'maintenance';
    }

    /**
     * Check if equipment is out of service.
     */
    public function isOutOfService()
    {
        return $this->status === 'out_of_service';
    }

    /**
     * Check if equipment is critical.
     */
    public function isCritical()
    {
        return $this->is_critical;
    }

    /**
     * Check if equipment is portable.
     */
    public function isPortable()
    {
        return $this->is_portable;
    }

    /**
     * Check if equipment needs maintenance.
     */
    public function needsMaintenance()
    {
        return $this->next_maintenance_date && $this->next_maintenance_date->isPast();
    }

    /**
     * Check if equipment is due for maintenance soon.
     */
    public function isDueForMaintenanceSoon($days = 7)
    {
        return $this->next_maintenance_date && $this->next_maintenance_date->diffInDays(now()) <= $days;
    }

    /**
     * Check if equipment needs calibration.
     */
    public function needsCalibration()
    {
        return $this->requires_calibration && $this->next_calibration_date && $this->next_calibration_date->isPast();
    }

    /**
     * Check if equipment is due for calibration soon.
     */
    public function isDueForCalibrationSoon($days = 7)
    {
        return $this->requires_calibration && $this->next_calibration_date && $this->next_calibration_date->diffInDays(now()) <= $days;
    }

    /**
     * Check if equipment is under warranty.
     */
    public function isUnderWarranty()
    {
        return $this->warranty_expiry && $this->warranty_expiry->isFuture();
    }

    /**
     * Get warranty status.
     */
    public function getWarrantyStatus()
    {
        if (!$this->warranty_expiry) {
            return 'No warranty information';
        }

        if ($this->isUnderWarranty()) {
            $daysLeft = $this->warranty_expiry->diffInDays(now());
            return "Under warranty ({$daysLeft} days remaining)";
        }

        $daysExpired = now()->diffInDays($this->warranty_expiry);
        return "Warranty expired ({$daysExpired} days ago)";
    }

    /**
     * Get status color.
     */
    public function getStatusColor()
    {
        $colors = [
            'active' => 'green',
            'maintenance' => 'yellow',
            'out_of_service' => 'red',
            'retired' => 'gray',
            'lost' => 'orange',
            'stolen' => 'red'
        ];

        return $colors[$this->status] ?? 'gray';
    }

    /**
     * Get condition color.
     */
    public function getConditionColor()
    {
        $colors = [
            'excellent' => 'green',
            'good' => 'blue',
            'fair' => 'yellow',
            'poor' => 'orange',
            'critical' => 'red'
        ];

        return $colors[$this->condition] ?? 'gray';
    }

    /**
     * Get age in years.
     */
    public function getAge()
    {
        if (!$this->purchase_date) {
            return null;
        }

        return $this->purchase_date->diffInYears(now());
    }

    /**
     * Get remaining useful life.
     */
    public function getRemainingUsefulLife()
    {
        if (!$this->expected_lifespan_years || !$this->purchase_date) {
            return null;
        }

        $age = $this->getAge();
        $remaining = $this->expected_lifespan_years - $age;

        return max(0, $remaining);
    }

    /**
     * Get utilization percentage.
     */
    public function getUtilizationPercentage()
    {
        if (!$this->expected_lifespan_years) {
            return null;
        }

        $age = $this->getAge();
        return min(100, ($age / $this->expected_lifespan_years) * 100);
    }

    /**
     * Get current book value.
     */
    public function getCurrentBookValue()
    {
        if ($this->depreciation) {
            return $this->depreciation->book_value;
        }

        return $this->purchase_price;
    }

    /**
     * Get maintenance cost this year.
     */
    public function getMaintenanceCostThisYear()
    {
        return $this->maintenanceRecords()
            ->whereYear('completed_at', now()->year)
            ->where('status', 'completed')
            ->sum('actual_cost');
    }

    /**
     * Get total maintenance cost.
     */
    public function getTotalMaintenanceCost()
    {
        return $this->maintenanceRecords()
            ->where('status', 'completed')
            ->sum('actual_cost');
    }

    /**
     * Get last maintenance record.
     */
    public function getLastMaintenance()
    {
        return $this->maintenanceRecords()
            ->where('status', 'completed')
            ->latest('completed_at')
            ->first();
    }

    /**
     * Get open issues count.
     */
    public function getOpenIssuesCount()
    {
        return $this->issues()
            ->whereIn('status', ['reported', 'investigating', 'in_progress'])
            ->count();
    }

    /**
     * Get critical issues count.
     */
    public function getCriticalIssuesCount()
    {
        return $this->issues()
            ->where('severity', 'critical')
            ->whereIn('status', ['reported', 'investigating', 'in_progress'])
            ->count();
    }

    /**
     * Generate equipment number.
     */
    public static function generateEquipmentNumber()
    {
        $prefix = 'EQ';
        $year = now()->year;
        
        $lastEquipment = static::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastEquipment ? (intval(substr($lastEquipment->equipment_number, -4)) + 1) : 1;
        
        return $prefix . $year . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get equipment summary.
     */
    public function getSummary()
    {
        return [
            'id' => $this->id,
            'equipment_number' => $this->equipment_number,
            'name' => $this->name,
            'category' => $this->category->name ?? 'Unknown',
            'status' => $this->status,
            'condition' => $this->condition,
            'location' => $this->location,
            'assigned_to' => $this->assignedUser->name ?? 'Unassigned',
            'is_critical' => $this->is_critical,
            'needs_maintenance' => $this->needsMaintenance(),
            'needs_calibration' => $this->needsCalibration(),
            'open_issues' => $this->getOpenIssuesCount(),
            'book_value' => $this->getCurrentBookValue(),
        ];
    }
}