<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Department::with(['head', 'employees']);

            // Apply filters
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('head_id')) {
                $query->where('head_id', $request->head_id);
            }

            $departments = $query->orderBy('name')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $departments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load departments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created department.
     */
    public function store(Request $request): JsonResponse
    {
            $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
                'description' => 'nullable|string',
            'code' => 'required|string|max:255|unique:departments,code',
                'head_id' => 'nullable|exists:users,id',
            'budget' => 'nullable|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

        try {
            $department = Department::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Department created successfully',
                'data' => $department->load(['head', 'employees'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified department.
     */
    public function show(Department $department): JsonResponse
    {
        $department->load(['head', 'employees.user']);

            return response()->json([
                'success' => true,
            'data' => $department
        ]);
    }

    /**
     * Update the specified department.
     */
    public function update(Request $request, Department $department): JsonResponse
    {
            $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
            'code' => 'sometimes|required|string|max:255|unique:departments,code,' . $department->id,
                'head_id' => 'nullable|exists:users,id',
                'budget' => 'nullable|numeric|min:0',
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
            $department->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Department updated successfully',
                'data' => $department->load(['head', 'employees'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified department.
     */
    public function destroy(Department $department): JsonResponse
    {
        try {
            // Check if department has employees
            if ($department->employees()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete department with existing employees'
                ], 400);
            }

            $department->delete();

            return response()->json([
                'success' => true,
                'message' => 'Department deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete department',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get department analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $analytics = [
                'total_departments' => Department::count(),
                'active_departments' => Department::active()->count(),
                'inactive_departments' => Department::inactive()->count(),
                'departments_with_heads' => Department::whereNotNull('head_id')->count(),
                'departments_without_heads' => Department::whereNull('head_id')->count(),
                'total_budget' => Department::sum('budget'),
                'average_budget' => Department::avg('budget'),
                'department_employee_counts' => Department::withCount('employees')
                    ->orderBy('employees_count', 'desc')
                    ->get()
                    ->map(function ($dept) {
                        return [
                            'name' => $dept->name,
                            'employee_count' => $dept->employees_count
                        ];
                    })
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
