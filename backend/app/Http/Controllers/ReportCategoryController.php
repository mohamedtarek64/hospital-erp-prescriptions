<?php

namespace App\Http\Controllers;

use App\Models\ReportCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ReportCategoryController extends Controller
{
    /**
     * Display a listing of report categories.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = ReportCategory::with(['reports']);

            // Apply filters
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            $categories = $query->ordered()->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load report categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created report category.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $category = ReportCategory::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Report category created successfully',
                'data' => $category->load(['reports'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create report category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified report category.
     */
    public function show(ReportCategory $reportCategory): JsonResponse
    {
        $reportCategory->load(['reports']);

        return response()->json([
            'success' => true,
            'data' => $reportCategory
        ]);
    }

    /**
     * Update the specified report category.
     */
    public function update(Request $request, ReportCategory $reportCategory): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $reportCategory->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Report category updated successfully',
                'data' => $reportCategory->load(['reports'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update report category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified report category.
     */
    public function destroy(ReportCategory $reportCategory): JsonResponse
    {
        try {
            // Check if category has reports
            if ($reportCategory->reports()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with existing reports'
                ], 400);
            }

            $reportCategory->delete();

            return response()->json([
                'success' => true,
                'message' => 'Report category deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete report category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all active categories for dropdown.
     */
    public function getActiveCategories(): JsonResponse
    {
        try {
            $categories = ReportCategory::active()->ordered()->get();

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
