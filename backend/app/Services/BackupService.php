<?php

namespace App\Services;

use App\Models\Backup;
use App\Models\SystemLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Process;
use Carbon\Carbon;
use Exception;

/**
 * BackupService
 * 
 * Handles system backup operations
 */
class BackupService
{
    protected $backupPath;
    protected $maxBackups;

    public function __construct()
    {
        $this->backupPath = storage_path('backups');
        $this->maxBackups = config('backup.max_backups', 10);
        
        // Ensure backup directory exists
        if (!file_exists($this->backupPath)) {
            mkdir($this->backupPath, 0755, true);
        }
    }

    /**
     * Create full database backup
     */
    public function createDatabaseBackup(string $type = 'full', int $userId = null): array
    {
        try {
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $filename = "database_backup_{$type}_{$timestamp}.sql";
            $filePath = $this->backupPath . '/' . $filename;

            // Get database configuration
            $database = config('database.connections.' . config('database.default'));
            
            // Create mysqldump command
            $command = $this->buildMysqldumpCommand($database, $filePath);
            
            // Execute backup command
            $result = Process::run($command);
            
            if ($result->failed()) {
                throw new Exception('Backup command failed: ' . $result->errorOutput());
            }

            // Get file size
            $fileSize = filesize($filePath);
            
            // Create backup record
            $backup = Backup::createBackup(
                $filename,
                $filePath,
                $fileSize,
                $type,
                $userId ?? auth()->id(),
                'completed'
            );

            // Log activity
            SystemLog::logActivity(
                $userId ?? auth()->id(),
                'backup',
                'admin',
                "Created {$type} database backup: {$filename}",
                request()->ip(),
                request()->userAgent()
            );

            return [
                'success' => true,
                'backup' => $backup,
                'file_path' => $filePath,
                'file_size' => $fileSize
            ];

        } catch (Exception $e) {
            // Log failed backup
            SystemLog::logActivity(
                $userId ?? auth()->id(),
                'backup',
                'admin',
                "Failed to create database backup: " . $e->getMessage(),
                request()->ip(),
                request()->userAgent()
            );

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Create files backup
     */
    public function createFilesBackup(string $type = 'full', int $userId = null): array
    {
        try {
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $filename = "files_backup_{$type}_{$timestamp}.zip";
            $filePath = $this->backupPath . '/' . $filename;

            // Create zip archive
            $zip = new \ZipArchive();
            if ($zip->open($filePath, \ZipArchive::CREATE) !== TRUE) {
                throw new Exception('Cannot create zip file');
            }

            // Add directories to backup
            $directories = [
                'storage/app' => 'app',
                'storage/logs' => 'logs',
                'public/uploads' => 'uploads'
            ];

            foreach ($directories as $source => $destination) {
                $fullPath = base_path($source);
                if (is_dir($fullPath)) {
                    $this->addDirectoryToZip($zip, $fullPath, $destination);
                }
            }

            $zip->close();

            // Get file size
            $fileSize = filesize($filePath);
            
            // Create backup record
            $backup = Backup::createBackup(
                $filename,
                $filePath,
                $fileSize,
                $type,
                $userId ?? auth()->id(),
                'completed'
            );

            // Log activity
            SystemLog::logActivity(
                $userId ?? auth()->id(),
                'backup',
                'admin',
                "Created {$type} files backup: {$filename}",
                request()->ip(),
                request()->userAgent()
            );

            return [
                'success' => true,
                'backup' => $backup,
                'file_path' => $filePath,
                'file_size' => $fileSize
            ];

        } catch (Exception $e) {
            // Log failed backup
            SystemLog::logActivity(
                $userId ?? auth()->id(),
                'backup',
                'admin',
                "Failed to create files backup: " . $e->getMessage(),
                request()->ip(),
                request()->userAgent()
            );

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Create complete system backup
     */
    public function createCompleteBackup(int $userId = null): array
    {
        try {
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $filename = "complete_backup_{$timestamp}.zip";
            $filePath = $this->backupPath . '/' . $filename;

            // Create zip archive
            $zip = new \ZipArchive();
            if ($zip->open($filePath, \ZipArchive::CREATE) !== TRUE) {
                throw new Exception('Cannot create zip file');
            }

            // Add database backup
            $dbBackup = $this->createDatabaseBackup('full', $userId);
            if ($dbBackup['success']) {
                $zip->addFile($dbBackup['file_path'], 'database.sql');
            }

            // Add files
            $directories = [
                'storage/app' => 'app',
                'storage/logs' => 'logs',
                'public/uploads' => 'uploads',
                'config' => 'config'
            ];

            foreach ($directories as $source => $destination) {
                $fullPath = base_path($source);
                if (is_dir($fullPath)) {
                    $this->addDirectoryToZip($zip, $fullPath, $destination);
                }
            }

            $zip->close();

            // Get file size
            $fileSize = filesize($filePath);
            
            // Create backup record
            $backup = Backup::createBackup(
                $filename,
                $filePath,
                $fileSize,
                'full',
                $userId ?? auth()->id(),
                'completed'
            );

            // Clean up temporary database backup
            if ($dbBackup['success'] && file_exists($dbBackup['file_path'])) {
                unlink($dbBackup['file_path']);
            }

            // Log activity
            SystemLog::logActivity(
                $userId ?? auth()->id(),
                'backup',
                'admin',
                "Created complete system backup: {$filename}",
                request()->ip(),
                request()->userAgent()
            );

            return [
                'success' => true,
                'backup' => $backup,
                'file_path' => $filePath,
                'file_size' => $fileSize
            ];

        } catch (Exception $e) {
            // Log failed backup
            SystemLog::logActivity(
                $userId ?? auth()->id(),
                'backup',
                'admin',
                "Failed to create complete backup: " . $e->getMessage(),
                request()->ip(),
                request()->userAgent()
            );

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Restore database from backup
     */
    public function restoreDatabase(Backup $backup): array
    {
        try {
            if (!$backup->fileExists()) {
                throw new Exception('Backup file not found');
            }

            // Get database configuration
            $database = config('database.connections.' . config('database.default'));
            
            // Create restore command
            $command = $this->buildMysqlRestoreCommand($database, $backup->file_path);
            
            // Execute restore command
            $result = Process::run($command);
            
            if ($result->failed()) {
                throw new Exception('Restore command failed: ' . $result->errorOutput());
            }

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'restore',
                'admin',
                "Restored database from backup: {$backup->filename}",
                request()->ip(),
                request()->userAgent()
            );

            return [
                'success' => true,
                'message' => 'Database restored successfully'
            ];

        } catch (Exception $e) {
            // Log failed restore
            SystemLog::logActivity(
                auth()->id(),
                'restore',
                'admin',
                "Failed to restore database: " . $e->getMessage(),
                request()->ip(),
                request()->userAgent()
            );

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Download backup file
     */
    public function downloadBackup(Backup $backup): array
    {
        try {
            if (!$backup->fileExists()) {
                throw new Exception('Backup file not found');
            }

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'view',
                'admin',
                "Downloaded backup: {$backup->filename}",
                request()->ip(),
                request()->userAgent()
            );

            return [
                'success' => true,
                'file_path' => $backup->file_path,
                'filename' => $backup->filename
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Clean old backups
     */
    public function cleanOldBackups(int $days = 30): int
    {
        return Backup::cleanOldBackups($days);
    }

    /**
     * Get backup statistics
     */
    public function getBackupStatistics(): array
    {
        return Backup::getStatistics();
    }

    /**
     * Schedule automatic backup
     */
    public function scheduleBackup(string $type, string $frequency, int $userId = null): array
    {
        try {
            // This would typically integrate with a job scheduler like Laravel Horizon
            // For now, we'll just create a scheduled backup record
            
            $backup = Backup::create([
                'filename' => "scheduled_{$type}_backup_" . Carbon::now()->format('Y-m-d_H-i-s'),
                'file_path' => '',
                'file_size' => 0,
                'type' => $type,
                'status' => 'scheduled',
                'created_by' => $userId ?? auth()->id()
            ]);

            // Log activity
            SystemLog::logActivity(
                $userId ?? auth()->id(),
                'create',
                'admin',
                "Scheduled {$frequency} {$type} backup",
                request()->ip(),
                request()->userAgent()
            );

            return [
                'success' => true,
                'backup' => $backup,
                'message' => 'Backup scheduled successfully'
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Build mysqldump command
     */
    private function buildMysqldumpCommand(array $database, string $filePath): string
    {
        $command = "mysqldump";
        $command .= " --host={$database['host']}";
        $command .= " --port={$database['port']}";
        $command .= " --user={$database['username']}";
        
        if (!empty($database['password'])) {
            $command .= " --password={$database['password']}";
        }
        
        $command .= " --single-transaction";
        $command .= " --routines";
        $command .= " --triggers";
        $command .= " {$database['database']}";
        $command .= " > {$filePath}";

        return $command;
    }

    /**
     * Build mysql restore command
     */
    private function buildMysqlRestoreCommand(array $database, string $filePath): string
    {
        $command = "mysql";
        $command .= " --host={$database['host']}";
        $command .= " --port={$database['port']}";
        $command .= " --user={$database['username']}";
        
        if (!empty($database['password'])) {
            $command .= " --password={$database['password']}";
        }
        
        $command .= " {$database['database']}";
        $command .= " < {$filePath}";

        return $command;
    }

    /**
     * Add directory to zip recursively
     */
    private function addDirectoryToZip(\ZipArchive $zip, string $source, string $destination): void
    {
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($source, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            $filePath = $file->getRealPath();
            $relativePath = $destination . '/' . substr($filePath, strlen($source) + 1);

            if ($file->isDir()) {
                $zip->addEmptyDir($relativePath);
            } else {
                $zip->addFile($filePath, $relativePath);
            }
        }
    }
}
