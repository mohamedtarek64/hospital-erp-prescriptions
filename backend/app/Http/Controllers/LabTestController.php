<?php

namespace App\Http\Controllers;

use App\Models\LabTest;
use App\Models\LabTestCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class LabTestController extends Controller
{
    /**
     * Display a listing of lab tests.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = LabTest::with(['category']);

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

            $labTests = $query->orderBy('name')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $labTests
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load lab tests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created lab test.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:lab_test_categories,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:lab_tests,code',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'turnaround_time_hours' => 'required|integer|min:1',
            'preparation_instructions' => 'nullable|string',
            'normal_range' => 'nullable|string',
            'unit' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $labTest = LabTest::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Lab test created successfully',
                'data' => $labTest->load(['category'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create lab test',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified lab test.
     */
    public function show(LabTest $labTest): JsonResponse
    {
        $labTest->load(['category', 'labRequestItems.labRequest.patient']);

        return response()->json([
            'success' => true,
            'data' => $labTest
        ]);
    }

    /**
     * Update the specified lab test.
     */
    public function update(Request $request, LabTest $labTest): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|exists:lab_test_categories,id',
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:lab_tests,code,' . $labTest->id,
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'turnaround_time_hours' => 'sometimes|required|integer|min:1',
            'preparation_instructions' => 'nullable|string',
            'normal_range' => 'nullable|string',
            'unit' => 'nullable|string|max:255',
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
            $labTest->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Lab test updated successfully',
                'data' => $labTest->load(['category'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update lab test',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified lab test.
     */
    public function destroy(LabTest $labTest): JsonResponse
    {
        try {
            // Check if lab test has request items
            if ($labTest->labRequestItems()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete lab test with existing request items'
                ], 400);
            }

            $labTest->delete();

            return response()->json([
                'success' => true,
                'message' => 'Lab test deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete lab test',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lab test categories.
     */
    public function getCategories(): JsonResponse
    {
        try {
            $categories = LabTestCategory::active()->orderBy('name')->get();

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
     * Get lab tests by category.
     */
    public function getByCategory(LabTestCategory $category): JsonResponse
    {
        try {
            $labTests = $category->labTests()->active()->orderBy('name')->get();

            return response()->json([
                'success' => true,
                'data' => $labTests
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load lab tests',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
