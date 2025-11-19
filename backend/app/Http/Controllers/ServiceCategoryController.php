<?php

namespace App\Http\Controllers;

use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ServiceCategoryController extends Controller
{
    /**
     * Display a listing of service categories.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = ServiceCategory::with(['services']);

            // Apply filters
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $categories = $query->orderBy('name')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load service categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created service category.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
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
            $category = ServiceCategory::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Service category created successfully',
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create service category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified service category.
     */
    public function show(ServiceCategory $serviceCategory): JsonResponse
    {
        $serviceCategory->load(['services']);

        return response()->json([
            'success' => true,
            'data' => $serviceCategory
        ]);
    }

    /**
     * Update the specified service category.
     */
    public function update(Request $request, ServiceCategory $serviceCategory): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
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
            $serviceCategory->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Service category updated successfully',
                'data' => $serviceCategory
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update service category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified service category.
     */
    public function destroy(ServiceCategory $serviceCategory): JsonResponse
    {
        try {
            // Check if category has services
            if ($serviceCategory->services()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with existing services'
                ], 400);
            }

            $serviceCategory->delete();

            return response()->json([
                'success' => true,
                'message' => 'Service category deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete service category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
