<?php

namespace App\Http\Controllers;

use App\Models\LabTestCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class LabTestCategoryController extends Controller
{
    /**
     * Display a listing of lab test categories.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = LabTestCategory::with(['labTests']);

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
                'message' => 'Failed to load lab test categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created lab test category.
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
            $category = LabTestCategory::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Lab test category created successfully',
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create lab test category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified lab test category.
     */
    public function show(LabTestCategory $labTestCategory): JsonResponse
    {
        $labTestCategory->load(['labTests']);

        return response()->json([
            'success' => true,
            'data' => $labTestCategory
        ]);
    }

    /**
     * Update the specified lab test category.
     */
    public function update(Request $request, LabTestCategory $labTestCategory): JsonResponse
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
            $labTestCategory->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Lab test category updated successfully',
                'data' => $labTestCategory
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update lab test category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified lab test category.
     */
    public function destroy(LabTestCategory $labTestCategory): JsonResponse
    {
        try {
            // Check if category has lab tests
            if ($labTestCategory->labTests()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with existing lab tests'
                ], 400);
            }

            $labTestCategory->delete();

            return response()->json([
                'success' => true,
                'message' => 'Lab test category deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete lab test category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
