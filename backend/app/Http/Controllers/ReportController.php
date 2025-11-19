<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportCategory;
use App\Models\ReportExecution;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    /**
     * Display a listing of reports.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Report::with(['category', 'latestExecution']);

            // Apply filters
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            if ($request->has('is_scheduled')) {
                $query->where('is_scheduled', $request->boolean('is_scheduled'));
            }

            if ($request->has('is_public')) {
                $query->where('is_public', $request->boolean('is_public'));
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $reports = $query->active()->orderBy('name')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $reports
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load reports',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created report.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:report_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:dashboard,detailed,summary,custom',
            'parameters' => 'nullable|array',
            'filters' => 'nullable|array',
            'columns' => 'nullable|array',
            'query_type' => 'required|in:sql,eloquent,api',
            'query' => 'nullable|string',
            'file_format' => 'in:pdf,excel,csv',
            'is_scheduled' => 'boolean',
            'schedule_frequency' => 'nullable|in:daily,weekly,monthly',
            'schedule_time' => 'nullable|date_format:H:i',
            'recipients' => 'nullable|array',
            'is_public' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $report = Report::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Report created successfully',
                'data' => $report->load(['category'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified report.
     */
    public function show(Report $report): JsonResponse
    {
        $report->load(['category', 'executions.user']);

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    /**
     * Update the specified report.
     */
    public function update(Request $request, Report $report): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|exists:report_categories,id',
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:dashboard,detailed,summary,custom',
            'parameters' => 'nullable|array',
            'filters' => 'nullable|array',
            'columns' => 'nullable|array',
            'query_type' => 'sometimes|required|in:sql,eloquent,api',
            'query' => 'nullable|string',
            'file_format' => 'in:pdf,excel,csv',
            'is_scheduled' => 'boolean',
            'schedule_frequency' => 'nullable|in:daily,weekly,monthly',
            'schedule_time' => 'nullable|date_format:H:i',
            'recipients' => 'nullable|array',
            'is_public' => 'boolean',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $report->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Report updated successfully',
                'data' => $report->load(['category'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified report.
     */
    public function destroy(Report $report): JsonResponse
    {
        try {
            // Check if report has executions
            if ($report->executions()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete report with existing executions'
                ], 400);
            }

            $report->delete();

            return response()->json([
                'success' => true,
                'message' => 'Report deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Execute a report.
     */
    public function execute(Request $request, Report $report): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'parameters' => 'nullable|array',
            'filters' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create execution record
            $execution = ReportExecution::create([
                'report_id' => $report->id,
                'user_id' => auth()->id(),
                'execution_type' => 'manual',
                'parameters' => $request->parameters ?? [],
                'filters' => $request->filters ?? [],
                'status' => 'pending'
            ]);

            // Mark as started
            $execution->markAsStarted();

            // Execute report based on query type
            $result = $this->executeReport($report, $execution);

            if ($result['success']) {
                $execution->markAsCompleted(
                    $result['total_records'],
                    $result['file_path'],
                    $result['file_name'],
                    $result['file_size']
                );

                return response()->json([
                    'success' => true,
                    'message' => 'Report executed successfully',
                    'data' => [
                        'execution' => $execution->load(['user']),
                        'download_url' => $result['download_url']
                    ]
                ]);
            } else {
                $execution->markAsFailed($result['error']);

                return response()->json([
                    'success' => false,
                    'message' => 'Report execution failed',
                    'error' => $result['error']
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to execute report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Execute report based on query type.
     */
    private function executeReport(Report $report, ReportExecution $execution): array
    {
        try {
            switch ($report->query_type) {
                case 'sql':
                    return $this->executeSqlReport($report, $execution);
                case 'eloquent':
                    return $this->executeEloquentReport($report, $execution);
                case 'api':
                    return $this->executeApiReport($report, $execution);
                default:
                    return ['success' => false, 'error' => 'Invalid query type'];
            }
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Execute SQL report.
     */
    private function executeSqlReport(Report $report, ReportExecution $execution): array
    {
        $data = DB::select($report->query);
        return $this->generateReportFile($report, $data, $execution);
    }

    /**
     * Execute Eloquent report.
     */
    private function executeEloquentReport(Report $report, ReportExecution $execution): array
    {
        // This would need to be implemented based on specific report requirements
        $data = [];
        return $this->generateReportFile($report, $data, $execution);
    }

    /**
     * Execute API report.
     */
    private function executeApiReport(Report $report, ReportExecution $execution): array
    {
        // This would need to be implemented based on specific report requirements
        $data = [];
        return $this->generateReportFile($report, $data, $execution);
    }

    /**
     * Generate report file.
     */
    private function generateReportFile(Report $report, array $data, ReportExecution $execution): array
    {
        $fileName = $report->name . '_' . now()->format('Y-m-d_H-i-s') . '.' . $report->file_format;
        $filePath = 'reports/' . $fileName;

        // Generate file based on format
        switch ($report->file_format) {
            case 'csv':
                $this->generateCsvFile($data, $filePath);
                break;
            case 'excel':
                $this->generateExcelFile($data, $filePath);
                break;
            case 'pdf':
                $this->generatePdfFile($data, $filePath, $report);
                break;
        }

        $fileSize = Storage::size($filePath);

        return [
            'success' => true,
            'total_records' => count($data),
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'download_url' => Storage::url($filePath)
        ];
    }

    /**
     * Generate CSV file.
     */
    private function generateCsvFile(array $data, string $filePath): void
    {
        $csv = fopen('php://temp', 'r+');
        
        if (!empty($data)) {
            // Write headers
            fputcsv($csv, array_keys((array) $data[0]));
            
            // Write data
            foreach ($data as $row) {
                fputcsv($csv, (array) $row);
            }
        }
        
        rewind($csv);
        $content = stream_get_contents($csv);
        fclose($csv);
        
        Storage::put($filePath, $content);
    }

    /**
     * Generate Excel file.
     */
    private function generateExcelFile(array $data, string $filePath): void
    {
        // This would need to be implemented using a library like PhpSpreadsheet
        Storage::put($filePath, json_encode($data));
    }

    /**
     * Generate PDF file.
     */
    private function generatePdfFile(array $data, string $filePath, Report $report): void
    {
        // This would need to be implemented using a library like DomPDF or TCPDF
        Storage::put($filePath, json_encode($data));
    }

    /**
     * Get report analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'total_reports' => Report::count(),
                'active_reports' => Report::active()->count(),
                'scheduled_reports' => Report::scheduled()->count(),
                'public_reports' => Report::public()->count(),
                'total_executions' => ReportExecution::where('created_at', '>=', $startDate)->count(),
                'successful_executions' => ReportExecution::where('created_at', '>=', $startDate)->completed()->count(),
                'failed_executions' => ReportExecution::where('created_at', '>=', $startDate)->failed()->count(),
                'execution_success_rate' => ReportExecution::where('created_at', '>=', $startDate)->count() > 0 
                    ? (ReportExecution::where('created_at', '>=', $startDate)->completed()->count() / ReportExecution::where('created_at', '>=', $startDate)->count()) * 100 
                    : 0,
                'report_types' => Report::selectRaw('type, COUNT(*) as count')
                    ->groupBy('type')
                    ->get(),
                'daily_executions' => ReportExecution::where('created_at', '>=', $startDate)
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
