<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Employee::with(['user', 'department']);

            // Apply filters
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('employee_id', 'like', "%{$search}%")
                      ->orWhere('position', 'like', "%{$search}%")
                      ->orWhere('job_title', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->has('department_id')) {
                $query->where('department_id', $request->department_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('employment_type')) {
                $query->where('employment_type', $request->employment_type);
            }

            if ($request->has('work_schedule')) {
                $query->where('work_schedule', $request->work_schedule);
            }

            $employees = $query->orderBy('hire_date', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $employees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load employees',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created employee.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id|unique:employees,user_id',
            'department_id' => 'required|exists:departments,id',
            'position' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
            'hire_date' => 'required|date',
            'salary' => 'required|numeric|min:0',
            'employment_type' => 'required|in:full_time,part_time,contract,temporary',
            'work_schedule' => 'required|in:day_shift,night_shift,rotating,flexible',
            'emergency_contact_name' => 'nullable|string',
            'emergency_contact_phone' => 'nullable|string',
            'emergency_contact_relationship' => 'nullable|string',
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
            $employee = Employee::create([
                'user_id' => $request->user_id,
                'employee_id' => Employee::generateEmployeeId(),
                'department_id' => $request->department_id,
                'position' => $request->position,
                'job_title' => $request->job_title,
                'hire_date' => $request->hire_date,
                'salary' => $request->salary,
                'employment_type' => $request->employment_type,
                'work_schedule' => $request->work_schedule,
                'emergency_contact_name' => $request->emergency_contact_name,
                'emergency_contact_phone' => $request->emergency_contact_phone,
                'emergency_contact_relationship' => $request->emergency_contact_relationship,
                'notes' => $request->notes
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Employee created successfully',
                'data' => $employee->load(['user', 'department'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified employee.
     */
    public function show(Employee $employee): JsonResponse
    {
        $employee->load(['user', 'department', 'attendance', 'leaveRequests.leaveType', 'payroll']);

        return response()->json([
            'success' => true,
            'data' => $employee
        ]);
    }

    /**
     * Update the specified employee.
     */
    public function update(Request $request, Employee $employee): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'department_id' => 'sometimes|required|exists:departments,id',
            'position' => 'sometimes|required|string|max:255',
            'job_title' => 'sometimes|required|string|max:255',
            'hire_date' => 'sometimes|required|date',
            'termination_date' => 'nullable|date|after:hire_date',
            'salary' => 'sometimes|required|numeric|min:0',
            'employment_type' => 'sometimes|required|in:full_time,part_time,contract,temporary',
            'work_schedule' => 'sometimes|required|in:day_shift,night_shift,rotating,flexible',
            'status' => 'sometimes|in:active,inactive,terminated,on_leave',
            'emergency_contact_name' => 'nullable|string',
            'emergency_contact_phone' => 'nullable|string',
            'emergency_contact_relationship' => 'nullable|string',
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
            $employee->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Employee updated successfully',
                'data' => $employee->load(['user', 'department'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified employee.
     */
    public function destroy(Employee $employee): JsonResponse
    {
        try {
            // Check if employee has attendance records or payroll
            if ($employee->attendance()->count() > 0 || $employee->payroll()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete employee with existing attendance or payroll records'
                ], 400);
            }

            $employee->delete();

            return response()->json([
                'success' => true,
                'message' => 'Employee deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Terminate employee.
     */
    public function terminate(Request $request, Employee $employee): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'termination_date' => 'required|date|after:hire_date',
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
            $employee->update([
                'status' => 'terminated',
                'termination_date' => $request->termination_date,
                'notes' => $request->notes ?? $employee->notes
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Employee terminated successfully',
                'data' => $employee->load(['user', 'department'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to terminate employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get employee analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $analytics = [
                'total_employees' => Employee::count(),
                'active_employees' => Employee::active()->count(),
                'inactive_employees' => Employee::inactive()->count(),
                'terminated_employees' => Employee::terminated()->count(),
                'employees_on_leave' => Employee::onLeave()->count(),
                'full_time_employees' => Employee::fullTime()->count(),
                'part_time_employees' => Employee::partTime()->count(),
                'average_salary' => Employee::active()->avg('salary'),
                'total_salary_budget' => Employee::active()->sum('salary'),
                'employment_types' => Employee::selectRaw('employment_type, COUNT(*) as count')
                    ->groupBy('employment_type')
                    ->get(),
                'work_schedules' => Employee::selectRaw('work_schedule, COUNT(*) as count')
                    ->groupBy('work_schedule')
                    ->get(),
                'department_distribution' => Employee::with('department')
                    ->selectRaw('department_id, COUNT(*) as count')
                    ->groupBy('department_id')
                    ->get()
                    ->map(function ($emp) {
                        return [
                            'department' => $emp->department->name ?? 'Unknown',
                            'count' => $emp->count
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