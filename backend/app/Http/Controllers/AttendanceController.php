<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /**
     * Display a listing of attendance records.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Attendance::with(['employee.user', 'employee.department']);

            // Apply filters
            if ($request->has('employee_id')) {
                $query->where('employee_id', $request->employee_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('date_from')) {
                $query->whereDate('date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('date', '<=', $request->date_to);
            }

            if ($request->has('department_id')) {
                $query->whereHas('employee', function ($q) use ($request) {
                    $q->where('department_id', $request->department_id);
                });
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('employee_id', 'like', "%{$search}%")
                      ->orWhereHas('employee.user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            $attendance = $query->orderBy('date', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $attendance
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load attendance records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created attendance record.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i|after:check_in',
            'break_start' => 'nullable|date_format:H:i',
            'break_end' => 'nullable|date_format:H:i|after:break_start',
            'status' => 'required|in:present,absent,late,half_day,on_leave',
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
            // Check if attendance record already exists for this date
            $existingAttendance = Attendance::where('employee_id', $request->employee_id)
                ->whereDate('date', $request->date)
                ->first();

            if ($existingAttendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attendance record already exists for this date'
                ], 400);
            }

            $attendance = Attendance::create($request->all());

            // Calculate total hours if check_in and check_out are provided
            if ($attendance->check_in && $attendance->check_out) {
                $attendance->calculateTotalHours();
                $attendance->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Attendance record created successfully',
                'data' => $attendance->load(['employee.user', 'employee.department'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create attendance record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified attendance record.
     */
    public function show(Attendance $attendance): JsonResponse
    {
        $attendance->load(['employee.user', 'employee.department']);

        return response()->json([
            'success' => true,
            'data' => $attendance
        ]);
    }

    /**
     * Update the specified attendance record.
     */
    public function update(Request $request, Attendance $attendance): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i|after:check_in',
            'break_start' => 'nullable|date_format:H:i',
            'break_end' => 'nullable|date_format:H:i|after:break_start',
            'status' => 'sometimes|in:present,absent,late,half_day,on_leave',
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
            $attendance->update($request->all());

            // Recalculate total hours if check_in and check_out are provided
            if ($attendance->check_in && $attendance->check_out) {
                $attendance->calculateTotalHours();
                $attendance->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Attendance record updated successfully',
                'data' => $attendance->load(['employee.user', 'employee.department'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update attendance record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified attendance record.
     */
    public function destroy(Attendance $attendance): JsonResponse
    {
        try {
            $attendance->delete();

            return response()->json([
                'success' => true,
                'message' => 'Attendance record deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete attendance record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check in employee.
     */
    public function checkIn(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $attendance = Attendance::firstOrCreate(
                [
                    'employee_id' => $request->employee_id,
                    'date' => $request->date
                ],
                [
                    'check_in' => now()->format('H:i'),
                    'status' => 'present'
                ]
            );

            if ($attendance->wasRecentlyCreated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Checked in successfully',
                    'data' => $attendance->load(['employee.user'])
                ], 201);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Already checked in for this date'
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check in',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check out employee.
     */
    public function checkOut(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $attendance = Attendance::where('employee_id', $request->employee_id)
                ->whereDate('date', $request->date)
                ->first();

            if (!$attendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'No check-in record found for this date'
                ], 400);
            }

            if ($attendance->check_out) {
                return response()->json([
                    'success' => false,
                    'message' => 'Already checked out for this date'
                ], 400);
            }

            $attendance->update([
                'check_out' => now()->format('H:i')
            ]);

            // Calculate total hours
            $attendance->calculateTotalHours();
            $attendance->save();

            return response()->json([
                'success' => true,
                'message' => 'Checked out successfully',
                'data' => $attendance->load(['employee.user'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check out',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'total_records' => Attendance::where('date', '>=', $startDate)->count(),
                'present_count' => Attendance::where('date', '>=', $startDate)->present()->count(),
                'absent_count' => Attendance::where('date', '>=', $startDate)->absent()->count(),
                'late_count' => Attendance::where('date', '>=', $startDate)->late()->count(),
                'half_day_count' => Attendance::where('date', '>=', $startDate)->halfDay()->count(),
                'on_leave_count' => Attendance::where('date', '>=', $startDate)->onLeave()->count(),
                'attendance_rate' => Attendance::where('date', '>=', $startDate)->count() > 0 
                    ? (Attendance::where('date', '>=', $startDate)->present()->count() / Attendance::where('date', '>=', $startDate)->count()) * 100 
                    : 0,
                'total_hours_worked' => Attendance::where('date', '>=', $startDate)->sum('total_hours') / 60, // Convert to hours
                'total_overtime_hours' => Attendance::where('date', '>=', $startDate)->sum('overtime_hours') / 60, // Convert to hours
                'daily_attendance' => Attendance::where('date', '>=', $startDate)
                    ->selectRaw('DATE(date) as date, COUNT(*) as total, SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
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