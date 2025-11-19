<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class LeaveRequestController extends Controller
{
    /**
     * Display a listing of leave requests.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = LeaveRequest::with(['employee.user', 'employee.department', 'leaveType', 'approver']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('employee_id')) {
                $query->where('employee_id', $request->employee_id);
            }

            if ($request->has('leave_type_id')) {
                $query->where('leave_type_id', $request->leave_type_id);
            }

            if ($request->has('date_from')) {
                $query->whereDate('start_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('end_date', '<=', $request->date_to);
            }

            if ($request->has('department_id')) {
                $query->whereHas('employee', function ($q) use ($request) {
                    $q->where('department_id', $request->department_id);
                });
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->whereHas('employee.user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                                 ->orWhere('email', 'like', "%{$search}%");
                    });
                });
            }

            $leaveRequests = $query->orderBy('start_date', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $leaveRequests
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load leave requests',
                'error' => $e->getMessage()
            ], 500);
        }
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
            'reason' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Calculate total days
            $startDate = \Carbon\Carbon::parse($request->start_date);
            $endDate = \Carbon\Carbon::parse($request->end_date);
            $totalDays = $startDate->diffInDays($endDate) + 1;

            // Check if employee has enough leave balance
            $leaveType = LeaveType::find($request->leave_type_id);
            if ($leaveType->max_days_per_year) {
                $usedDays = LeaveRequest::where('employee_id', $request->employee_id)
                    ->where('leave_type_id', $request->leave_type_id)
                    ->where('status', 'approved')
                    ->whereYear('start_date', now()->year)
                    ->sum('total_days');

                if (($usedDays + $totalDays) > $leaveType->max_days_per_year) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Insufficient leave balance'
                    ], 400);
                }
            }

            // Check for overlapping leave requests
            $overlappingRequest = LeaveRequest::where('employee_id', $request->employee_id)
                ->where('status', '!=', 'rejected')
                ->where('status', '!=', 'cancelled')
                ->where(function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('start_date', [$startDate, $endDate])
                      ->orWhereBetween('end_date', [$startDate, $endDate])
                      ->orWhere(function ($subQ) use ($startDate, $endDate) {
                          $subQ->where('start_date', '<=', $startDate)
                               ->where('end_date', '>=', $endDate);
                      });
                })
                ->first();

            if ($overlappingRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'Overlapping leave request exists'
                ], 400);
            }

            $leaveRequest = LeaveRequest::create([
                'employee_id' => $request->employee_id,
                'leave_type_id' => $request->leave_type_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'total_days' => $totalDays,
                'reason' => $request->reason
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Leave request created successfully',
                'data' => $leaveRequest->load(['employee.user', 'employee.department', 'leaveType'])
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
        $leaveRequest->load(['employee.user', 'employee.department', 'leaveType', 'approver']);

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
            'start_date' => 'sometimes|required|date|after_or_equal:today',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'reason' => 'sometimes|required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Only allow updates for pending requests
            if (!$leaveRequest->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update non-pending leave request'
                ], 400);
            }

            $data = $request->all();

            // Recalculate total days if dates are updated
            if ($request->has('start_date') || $request->has('end_date')) {
                $startDate = \Carbon\Carbon::parse($request->start_date ?? $leaveRequest->start_date);
                $endDate = \Carbon\Carbon::parse($request->end_date ?? $leaveRequest->end_date);
                $data['total_days'] = $startDate->diffInDays($endDate) + 1;
            }

            $leaveRequest->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Leave request updated successfully',
                'data' => $leaveRequest->load(['employee.user', 'employee.department', 'leaveType'])
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
        try {
            // Only allow deletion of pending requests
            if (!$leaveRequest->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete non-pending leave request'
                ], 400);
            }

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
     * Approve leave request.
     */
    public function approve(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'approval_notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            if (!$leaveRequest->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending leave requests can be approved'
                ], 400);
            }

            $leaveRequest->approve(auth()->id(), $request->approval_notes);

            return response()->json([
                'success' => true,
                'message' => 'Leave request approved successfully',
                'data' => $leaveRequest->load(['employee.user', 'employee.department', 'leaveType', 'approver'])
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
     * Reject leave request.
     */
    public function reject(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            if (!$leaveRequest->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending leave requests can be rejected'
                ], 400);
            }

            $leaveRequest->reject(auth()->id(), $request->rejection_reason);

            return response()->json([
                'success' => true,
                'message' => 'Leave request rejected successfully',
                'data' => $leaveRequest->load(['employee.user', 'employee.department', 'leaveType', 'approver'])
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
     * Cancel leave request.
     */
    public function cancel(LeaveRequest $leaveRequest): JsonResponse
    {
        try {
            if (!$leaveRequest->isPending() && !$leaveRequest->isApproved()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending or approved leave requests can be cancelled'
                ], 400);
            }

            $leaveRequest->cancel();

            return response()->json([
                'success' => true,
                'message' => 'Leave request cancelled successfully',
                'data' => $leaveRequest->load(['employee.user', 'employee.department', 'leaveType'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel leave request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get leave request analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'total_requests' => LeaveRequest::where('created_at', '>=', $startDate)->count(),
                'pending_requests' => LeaveRequest::where('created_at', '>=', $startDate)->pending()->count(),
                'approved_requests' => LeaveRequest::where('created_at', '>=', $startDate)->approved()->count(),
                'rejected_requests' => LeaveRequest::where('created_at', '>=', $startDate)->rejected()->count(),
                'cancelled_requests' => LeaveRequest::where('created_at', '>=', $startDate)->cancelled()->count(),
                'approval_rate' => LeaveRequest::where('created_at', '>=', $startDate)->count() > 0 
                    ? (LeaveRequest::where('created_at', '>=', $startDate)->approved()->count() / LeaveRequest::where('created_at', '>=', $startDate)->count()) * 100 
                    : 0,
                'total_days_requested' => LeaveRequest::where('created_at', '>=', $startDate)->sum('total_days'),
                'leave_types' => LeaveRequest::with('leaveType')
                    ->where('created_at', '>=', $startDate)
                    ->selectRaw('leave_type_id, COUNT(*) as count, SUM(total_days) as total_days')
                    ->groupBy('leave_type_id')
                    ->get()
                    ->map(function ($req) {
                        return [
                            'leave_type' => $req->leaveType->name ?? 'Unknown',
                            'count' => $req->count,
                            'total_days' => $req->total_days
                        ];
                    }),
                'daily_requests' => LeaveRequest::where('created_at', '>=', $startDate)
                    ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
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
