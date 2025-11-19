<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'reviewer_id',
        'review_period',
        'overall_rating',
        'goals',
        'achievements',
        'areas_for_improvement',
        'comments'
    ];

    protected $casts = [
        'goals' => 'array',
        'achievements' => 'array',
        'areas_for_improvement' => 'array',
    ];  

    /**
     * Get the employee that owns the performance review.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user who reviewed this performance.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /**
     * Scope a query to only include reviews with high ratings.
     */
    public function scopeHighRating($query, $minRating = 4)
    {
        return $query->where('overall_rating', '>=', $minRating);
    }

    /**
     * Scope a query to only include reviews with low ratings.
     */
    public function scopeLowRating($query, $maxRating = 2)
    {
        return $query->where('overall_rating', '<=', $maxRating);
    }

    /**
     * Scope a query to only include reviews for a specific period.
     */
    public function scopeForPeriod($query, $period)
    {
        return $query->where('review_period', $period);
    }

    /**
     * Get the rating description.
     */
    public function getRatingDescriptionAttribute()
    {
        $ratings = [
            1 => 'Needs Improvement',
            2 => 'Below Expectations',
            3 => 'Meets Expectations',
            4 => 'Exceeds Expectations',
            5 => 'Outstanding'
        ];

        return $ratings[$this->overall_rating] ?? 'Not Rated';
    }

    /**
     * Get the rating color for UI display.
     */
    public function getRatingColorAttribute()
    {
        $colors = [
            1 => 'red',
            2 => 'orange',
            3 => 'yellow',
            4 => 'blue',
            5 => 'green'
        ];

        return $colors[$this->overall_rating] ?? 'gray';
    }

    /**
     * Get average rating for an employee.
     */
    public static function getAverageRating($employeeId)
    {
        return static::where('employee_id', $employeeId)
            ->avg('overall_rating');
    }

    /**
     * Get performance trends for an employee.
     */
    public static function getPerformanceTrends($employeeId, $limit = 5)
    {
        return static::where('employee_id', $employeeId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get(['overall_rating', 'review_period', 'created_at']);
    }

    /**
     * Get department performance summary.
     */
    public static function getDepartmentPerformanceSummary($departmentId)
    {
        return static::whereHas('employee', function ($query) use ($departmentId) {
            $query->where('department_id', $departmentId);
        })
        ->selectRaw('
            AVG(overall_rating) as average_rating,
            COUNT(*) as total_reviews,
            COUNT(CASE WHEN overall_rating >= 4 THEN 1 END) as high_performers,
            COUNT(CASE WHEN overall_rating <= 2 THEN 1 END) as low_performers
        ')
        ->first();
    }
}
