<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * SystemLog Model
 * 
 * Manages system activity logs
 * 
 * @property int $id
 * @property int|null $user_id
 * @property string $action
 * @property string $module
 * @property string|null $description
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class SystemLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'action',
        'module',
        'description',
        'ip_address',
        'user_agent'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the user that performed the action
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log user activity
     */
    public static function logActivity(
        ?int $userId,
        string $action,
        string $module,
        ?string $description = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): self {
        return static::create([
            'user_id' => $userId,
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent
        ]);
    }

    /**
     * Get logs by user
     */
    public static function getByUser(int $userId, int $limit = 50)
    {
        return static::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get logs by module
     */
    public static function getByModule(string $module, int $limit = 50)
    {
        return static::where('module', $module)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get logs by action
     */
    public static function getByAction(string $action, int $limit = 50)
    {
        return static::where('action', $action)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get recent logs
     */
    public static function getRecent(int $limit = 100)
    {
        return static::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get logs by date range
     */
    public static function getByDateRange(string $startDate, string $endDate, int $limit = 1000)
    {
        return static::with('user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get activity summary
     */
    public static function getActivitySummary(int $days = 30): array
    {
        $startDate = now()->subDays($days);
        
        return [
            'total_activities' => static::where('created_at', '>=', $startDate)->count(),
            'unique_users' => static::where('created_at', '>=', $startDate)->distinct('user_id')->count(),
            'top_actions' => static::where('created_at', '>=', $startDate)
                ->selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
            'top_modules' => static::where('created_at', '>=', $startDate)
                ->selectRaw('module, COUNT(*) as count')
                ->groupBy('module')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
            'daily_activity' => static::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->get()
        ];
    }

    /**
     * Clean old logs
     */
    public static function cleanOldLogs(int $days = 90): int
    {
        $cutoffDate = now()->subDays($days);
        return static::where('created_at', '<', $cutoffDate)->delete();
    }

    /**
     * Get available actions
     */
    public static function getAvailableActions(): array
    {
        return [
            'login' => 'User Login',
            'logout' => 'User Logout',
            'create' => 'Create Record',
            'update' => 'Update Record',
            'delete' => 'Delete Record',
            'view' => 'View Record',
            'export' => 'Export Data',
            'import' => 'Import Data',
            'backup' => 'System Backup',
            'restore' => 'System Restore',
            'settings' => 'Change Settings',
            'permission' => 'Permission Change',
            'role' => 'Role Change',
            'password' => 'Password Change',
            'profile' => 'Profile Update'
        ];
    }

    /**
     * Get available modules
     */
    public static function getAvailableModules(): array
    {
        return [
            'auth' => 'Authentication',
            'dashboard' => 'Dashboard',
            'patients' => 'Patients',
            'appointments' => 'Appointments',
            'medical_records' => 'Medical Records',
            'pharmacy' => 'Pharmacy',
            'laboratory' => 'Laboratory',
            'billing' => 'Billing',
            'wards' => 'Ward Management',
            'reports' => 'Reports',
            'quality' => 'Quality Assurance',
            'admin' => 'System Administration',
            'settings' => 'System Settings',
            'users' => 'User Management',
            'roles' => 'Role Management'
        ];
    }
}
