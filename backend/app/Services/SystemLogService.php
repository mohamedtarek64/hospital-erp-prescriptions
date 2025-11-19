<?php

namespace App\Services;

use App\Models\SystemLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

/**
 * SystemLogService
 * 
 * Handles system logging operations
 */
class SystemLogService
{
    /**
     * Log user activity
     */
    public function logActivity(
        ?int $userId,
        string $action,
        string $module,
        ?string $description = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): SystemLog {
        return SystemLog::logActivity($userId, $action, $module, $description, $ipAddress, $userAgent);
    }

    /**
     * Log user login
     */
    public function logLogin(User $user, Request $request): SystemLog
    {
        return $this->logActivity(
            $user->id,
            'login',
            'auth',
            "User logged in: {$user->name}",
            $request->ip(),
            $request->userAgent()
        );
    }

    /**
     * Log user logout
     */
    public function logLogout(User $user, Request $request): SystemLog
    {
        return $this->logActivity(
            $user->id,
            'logout',
            'auth',
            "User logged out: {$user->name}",
            $request->ip(),
            $request->userAgent()
        );
    }

    /**
     * Log data creation
     */
    public function logCreate(
        ?int $userId,
        string $module,
        string $description,
        ?int $recordId = null,
        Request $request = null
    ): SystemLog {
        return $this->logActivity(
            $userId,
            'create',
            $module,
            $description,
            $request?->ip(),
            $request?->userAgent()
        );
    }

    /**
     * Log data update
     */
    public function logUpdate(
        ?int $userId,
        string $module,
        string $description,
        ?int $recordId = null,
        Request $request = null
    ): SystemLog {
        return $this->logActivity(
            $userId,
            'update',
            $module,
            $description,
            $request?->ip(),
            $request?->userAgent()
        );
    }

    /**
     * Log data deletion
     */
    public function logDelete(
        ?int $userId,
        string $module,
        string $description,
        ?int $recordId = null,
        Request $request = null
    ): SystemLog {
        return $this->logActivity(
            $userId,
            'delete',
            $module,
            $description,
            $request?->ip(),
            $request?->userAgent()
        );
    }

    /**
     * Log data view
     */
    public function logView(
        ?int $userId,
        string $module,
        string $description,
        ?int $recordId = null,
        Request $request = null
    ): SystemLog {
        return $this->logActivity(
            $userId,
            'view',
            $module,
            $description,
            $request?->ip(),
            $request?->userAgent()
        );
    }

    /**
     * Log system events
     */
    public function logSystemEvent(
        string $action,
        string $module,
        string $description,
        ?int $userId = null,
        Request $request = null
    ): SystemLog {
        return $this->logActivity(
            $userId,
            $action,
            $module,
            $description,
            $request?->ip(),
            $request?->userAgent()
        );
    }

    /**
     * Get activity summary
     */
    public function getActivitySummary(int $days = 30): array
    {
        return SystemLog::getActivitySummary($days);
    }

    /**
     * Get user activity
     */
    public function getUserActivity(int $userId, int $limit = 50): array
    {
        return SystemLog::getByUser($userId, $limit)->toArray();
    }

    /**
     * Get module activity
     */
    public function getModuleActivity(string $module, int $limit = 50): array
    {
        return SystemLog::getByModule($module, $limit)->toArray();
    }

    /**
     * Get recent activity
     */
    public function getRecentActivity(int $limit = 100): array
    {
        return SystemLog::getRecent($limit)->toArray();
    }

    /**
     * Get activity by date range
     */
    public function getActivityByDateRange(string $startDate, string $endDate, int $limit = 1000): array
    {
        return SystemLog::getByDateRange($startDate, $endDate, $limit)->toArray();
    }

    /**
     * Get activity statistics
     */
    public function getActivityStatistics(int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days);
        
        $stats = [
            'total_activities' => SystemLog::where('created_at', '>=', $startDate)->count(),
            'unique_users' => SystemLog::where('created_at', '>=', $startDate)->distinct('user_id')->count(),
            'top_actions' => SystemLog::where('created_at', '>=', $startDate)
                ->selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
            'top_modules' => SystemLog::where('created_at', '>=', $startDate)
                ->selectRaw('module, COUNT(*) as count')
                ->groupBy('module')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
            'top_users' => SystemLog::where('created_at', '>=', $startDate)
                ->whereNotNull('user_id')
                ->with('user:id,name')
                ->selectRaw('user_id, COUNT(*) as count')
                ->groupBy('user_id')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
            'daily_activity' => SystemLog::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->get(),
            'hourly_activity' => SystemLog::where('created_at', '>=', $startDate)
                ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
                ->groupBy('hour')
                ->orderBy('hour')
                ->get()
        ];

        return $stats;
    }

    /**
     * Get security events
     */
    public function getSecurityEvents(int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days);
        
        $securityActions = ['login', 'logout', 'password', 'permission', 'role'];
        
        return SystemLog::where('created_at', '>=', $startDate)
            ->whereIn('action', $securityActions)
            ->with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get failed login attempts
     */
    public function getFailedLogins(int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days);
        
        return SystemLog::where('created_at', '>=', $startDate)
            ->where('action', 'login')
            ->where('description', 'like', '%failed%')
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get admin activities
     */
    public function getAdminActivities(int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days);
        
        $adminModules = ['admin', 'settings', 'users', 'roles', 'backup'];
        
        return SystemLog::where('created_at', '>=', $startDate)
            ->whereIn('module', $adminModules)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Clean old logs
     */
    public function cleanOldLogs(int $days = 90): int
    {
        return SystemLog::cleanOldLogs($days);
    }

    /**
     * Export logs to CSV
     */
    public function exportLogsToCsv(string $startDate, string $endDate): array
    {
        try {
            $logs = SystemLog::with('user:id,name')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->orderBy('created_at', 'desc')
                ->get();

            $filename = 'system_logs_' . Carbon::now()->format('Y-m-d_H-i-s') . '.csv';
            $filePath = storage_path('exports/' . $filename);
            
            // Ensure directory exists
            if (!file_exists(dirname($filePath))) {
                mkdir(dirname($filePath), 0755, true);
            }

            $file = fopen($filePath, 'w');
            
            // Write CSV header
            fputcsv($file, [
                'ID',
                'User',
                'Action',
                'Module',
                'Description',
                'IP Address',
                'User Agent',
                'Created At'
            ]);

            // Write data
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->user?->name ?? 'System',
                    $log->action,
                    $log->module,
                    $log->description,
                    $log->ip_address,
                    $log->user_agent,
                    $log->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);

            return [
                'success' => true,
                'file_path' => $filePath,
                'filename' => $filename,
                'record_count' => $logs->count()
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get log analytics
     */
    public function getLogAnalytics(int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days);
        
        $analytics = [
            'overview' => [
                'total_logs' => SystemLog::where('created_at', '>=', $startDate)->count(),
                'unique_users' => SystemLog::where('created_at', '>=', $startDate)->distinct('user_id')->count(),
                'unique_ips' => SystemLog::where('created_at', '>=', $startDate)->distinct('ip_address')->count(),
                'most_active_day' => SystemLog::where('created_at', '>=', $startDate)
                    ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->orderBy('count', 'desc')
                    ->first()
            ],
            'activity_trends' => SystemLog::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'module_distribution' => SystemLog::where('created_at', '>=', $startDate)
                ->selectRaw('module, COUNT(*) as count')
                ->groupBy('module')
                ->orderBy('count', 'desc')
                ->get(),
            'action_distribution' => SystemLog::where('created_at', '>=', $startDate)
                ->selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->orderBy('count', 'desc')
                ->get(),
            'top_users' => SystemLog::where('created_at', '>=', $startDate)
                ->whereNotNull('user_id')
                ->with('user:id,name')
                ->selectRaw('user_id, COUNT(*) as count')
                ->groupBy('user_id')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get()
        ];

        return $analytics;
    }

    /**
     * Detect suspicious activity
     */
    public function detectSuspiciousActivity(int $days = 7): array
    {
        $startDate = Carbon::now()->subDays($days);
        
        $suspicious = [
            'multiple_failed_logins' => SystemLog::where('created_at', '>=', $startDate)
                ->where('action', 'login')
                ->where('description', 'like', '%failed%')
                ->selectRaw('ip_address, COUNT(*) as count')
                ->groupBy('ip_address')
                ->having('count', '>', 5)
                ->get(),
            'unusual_hours' => SystemLog::where('created_at', '>=', $startDate)
                ->whereRaw('HOUR(created_at) NOT BETWEEN 6 AND 22')
                ->whereNotNull('user_id')
                ->with('user:id,name')
                ->selectRaw('user_id, HOUR(created_at) as hour, COUNT(*) as count')
                ->groupBy('user_id', 'hour')
                ->having('count', '>', 10)
                ->get(),
            'bulk_operations' => SystemLog::where('created_at', '>=', $startDate)
                ->whereIn('action', ['delete', 'update'])
                ->whereNotNull('user_id')
                ->with('user:id,name')
                ->selectRaw('user_id, action, module, COUNT(*) as count')
                ->groupBy('user_id', 'action', 'module')
                ->having('count', '>', 20)
                ->get()
        ];

        return $suspicious;
    }
}
