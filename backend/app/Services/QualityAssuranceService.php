<?php

namespace App\Services;

use App\Models\QualityStandard;
use App\Models\Audit;
use App\Models\Incident;
use App\Models\ComplianceRecord;
use App\Models\TrainingRecord;
use App\Models\StaffTraining;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class QualityAssuranceService
{
    /**
     * Get comprehensive quality assurance dashboard data
     */
    public function getDashboardData(): array
    {
        return [
            'overview' => $this->getOverviewStats(),
            'recent_activities' => $this->getRecentActivities(),
            'alerts' => $this->getAlerts(),
            'compliance_trends' => $this->getComplianceTrends(),
            'incident_trends' => $this->getIncidentTrends(),
            'training_status' => $this->getTrainingStatus()
        ];
    }

    /**
     * Get overview statistics
     */
    private function getOverviewStats(): array
    {
        return [
            'total_standards' => QualityStandard::count(),
            'active_standards' => QualityStandard::active()->count(),
            'total_audits' => Audit::count(),
            'completed_audits' => Audit::where('status', 'completed')->count(),
            'total_incidents' => Incident::count(),
            'critical_incidents' => Incident::critical()->count(),
            'compliance_rate' => $this->calculateOverallComplianceRate(),
            'training_completion_rate' => $this->calculateTrainingCompletionRate()
        ];
    }

    /**
     * Get recent activities across all modules
     */
    private function getRecentActivities(): array
    {
        $activities = collect();

        // Recent audits
        $recentAudits = Audit::with(['standard', 'auditor'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($audit) {
                return [
                    'type' => 'audit',
                    'title' => $audit->title,
                    'description' => "Audit for " . ($audit->standard?->name ?? 'Unknown Standard'),
                    'status' => $audit->status,
                    'date' => $audit->created_at,
                    'user' => $audit->auditor?->name ?? 'Unknown'
                ];
            });

        // Recent incidents
        $recentIncidents = Incident::with(['reporter', 'department'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($incident) {
                return [
                    'type' => 'incident',
                    'title' => $incident->title,
                    'description' => "Incident in " . ($incident->department?->name ?? 'Unknown Department'),
                    'status' => $incident->status,
                    'severity' => $incident->severity,
                    'date' => $incident->created_at,
                    'user' => $incident->reporter?->name ?? 'Unknown'
                ];
            });

        // Recent compliance assessments
        $recentCompliance = ComplianceRecord::with(['standard', 'assessor'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($record) {
                return [
                    'type' => 'compliance',
                    'title' => "Compliance Assessment",
                    'description' => "Assessment for " . ($record->standard?->name ?? 'Unknown Standard'),
                    'status' => $record->compliance_status,
                    'date' => $record->created_at,
                    'user' => $record->assessor?->name ?? 'Unknown'
                ];
            });

        return $activities
            ->merge($recentAudits)
            ->merge($recentIncidents)
            ->merge($recentCompliance)
            ->sortByDesc('date')
            ->take(10)
            ->values()
            ->toArray();
    }

    /**
     * Get system alerts and notifications
     */
    private function getAlerts(): array
    {
        $alerts = collect();

        // Standards due for review
        $standardsDueForReview = QualityStandard::where('review_date', '<=', now())
            ->where('status', 'active')
            ->count();

        if ($standardsDueForReview > 0) {
            $alerts->push([
                'type' => 'warning',
                'title' => 'Standards Due for Review',
                'message' => "{$standardsDueForReview} quality standards are due for review",
                'count' => $standardsDueForReview,
                'action' => 'review_standards'
            ]);
        }

        // Critical incidents
        $criticalIncidents = Incident::critical()
            ->whereIn('status', ['reported', 'investigating'])
            ->count();

        if ($criticalIncidents > 0) {
            $alerts->push([
                'type' => 'error',
                'title' => 'Critical Incidents',
                'message' => "{$criticalIncidents} critical incidents require immediate attention",
                'count' => $criticalIncidents,
                'action' => 'review_incidents'
            ]);
        }

        // Overdue audits
        $overdueAudits = Audit::overdue()->count();

        if ($overdueAudits > 0) {
            $alerts->push([
                'type' => 'warning',
                'title' => 'Overdue Audits',
                'message' => "{$overdueAudits} audits are overdue",
                'count' => $overdueAudits,
                'action' => 'review_audits'
            ]);
        }

        // Expired certifications
        $expiredCertifications = StaffTraining::expiredCertification()->count();

        if ($expiredCertifications > 0) {
            $alerts->push([
                'type' => 'error',
                'title' => 'Expired Certifications',
                'message' => "{$expiredCertifications} staff certifications have expired",
                'count' => $expiredCertifications,
                'action' => 'review_certifications'
            ]);
        }

        // Non-compliant records
        $nonCompliantRecords = ComplianceRecord::nonCompliant()->count();

        if ($nonCompliantRecords > 0) {
            $alerts->push([
                'type' => 'warning',
                'title' => 'Non-Compliant Records',
                'message' => "{$nonCompliantRecords} compliance records are non-compliant",
                'count' => $nonCompliantRecords,
                'action' => 'review_compliance'
            ]);
        }

        return $alerts->toArray();
    }

    /**
     * Get compliance trends over time
     */
    private function getComplianceTrends(): array
    {
        $trends = [];
        $months = 6;

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            $totalAssessments = ComplianceRecord::whereBetween('assessment_date', [$startOfMonth, $endOfMonth])->count();
            $compliantAssessments = ComplianceRecord::whereBetween('assessment_date', [$startOfMonth, $endOfMonth])
                ->where('compliance_status', 'compliant')
                ->count();

            $complianceRate = $totalAssessments > 0 ? round(($compliantAssessments / $totalAssessments) * 100, 2) : 0;

            $trends[] = [
                'month' => $date->format('M Y'),
                'compliance_rate' => $complianceRate,
                'total_assessments' => $totalAssessments
            ];
        }

        return $trends;
    }

    /**
     * Get incident trends over time
     */
    private function getIncidentTrends(): array
    {
        $trends = [];
        $months = 6;

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            $totalIncidents = Incident::whereBetween('incident_date', [$startOfMonth, $endOfMonth])->count();
            $criticalIncidents = Incident::whereBetween('incident_date', [$startOfMonth, $endOfMonth])
                ->where('severity', 'critical')
                ->count();

            $trends[] = [
                'month' => $date->format('M Y'),
                'total_incidents' => $totalIncidents,
                'critical_incidents' => $criticalIncidents
            ];
        }

        return $trends;
    }

    /**
     * Get training status overview
     */
    private function getTrainingStatus(): array
    {
        $totalStaff = StaffTraining::distinct('staff_id')->count();
        $completedTrainings = StaffTraining::completed()->count();
        $expiredCertifications = StaffTraining::expiredCertification()->count();
        $expiringCertifications = StaffTraining::expiringCertification(30)->count();

        return [
            'total_staff' => $totalStaff,
            'completed_trainings' => $completedTrainings,
            'expired_certifications' => $expiredCertifications,
            'expiring_certifications' => $expiringCertifications,
            'completion_rate' => $totalStaff > 0 ? round(($completedTrainings / $totalStaff) * 100, 2) : 0
        ];
    }

    /**
     * Calculate overall compliance rate
     */
    private function calculateOverallComplianceRate(): float
    {
        $totalRecords = ComplianceRecord::count();
        if ($totalRecords === 0) {
            return 0;
        }

        $compliantRecords = ComplianceRecord::where('compliance_status', 'compliant')->count();
        return round(($compliantRecords / $totalRecords) * 100, 2);
    }

    /**
     * Calculate training completion rate
     */
    private function calculateTrainingCompletionRate(): float
    {
        $totalTrainings = StaffTraining::count();
        if ($totalTrainings === 0) {
            return 0;
        }

        $completedTrainings = StaffTraining::completed()->count();
        return round(($completedTrainings / $totalTrainings) * 100, 2);
    }

    /**
     * Generate quality assurance report
     */
    public function generateReport(array $filters = []): array
    {
        $report = [
            'generated_at' => now(),
            'filters' => $filters,
            'executive_summary' => $this->getExecutiveSummary(),
            'standards_compliance' => $this->getStandardsComplianceReport(),
            'audit_summary' => $this->getAuditSummaryReport(),
            'incident_analysis' => $this->getIncidentAnalysisReport(),
            'training_effectiveness' => $this->getTrainingEffectivenessReport(),
            'recommendations' => $this->getRecommendations()
        ];

        return $report;
    }

    /**
     * Get executive summary for reports
     */
    private function getExecutiveSummary(): array
    {
        return [
            'overall_compliance_rate' => $this->calculateOverallComplianceRate(),
            'total_incidents' => Incident::count(),
            'critical_incidents' => Incident::critical()->count(),
            'audits_completed' => Audit::where('status', 'completed')->count(),
            'training_completion_rate' => $this->calculateTrainingCompletionRate(),
            'key_achievements' => $this->getKeyAchievements(),
            'areas_for_improvement' => $this->getAreasForImprovement()
        ];
    }

    /**
     * Get standards compliance report
     */
    private function getStandardsComplianceReport(): array
    {
        $standards = QualityStandard::with('complianceRecords')->get();

        return $standards->map(function ($standard) {
            $totalAssessments = $standard->complianceRecords->count();
            $compliantAssessments = $standard->complianceRecords->where('compliance_status', 'compliant')->count();
            $complianceRate = $totalAssessments > 0 ? round(($compliantAssessments / $totalAssessments) * 100, 2) : 0;

            return [
                'standard_id' => $standard->id,
                'standard_name' => $standard->name,
                'category' => $standard->category,
                'priority' => $standard->priority,
                'compliance_rate' => $complianceRate,
                'total_assessments' => $totalAssessments,
                'last_assessment' => $standard->complianceRecords->max('assessment_date'),
                'status' => $standard->status
            ];
        })->toArray();
    }

    /**
     * Get audit summary report
     */
    private function getAuditSummaryReport(): array
    {
        $audits = Audit::with(['standard', 'auditor'])->get();

        return [
            'total_audits' => $audits->count(),
            'completed_audits' => $audits->where('status', 'completed')->count(),
            'average_rating' => $audits->whereNotNull('overall_rating')->avg(function ($audit) {
                $ratings = ['excellent' => 5, 'good' => 4, 'satisfactory' => 3, 'needs_improvement' => 2, 'unsatisfactory' => 1];
                return $ratings[$audit->overall_rating] ?? 0;
            }),
            'by_type' => $audits->groupBy('type')->map->count(),
            'by_scope' => $audits->groupBy('scope')->map->count(),
            'recent_audits' => $audits->sortByDesc('created_at')->take(5)->values()
        ];
    }

    /**
     * Get incident analysis report
     */
    private function getIncidentAnalysisReport(): array
    {
        $incidents = Incident::with(['department', 'reporter'])->get();

        return [
            'total_incidents' => $incidents->count(),
            'by_severity' => $incidents->groupBy('severity')->map->count(),
            'by_type' => $incidents->groupBy('type')->map->count(),
            'by_department' => $incidents->groupBy(function ($incident) {
                return $incident->department?->name ?? 'Unknown Department';
            })->map->count(),
            'resolution_time' => $incidents->whereNotNull('resolved_date')->avg('resolution_time'),
            'trend_analysis' => $this->getIncidentTrendAnalysis()
        ];
    }

    /**
     * Get training effectiveness report
     */
    private function getTrainingEffectivenessReport(): array
    {
        $trainings = TrainingRecord::with('staffTraining')->get();
        $staffTrainings = StaffTraining::with(['staff', 'training'])->get();

        return [
            'total_trainings' => $trainings->count(),
            'completed_trainings' => $staffTrainings->where('status', 'completed')->count(),
            'pass_rate' => $staffTrainings->where('status', 'completed')->where('result', 'pass')->count(),
            'by_category' => $trainings->groupBy('category')->map->count(),
            'certification_status' => [
                'valid' => $staffTrainings->where('certification_valid', true)->count(),
                'expired' => $staffTrainings->where('certification_valid', false)->count(),
                'expiring_soon' => $staffTrainings->filter(function ($training) {
                    return $training->isCertificationExpiringSoon();
                })->count()
            ]
        ];
    }

    /**
     * Get key achievements
     */
    private function getKeyAchievements(): array
    {
        $achievements = [];

        $complianceRate = $this->calculateOverallComplianceRate();
        if ($complianceRate >= 90) {
            $achievements[] = "Excellent compliance rate of {$complianceRate}%";
        }

        $criticalIncidents = Incident::critical()->count();
        if ($criticalIncidents === 0) {
            $achievements[] = "Zero critical incidents this period";
        }

        $completedAudits = Audit::where('status', 'completed')->count();
        if ($completedAudits > 0) {
            $achievements[] = "Successfully completed {$completedAudits} audits";
        }

        return $achievements;
    }

    /**
     * Get areas for improvement
     */
    private function getAreasForImprovement(): array
    {
        $improvements = [];

        $complianceRate = $this->calculateOverallComplianceRate();
        if ($complianceRate < 80) {
            $improvements[] = "Improve overall compliance rate (currently {$complianceRate}%)";
        }

        $overdueAudits = Audit::overdue()->count();
        if ($overdueAudits > 0) {
            $improvements[] = "Address {$overdueAudits} overdue audits";
        }

        $expiredCertifications = StaffTraining::expiredCertification()->count();
        if ($expiredCertifications > 0) {
            $improvements[] = "Renew {$expiredCertifications} expired certifications";
        }

        $nonCompliantRecords = ComplianceRecord::nonCompliant()->count();
        if ($nonCompliantRecords > 0) {
            $improvements[] = "Address {$nonCompliantRecords} non-compliant records";
        }

        return $improvements;
    }

    /**
     * Get recommendations based on data analysis
     */
    private function getRecommendations(): array
    {
        $recommendations = [];

        // Compliance recommendations
        $lowComplianceStandards = QualityStandard::with('complianceRecords')
            ->get()
            ->filter(function ($standard) {
                $totalAssessments = $standard->complianceRecords->count();
                $compliantAssessments = $standard->complianceRecords->where('compliance_status', 'compliant')->count();
                $complianceRate = $totalAssessments > 0 ? ($compliantAssessments / $totalAssessments) * 100 : 0;
                return $complianceRate < 70;
            });

        if ($lowComplianceStandards->count() > 0) {
            $recommendations[] = [
                'category' => 'Compliance',
                'priority' => 'High',
                'recommendation' => 'Focus on improving compliance for standards with low compliance rates',
                'affected_standards' => $lowComplianceStandards->pluck('name')->toArray()
            ];
        }

        // Training recommendations
        $expiringCertifications = StaffTraining::expiringCertification(60)->count();
        if ($expiringCertifications > 0) {
            $recommendations[] = [
                'category' => 'Training',
                'priority' => 'Medium',
                'recommendation' => 'Plan renewal training for expiring certifications',
                'count' => $expiringCertifications
            ];
        }

        // Incident recommendations
        $recentIncidents = Incident::where('incident_date', '>=', now()->subDays(30))->count();
        if ($recentIncidents > 10) {
            $recommendations[] = [
                'category' => 'Incident Management',
                'priority' => 'High',
                'recommendation' => 'Review incident prevention measures - high incident rate detected',
                'incident_count' => $recentIncidents
            ];
        }

        return $recommendations;
    }

    /**
     * Get incident trend analysis
     */
    private function getIncidentTrendAnalysis(): array
    {
        $currentMonth = now()->startOfMonth();
        $previousMonth = now()->subMonth()->startOfMonth();

        $currentMonthIncidents = Incident::where('incident_date', '>=', $currentMonth)->count();
        $previousMonthIncidents = Incident::whereBetween('incident_date', [$previousMonth, $currentMonth])->count();

        $trend = 'stable';
        if ($currentMonthIncidents > $previousMonthIncidents) {
            $trend = 'increasing';
        } elseif ($currentMonthIncidents < $previousMonthIncidents) {
            $trend = 'decreasing';
        }

        return [
            'current_month' => $currentMonthIncidents,
            'previous_month' => $previousMonthIncidents,
            'trend' => $trend,
            'change_percentage' => $previousMonthIncidents > 0 
                ? round((($currentMonthIncidents - $previousMonthIncidents) / $previousMonthIncidents) * 100, 2)
                : 0
        ];
    }
}
