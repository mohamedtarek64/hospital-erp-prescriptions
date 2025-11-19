<?php

namespace App\Http\Controllers;

use App\Models\AssetDepreciation;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AssetDepreciationController extends Controller
{
    /**
     * Display a listing of asset depreciation records.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = AssetDepreciation::with(['equipment', 'creator']);

            // Apply filters
            if ($request->filled('equipment_id')) {
                $query->where('equipment_id', $request->equipment_id);
            }

            if ($request->filled('depreciation_method')) {
                $query->where('depreciation_method', $request->depreciation_method);
            }

            if ($request->filled('date_from')) {
                $query->where('depreciation_date', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->where('depreciation_date', '<=', $request->date_to);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('equipment', function ($equipmentQuery) use ($search) {
                    $equipmentQuery->where('name', 'like', '%' . $search . '%')
                                  ->orWhere('serial_number', 'like', '%' . $search . '%')
                                  ->orWhere('asset_tag', 'like', '%' . $search . '%');
                });
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'depreciation_date');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $depreciation = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $depreciation,
                'message' => 'Asset depreciation records retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve asset depreciation records: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created asset depreciation record.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'equipment_id' => 'required|exists:equipment,id|unique:asset_depreciation',
                'depreciation_method' => 'required|in:straight_line,declining_balance,sum_of_years,units_of_production',
                'purchase_cost' => 'required|numeric|min:0',
                'salvage_value' => 'required|numeric|min:0',
                'useful_life_years' => 'required|integer|min:1',
                'depreciation_rate' => 'nullable|numeric|min:0|max:1',
                'depreciation_date' => 'required|date',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->validated();
            
            // Calculate annual depreciation based on method
            $annualDepreciation = $this->calculateAnnualDepreciation(
                $data['depreciation_method'],
                $data['purchase_cost'],
                $data['salvage_value'],
                $data['useful_life_years'],
                $data['depreciation_rate'] ?? null
            );

            $depreciation = AssetDepreciation::create([
                ...$data,
                'annual_depreciation' => $annualDepreciation,
                'accumulated_depreciation' => 0,
                'book_value' => $data['purchase_cost'],
                'created_by' => auth()->id()
            ]);

            $depreciation->load(['equipment', 'creator']);

            return response()->json([
                'success' => true,
                'data' => $depreciation,
                'message' => 'Asset depreciation record created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create asset depreciation record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified asset depreciation record.
     */
    public function show(AssetDepreciation $assetDepreciation): JsonResponse
    {
        try {
            $assetDepreciation->load(['equipment', 'creator']);

            $data = [
                'depreciation' => $assetDepreciation,
                'schedule' => $assetDepreciation->getDepreciationSchedule(),
                'statistics' => AssetDepreciation::getEquipmentDepreciationStats($assetDepreciation->equipment_id)
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Asset depreciation record retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve asset depreciation record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified asset depreciation record.
     */
    public function update(Request $request, AssetDepreciation $assetDepreciation): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'depreciation_method' => 'sometimes|in:straight_line,declining_balance,sum_of_years,units_of_production',
                'purchase_cost' => 'sometimes|numeric|min:0',
                'salvage_value' => 'sometimes|numeric|min:0',
                'useful_life_years' => 'sometimes|integer|min:1',
                'depreciation_rate' => 'nullable|numeric|min:0|max:1',
                'annual_depreciation' => 'nullable|numeric|min:0',
                'accumulated_depreciation' => 'nullable|numeric|min:0',
                'book_value' => 'nullable|numeric|min:0',
                'depreciation_date' => 'sometimes|date',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->validated();

            // Recalculate annual depreciation if method or cost parameters changed
            if (isset($data['depreciation_method']) || 
                isset($data['purchase_cost']) || 
                isset($data['salvage_value']) || 
                isset($data['useful_life_years']) || 
                isset($data['depreciation_rate'])) {
                
                $purchaseCost = $data['purchase_cost'] ?? $assetDepreciation->purchase_cost;
                $salvageValue = $data['salvage_value'] ?? $assetDepreciation->salvage_value;
                $usefulLife = $data['useful_life_years'] ?? $assetDepreciation->useful_life_years;
                $method = $data['depreciation_method'] ?? $assetDepreciation->depreciation_method;
                $rate = $data['depreciation_rate'] ?? $assetDepreciation->depreciation_rate;

                $data['annual_depreciation'] = $this->calculateAnnualDepreciation(
                    $method,
                    $purchaseCost,
                    $salvageValue,
                    $usefulLife,
                    $rate
                );
            }

            $assetDepreciation->update($data);
            $assetDepreciation->load(['equipment', 'creator']);

            return response()->json([
                'success' => true,
                'data' => $assetDepreciation,
                'message' => 'Asset depreciation record updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update asset depreciation record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified asset depreciation record.
     */
    public function destroy(AssetDepreciation $assetDepreciation): JsonResponse
    {
        try {
            $assetDepreciation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Asset depreciation record deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete asset depreciation record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get depreciation dashboard data.
     */
    public function dashboard(): JsonResponse
    {
        try {
            $stats = [
                'total_assets' => AssetDepreciation::count(),
                'total_cost' => AssetDepreciation::sum('purchase_cost'),
                'total_depreciation' => AssetDepreciation::sum('accumulated_depreciation'),
                'total_book_value' => AssetDepreciation::sum('book_value'),
                'average_depreciation_rate' => AssetDepreciation::avg('depreciation_rate') ?? 0,
                'fully_depreciated_assets' => AssetDepreciation::whereRaw('book_value <= salvage_value')->count()
            ];

            // Portfolio summary
            $portfolioSummary = AssetDepreciation::getPortfolioDepreciationSummary();

            // Depreciation by method
            $depreciationByMethod = AssetDepreciation::selectRaw('depreciation_method, COUNT(*) as count, SUM(accumulated_depreciation) as total_depreciation')
                ->groupBy('depreciation_method')
                ->get()
                ->keyBy('depreciation_method');

            // Recent depreciation records
            $recentDepreciation = AssetDepreciation::with(['equipment'])
                ->latest()
                ->limit(10)
                ->get();

            // Assets nearing end of useful life
            $nearingEndOfLife = AssetDepreciation::with(['equipment'])
                ->whereRaw('(useful_life_years - TIMESTAMPDIFF(YEAR, depreciation_date, NOW())) <= 1')
                ->whereRaw('book_value > salvage_value')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'statistics' => $stats,
                    'portfolio_summary' => $portfolioSummary,
                    'depreciation_by_method' => $depreciationByMethod,
                    'recent_depreciation' => $recentDepreciation,
                    'nearing_end_of_life' => $nearingEndOfLife
                ],
                'message' => 'Depreciation dashboard data retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve depreciation dashboard data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get depreciation statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $startDate = $request->get('start_date', now()->subYear());
            $endDate = $request->get('end_date', now());

            $statistics = AssetDepreciation::getPortfolioDepreciationSummary($startDate, $endDate);

            // Additional statistics
            $statistics['depreciation_trend'] = AssetDepreciation::selectRaw('DATE_FORMAT(depreciation_date, "%Y-%m") as month, SUM(annual_depreciation) as total_depreciation')
                ->whereBetween('depreciation_date', [$startDate, $endDate])
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            $statistics['asset_age_distribution'] = AssetDepreciation::selectRaw('
                CASE 
                    WHEN TIMESTAMPDIFF(YEAR, depreciation_date, NOW()) <= 1 THEN "0-1 years"
                    WHEN TIMESTAMPDIFF(YEAR, depreciation_date, NOW()) <= 3 THEN "1-3 years"
                    WHEN TIMESTAMPDIFF(YEAR, depreciation_date, NOW()) <= 5 THEN "3-5 years"
                    WHEN TIMESTAMPDIFF(YEAR, depreciation_date, NOW()) <= 10 THEN "5-10 years"
                    ELSE "10+ years"
                END as age_group,
                COUNT(*) as count,
                SUM(book_value) as total_book_value
            ')
                ->groupBy('age_group')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $statistics,
                'message' => 'Depreciation statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve depreciation statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate annual depreciation based on method.
     */
    private function calculateAnnualDepreciation($method, $purchaseCost, $salvageValue, $usefulLife, $rate = null)
    {
        switch ($method) {
            case 'straight_line':
                return ($purchaseCost - $salvageValue) / $usefulLife;
            
            case 'declining_balance':
                if (!$rate) {
                    $rate = 2 / $usefulLife; // Double declining balance
                }
                return $purchaseCost * $rate;
            
            case 'sum_of_years':
                $sumOfYears = ($usefulLife * ($usefulLife + 1)) / 2;
                return (($purchaseCost - $salvageValue) * $usefulLife) / $sumOfYears;
            
            case 'units_of_production':
                // This would require additional parameters like total units expected
                return ($purchaseCost - $salvageValue) / $usefulLife;
            
            default:
                return ($purchaseCost - $salvageValue) / $usefulLife;
        }
    }

    /**
     * Generate depreciation schedule for equipment.
     */
    public function schedule(AssetDepreciation $assetDepreciation): JsonResponse
    {
        try {
            $schedule = $assetDepreciation->getDepreciationSchedule();

            return response()->json([
                'success' => true,
                'data' => $schedule,
                'message' => 'Depreciation schedule retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve depreciation schedule: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get projected book values.
     */
    public function projections(AssetDepreciation $assetDepreciation, Request $request): JsonResponse
    {
        try {
            $years = $request->get('years', 5);
            $projections = [];

            for ($i = 1; $i <= $years; $i++) {
                $projections[] = [
                    'year' => $i,
                    'book_value' => $assetDepreciation->getProjectedBookValue($i),
                    'depreciation' => $assetDepreciation->annual_depreciation
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $projections,
                'message' => 'Depreciation projections retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve depreciation projections: ' . $e->getMessage()
            ], 500);
        }
    }
}
