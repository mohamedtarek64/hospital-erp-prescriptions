<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SystemSetting;
use App\Models\AuditLog;
use App\Models\SystemBackup;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get admin dashboard data.
     */
    public function dashboard(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $dashboardData = [
                'system_overview' => [
                    'total_users' => User::count(),
                    'active_users' => User::where('is_active', true)->count(),
                    'total_admins' => User::where('role', 'admin')->count(),
                    'total_doctors' => User::where('role', 'doctor')->count(),
                    'total_nurses' => User::where('role', 'nurse')->count(),
                    'total_patients' => User::where('role', 'patient')->count(),
                ],
                'activity_summary' => [
                    'total_logins' => AuditLog::where('action', 'login')
                        ->where('created_at', '>=', $startDate)
                        ->count(),
                    'total_actions' => AuditLog::where('created_at', '>=', $startDate)->count(),
                    'unique_users_active' => AuditLog::where('created_at', '>=', $startDate)
                        ->distinct('user_id')
                        ->count('user_id'),
                    'system_errors' => AuditLog::where('action', 'error')
                        ->where('created_at', '>=', $startDate)
                        ->count(),
                ],
                'backup_status' => [
                    'total_backups' => SystemBackup::count(),
                    'successful_backups' => SystemBackup::completed()->count(),
                    'failed_backups' => SystemBackup::failed()->count(),
                    'last_backup' => SystemBackup::completed()->latest()->first(),
                    'backup_size_total' => SystemBackup::completed()->sum('file_size'),
                ],
                'system_health' => [
                    'database_size' => $this->getDatabaseSize(),
                    'disk_usage' => $this->getDiskUsage(),
                    'memory_usage' => $this->getMemoryUsage(),
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                ],
                'recent_activities' => AuditLog::with('user')
                    ->latest()
                    ->limit(10)
                    ->get(),
                'recent_backups' => SystemBackup::with('creator')
                    ->latest()
                    ->limit(5)
                    ->get(),
                'daily_activity' => AuditLog::where('created_at', '>=', $startDate)
                    ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get(),
                'user_activity_by_role' => AuditLog::with('user')
                    ->where('created_at', '>=', $startDate)
                    ->get()
                    ->groupBy('user.role')
                    ->map(function ($logs, $role) {
                        return [
                            'role' => $role,
                            'count' => $logs->count(),
                            'unique_users' => $logs->unique('user_id')->count()
                        ];
                    })
                    ->values(),
            ];

            return response()->json([
                'success' => true,
                'data' => $dashboardData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get system settings.
     */
    public function getSettings(Request $request): JsonResponse
    {
        try {
            $query = SystemSetting::query();

            if ($request->has('group')) {
                $query->where('group', $request->group);
            }

            if ($request->has('is_public')) {
                $query->where('is_public', $request->boolean('is_public'));
            }

            $settings = $query->orderBy('group')->orderBy('display_name')->get();

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update system settings.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        try {
            $settings = $request->all();
            $updated = [];

            foreach ($settings as $key => $value) {
                $setting = SystemSetting::where('key', $key)->first();
                if ($setting) {
                    $setting->update(['value' => $value]);
                    $updated[] = $key;
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => [
                    'updated_settings' => $updated,
                    'count' => count($updated)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get system analytics.
     */
    public function getAnalytics(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = now()->subDays($period);

            $analytics = [
                'user_analytics' => [
                    'registrations' => User::where('created_at', '>=', $startDate)
                        ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                        ->groupBy('date')
                        ->orderBy('date')
                        ->get(),
                    'role_distribution' => User::selectRaw('role, COUNT(*) as count')
                        ->groupBy('role')
                        ->get(),
                    'active_users' => User::where('is_active', true)
                        ->selectRaw('role, COUNT(*) as count')
                        ->groupBy('role')
                        ->get(),
                ],
                'activity_analytics' => [
                    'daily_activity' => AuditLog::where('created_at', '>=', $startDate)
                        ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                        ->groupBy('date')
                        ->orderBy('date')
                        ->get(),
                    'action_distribution' => AuditLog::where('created_at', '>=', $startDate)
                        ->selectRaw('action, COUNT(*) as count')
                        ->groupBy('action')
                        ->orderBy('count', 'desc')
                        ->get(),
                    'top_users' => AuditLog::with('user')
                        ->where('created_at', '>=', $startDate)
                        ->selectRaw('user_id, COUNT(*) as count')
                        ->groupBy('user_id')
                        ->orderBy('count', 'desc')
                        ->limit(10)
                        ->get()
                        ->map(function ($log) {
                            return [
                                'user' => $log->user->name ?? 'Unknown',
                                'count' => $log->count
                            ];
                        }),
                ],
                'backup_analytics' => [
                    'backup_success_rate' => SystemBackup::where('created_at', '>=', $startDate)->count() > 0
                        ? (SystemBackup::where('created_at', '>=', $startDate)->completed()->count() / SystemBackup::where('created_at', '>=', $startDate)->count()) * 100
                        : 0,
                    'backup_types' => SystemBackup::where('created_at', '>=', $startDate)
                        ->selectRaw('backup_type, COUNT(*) as count')
                        ->groupBy('backup_type')
                        ->get(),
                    'backup_sizes' => SystemBackup::completed()
                        ->where('created_at', '>=', $startDate)
                        ->selectRaw('backup_type, AVG(file_size) as avg_size')
                        ->groupBy('backup_type')
                        ->get(),
                ],
                'system_performance' => [
                    'database_queries' => $this->getDatabaseStats(),
                    'cache_hit_rate' => $this->getCacheStats(),
                    'error_rate' => AuditLog::where('created_at', '>=', $startDate)->count() > 0
                        ? (AuditLog::where('action', 'error')->where('created_at', '>=', $startDate)->count() / AuditLog::where('created_at', '>=', $startDate)->count()) * 100
                        : 0,
                ],
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

    /**
     * Get database size.
     */
    private function getDatabaseSize()
    {
        try {
            $result = DB::select("
                SELECT 
                    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'size_mb'
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
            ");

            return $result[0]->size_mb ?? 0;
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get disk usage.
     */
    private function getDiskUsage()
    {
        try {
            $total = disk_total_space(storage_path());
            $free = disk_free_space(storage_path());
            $used = $total - $free;

            return [
                'total' => round($total / 1024 / 1024 / 1024, 2), // GB
                'used' => round($used / 1024 / 1024 / 1024, 2), // GB
                'free' => round($free / 1024 / 1024 / 1024, 2), // GB
                'percentage' => round(($used / $total) * 100, 2)
            ];
        } catch (\Exception $e) {
            return [
                'total' => 0,
                'used' => 0,
                'free' => 0,
                'percentage' => 0
            ];
        }
    }

    /**
     * Get memory usage.
     */
    private function getMemoryUsage()
    {
        try {
            $memoryLimit = ini_get('memory_limit');
            $memoryUsage = memory_get_usage(true);
            $memoryPeak = memory_get_peak_usage(true);

            return [
                'limit' => $memoryLimit,
                'current' => round($memoryUsage / 1024 / 1024, 2), // MB
                'peak' => round($memoryPeak / 1024 / 1024, 2), // MB
                'percentage' => $memoryLimit !== '-1' ? round(($memoryUsage / $this->parseMemoryLimit($memoryLimit)) * 100, 2) : 0
            ];
        } catch (\Exception $e) {
            return [
                'limit' => 'Unknown',
                'current' => 0,
                'peak' => 0,
                'percentage' => 0
            ];
        }
    }

    /**
     * Parse memory limit string to bytes.
     */
    private function parseMemoryLimit($limit)
    {
        $unit = strtolower(substr($limit, -1));
        $value = (int) substr($limit, 0, -1);

        switch ($unit) {
            case 'k':
                return $value * 1024;
            case 'm':
                return $value * 1024 * 1024;
            case 'g':
                return $value * 1024 * 1024 * 1024;
            default:
                return $value;
        }
    }

    /**
     * Get database statistics.
     */
    private function getDatabaseStats()
    {
        try {
            $stats = DB::select("
                SELECT 
                    COUNT(*) as total_tables,
                    SUM(table_rows) as total_rows,
                    SUM(data_length + index_length) as total_size
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
            ");

            return $stats[0] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get cache statistics.
     */
    private function getCacheStats()
    {
        try {
            // This would need to be implemented based on your cache driver
            return [
                'driver' => config('cache.default'),
                'hit_rate' => 0, // Would need cache monitoring
                'miss_rate' => 0, // Would need cache monitoring
            ];
        } catch (\Exception $e) {
            return [
                'driver' => 'unknown',
                'hit_rate' => 0,
                'miss_rate' => 0,
            ];
        }
    }
}
