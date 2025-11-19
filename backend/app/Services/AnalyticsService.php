<?php

namespace App\Services;

use App\Models\AnalyticsEvent;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\MedicalRecord;
use App\Models\LabRequest;
use App\Models\EmergencyCase;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Get dashboard analytics data
     */
    public function getDashboardAnalytics(array $filters = []): array
    {
        $dateRange = $this->getDateRange($filters);
        
        return [
            'overview' => $this->getOverviewMetrics($dateRange),
            'patient_metrics' => $this->getPatientMetrics($dateRange),
            'financial_metrics' => $this->getFinancialMetrics($dateRange),
            'operational_metrics' => $this->getOperationalMetrics($dateRange),
            'recent_activities' => $this->getRecentActivities($dateRange),
            'charts' => $this->getDashboardCharts($dateRange)
        ];
    }

    /**
     * Get patient analytics
     */
    public function getPatientAnalytics(array $filters = []): array
    {
        $dateRange = $this->getDateRange($filters);
        
        return [
            'patient_demographics' => $this->getPatientDemographics($dateRange),
            'appointment_analytics' => $this->getAppointmentAnalytics($dateRange),
            'medical_records_analytics' => $this->getMedicalRecordsAnalytics($dateRange),
            'lab_analytics' => $this->getLabAnalytics($dateRange),
            'patient_satisfaction' => $this->getPatientSatisfactionMetrics($dateRange)
        ];
    }

    /**
     * Get financial analytics
     */
    public function getFinancialAnalytics(array $filters = []): array
    {
        $dateRange = $this->getDateRange($filters);
        
        return [
            'revenue_analytics' => $this->getRevenueAnalytics($dateRange),
            'payment_analytics' => $this->getPaymentAnalytics($dateRange),
            'outstanding_analytics' => $this->getOutstandingAnalytics($dateRange),
            'service_analytics' => $this->getServiceAnalytics($dateRange),
            'insurance_analytics' => $this->getInsuranceAnalytics($dateRange)
        ];
    }

    /**
     * Get operational analytics
     */
    public function getOperationalAnalytics(array $filters = []): array
    {
        $dateRange = $this->getDateRange($filters);
        
        return [
            'staff_analytics' => $this->getStaffAnalytics($dateRange),
            'equipment_analytics' => $this->getEquipmentAnalytics($dateRange),
            'emergency_analytics' => $this->getEmergencyAnalytics($dateRange),
            'ward_analytics' => $this->getWardAnalytics($dateRange),
            'efficiency_metrics' => $this->getEfficiencyMetrics($dateRange)
        ];
    }

    /**
     * Track analytics event
     */
    public function trackEvent(array $eventData): AnalyticsEvent
    {
        return AnalyticsEvent::create([
            'event_type' => $eventData['event_type'],
            'event_name' => $eventData['event_name'],
            'event_data' => $eventData['event_data'] ?? null,
            'user_id' => auth()->id(),
            'session_id' => $eventData['session_id'] ?? null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now()
        ]);
    }

    /**
     * Generate custom report
     */
    public function generateCustomReport(array $params): array
    {
        $reportType = $params['report_type'];
        $dateRange = $params['date_range'];
        $filters = $params['filters'] ?? [];

        switch ($reportType) {
            case 'patient_summary':
                return $this->generatePatientSummaryReport($dateRange, $filters);
            case 'financial_summary':
                return $this->generateFinancialSummaryReport($dateRange, $filters);
            case 'operational_summary':
                return $this->generateOperationalSummaryReport($dateRange, $filters);
            case 'quality_metrics':
                return $this->generateQualityMetricsReport($dateRange, $filters);
            default:
                throw new \InvalidArgumentException('Invalid report type');
        }
    }

    /**
     * Get real-time analytics
     */
    public function getRealTimeAnalytics(): array
    {
        return [
            'current_patients' => $this->getCurrentPatients(),
            'active_emergencies' => $this->getActiveEmergencies(),
            'bed_occupancy' => $this->getBedOccupancy(),
            'staff_on_duty' => $this->getStaffOnDuty(),
            'equipment_status' => $this->getEquipmentStatus(),
            'recent_alerts' => $this->getRecentAlerts()
        ];
    }

    /**
     * Get overview metrics
     */
    private function getOverviewMetrics(array $dateRange): array
    {
        return [
            'total_patients' => Patient::count(),
            'new_patients_today' => Patient::whereDate('created_at', today())->count(),
            'total_appointments' => Appointment::whereBetween('appointment_date', $dateRange)->count(),
            'completed_appointments' => Appointment::whereBetween('appointment_date', $dateRange)
                ->where('status', 'completed')->count(),
            'total_revenue' => Invoice::whereBetween('created_at', $dateRange)
                ->where('status', 'paid')->sum('total_amount'),
            'pending_payments' => Invoice::where('status', 'pending')->sum('total_amount')
        ];
    }

    /**
     * Get patient metrics
     */
    private function getPatientMetrics(array $dateRange): array
    {
        return [
            'age_distribution' => $this->getAgeDistribution(),
            'gender_distribution' => $this->getGenderDistribution(),
            'top_diagnoses' => $this->getTopDiagnoses($dateRange),
            'patient_satisfaction' => $this->getPatientSatisfactionScore($dateRange)
        ];
    }

    /**
     * Get financial metrics
     */
    private function getFinancialMetrics(array $dateRange): array
    {
        return [
            'daily_revenue' => $this->getDailyRevenue($dateRange),
            'payment_methods' => $this->getPaymentMethodDistribution($dateRange),
            'outstanding_amount' => Invoice::where('status', 'pending')->sum('total_amount'),
            'average_transaction' => Invoice::whereBetween('created_at', $dateRange)
                ->where('status', 'paid')->avg('total_amount')
        ];
    }

    /**
     * Get operational metrics
     */
    private function getOperationalMetrics(array $dateRange): array
    {
        return [
            'appointment_efficiency' => $this->getAppointmentEfficiency($dateRange),
            'bed_utilization' => $this->getBedUtilization(),
            'staff_productivity' => $this->getStaffProductivity($dateRange),
            'equipment_utilization' => $this->getEquipmentUtilization($dateRange)
        ];
    }

    /**
     * Get recent activities
     */
    private function getRecentActivities(array $dateRange): array
    {
        return [
            'new_patients' => Patient::whereBetween('created_at', $dateRange)
                ->orderBy('created_at', 'desc')->limit(5)->get(),
            'recent_appointments' => Appointment::whereBetween('appointment_date', $dateRange)
                ->with('patient')->orderBy('appointment_date', 'desc')->limit(5)->get(),
            'recent_payments' => Payment::whereBetween('created_at', $dateRange)
                ->with('invoice')->orderBy('created_at', 'desc')->limit(5)->get()
        ];
    }

    /**
     * Get dashboard charts data
     */
    private function getDashboardCharts(array $dateRange): array
    {
        return [
            'patient_trend' => $this->getPatientTrendChart($dateRange),
            'revenue_trend' => $this->getRevenueTrendChart($dateRange),
            'appointment_distribution' => $this->getAppointmentDistributionChart($dateRange),
            'department_activity' => $this->getDepartmentActivityChart($dateRange)
        ];
    }

    /**
     * Get date range from filters
     */
    private function getDateRange(array $filters): array
    {
        $startDate = $filters['start_date'] ?? Carbon::now()->subDays(30)->startOfDay();
        $endDate = $filters['end_date'] ?? Carbon::now()->endOfDay();
        
        return [$startDate, $endDate];
    }

    /**
     * Get age distribution
     */
    private function getAgeDistribution(): array
    {
        return Patient::selectRaw('
            CASE 
                WHEN age < 18 THEN "0-17"
                WHEN age BETWEEN 18 AND 30 THEN "18-30"
                WHEN age BETWEEN 31 AND 50 THEN "31-50"
                WHEN age BETWEEN 51 AND 70 THEN "51-70"
                ELSE "70+"
            END as age_group,
            COUNT(*) as count
        ')
        ->groupBy('age_group')
        ->get()
        ->pluck('count', 'age_group')
        ->toArray();
    }

    /**
     * Get gender distribution
     */
    private function getGenderDistribution(): array
    {
        return Patient::selectRaw('gender, COUNT(*) as count')
            ->groupBy('gender')
            ->get()
            ->pluck('count', 'gender')
            ->toArray();
    }

    /**
     * Get top diagnoses
     */
    private function getTopDiagnoses(array $dateRange): array
    {
        return MedicalRecord::selectRaw('diagnosis, COUNT(*) as count')
            ->whereBetween('created_at', $dateRange)
            ->whereNotNull('diagnosis')
            ->groupBy('diagnosis')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->pluck('count', 'diagnosis')
            ->toArray();
    }

    /**
     * Get patient satisfaction score
     */
    private function getPatientSatisfactionScore(array $dateRange): float
    {
        // This would typically come from a patient satisfaction survey
        // For now, we'll return a mock value
        return 4.2;
    }

    /**
     * Get daily revenue
     */
    private function getDailyRevenue(array $dateRange): array
    {
        return Invoice::selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue')
            ->whereBetween('created_at', $dateRange)
            ->where('status', 'paid')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('revenue', 'date')
            ->toArray();
    }

    /**
     * Get payment method distribution
     */
    private function getPaymentMethodDistribution(array $dateRange): array
    {
        return Payment::selectRaw('payment_method, COUNT(*) as count')
            ->whereBetween('created_at', $dateRange)
            ->groupBy('payment_method')
            ->get()
            ->pluck('count', 'payment_method')
            ->toArray();
    }

    /**
     * Get appointment efficiency
     */
    private function getAppointmentEfficiency(array $dateRange): float
    {
        $totalAppointments = Appointment::whereBetween('appointment_date', $dateRange)->count();
        $completedAppointments = Appointment::whereBetween('appointment_date', $dateRange)
            ->where('status', 'completed')->count();
        
        return $totalAppointments > 0 ? ($completedAppointments / $totalAppointments) * 100 : 0;
    }

    /**
     * Get bed utilization
     */
    private function getBedUtilization(): float
    {
        // This would typically come from bed management data
        // For now, we'll return a mock value
        return 75.5;
    }

    /**
     * Get staff productivity
     */
    private function getStaffProductivity(array $dateRange): array
    {
        // This would typically come from staff performance data
        // For now, we'll return mock data
        return [
            'average_patients_per_doctor' => 12.5,
            'average_appointments_per_day' => 8.3,
            'staff_utilization_rate' => 85.2
        ];
    }

    /**
     * Get equipment utilization
     */
    private function getEquipmentUtilization(array $dateRange): array
    {
        // This would typically come from equipment usage data
        // For now, we'll return mock data
        return [
            'mri_utilization' => 78.5,
            'ct_utilization' => 82.3,
            'xray_utilization' => 91.2,
            'ultrasound_utilization' => 67.8
        ];
    }

    /**
     * Get patient trend chart data
     */
    private function getPatientTrendChart(array $dateRange): array
    {
        return Patient::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->whereBetween('created_at', $dateRange)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Get revenue trend chart data
     */
    private function getRevenueTrendChart(array $dateRange): array
    {
        return Invoice::selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue')
            ->whereBetween('created_at', $dateRange)
            ->where('status', 'paid')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Get appointment distribution chart data
     */
    private function getAppointmentDistributionChart(array $dateRange): array
    {
        return Appointment::selectRaw('status, COUNT(*) as count')
            ->whereBetween('appointment_date', $dateRange)
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();
    }

    /**
     * Get department activity chart data
     */
    private function getDepartmentActivityChart(array $dateRange): array
    {
        return Appointment::selectRaw('department, COUNT(*) as count')
            ->whereBetween('appointment_date', $dateRange)
            ->groupBy('department')
            ->get()
            ->pluck('count', 'department')
            ->toArray();
    }

    /**
     * Get current patients
     */
    private function getCurrentPatients(): int
    {
        return Patient::whereHas('appointments', function($query) {
            $query->where('appointment_date', today())
                ->where('status', 'in_progress');
        })->count();
    }

    /**
     * Get active emergencies
     */
    private function getActiveEmergencies(): int
    {
        return EmergencyCase::where('status', 'active')->count();
    }

    /**
     * Get bed occupancy
     */
    private function getBedOccupancy(): array
    {
        // This would typically come from bed management data
        return [
            'occupied' => 45,
            'available' => 15,
            'total' => 60,
            'occupancy_rate' => 75.0
        ];
    }

    /**
     * Get staff on duty
     */
    private function getStaffOnDuty(): int
    {
        // This would typically come from staff scheduling data
        return 28;
    }

    /**
     * Get equipment status
     */
    private function getEquipmentStatus(): array
    {
        // This would typically come from equipment management data
        return [
            'operational' => 45,
            'maintenance' => 3,
            'out_of_order' => 2,
            'total' => 50
        ];
    }

    /**
     * Get recent alerts
     */
    private function getRecentAlerts(): array
    {
        // This would typically come from alert/notification data
        return [
            'critical' => 2,
            'warning' => 5,
            'info' => 8
        ];
    }

    // Additional helper methods for custom reports
    private function generatePatientSummaryReport(array $dateRange, array $filters): array
    {
        return [
            'total_patients' => Patient::whereBetween('created_at', $dateRange)->count(),
            'new_patients' => Patient::whereBetween('created_at', $dateRange)->count(),
            'returning_patients' => Patient::whereBetween('created_at', $dateRange)
                ->whereHas('appointments', function($query) use ($dateRange) {
                    $query->whereBetween('appointment_date', $dateRange);
                })->count(),
            'demographics' => $this->getPatientDemographics($dateRange)
        ];
    }

    private function generateFinancialSummaryReport(array $dateRange, array $filters): array
    {
        return [
            'total_revenue' => Invoice::whereBetween('created_at', $dateRange)
                ->where('status', 'paid')->sum('total_amount'),
            'total_invoices' => Invoice::whereBetween('created_at', $dateRange)->count(),
            'average_invoice' => Invoice::whereBetween('created_at', $dateRange)
                ->where('status', 'paid')->avg('total_amount'),
            'payment_methods' => $this->getPaymentMethodDistribution($dateRange)
        ];
    }

    private function generateOperationalSummaryReport(array $dateRange, array $filters): array
    {
        return [
            'total_appointments' => Appointment::whereBetween('appointment_date', $dateRange)->count(),
            'completed_appointments' => Appointment::whereBetween('appointment_date', $dateRange)
                ->where('status', 'completed')->count(),
            'cancelled_appointments' => Appointment::whereBetween('appointment_date', $dateRange)
                ->where('status', 'cancelled')->count(),
            'efficiency_metrics' => $this->getEfficiencyMetrics($dateRange)
        ];
    }

    private function generateQualityMetricsReport(array $dateRange, array $filters): array
    {
        return [
            'patient_satisfaction' => $this->getPatientSatisfactionScore($dateRange),
            'appointment_efficiency' => $this->getAppointmentEfficiency($dateRange),
            'bed_utilization' => $this->getBedUtilization(),
            'staff_productivity' => $this->getStaffProductivity($dateRange)
        ];
    }

    private function getPatientDemographics(array $dateRange): array
    {
        return [
            'age_distribution' => $this->getAgeDistribution(),
            'gender_distribution' => $this->getGenderDistribution(),
            'top_diagnoses' => $this->getTopDiagnoses($dateRange)
        ];
    }

    private function getAppointmentAnalytics(array $dateRange): array
    {
        return [
            'total_appointments' => Appointment::whereBetween('appointment_date', $dateRange)->count(),
            'completed_appointments' => Appointment::whereBetween('appointment_date', $dateRange)
                ->where('status', 'completed')->count(),
            'cancelled_appointments' => Appointment::whereBetween('appointment_date', $dateRange)
                ->where('status', 'cancelled')->count(),
            'no_show_appointments' => Appointment::whereBetween('appointment_date', $dateRange)
                ->where('status', 'no_show')->count()
        ];
    }

    private function getMedicalRecordsAnalytics(array $dateRange): array
    {
        return [
            'total_records' => MedicalRecord::whereBetween('created_at', $dateRange)->count(),
            'top_diagnoses' => $this->getTopDiagnoses($dateRange),
            'average_consultation_time' => 25.5 // Mock data
        ];
    }

    private function getLabAnalytics(array $dateRange): array
    {
        return [
            'total_requests' => LabRequest::whereBetween('created_at', $dateRange)->count(),
            'completed_tests' => LabRequest::whereBetween('created_at', $dateRange)
                ->where('status', 'completed')->count(),
            'pending_tests' => LabRequest::whereBetween('created_at', $dateRange)
                ->where('status', 'pending')->count()
        ];
    }

    private function getPatientSatisfactionMetrics(array $dateRange): array
    {
        return [
            'overall_satisfaction' => 4.2,
            'wait_time_satisfaction' => 3.8,
            'staff_satisfaction' => 4.5,
            'facility_satisfaction' => 4.1
        ];
    }

    private function getRevenueAnalytics(array $dateRange): array
    {
        return [
            'total_revenue' => Invoice::whereBetween('created_at', $dateRange)
                ->where('status', 'paid')->sum('total_amount'),
            'daily_revenue' => $this->getDailyRevenue($dateRange),
            'revenue_by_service' => $this->getRevenueByService($dateRange)
        ];
    }

    private function getPaymentAnalytics(array $dateRange): array
    {
        return [
            'total_payments' => Payment::whereBetween('created_at', $dateRange)->sum('amount'),
            'payment_methods' => $this->getPaymentMethodDistribution($dateRange),
            'average_payment' => Payment::whereBetween('created_at', $dateRange)->avg('amount')
        ];
    }

    private function getOutstandingAnalytics(array $dateRange): array
    {
        return [
            'total_outstanding' => Invoice::where('status', 'pending')->sum('total_amount'),
            'overdue_invoices' => Invoice::where('status', 'pending')
                ->where('due_date', '<', now())->count(),
            'average_outstanding' => Invoice::where('status', 'pending')->avg('total_amount')
        ];
    }

    private function getServiceAnalytics(array $dateRange): array
    {
        return [
            'most_requested_services' => $this->getMostRequestedServices($dateRange),
            'service_revenue' => $this->getServiceRevenue($dateRange)
        ];
    }

    private function getInsuranceAnalytics(array $dateRange): array
    {
        return [
            'insurance_claims' => 45, // Mock data
            'approved_claims' => 42,
            'pending_claims' => 3,
            'total_claim_amount' => 125000.00
        ];
    }

    private function getStaffAnalytics(array $dateRange): array
    {
        return [
            'total_staff' => 150, // Mock data
            'active_staff' => 145,
            'on_leave' => 5,
            'productivity_metrics' => $this->getStaffProductivity($dateRange)
        ];
    }

    private function getEquipmentAnalytics(array $dateRange): array
    {
        return [
            'total_equipment' => 50,
            'operational' => 45,
            'maintenance' => 3,
            'out_of_order' => 2,
            'utilization' => $this->getEquipmentUtilization($dateRange)
        ];
    }

    private function getEmergencyAnalytics(array $dateRange): array
    {
        return [
            'total_emergencies' => EmergencyCase::whereBetween('created_at', $dateRange)->count(),
            'active_emergencies' => EmergencyCase::where('status', 'active')->count(),
            'average_response_time' => 8.5 // Mock data in minutes
        ];
    }

    private function getWardAnalytics(array $dateRange): array
    {
        return [
            'total_beds' => 60,
            'occupied_beds' => 45,
            'available_beds' => 15,
            'occupancy_rate' => 75.0
        ];
    }

    private function getEfficiencyMetrics(array $dateRange): array
    {
        return [
            'appointment_efficiency' => $this->getAppointmentEfficiency($dateRange),
            'bed_utilization' => $this->getBedUtilization(),
            'staff_utilization' => 85.2,
            'equipment_utilization' => 78.5
        ];
    }

    private function getRevenueByService(array $dateRange): array
    {
        // Mock data - would typically come from invoice items
        return [
            'consultation' => 25000.00,
            'laboratory' => 15000.00,
            'radiology' => 20000.00,
            'pharmacy' => 10000.00
        ];
    }

    private function getMostRequestedServices(array $dateRange): array
    {
        // Mock data - would typically come from appointment or service data
        return [
            'general_consultation' => 150,
            'laboratory_tests' => 120,
            'xray' => 80,
            'ultrasound' => 60
        ];
    }

    private function getServiceRevenue(array $dateRange): array
    {
        return $this->getRevenueByService($dateRange);
    }
}
