<?php

namespace App\Services;

use App\Models\SystemLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class LoggerService
{
    /**
     * Log an activity.
     */
    public static function logActivity(
        string $action,
        string $module,
        string $description = null,
        array $metadata = []
    ): void {
        try {
            SystemLog::create([
                'user_id' => Auth::id(),
                'action' => $action,
                'module' => $module,
                'description' => $description,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'metadata' => json_encode($metadata),
                'created_at' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log activity', [
                'action' => $action,
                'module' => $module,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Log a patient activity.
     */
    public static function logPatientActivity(
        string $action,
        int $patientId,
        string $description = null,
        array $additionalData = []
    ): void {
        self::logActivity(
            $action,
            'patients',
            $description,
            array_merge(['patient_id' => $patientId], $additionalData)
        );
    }

    /**
     * Log an appointment activity.
     */
    public static function logAppointmentActivity(
        string $action,
        int $appointmentId,
        string $description = null,
        array $additionalData = []
    ): void {
        self::logActivity(
            $action,
            'appointments',
            $description,
            array_merge(['appointment_id' => $appointmentId], $additionalData)
        );
    }

    /**
     * Log a medical record activity.
     */
    public static function logMedicalRecordActivity(
        string $action,
        int $medicalRecordId,
        string $description = null,
        array $additionalData = []
    ): void {
        self::logActivity(
            $action,
            'medical_records',
            $description,
            array_merge(['medical_record_id' => $medicalRecordId], $additionalData)
        );
    }

    /**
     * Log an error.
     */
    public static function logError(
        string $module,
        \Throwable $exception,
        array $context = []
    ): void {
        $errorData = [
            'exception' => get_class($exception),
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
            'context' => $context
        ];

        Log::error("Error in {$module}", $errorData);

        try {
            SystemLog::create([
                'user_id' => Auth::id(),
                'action' => 'error',
                'module' => $module,
                'description' => $exception->getMessage(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'metadata' => json_encode($errorData),
                'created_at' => now()
            ]);
        } catch (\Exception $e) {
            Log::critical('Failed to log error to database', [
                'original_error' => $exception->getMessage(),
                'logging_error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Log a security event.
     */
    public static function logSecurityEvent(
        string $event,
        string $description = null,
        array $metadata = []
    ): void {
        $securityData = array_merge([
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'method' => request()->method()
        ], $metadata);

        Log::warning("Security Event: {$event}", $securityData);

        try {
            SystemLog::create([
                'user_id' => Auth::id(),
                'action' => 'security_event',
                'module' => 'security',
                'description' => $description ?? $event,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'metadata' => json_encode($securityData),
                'created_at' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log security event', [
                'event' => $event,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Log API request.
     */
    public static function logApiRequest(
        string $endpoint,
        string $method,
        array $requestData = [],
        int $statusCode = null,
        string $responseData = null
    ): void {
        try {
            SystemLog::create([
                'user_id' => Auth::id(),
                'action' => 'api_request',
                'module' => 'api',
                'description' => "{$method} {$endpoint}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'metadata' => json_encode([
                    'endpoint' => $endpoint,
                    'method' => $method,
                    'request_data' => $requestData,
                    'status_code' => $statusCode,
                    'response_data' => $responseData
                ]),
                'created_at' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log API request', [
                'endpoint' => $endpoint,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get user activity logs.
     */
    public static function getUserActivityLogs(int $userId, int $limit = 50): array
    {
        try {
            return SystemLog::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Failed to retrieve user activity logs', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get module activity logs.
     */
    public static function getModuleActivityLogs(string $module, int $limit = 100): array
    {
        try {
            return SystemLog::where('module', $module)
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Failed to retrieve module activity logs', [
                'module' => $module,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Clean old logs.
     */
    public static function cleanOldLogs(int $daysToKeep = 90): int
    {
        try {
            $deletedCount = SystemLog::where('created_at', '<', now()->subDays($daysToKeep))
                ->delete();

            Log::info("Cleaned old logs", [
                'deleted_count' => $deletedCount,
                'days_threshold' => $daysToKeep
            ]);

            return $deletedCount;
        } catch (\Exception $e) {
            Log::error('Failed to clean old logs', [
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }
}


