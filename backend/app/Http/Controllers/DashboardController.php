<?php

namespace App\Http\Controllers;

use App\Models\DashboardWidget;
use App\Models\UserDashboardLayout;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class DashboardController extends Controller
{
    /**
     * Get dashboard data.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $dashboardName = $request->get('dashboard', 'default');
            $userId = auth()->id();

            // Get user's dashboard layout
            $layout = UserDashboardLayout::where('user_id', $userId)
                ->where('dashboard_name', $dashboardName)
                ->first();

            // Get available widgets
            $widgets = DashboardWidget::active()
                ->public()
                ->ordered()
                ->get();

            // Get widget data
            $widgetData = [];
            foreach ($widgets as $widget) {
                $widgetData[$widget->id] = $this->getWidgetData($widget, $request);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'layout' => $layout,
                    'widgets' => $widgets,
                    'widget_data' => $widgetData
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save dashboard layout.
     */
    public function saveLayout(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'dashboard_name' => 'required|string|max:255',
            'layout' => 'required|array',
            'settings' => 'nullable|array',
            'is_default' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userId = auth()->id();
            $dashboardName = $request->dashboard_name;

            // Update or create layout
            $layout = UserDashboardLayout::updateOrCreate(
                [
                    'user_id' => $userId,
                    'dashboard_name' => $dashboardName
                ],
                [
                    'layout' => $request->layout,
                    'settings' => $request->settings ?? [],
                    'is_default' => $request->boolean('is_default', false)
                ]
            );

            // If this is set as default, remove default from others
            if ($request->boolean('is_default')) {
                $layout->setAsDefault();
            }

            return response()->json([
                'success' => true,
                'message' => 'Dashboard layout saved successfully',
                'data' => $layout
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save dashboard layout',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get widget data.
     */
    public function getWidgetData(DashboardWidget $widget, Request $request): JsonResponse
    {
        try {
            $data = $this->fetchWidgetData($widget, $request);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load widget data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get widget data based on data source.
     */
    private function fetchWidgetData(DashboardWidget $widget, Request $request): array
    {
        $dataSource = $widget->data_source;
        
        if (!$dataSource || !isset($dataSource['type'])) {
            return [];
        }

        switch ($dataSource['type']) {
            case 'medical_records':
                return $this->getMedicalRecordsData($dataSource, $request);
            case 'pharmacy':
                return $this->getPharmacyData($dataSource, $request);
            case 'billing':
                return $this->getBillingData($dataSource, $request);
            case 'laboratory':
                return $this->getLaboratoryData($dataSource, $request);
            case 'hr':
                return $this->getHrData($dataSource, $request);
            case 'custom':
                return $this->getCustomData($dataSource, $request);
            default:
                return [];
        }
    }

    /**
     * Get medical records data.
     */
    private function getMedicalRecordsData(array $dataSource, Request $request): array
    {
        // This would integrate with the medical records system
        return [
            'total_records' => 0,
            'today_records' => 0,
            'pending_records' => 0,
            'completed_records' => 0
        ];
    }

    /**
     * Get pharmacy data.
     */
    private function getPharmacyData(array $dataSource, Request $request): array
    {
        // This would integrate with the pharmacy system
        return [
            'total_medicines' => 0,
            'low_stock' => 0,
            'expired_medicines' => 0,
            'pending_orders' => 0
        ];
    }

    /**
     * Get billing data.
     */
    private function getBillingData(array $dataSource, Request $request): array
    {
        // This would integrate with the billing system
        return [
            'total_revenue' => 0,
            'pending_invoices' => 0,
            'paid_invoices' => 0,
            'overdue_invoices' => 0
        ];
    }

    /**
     * Get laboratory data.
     */
    private function getLaboratoryData(array $dataSource, Request $request): array
    {
        // This would integrate with the laboratory system
        return [
            'total_tests' => 0,
            'pending_tests' => 0,
            'completed_tests' => 0,
            'critical_results' => 0
        ];
    }

    /**
     * Get HR data.
     */
    private function getHrData(array $dataSource, Request $request): array
    {
        // This would integrate with the HR system
        return [
            'total_employees' => 0,
            'present_today' => 0,
            'on_leave' => 0,
            'pending_requests' => 0
        ];
    }

    /**
     * Get custom data.
     */
    private function getCustomData(array $dataSource, Request $request): array
    {
        // This would execute custom queries or API calls
        return [];
    }

    /**
     * Get dashboard analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'total_widgets' => DashboardWidget::count(),
                'active_widgets' => DashboardWidget::active()->count(),
                'public_widgets' => DashboardWidget::public()->count(),
                'widget_types' => DashboardWidget::selectRaw('type, COUNT(*) as count')
                    ->groupBy('type')
                    ->get(),
                'chart_types' => DashboardWidget::selectRaw('chart_type, COUNT(*) as count')
                    ->whereNotNull('chart_type')
                    ->groupBy('chart_type')
                    ->get(),
                'user_layouts' => UserDashboardLayout::where('created_at', '>=', $startDate)
                    ->selectRaw('dashboard_name, COUNT(*) as count')
                    ->groupBy('dashboard_name')
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
