<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\MedicineInventory;
use App\Models\Supplier;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Display a listing of medicines.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Medicine::with(['inventory', 'creator']);

            // Apply filters
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('generic_name', 'like', "%{$search}%")
                      ->orWhere('brand_name', 'like', "%{$search}%")
                      ->orWhere('medicine_id', 'like', "%{$search}%");
                });
            }

            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('stock_status')) {
                switch ($request->stock_status) {
                    case 'low_stock':
                        $query->lowStock();
                        break;
                    case 'out_of_stock':
                        $query->outOfStock();
                        break;
                    case 'expired':
                        $query->expired();
                        break;
                    case 'expiring_soon':
                        $query->expiringSoon();
                        break;
                }
            }

            $medicines = $query->orderBy('name')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $medicines
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load medicines',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created medicine.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'dosage_form' => 'nullable|string|max:255',
            'strength' => 'nullable|string|max:255',
            'unit' => 'nullable|string|max:255',
            'minimum_stock_level' => 'required|integer|min:0',
            'maximum_stock_level' => 'nullable|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'storage_conditions' => 'nullable|string',
            'side_effects' => 'nullable|string',
            'contraindications' => 'nullable|string',
            'drug_interactions' => 'nullable|string',
            'requires_prescription' => 'boolean',
            'is_controlled_substance' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            $data['medicine_id'] = Medicine::generateMedicineId();
            $data['created_by'] = auth()->id();

            $medicine = Medicine::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Medicine created successfully',
                'data' => $medicine->load(['creator'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create medicine',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified medicine.
     */
    public function show(Medicine $medicine): JsonResponse
    {
        $medicine->load(['inventory.supplier', 'creator', 'updater']);

        return response()->json([
            'success' => true,
            'data' => $medicine
        ]);
    }

    /**
     * Update the specified medicine.
     */
    public function update(Request $request, Medicine $medicine): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'dosage_form' => 'nullable|string|max:255',
            'strength' => 'nullable|string|max:255',
            'unit' => 'nullable|string|max:255',
            'minimum_stock_level' => 'sometimes|required|integer|min:0',
            'maximum_stock_level' => 'nullable|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'storage_conditions' => 'nullable|string',
            'side_effects' => 'nullable|string',
            'contraindications' => 'nullable|string',
            'drug_interactions' => 'nullable|string',
            'requires_prescription' => 'boolean',
            'is_controlled_substance' => 'boolean',
            'status' => 'sometimes|in:active,inactive,discontinued'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            $data['updated_by'] = auth()->id();

            $medicine->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Medicine updated successfully',
                'data' => $medicine->load(['creator', 'updater'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update medicine',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified medicine.
     */
    public function destroy(Medicine $medicine): JsonResponse
    {
        try {
            // Check if medicine has inventory or dispensing records
            if ($medicine->inventory()->count() > 0 || $medicine->prescriptionDispensing()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete medicine with existing inventory or dispensing records'
                ], 400);
            }

            $medicine->delete();

            return response()->json([
                'success' => true,
                'message' => 'Medicine deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete medicine',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add inventory for a medicine.
     */
    public function addInventory(Request $request, Medicine $medicine): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'batch_number' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'min_stock_level' => 'required|integer|min:0',
            'max_stock_level' => 'nullable|integer|min:0',
            'expiry_date' => 'required|date|after:today',
            'manufacturing_date' => 'nullable|date|before:today',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'supplier_id' => 'required|exists:suppliers,id',
            'location' => 'nullable|string|max:255',
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
            $inventory = $medicine->inventory()->create($request->all());

            // Update medicine stock
            $medicine->increment('quantity_in_stock', $request->quantity);

            return response()->json([
                'success' => true,
                'message' => 'Inventory added successfully',
                'data' => $inventory->load(['supplier'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add inventory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory movements for a medicine.
     */
    public function getInventoryMovements(Medicine $medicine): JsonResponse
    {
        try {
            $movements = [
                'inventory_records' => $medicine->inventory()->with('supplier')->get(),
                'dispensing_records' => $medicine->prescriptionDispensing()
                    ->with(['prescription.medicalRecord.patient', 'dispenser'])
                    ->orderBy('dispensed_at', 'desc')
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $movements
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load inventory movements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get medicine categories.
     */
    public function getCategories(): JsonResponse
    {
        try {
            $categories = Medicine::select('category')
                ->whereNotNull('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category');

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
