<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class LeaveController extends Controller
{
    /**
     * Display a listing of leave requests.
     */
    public function index(Request $request): JsonResponse
    {
        $query = LeaveRequest::with(['employee.user', 'leaveType', 'approver']);

        // Filter by employee
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by leave type
        if ($request->has('leave_type_id')) {
            $query->where('leave_type_id', $request->leave_type_id);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('start_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('end_date', '<=', $request->date_to);
        }

        // Filter by department
        if ($request->has('department_id')) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('department_id', $request->department_id);
            });
        }

        $leaveRequests = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $leaveRequests
        ]);
    }

    /**
     * Store a newly created leave request.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Calculate working days
            $workingDays = $this->calculateWorkingDays($request->start_date, $request->end_date);

            $leaveRequest = LeaveRequest::create([
                'employee_id' => $request->employee_id,
                'leave_type_id' => $request->leave_type_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'days_requested' => $workingDays,
                'reason' => $request->reason,
            ]);

            // Check for conflicts
            if ($leaveRequest->hasConflict()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Leave request conflicts with existing approved leave',
                    'data' => $leaveRequest->load(['employee.user', 'leaveType'])
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Leave request created successfully',
                'data' => $leaveRequest->load(['employee.user', 'leaveType'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create leave request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified leave request.
     */
    public function show(LeaveRequest $leaveRequest): JsonResponse
    {
        $leaveRequest->load(['employee.user', 'leaveType', 'approver']);

        return response()->json([
            'success' => true,
            'data' => $leaveRequest
        ]);
    }

    /**
     * Update the specified leave request.
     */
    public function update(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'reason' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update non-pending leave request'
            ], 400);
        }

        try {
            $data = $request->only(['start_date', 'end_date', 'reason']);

            // Recalculate working days if dates are updated
            if (isset($data['start_date']) || isset($data['end_date'])) {
                $startDate = $data['start_date'] ?? $leaveRequest->start_date;
                $endDate = $data['end_date'] ?? $leaveRequest->end_date;
                $data['days_requested'] = $this->calculateWorkingDays($startDate, $endDate);
            }

            $leaveRequest->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Leave request updated successfully',
                'data' => $leaveRequest->load(['employee.user', 'leaveType'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update leave request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified leave request.
     */
    public function destroy(LeaveRequest $leaveRequest): JsonResponse
    {
        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete non-pending leave request'
            ], 400);
        }

        try {
            $leaveRequest->delete();

            return response()->json([
                'success' => true,
                'message' => 'Leave request deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete leave request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve a leave request.
     */
    public function approve(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'approval_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Leave request is not pending'
            ], 400);
        }

        try {
            $leaveRequest->approve(auth()->id(), $request->approval_notes);

            return response()->json([
                'success' => true,
                'message' => 'Leave request approved successfully',
                'data' => $leaveRequest->load(['employee.user', 'leaveType', 'approver'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve leave request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a leave request.
     */
    public function reject(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'approval_notes' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Leave request is not pending'
            ], 400);
        }

        try {
            $leaveRequest->reject(auth()->id(), $request->approval_notes);

            return response()->json([
                'success' => true,
                'message' => 'Leave request rejected successfully',
                'data' => $leaveRequest->load(['employee.user', 'leaveType', 'approver'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject leave request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get leave types.
     */
    public function getLeaveTypes(): JsonResponse
    {
        $leaveTypes = LeaveType::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $leaveTypes
        ]);
    }

    /**
     * Get leave statistics.
     */
    public function getStatistics(Request $request): JsonResponse
    {
        $year = $request->year ?? now()->year;

        $stats = [
            'total_requests' => LeaveRequest::whereYear('start_date', $year)->count(),
            'pending_requests' => LeaveRequest::whereYear('start_date', $year)->pending()->count(),
            'approved_requests' => LeaveRequest::whereYear('start_date', $year)->approved()->count(),
            'rejected_requests' => LeaveRequest::whereYear('start_date', $year)->rejected()->count(),
            'total_days_taken' => LeaveRequest::whereYear('start_date', $year)->approved()->sum('days_requested'),
            'by_leave_type' => LeaveRequest::with('leaveType')
                ->whereYear('start_date', $year)
                ->approved()
                ->selectRaw('leave_type_id, SUM(days_requested) as total_days')
                ->groupBy('leave_type_id')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Calculate working days between two dates.
     */
    private function calculateWorkingDays($startDate, $endDate)
    {
        $start = \Carbon\Carbon::parse($startDate);
        $end = \Carbon\Carbon::parse($endDate);
        
        $workingDays = 0;
        while ($start->lte($end)) {
            if ($start->isWeekday()) {
                $workingDays++;
            }
            $start->addDay();
        }
        
        return $workingDays;
    }
}
