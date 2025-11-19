<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\MedicineInventory;
use App\Models\PrescriptionDispensing;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PharmacyController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Display pharmacy dashboard data.
     */
    public function dashboard(): JsonResponse
    {
        try {
            $data = [
                'total_medicines' => Medicine::count(),
                'low_stock_medicines' => Medicine::lowStock()->count(),
                'out_of_stock_medicines' => Medicine::outOfStock()->count(),
                'expired_medicines' => Medicine::expired()->count(),
                'expiring_soon_medicines' => Medicine::expiringSoon()->count(),
                'total_inventory_value' => MedicineInventory::sum(DB::raw('quantity * selling_price')),
                'recent_dispensings' => PrescriptionDispensing::with(['medicine', 'prescription.medicalRecord.patient'])
                    ->orderBy('dispensed_at', 'desc')
                    ->limit(10)
                    ->get(),
                'low_stock_alerts' => Medicine::lowStock()->with('inventory')->get(),
                'expiry_alerts' => Medicine::expiringSoon()->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load pharmacy dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get medicine inventory with filters.
     */
    public function getInventory(Request $request): JsonResponse
    {
        try {
            $query = MedicineInventory::with(['medicine', 'supplier']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('medicine_id')) {
                $query->where('medicine_id', $request->medicine_id);
            }

            if ($request->has('supplier_id')) {
                $query->where('supplier_id', $request->supplier_id);
            }

            if ($request->has('expiring_soon')) {
                $query->expiringSoon($request->expiring_soon);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->whereHas('medicine', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('generic_name', 'like', "%{$search}%");
                });
            }

            $inventory = $query->orderBy('expiry_date', 'asc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $inventory
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load inventory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update medicine stock.
     */
    public function updateStock(Request $request, MedicineInventory $inventory): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:0',
            'action' => 'required|in:add,reduce,set'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $quantity = $request->quantity;
            $action = $request->action;

            switch ($action) {
                case 'add':
                    $inventory->addQuantity($quantity);
                    break;
                case 'reduce':
                    if (!$inventory->reduceQuantity($quantity)) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Insufficient stock'
                        ], 400);
                    }
                    break;
                case 'set':
                    $inventory->quantity = $quantity;
                    $inventory->updateStatus();
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => 'Stock updated successfully',
                'data' => $inventory->fresh(['medicine', 'supplier'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dispense prescription.
     */
    public function dispensePrescription(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'prescription_id' => 'required|exists:prescriptions,id',
            'medicine_id' => 'required|exists:medicines,id',
            'quantity_dispensed' => 'required|integer|min:1',
            'batch_number' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Check if medicine is available in stock
            $inventory = MedicineInventory::where('medicine_id', $request->medicine_id)
                ->where('batch_number', $request->batch_number)
                ->where('status', 'available')
                ->first();

            if (!$inventory || $inventory->quantity < $request->quantity_dispensed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock for dispensing'
                ], 400);
            }

            // Create dispensing record
            $dispensing = PrescriptionDispensing::create([
                'prescription_id' => $request->prescription_id,
                'medicine_id' => $request->medicine_id,
                'quantity_dispensed' => $request->quantity_dispensed,
                'batch_number' => $request->batch_number,
                'dispensed_by' => auth()->id(),
                'dispensed_at' => now(),
                'notes' => $request->notes
            ]);

            // Reduce inventory
            $inventory->reduceQuantity($request->quantity_dispensed);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Prescription dispensed successfully',
                'data' => $dispensing->load(['medicine', 'prescription', 'dispenser'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to dispense prescription',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dispensing history.
     */
    public function getDispensingHistory(Request $request): JsonResponse
    {
        try {
            $query = PrescriptionDispensing::with(['medicine', 'prescription.medicalRecord.patient', 'dispenser']);

            if ($request->has('date_from')) {
                $query->whereDate('dispensed_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('dispensed_at', '<=', $request->date_to);
            }

            if ($request->has('medicine_id')) {
                $query->where('medicine_id', $request->medicine_id);
            }

            if ($request->has('dispensed_by')) {
                $query->where('dispensed_by', $request->dispensed_by);
            }

            $history = $query->orderBy('dispensed_at', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $history
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dispensing history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get stock alerts.
     */
    public function getStockAlerts(): JsonResponse
    {
        try {
            $alerts = [
                'low_stock' => Medicine::lowStock()->with('inventory')->get(),
                'out_of_stock' => Medicine::outOfStock()->get(),
                'expired' => Medicine::expired()->get(),
                'expiring_soon' => Medicine::expiringSoon()->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $alerts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load stock alerts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pharmacy analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'total_dispensings' => PrescriptionDispensing::where('dispensed_at', '>=', $startDate)->count(),
                'total_value_dispensed' => PrescriptionDispensing::where('dispensed_at', '>=', $startDate)
                    ->with('medicine')
                    ->get()
                    ->sum(function ($dispensing) {
                        return $dispensing->quantity_dispensed * $dispensing->medicine->selling_price;
                    }),
                'top_medicines' => PrescriptionDispensing::where('dispensed_at', '>=', $startDate)
                    ->with('medicine')
                    ->selectRaw('medicine_id, SUM(quantity_dispensed) as total_quantity')
                    ->groupBy('medicine_id')
                    ->orderBy('total_quantity', 'desc')
                    ->limit(10)
                    ->get(),
                'daily_dispensings' => PrescriptionDispensing::where('dispensed_at', '>=', $startDate)
                    ->selectRaw('DATE(dispensed_at) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
