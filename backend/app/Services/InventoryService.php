<?php

namespace App\Services;

use App\Models\Medicine;
use App\Models\MedicineInventory;
use App\Models\PrescriptionDispensing;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryService
{
    /**
     * Update medicine stock levels.
     */
    public function updateStockLevels(): array
    {
        $results = [
            'updated' => 0,
            'low_stock_alerts' => 0,
            'out_of_stock_alerts' => 0,
            'expired_alerts' => 0
        ];

        try {
            DB::beginTransaction();

            // Update all medicine stock levels
            $medicines = Medicine::all();
            
            foreach ($medicines as $medicine) {
                $totalStock = $medicine->inventory()
                    ->where('status', 'available')
                    ->sum('quantity');

                $medicine->update(['quantity_in_stock' => $totalStock]);
                $results['updated']++;

                // Check for alerts
                if ($medicine->isLowStock()) {
                    $results['low_stock_alerts']++;
                }

                if ($medicine->isOutOfStock()) {
                    $results['out_of_stock_alerts']++;
                }

                if ($medicine->isExpired()) {
                    $results['expired_alerts']++;
                }
            }

            // Update inventory statuses
            $inventoryItems = MedicineInventory::all();
            
            foreach ($inventoryItems as $item) {
                $item->updateStatus();
            }

            DB::commit();

            Log::info('Stock levels updated successfully', $results);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update stock levels', ['error' => $e->getMessage()]);
            throw $e;
        }

        return $results;
    }

    /**
     * Get low stock medicines.
     */
    public function getLowStockMedicines(): \Illuminate\Database\Eloquent\Collection
    {
        return Medicine::lowStock()
            ->with(['inventory.supplier'])
            ->get();
    }

    /**
     * Get expired medicines.
     */
    public function getExpiredMedicines(): \Illuminate\Database\Eloquent\Collection
    {
        return Medicine::expired()
            ->with(['inventory.supplier'])
            ->get();
    }

    /**
     * Get medicines expiring soon.
     */
    public function getExpiringSoonMedicines(int $days = 30): \Illuminate\Database\Eloquent\Collection
    {
        return Medicine::expiringSoon($days)
            ->with(['inventory.supplier'])
            ->get();
    }

    /**
     * Get inventory valuation.
     */
    public function getInventoryValuation(): array
    {
        $totalValue = MedicineInventory::where('status', 'available')
            ->sum(DB::raw('quantity * selling_price'));

        $totalCost = MedicineInventory::where('status', 'available')
            ->sum(DB::raw('quantity * purchase_price'));

        $categories = MedicineInventory::where('status', 'available')
            ->join('medicines', 'medicine_inventory.medicine_id', '=', 'medicines.id')
            ->select('medicines.category', DB::raw('SUM(medicine_inventory.quantity * medicine_inventory.selling_price) as value'))
            ->groupBy('medicines.category')
            ->get();

        return [
            'total_value' => $totalValue,
            'total_cost' => $totalCost,
            'profit_margin' => $totalCost > 0 ? (($totalValue - $totalCost) / $totalCost) * 100 : 0,
            'categories' => $categories
        ];
    }

    /**
     * Get stock movement report.
     */
    public function getStockMovementReport(string $startDate, string $endDate): array
    {
        $movements = [
            'incoming' => MedicineInventory::whereBetween('created_at', [$startDate, $endDate])
                ->with(['medicine', 'supplier'])
                ->get(),
            'outgoing' => PrescriptionDispensing::whereBetween('dispensed_at', [$startDate, $endDate])
                ->with(['medicine', 'prescription.medicalRecord.patient'])
                ->get()
        ];

        return $movements;
    }

    /**
     * Generate stock alerts.
     */
    public function generateStockAlerts(): array
    {
        $alerts = [
            'low_stock' => $this->getLowStockMedicines(),
            'out_of_stock' => Medicine::outOfStock()->get(),
            'expired' => $this->getExpiredMedicines(),
            'expiring_soon' => $this->getExpiringSoonMedicines()
        ];

        return $alerts;
    }

    /**
     * Process inventory adjustment.
     */
    public function processInventoryAdjustment(int $inventoryId, int $newQuantity, string $reason): bool
    {
        try {
            DB::beginTransaction();

            $inventory = MedicineInventory::findOrFail($inventoryId);
            $oldQuantity = $inventory->quantity;
            $difference = $newQuantity - $oldQuantity;

            $inventory->update(['quantity' => $newQuantity]);
            $inventory->updateStatus();

            // Update medicine total stock
            $medicine = $inventory->medicine;
            $medicine->increment('quantity_in_stock', $difference);

            // Log the adjustment
            Log::info('Inventory adjustment processed', [
                'inventory_id' => $inventoryId,
                'medicine_id' => $medicine->id,
                'old_quantity' => $oldQuantity,
                'new_quantity' => $newQuantity,
                'difference' => $difference,
                'reason' => $reason,
                'adjusted_by' => auth()->id()
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to process inventory adjustment', [
                'inventory_id' => $inventoryId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get top selling medicines.
     */
    public function getTopSellingMedicines(int $limit = 10, string $period = '30'): \Illuminate\Database\Eloquent\Collection
    {
        $startDate = now()->subDays($period);

        return PrescriptionDispensing::where('dispensed_at', '>=', $startDate)
            ->with('medicine')
            ->selectRaw('medicine_id, SUM(quantity_dispensed) as total_quantity')
            ->groupBy('medicine_id')
            ->orderBy('total_quantity', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get inventory turnover report.
     */
    public function getInventoryTurnoverReport(): array
    {
        $medicines = Medicine::with(['inventory', 'prescriptionDispensing'])
            ->get()
            ->map(function ($medicine) {
                $totalDispensed = $medicine->prescriptionDispensing()
                    ->where('dispensed_at', '>=', now()->subDays(30))
                    ->sum('quantity_dispensed');

                $averageStock = $medicine->inventory()
                    ->where('status', 'available')
                    ->avg('quantity');

                $turnover = $averageStock > 0 ? $totalDispensed / $averageStock : 0;

                return [
                    'medicine' => $medicine,
                    'total_dispensed' => $totalDispensed,
                    'average_stock' => $averageStock,
                    'turnover_rate' => $turnover
                ];
            })
            ->sortByDesc('turnover_rate')
            ->values();

        return $medicines->toArray();
    }
}
