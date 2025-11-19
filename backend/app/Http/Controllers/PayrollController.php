<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PayrollController extends Controller
{
    /**
     * Display a listing of payroll records.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Payroll::with(['employee.user', 'employee.department', 'processor']);

            // Apply filters
            if ($request->has('employee_id')) {
                $query->where('employee_id', $request->employee_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('payroll_period')) {
                $query->where('payroll_period', $request->payroll_period);
            }

            if ($request->has('date_from')) {
                $query->whereDate('pay_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('pay_date', '<=', $request->date_to);
            }

            if ($request->has('department_id')) {
                $query->whereHas('employee', function ($q) use ($request) {
                    $q->where('department_id', $request->department_id);
                });
            }

            $payroll = $query->orderBy('pay_date', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $payroll
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load payroll records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created payroll record.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'payroll_period' => 'required|string|max:255',
            'pay_date' => 'required|date',
            'basic_salary' => 'required|numeric|min:0',
            'overtime_pay' => 'nullable|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'tax_deduction' => 'nullable|numeric|min:0',
            'insurance_deduction' => 'nullable|numeric|min:0',
            'other_deductions' => 'nullable|numeric|min:0',
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
            // Check if payroll record already exists for this period
            $existingPayroll = Payroll::where('employee_id', $request->employee_id)
                ->where('payroll_period', $request->payroll_period)
                ->first();

            if ($existingPayroll) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payroll record already exists for this period'
                ], 400);
            }

            $payroll = Payroll::create($request->all());

            // Calculate totals
            $payroll->calculateNetSalary();
            $payroll->save();

            return response()->json([
                'success' => true,
                'message' => 'Payroll record created successfully',
                'data' => $payroll->load(['employee.user', 'employee.department'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payroll record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified payroll record.
     */
    public function show(Payroll $payroll): JsonResponse
    {
        $payroll->load(['employee.user', 'employee.department', 'processor']);

        return response()->json([
            'success' => true,
            'data' => $payroll
        ]);
    }

    /**
     * Update the specified payroll record.
     */
    public function update(Request $request, Payroll $payroll): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'basic_salary' => 'sometimes|required|numeric|min:0',
            'overtime_pay' => 'nullable|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'tax_deduction' => 'nullable|numeric|min:0',
            'insurance_deduction' => 'nullable|numeric|min:0',
            'other_deductions' => 'nullable|numeric|min:0',
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
            // Only allow updates for draft payroll
            if (!$payroll->isDraft()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update non-draft payroll record'
                ], 400);
            }

            $payroll->update($request->all());

            // Recalculate totals
            $payroll->calculateNetSalary();
            $payroll->save();

            return response()->json([
                'success' => true,
                'message' => 'Payroll record updated successfully',
                'data' => $payroll->load(['employee.user', 'employee.department'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payroll record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified payroll record.
     */
    public function destroy(Payroll $payroll): JsonResponse
    {
        try {
            // Only allow deletion of draft payroll
            if (!$payroll->isDraft()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete non-draft payroll record'
                ], 400);
            }

            $payroll->delete();

            return response()->json([
                'success' => true,
                'message' => 'Payroll record deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete payroll record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve payroll record.
     */
    public function approve(Payroll $payroll): JsonResponse
    {
        try {
            if (!$payroll->isDraft()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft payroll records can be approved'
                ], 400);
            }

            $payroll->approve(auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Payroll record approved successfully',
                'data' => $payroll->load(['employee.user', 'employee.department', 'processor'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve payroll record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark payroll as paid.
     */
    public function markAsPaid(Payroll $payroll): JsonResponse
    {
        try {
            if (!$payroll->isApproved()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only approved payroll records can be marked as paid'
                ], 400);
            }

            $payroll->markAsPaid(auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Payroll record marked as paid successfully',
                'data' => $payroll->load(['employee.user', 'employee.department', 'processor'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark payroll as paid',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate payroll for all employees.
     */
    public function generatePayroll(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'payroll_period' => 'required|string|max:255',
            'pay_date' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $employees = Employee::active()->get();
            $generatedCount = 0;

            foreach ($employees as $employee) {
                // Check if payroll already exists for this period
                $existingPayroll = Payroll::where('employee_id', $employee->id)
                    ->where('payroll_period', $request->payroll_period)
                    ->first();

                if (!$existingPayroll) {
                    $payroll = Payroll::create([
                        'employee_id' => $employee->id,
                        'payroll_period' => $request->payroll_period,
                        'pay_date' => $request->pay_date,
                        'basic_salary' => $employee->salary,
                        'overtime_pay' => 0,
                        'bonus' => 0,
                        'allowances' => 0,
                        'tax_deduction' => 0,
                        'insurance_deduction' => 0,
                        'other_deductions' => 0
                    ]);

                    $payroll->calculateNetSalary();
                    $payroll->save();
                    $generatedCount++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Payroll generated successfully for {$generatedCount} employees",
                'data' => ['generated_count' => $generatedCount]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate payroll',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payroll analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'total_payroll' => Payroll::where('pay_date', '>=', $startDate)->count(),
                'draft_payroll' => Payroll::where('pay_date', '>=', $startDate)->draft()->count(),
                'approved_payroll' => Payroll::where('pay_date', '>=', $startDate)->approved()->count(),
                'paid_payroll' => Payroll::where('pay_date', '>=', $startDate)->paid()->count(),
                'total_gross_salary' => Payroll::where('pay_date', '>=', $startDate)->sum('gross_salary'),
                'total_net_salary' => Payroll::where('pay_date', '>=', $startDate)->sum('net_salary'),
                'total_deductions' => Payroll::where('pay_date', '>=', $startDate)->sum('total_deductions'),
                'average_salary' => Payroll::where('pay_date', '>=', $startDate)->avg('net_salary'),
                'payroll_periods' => Payroll::where('pay_date', '>=', $startDate)
                    ->selectRaw('payroll_period, COUNT(*) as count, SUM(net_salary) as total_salary')
                    ->groupBy('payroll_period')
                    ->orderBy('payroll_period', 'desc')
                    ->get(),
                'department_payroll' => Payroll::with('employee.department')
                    ->where('pay_date', '>=', $startDate)
                    ->selectRaw('employee_id, SUM(net_salary) as total_salary')
                    ->groupBy('employee_id')
                    ->get()
                    ->groupBy('employee.department.name')
                    ->map(function ($payrolls) {
                        return [
                            'total_salary' => $payrolls->sum('total_salary'),
                            'employee_count' => $payrolls->count()
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