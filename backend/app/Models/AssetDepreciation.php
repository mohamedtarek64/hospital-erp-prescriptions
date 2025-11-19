<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetDepreciation extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'depreciation_method',
        'purchase_cost',
        'salvage_value',
        'useful_life_years',
        'depreciation_rate',
        'annual_depreciation',
        'accumulated_depreciation',
        'book_value',
        'depreciation_date',
        'notes',
        'created_by'
    ];

    protected $casts = [
        'purchase_cost' => 'decimal:2',
        'salvage_value' => 'decimal:2',
        'useful_life_years' => 'integer',
        'depreciation_rate' => 'decimal:4',
        'annual_depreciation' => 'decimal:2',
        'accumulated_depreciation' => 'decimal:2',
        'book_value' => 'decimal:2',
        'depreciation_date' => 'date'
    ];

    /**
     * Get the equipment that owns the depreciation record.
     */
    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the user who created the depreciation record.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to filter by depreciation method.
     */
    public function scopeByMethod($query, $method)
    {
        return $query->where('depreciation_method', $method);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('depreciation_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by equipment.
     */
    public function scopeForEquipment($query, $equipmentId)
    {
        return $query->where('equipment_id', $equipmentId);
    }

    /**
     * Get depreciation method description.
     */
    public function getDepreciationMethodDescription()
    {
        $descriptions = [
            'straight_line' => 'Straight Line',
            'declining_balance' => 'Declining Balance',
            'sum_of_years' => 'Sum of Years',
            'units_of_production' => 'Units of Production'
        ];

        return $descriptions[$this->depreciation_method] ?? 'Unknown';
    }

    /**
     * Calculate straight line depreciation.
     */
    public function calculateStraightLineDepreciation()
    {
        if ($this->purchase_cost && $this->salvage_value && $this->useful_life_years) {
            return ($this->purchase_cost - $this->salvage_value) / $this->useful_life_years;
        }
        return 0;
    }

    /**
     * Calculate declining balance depreciation.
     */
    public function calculateDecliningBalanceDepreciation($bookValue, $rate)
    {
        return $bookValue * $rate;
    }

    /**
     * Calculate sum of years depreciation.
     */
    public function calculateSumOfYearsDepreciation($year)
    {
        if ($this->purchase_cost && $this->salvage_value && $this->useful_life_years) {
            $sumOfYears = ($this->useful_life_years * ($this->useful_life_years + 1)) / 2;
            $remainingLife = $this->useful_life_years - $year + 1;
            return (($this->purchase_cost - $this->salvage_value) * $remainingLife) / $sumOfYears;
        }
        return 0;
    }

    /**
     * Get depreciation percentage.
     */
    public function getDepreciationPercentage()
    {
        if ($this->purchase_cost && $this->accumulated_depreciation) {
            return ($this->accumulated_depreciation / $this->purchase_cost) * 100;
        }
        return 0;
    }

    /**
     * Get remaining useful life.
     */
    public function getRemainingUsefulLife()
    {
        if ($this->useful_life_years && $this->depreciation_date) {
            $yearsElapsed = $this->depreciation_date->diffInYears(now());
            return max(0, $this->useful_life_years - $yearsElapsed);
        }
        return $this->useful_life_years;
    }

    /**
     * Check if asset is fully depreciated.
     */
    public function isFullyDepreciated()
    {
        return $this->book_value <= $this->salvage_value;
    }

    /**
     * Get depreciation status.
     */
    public function getDepreciationStatus()
    {
        if ($this->isFullyDepreciated()) {
            return 'fully_depreciated';
        }

        $percentage = $this->getDepreciationPercentage();
        
        if ($percentage >= 80) {
            return 'near_end';
        } elseif ($percentage >= 50) {
            return 'mid_life';
        } else {
            return 'early_life';
        }
    }

    /**
     * Get depreciation status color.
     */
    public function getDepreciationStatusColor()
    {
        $status = $this->getDepreciationStatus();
        
        $colors = [
            'early_life' => 'green',
            'mid_life' => 'yellow',
            'near_end' => 'orange',
            'fully_depreciated' => 'red'
        ];

        return $colors[$status] ?? 'gray';
    }

    /**
     * Get depreciation summary.
     */
    public function getDepreciationSummary()
    {
        return [
            'id' => $this->id,
            'equipment' => $this->equipment->name ?? 'Unknown',
            'method' => $this->getDepreciationMethodDescription(),
            'purchase_cost' => $this->purchase_cost,
            'salvage_value' => $this->salvage_value,
            'useful_life' => $this->useful_life_years,
            'annual_depreciation' => $this->annual_depreciation,
            'accumulated_depreciation' => $this->accumulated_depreciation,
            'book_value' => $this->book_value,
            'depreciation_percentage' => $this->getDepreciationPercentage(),
            'remaining_life' => $this->getRemainingUsefulLife(),
            'status' => $this->getDepreciationStatus(),
            'depreciation_date' => $this->depreciation_date?->format('Y-m-d')
        ];
    }

    /**
     * Calculate next year depreciation.
     */
    public function calculateNextYearDepreciation()
    {
        switch ($this->depreciation_method) {
            case 'straight_line':
                return $this->calculateStraightLineDepreciation();
            
            case 'declining_balance':
                return $this->calculateDecliningBalanceDepreciation($this->book_value, $this->depreciation_rate);
            
            case 'sum_of_years':
                $currentYear = $this->depreciation_date ? $this->depreciation_date->year : now()->year;
                return $this->calculateSumOfYearsDepreciation($currentYear + 1);
            
            default:
                return $this->annual_depreciation;
        }
    }

    /**
     * Get projected book value for a specific year.
     */
    public function getProjectedBookValue($yearsFromNow)
    {
        $currentBookValue = $this->book_value;
        $annualDepreciation = $this->annual_depreciation;
        
        return max($this->salvage_value, $currentBookValue - ($annualDepreciation * $yearsFromNow));
    }

    /**
     * Get depreciation schedule.
     */
    public function getDepreciationSchedule()
    {
        $schedule = [];
        $currentBookValue = $this->purchase_cost;
        $annualDepreciation = $this->annual_depreciation;
        
        for ($year = 1; $year <= $this->useful_life_years; $year++) {
            $depreciation = min($annualDepreciation, $currentBookValue - $this->salvage_value);
            $currentBookValue -= $depreciation;
            
            $schedule[] = [
                'year' => $year,
                'depreciation' => $depreciation,
                'book_value' => max($this->salvage_value, $currentBookValue),
                'accumulated_depreciation' => $this->purchase_cost - $currentBookValue
            ];
            
            if ($currentBookValue <= $this->salvage_value) {
                break;
            }
        }
        
        return $schedule;
    }

    /**
     * Get depreciation statistics for equipment.
     */
    public static function getEquipmentDepreciationStats($equipmentId)
    {
        $depreciation = static::where('equipment_id', $equipmentId)->first();
        
        if (!$depreciation) {
            return null;
        }
        
        return [
            'total_depreciation' => $depreciation->accumulated_depreciation,
            'remaining_value' => $depreciation->book_value,
            'depreciation_percentage' => $depreciation->getDepreciationPercentage(),
            'remaining_life' => $depreciation->getRemainingUsefulLife(),
            'status' => $depreciation->getDepreciationStatus(),
            'next_depreciation' => $depreciation->calculateNextYearDepreciation()
        ];
    }

    /**
     * Get portfolio depreciation summary.
     */
    public static function getPortfolioDepreciationSummary($startDate = null, $endDate = null)
    {
        $query = static::query();
        
        if ($startDate && $endDate) {
            $query->whereBetween('depreciation_date', [$startDate, $endDate]);
        }
        
        $totalCost = $query->sum('purchase_cost');
        $totalDepreciation = $query->sum('accumulated_depreciation');
        $totalBookValue = $query->sum('book_value');
        
        return [
            'total_assets' => $query->count(),
            'total_cost' => $totalCost,
            'total_depreciation' => $totalDepreciation,
            'total_book_value' => $totalBookValue,
            'average_depreciation_rate' => $totalCost > 0 ? ($totalDepreciation / $totalCost) * 100 : 0,
            'depreciation_by_method' => $query->selectRaw('depreciation_method, COUNT(*) as count, SUM(accumulated_depreciation) as total_depreciation')
                ->groupBy('depreciation_method')
                ->get()
                ->keyBy('depreciation_method')
        ];
    }
}
