<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'payroll_period',
        'pay_date',
        'basic_salary',
        'overtime_pay',
        'bonus',
        'allowances',
        'gross_salary',
        'tax_deduction',
        'insurance_deduction',
        'other_deductions',
        'total_deductions',
        'net_salary',
        'status',
        'processed_by',
        'processed_at',
        'notes'
    ];

    protected $casts = [
        'pay_date' => 'date',
        'basic_salary' => 'decimal:2',
        'overtime_pay' => 'decimal:2',
        'bonus' => 'decimal:2',
        'allowances' => 'decimal:2',
        'gross_salary' => 'decimal:2',
        'tax_deduction' => 'decimal:2',
        'insurance_deduction' => 'decimal:2',
        'other_deductions' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'processed_at' => 'datetime'
    ];

    /**
     * Get the employee that owns the payroll.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user who processed the payroll.
     */
    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Scope a query to only include draft payroll.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope a query to only include approved payroll.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include paid payroll.
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope a query to only include payroll for a specific period.
     */
    public function scopeForPeriod($query, $period)
    {
        return $query->where('payroll_period', $period);
    }

    /**
     * Scope a query to only include payroll for a date range.
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('pay_date', [$startDate, $endDate]);
    }

    /**
     * Check if payroll is draft.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if payroll is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if payroll is paid.
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    /**
     * Calculate gross salary.
     */
    public function calculateGrossSalary(): void
    {
        $this->gross_salary = $this->basic_salary + $this->overtime_pay + $this->bonus + $this->allowances;
    }

    /**
     * Calculate total deductions.
     */
    public function calculateTotalDeductions(): void
    {
        $this->total_deductions = $this->tax_deduction + $this->insurance_deduction + $this->other_deductions;
    }

    /**
     * Calculate net salary.
     */
    public function calculateNetSalary(): void
    {
        $this->calculateGrossSalary();
        $this->calculateTotalDeductions();
        $this->net_salary = $this->gross_salary - $this->total_deductions;
    }

    /**
     * Approve the payroll.
     */
    public function approve($userId): bool
    {
        if (!$this->isDraft()) {
            return false;
        }

        $this->update([
            'status' => 'approved',
            'processed_by' => $userId,
            'processed_at' => now()
        ]);

        return true;
    }

    /**
     * Mark payroll as paid.
     */
    public function markAsPaid($userId): bool
    {
        if (!$this->isApproved()) {
            return false;
        }

        $this->update([
            'status' => 'paid',
            'processed_by' => $userId,
            'processed_at' => now()
        ]);

        return true;
    }
}