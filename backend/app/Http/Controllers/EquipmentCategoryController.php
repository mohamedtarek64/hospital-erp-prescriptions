<?php

namespace App\Http\Controllers;

use App\Models\EquipmentCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class EquipmentCategoryController extends Controller
{
    /**
     * Display a listing of equipment categories.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = EquipmentCategory::withCount('equipment');

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                      ->orWhere('description', 'like', '%' . $search . '%');
                });
            }

            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            $categories = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Equipment categories retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve equipment categories: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created equipment category.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:equipment_categories',
                'description' => 'nullable|string',
                'parent_id' => 'nullable|exists:equipment_categories,id',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $category = EquipmentCategory::create($request->validated());
            $category->load(['parent', 'children']);

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Equipment category created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create equipment category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified equipment category.
     */
    public function show(EquipmentCategory $equipmentCategory): JsonResponse
    {
        try {
            $equipmentCategory->load(['parent', 'children', 'equipment']);

            return response()->json([
                'success' => true,
                'data' => $equipmentCategory,
                'message' => 'Equipment category retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve equipment category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified equipment category.
     */
    public function update(Request $request, EquipmentCategory $equipmentCategory): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255|unique:equipment_categories,name,' . $equipmentCategory->id,
                'description' => 'nullable|string',
                'parent_id' => 'nullable|exists:equipment_categories,id',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $equipmentCategory->update($request->validated());
            $equipmentCategory->load(['parent', 'children']);

            return response()->json([
                'success' => true,
                'data' => $equipmentCategory,
                'message' => 'Equipment category updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update equipment category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified equipment category.
     */
    public function destroy(EquipmentCategory $equipmentCategory): JsonResponse
    {
        try {
            // Check if category has equipment
            if ($equipmentCategory->equipment()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with existing equipment'
                ], 422);
            }

            // Check if category has children
            if ($equipmentCategory->children()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with subcategories'
                ], 422);
            }

            $equipmentCategory->delete();

            return response()->json([
                'success' => true,
                'message' => 'Equipment category deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete equipment category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category tree structure.
     */
    public function tree(): JsonResponse
    {
        try {
            $categories = EquipmentCategory::with(['children', 'equipment'])
                ->whereNull('parent_id')
                ->where('is_active', true)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Category tree retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve category tree: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all active categories for dropdown.
     */
    public function active(): JsonResponse
    {
        try {
            $categories = EquipmentCategory::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'parent_id']);

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Active categories retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve active categories: ' . $e->getMessage()
            ], 500);
        }
    }
}
