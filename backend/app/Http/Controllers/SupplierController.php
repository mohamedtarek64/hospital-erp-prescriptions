<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Supplier::with(['purchaseOrders', 'medicineInventory']);

            // Apply filters
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('contact_person', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('city')) {
                $query->where('city', $request->city);
            }

            $suppliers = $query->orderBy('name')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $suppliers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load suppliers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created supplier.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email|unique:suppliers,email',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:255',
            'license_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'credit_limit' => 'nullable|numeric|min:0',
            'payment_terms_days' => 'nullable|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $supplier = Supplier::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Supplier created successfully',
                'data' => $supplier
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified supplier.
     */
    public function show(Supplier $supplier): JsonResponse
    {
        $supplier->load(['purchaseOrders.items.medicine', 'medicineInventory.medicine']);

        return response()->json([
            'success' => true,
            'data' => $supplier
        ]);
    }

    /**
     * Update the specified supplier.
     */
    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'contact_person' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:suppliers,email,' . $supplier->id,
            'phone' => 'sometimes|required|string|max:20',
            'address' => 'sometimes|required|string',
            'city' => 'sometimes|required|string|max:255',
            'state' => 'sometimes|required|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:255',
            'license_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,suspended',
            'credit_limit' => 'nullable|numeric|min:0',
            'payment_terms_days' => 'nullable|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $supplier->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Supplier updated successfully',
                'data' => $supplier
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy(Supplier $supplier): JsonResponse
    {
        try {
            // Check if supplier has purchase orders or inventory
            if ($supplier->purchaseOrders()->count() > 0 || $supplier->medicineInventory()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete supplier with existing purchase orders or inventory records'
                ], 400);
            }

            $supplier->delete();

            return response()->json([
                'success' => true,
                'message' => 'Supplier deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get supplier performance metrics.
     */
    public function getPerformance(Supplier $supplier): JsonResponse
    {
        try {
            $metrics = [
                'total_orders' => $supplier->purchaseOrders()->count(),
                'total_value' => $supplier->purchaseOrders()->sum('total_amount'),
                'on_time_deliveries' => $supplier->purchaseOrders()
                    ->where('status', 'received')
                    ->whereColumn('actual_delivery_date', '<=', 'expected_delivery_date')
                    ->count(),
                'late_deliveries' => $supplier->purchaseOrders()
                    ->where('status', 'received')
                    ->whereColumn('actual_delivery_date', '>', 'expected_delivery_date')
                    ->count(),
                'cancelled_orders' => $supplier->purchaseOrders()->where('status', 'cancelled')->count(),
                'performance_rating' => $supplier->performance_rating,
                'outstanding_amount' => $supplier->outstanding_amount,
                'credit_limit_utilization' => $supplier->credit_limit > 0 
                    ? ($supplier->outstanding_amount / $supplier->credit_limit) * 100 
                    : 0
            ];

            return response()->json([
                'success' => true,
                'data' => $metrics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load supplier performance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get supplier cities.
     */
    public function getCities(): JsonResponse
    {
        try {
            $cities = Supplier::select('city')
                ->distinct()
                ->orderBy('city')
                ->pluck('city');

            return response()->json([
                'success' => true,
                'data' => $cities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load cities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
