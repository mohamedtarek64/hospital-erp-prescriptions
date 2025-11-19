<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Backup Model
 * 
 * Manages system backups
 * 
 * @property int $id
 * @property string $filename
 * @property string $file_path
 * @property int $file_size
 * @property string $type
 * @property string $status
 * @property int $created_by
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Backup extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'filename',
        'file_path',
        'file_size',
        'type',
        'status',
        'created_by'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'file_size' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the user who created the backup
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get human readable file size
     */
    public function getFileSizeHumanAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Check if backup file exists
     */
    public function fileExists(): bool
    {
        return file_exists($this->file_path);
    }

    /**
     * Get backup age in days
     */
    public function getAgeInDaysAttribute(): int
    {
        return $this->created_at->diffInDays(now());
    }

    /**
     * Check if backup is recent (within 7 days)
     */
    public function isRecent(): bool
    {
        return $this->age_in_days <= 7;
    }

    /**
     * Check if backup is old (more than 30 days)
     */
    public function isOld(): bool
    {
        return $this->age_in_days > 30;
    }

    /**
     * Get status badge class
     */
    public function getStatusBadgeClassAttribute(): string
    {
        return match ($this->status) {
            'completed' => 'bg-green-100 text-green-800',
            'failed' => 'bg-red-100 text-red-800',
            'in_progress' => 'bg-yellow-100 text-yellow-800',
            'scheduled' => 'bg-blue-100 text-blue-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    /**
     * Get type badge class
     */
    public function getTypeBadgeClassAttribute(): string
    {
        return match ($this->type) {
            'full' => 'bg-purple-100 text-purple-800',
            'incremental' => 'bg-blue-100 text-blue-800',
            'differential' => 'bg-indigo-100 text-indigo-800',
            'manual' => 'bg-green-100 text-green-800',
            'automatic' => 'bg-orange-100 text-orange-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    /**
     * Get backups by type
     */
    public static function getByType(string $type)
    {
        return static::where('type', $type)->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get backups by status
     */
    public static function getByStatus(string $status)
    {
        return static::where('status', $status)->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get recent backups
     */
    public static function getRecent(int $limit = 10)
    {
        return static::with('creator')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get backup statistics
     */
    public static function getStatistics(): array
    {
        return [
            'total_backups' => static::count(),
            'completed_backups' => static::where('status', 'completed')->count(),
            'failed_backups' => static::where('status', 'failed')->count(),
            'total_size' => static::where('status', 'completed')->sum('file_size'),
            'average_size' => static::where('status', 'completed')->avg('file_size'),
            'last_backup' => static::where('status', 'completed')->latest()->first(),
            'backups_today' => static::whereDate('created_at', today())->count(),
            'backups_this_week' => static::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'backups_this_month' => static::whereMonth('created_at', now()->month)->count()
        ];
    }

    /**
     * Clean old backups
     */
    public static function cleanOldBackups(int $days = 30): int
    {
        $cutoffDate = now()->subDays($days);
        $oldBackups = static::where('created_at', '<', $cutoffDate)->get();
        
        $deletedCount = 0;
        foreach ($oldBackups as $backup) {
            if ($backup->fileExists()) {
                unlink($backup->file_path);
            }
            $backup->delete();
            $deletedCount++;
        }
        
        return $deletedCount;
    }

    /**
     * Get available backup types
     */
    public static function getAvailableTypes(): array
    {
        return [
            'full' => 'Full Backup',
            'incremental' => 'Incremental Backup',
            'differential' => 'Differential Backup',
            'manual' => 'Manual Backup',
            'automatic' => 'Automatic Backup'
        ];
    }

    /**
     * Get available backup statuses
     */
    public static function getAvailableStatuses(): array
    {
        return [
            'scheduled' => 'Scheduled',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'failed' => 'Failed',
            'cancelled' => 'Cancelled'
        ];
    }

    /**
     * Create backup record
     */
    public static function createBackup(
        string $filename,
        string $filePath,
        int $fileSize,
        string $type,
        int $createdBy,
        string $status = 'completed'
    ): self {
        return static::create([
            'filename' => $filename,
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'type' => $type,
            'status' => $status,
            'created_by' => $createdBy
        ]);
    }
}
