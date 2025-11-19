<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\Payroll;
use App\Models\PerformanceReview;
use Illuminate\Support\Facades\DB;

class HRService
{
    /**
     * Generate a unique employee ID.
     */
    public function generateEmployeeId(): string
    {
        $year = now()->year;
        $lastEmployee = Employee::where('employee_id', 'like', "EMP{$year}%")
            ->orderBy('employee_id', 'desc')
            ->first();

        if ($lastEmployee) {
            $lastNumber = (int) substr($lastEmployee->employee_id, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return "EMP{$year}" . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get HR dashboard statistics.
     */
    public function getDashboardStats(): array
    {
        return [
            'total_employees' => Employee::count(),
            'active_employees' => Employee::active()->count(),
            'new_employees_this_month' => Employee::whereMonth('hire_date', now()->month)
                ->whereYear('hire_date', now()->year)
                ->count(),
            'attendance_today' => Attendance::whereDate('date', today())
                ->where('status', 'present')
                ->count(),
            'pending_leave_requests' => LeaveRequest::pending()->count(),
            'pending_payrolls' => Payroll::draft()->count(),
            'average_performance_rating' => PerformanceReview::avg('overall_rating'),
        ];
    }

    /**
     * Get employee performance summary.
     */
    public function getEmployeePerformanceSummary($employeeId): array
    {
        $employee = Employee::findOrFail($employeeId);

        $reviews = PerformanceReview::where('employee_id', $employeeId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $averageRating = PerformanceReview::where('employee_id', $employeeId)
            ->avg('overall_rating');

        $attendanceRate = $this->calculateAttendanceRate($employeeId);

        return [
            'employee' => $employee->load('user'),
            'average_rating' => round($averageRating, 2),
            'attendance_rate' => $attendanceRate,
            'recent_reviews' => $reviews,
            'total_reviews' => PerformanceReview::where('employee_id', $employeeId)->count(),
        ];
    }

    /**
     * Calculate employee attendance rate.
     */
    public function calculateAttendanceRate($employeeId, $months = 3): float
    {
        $startDate = now()->subMonths($months)->startOfMonth();
        $endDate = now()->endOfMonth();

        $totalWorkingDays = Attendance::where('employee_id', $employeeId)
            ->whereBetween('date', [$startDate, $endDate])
            ->count();

        $presentDays = Attendance::where('employee_id', $employeeId)
            ->whereBetween('date', [$startDate, $endDate])
            ->whereIn('status', ['present', 'late'])
            ->count();

        if ($totalWorkingDays === 0) {
            return 0;
        }

        return round(($presentDays / $totalWorkingDays) * 100, 2);
    }

    /**
     * Get department performance summary.
     */
    public function getDepartmentPerformanceSummary($departmentId): array
    {
        $employees = Employee::where('department_id', $departmentId)->get();

        $summary = [
            'total_employees' => $employees->count(),
            'average_performance_rating' => 0,
            'high_performers' => 0,
            'low_performers' => 0,
            'average_attendance_rate' => 0,
        ];

        if ($employees->count() > 0) {
            $totalRating = 0;
            $totalAttendanceRate = 0;
            $highPerformers = 0;
            $lowPerformers = 0;

            foreach ($employees as $employee) {
                $rating = PerformanceReview::where('employee_id', $employee->id)
                    ->avg('overall_rating');
                
                if ($rating) {
                    $totalRating += $rating;
                    if ($rating >= 4) $highPerformers++;
                    if ($rating <= 2) $lowPerformers++;
                }

                $attendanceRate = $this->calculateAttendanceRate($employee->id);
                $totalAttendanceRate += $attendanceRate;
            }

            $summary['average_performance_rating'] = round($totalRating / $employees->count(), 2);
            $summary['high_performers'] = $highPerformers;
            $summary['low_performers'] = $lowPerformers;
            $summary['average_attendance_rate'] = round($totalAttendanceRate / $employees->count(), 2);
        }

        return $summary;
    }

    /**
     * Get leave balance for an employee.
     */
    public function getLeaveBalance($employeeId, $year = null): array
    {
        $year = $year ?? now()->year;

        $leaveTypes = \App\Models\LeaveType::all();
        $balances = [];

        foreach ($leaveTypes as $leaveType) {
            $usedDays = LeaveRequest::where('employee_id', $employeeId)
                ->where('leave_type_id', $leaveType->id)
                ->whereYear('start_date', $year)
                ->where('status', 'approved')
                ->sum('days_requested');

            $balances[] = [
                'leave_type' => $leaveType,
                'allowed_days' => $leaveType->days_allowed,
                'used_days' => $usedDays,
                'remaining_days' => max(0, $leaveType->days_allowed - $usedDays),
            ];
        }

        return $balances;
    }

    /**
     * Get payroll summary for a period.
     */
    public function getPayrollSummary($payPeriod): array
    {
        $payrolls = Payroll::where('pay_period', $payPeriod)->get();

        return [
            'total_employees' => $payrolls->count(),
            'total_gross_salary' => $payrolls->sum('gross_salary'),
            'total_net_salary' => $payrolls->sum('net_salary'),
            'total_deductions' => $payrolls->sum('deductions'),
            'total_allowances' => $payrolls->sum('allowances'),
            'average_salary' => $payrolls->avg('net_salary'),
            'by_department' => $payrolls->load('employee.department')
                ->groupBy('employee.department.name')
                ->map(function ($group) {
                    return [
                        'count' => $group->count(),
                        'total_salary' => $group->sum('net_salary'),
                        'average_salary' => $group->avg('net_salary'),
                    ];
                }),
        ];
    }

    /**
     * Get attendance trends for an employee.
     */
    public function getAttendanceTrends($employeeId, $months = 6): array
    {
        $startDate = now()->subMonths($months)->startOfMonth();
        $endDate = now()->endOfMonth();

        $attendance = Attendance::where('employee_id', $employeeId)
            ->whereBetween('date', [$startDate, $endDate])
            ->selectRaw('
                DATE_FORMAT(date, "%Y-%m") as month,
                COUNT(*) as total_days,
                SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) as late_days,
                SUM(CASE WHEN status = "absent" THEN 1 ELSE 0 END) as absent_days,
                AVG(total_hours) as average_hours
            ')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return $attendance->map(function ($record) {
            $attendanceRate = $record->total_days > 0 
                ? round((($record->present_days + $record->late_days) / $record->total_days) * 100, 2)
                : 0;

            return [
                'month' => $record->month,
                'total_days' => $record->total_days,
                'present_days' => $record->present_days,
                'late_days' => $record->late_days,
                'absent_days' => $record->absent_days,
                'attendance_rate' => $attendanceRate,
                'average_hours' => round($record->average_hours, 2),
            ];
        });
    }

    /**
     * Get upcoming birthdays.
     */
    public function getUpcomingBirthdays($days = 30): array
    {
        $startDate = now();
        $endDate = now()->addDays($days);

        return Employee::with('user')
            ->whereHas('user', function ($query) use ($startDate, $endDate) {
                $query->whereRaw("
                    DATE_FORMAT(date_of_birth, '%m-%d') BETWEEN 
                    DATE_FORMAT(?, '%m-%d') AND 
                    DATE_FORMAT(?, '%m-%d')
                ", [$startDate, $endDate]);
            })
            ->get()
            ->map(function ($employee) {
                $birthday = \Carbon\Carbon::parse($employee->user->date_of_birth)
                    ->year(now()->year);
                
                return [
                    'employee' => $employee,
                    'birthday' => $birthday,
                    'days_until_birthday' => now()->diffInDays($birthday, false),
                ];
            })
            ->sortBy('days_until_birthday');
    }

    /**
     * Get employee turnover rate.
     */
    public function getTurnoverRate($period = 'year'): array
    {
        $startDate = match ($period) {
            'month' => now()->subMonth(),
            'quarter' => now()->subMonths(3),
            'year' => now()->subYear(),
            default => now()->subYear(),
        };

        $totalEmployees = Employee::where('hire_date', '<=', $startDate)->count();
        $terminatedEmployees = Employee::where('status', 'terminated')
            ->where('updated_at', '>=', $startDate)
            ->count();

        $turnoverRate = $totalEmployees > 0 
            ? round(($terminatedEmployees / $totalEmployees) * 100, 2)
            : 0;

        return [
            'period' => $period,
            'total_employees' => $totalEmployees,
            'terminated_employees' => $terminatedEmployees,
            'turnover_rate' => $turnoverRate,
        ];
    }
}
