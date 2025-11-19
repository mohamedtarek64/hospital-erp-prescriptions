<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;

class ApiErrorHandler
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            return $next($request);
        } catch (\Throwable $e) {
            return $this->handleException($request, $e);
        }
    }

    /**
     * Handle exceptions and return appropriate JSON response.
     */
    protected function handleException(Request $request, \Throwable $exception): JsonResponse
    {
        // Log the exception
        Log::error('API Exception', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_id' => auth()->id(),
            'exception' => get_class($exception),
            'message' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);

        // Handle specific exception types
        if ($exception instanceof ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found',
                'error_code' => 'RESOURCE_NOT_FOUND'
            ], 404);
        }

        if ($exception instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $exception->errors(),
                'error_code' => 'VALIDATION_ERROR'
            ], 422);
        }

        if ($exception instanceof AuthenticationException) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'error_code' => 'UNAUTHENTICATED'
            ], 401);
        }

        if ($exception instanceof AuthorizationException) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'error_code' => 'UNAUTHORIZED'
            ], 403);
        }

        // Default error response
        $statusCode = method_exists($exception, 'getStatusCode') 
            ? $exception->getStatusCode() 
            : 500;

        $message = config('app.debug') 
            ? $exception->getMessage() 
            : 'An error occurred while processing your request';

        return response()->json([
            'success' => false,
            'message' => $message,
            'error_code' => 'INTERNAL_SERVER_ERROR',
            'debug' => config('app.debug') ? [
                'exception' => get_class($exception),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTrace()
            ] : null
        ], $statusCode);
    }
}


