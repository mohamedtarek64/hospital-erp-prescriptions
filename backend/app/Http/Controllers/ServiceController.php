<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    /**
     * Display a listing of services.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Service::with(['category']);

            // Apply filters
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $services = $query->orderBy('name')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $services
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load services',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created service.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:service_categories,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:services,code',
            'price' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $service = Service::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Service created successfully',
                'data' => $service->load(['category'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified service.
     */
    public function show(Service $service): JsonResponse
    {
        $service->load(['category', 'invoiceItems.invoice.patient']);

        return response()->json([
            'success' => true,
            'data' => $service
        ]);
    }

    /**
     * Update the specified service.
     */
    public function update(Request $request, Service $service): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|exists:service_categories,id',
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:services,code,' . $service->id,
            'price' => 'sometimes|required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $service->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Service updated successfully',
                'data' => $service->load(['category'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified service.
     */
    public function destroy(Service $service): JsonResponse
    {
        try {
            // Check if service has invoice items
            if ($service->invoiceItems()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete service with existing invoice items'
                ], 400);
            }

            $service->delete();

            return response()->json([
                'success' => true,
                'message' => 'Service deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get service categories.
     */
    public function getCategories(): JsonResponse
    {
        try {
            $categories = ServiceCategory::active()->orderBy('name')->get();

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

    /**
     * Get services by category.
     */
    public function getByCategory(ServiceCategory $category): JsonResponse
    {
        try {
            $services = $category->services()->active()->orderBy('name')->get();

            return response()->json([
                'success' => true,
                'data' => $services
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load services',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
