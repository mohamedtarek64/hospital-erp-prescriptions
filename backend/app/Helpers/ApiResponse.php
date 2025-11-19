<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    /**
     * Return a success response.
     */
    public static function success(
        $data = null,
        string $message = 'Success',
        int $statusCode = 200,
        array $metadata = []
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data
        ];

        if (!empty($metadata)) {
            $response['metadata'] = $metadata;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return an error response.
     */
    public static function error(
        string $message = 'An error occurred',
        int $statusCode = 400,
        $errors = null,
        string $errorCode = null
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        if ($errorCode !== null) {
            $response['error_code'] = $errorCode;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return a validation error response.
     */
    public static function validationError(
        $errors,
        string $message = 'Validation failed'
    ): JsonResponse {
        return self::error($message, 422, $errors, 'VALIDATION_ERROR');
    }

    /**
     * Return a not found response.
     */
    public static function notFound(
        string $message = 'Resource not found'
    ): JsonResponse {
        return self::error($message, 404, null, 'RESOURCE_NOT_FOUND');
    }

    /**
     * Return an unauthorized response.
     */
    public static function unauthorized(
        string $message = 'Unauthorized'
    ): JsonResponse {
        return self::error($message, 401, null, 'UNAUTHORIZED');
    }

    /**
     * Return a forbidden response.
     */
    public static function forbidden(
        string $message = 'Forbidden'
    ): JsonResponse {
        return self::error($message, 403, null, 'FORBIDDEN');
    }

    /**
     * Return a server error response.
     */
    public static function serverError(
        string $message = 'Internal server error'
    ): JsonResponse {
        return self::error($message, 500, null, 'INTERNAL_SERVER_ERROR');
    }

    /**
     * Return a created response.
     */
    public static function created(
        $data = null,
        string $message = 'Resource created successfully'
    ): JsonResponse {
        return self::success($data, $message, 201);
    }

    /**
     * Return an updated response.
     */
    public static function updated(
        $data = null,
        string $message = 'Resource updated successfully'
    ): JsonResponse {
        return self::success($data, $message, 200);
    }

    /**
     * Return a deleted response.
     */
    public static function deleted(
        string $message = 'Resource deleted successfully'
    ): JsonResponse {
        return self::success(null, $message, 200);
    }

    /**
     * Return a paginated response.
     */
    public static function paginated(
        $paginatedData,
        string $message = 'Data retrieved successfully'
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginatedData->items(),
            'pagination' => [
                'current_page' => $paginatedData->currentPage(),
                'per_page' => $paginatedData->perPage(),
                'total' => $paginatedData->total(),
                'last_page' => $paginatedData->lastPage(),
                'from' => $paginatedData->firstItem(),
                'to' => $paginatedData->lastItem()
            ]
        ], 200);
    }

    /**
     * Return a no content response.
     */
    public static function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    /**
     * Return a custom response.
     */
    public static function custom(
        bool $success,
        string $message,
        $data = null,
        int $statusCode = 200,
        array $additional = []
    ): JsonResponse {
        $response = array_merge([
            'success' => $success,
            'message' => $message,
            'data' => $data
        ], $additional);

        return response()->json($response, $statusCode);
    }
}


