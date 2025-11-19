<?php

namespace App\Http\Middleware;

use App\Models\SystemLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * LogUserActivity Middleware
 * 
 * Automatically logs user activities
 */
class LogUserActivity
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log for authenticated users and successful requests
        if (Auth::check() && $response->getStatusCode() < 400) {
            $this->logActivity($request, $response);
        }

        return $response;
    }

    /**
     * Log the user activity
     */
    private function logActivity(Request $request, Response $response): void
    {
        try {
            $user = Auth::user();
            $route = $request->route();
            
            if (!$route) {
                return;
            }

            $action = $this->determineAction($request);
            $module = $this->determineModule($route);
            $description = $this->generateDescription($request, $route, $action);

            // Skip logging for certain routes
            if ($this->shouldSkipLogging($route, $action)) {
                return;
            }

            SystemLog::logActivity(
                $user->id,
                $action,
                $module,
                $description,
                $request->ip(),
                $request->userAgent()
            );

        } catch (\Exception $e) {
            // Don't let logging errors break the application
            \Log::error('Failed to log user activity: ' . $e->getMessage());
        }
    }

    /**
     * Determine the action based on HTTP method and route
     */
    private function determineAction(Request $request): string
    {
        $method = $request->method();
        $routeName = $request->route()?->getName() ?? '';

        // Map HTTP methods to actions
        $actionMap = [
            'GET' => 'view',
            'POST' => 'create',
            'PUT' => 'update',
            'PATCH' => 'update',
            'DELETE' => 'delete'
        ];

        $action = $actionMap[$method] ?? 'view';

        // Override based on route name patterns
        if (str_contains($routeName, '.store')) {
            $action = 'create';
        } elseif (str_contains($routeName, '.update')) {
            $action = 'update';
        } elseif (str_contains($routeName, '.destroy')) {
            $action = 'delete';
        } elseif (str_contains($routeName, '.show')) {
            $action = 'view';
        } elseif (str_contains($routeName, '.index')) {
            $action = 'view';
        }

        return $action;
    }

    /**
     * Determine the module based on route
     */
    private function determineModule($route): string
    {
        $routeName = $route->getName() ?? '';
        $uri = $route->uri();

        // Extract module from route name
        if ($routeName) {
            $parts = explode('.', $routeName);
            if (count($parts) > 1) {
                return $parts[0];
            }
        }

        // Extract module from URI
        $uriParts = explode('/', trim($uri, '/'));
        if (count($uriParts) > 0) {
            $module = $uriParts[0];
            
            // Map common URI patterns to modules
            $moduleMap = [
                'api' => $uriParts[1] ?? 'api',
                'admin' => 'admin',
                'dashboard' => 'dashboard',
                'patients' => 'patients',
                'appointments' => 'appointments',
                'medical-records' => 'medical_records',
                'pharmacy' => 'pharmacy',
                'laboratory' => 'laboratory',
                'billing' => 'billing',
                'wards' => 'wards',
                'reports' => 'reports',
                'quality' => 'quality',
                'settings' => 'settings',
                'users' => 'users',
                'roles' => 'roles'
            ];

            return $moduleMap[$module] ?? $module;
        }

        return 'unknown';
    }

    /**
     * Generate description for the activity
     */
    private function generateDescription(Request $request, $route, string $action): string
    {
        $routeName = $route->getName() ?? '';
        $uri = $route->uri();
        $method = $request->method();

        // Get resource name from route parameters
        $resourceName = $this->getResourceName($route);

        // Generate description based on action and resource
        switch ($action) {
            case 'create':
                return "Created {$resourceName}";
            case 'update':
                return "Updated {$resourceName}";
            case 'delete':
                return "Deleted {$resourceName}";
            case 'view':
                return "Viewed {$resourceName}";
            default:
                return "Performed {$action} on {$resourceName}";
        }
    }

    /**
     * Get resource name from route
     */
    private function getResourceName($route): string
    {
        $routeName = $route->getName() ?? '';
        $uri = $route->uri();

        // Extract resource from route name
        if ($routeName) {
            $parts = explode('.', $routeName);
            if (count($parts) > 1) {
                $resource = $parts[0];
                return $this->formatResourceName($resource);
            }
        }

        // Extract resource from URI
        $uriParts = explode('/', trim($uri, '/'));
        if (count($uriParts) > 0) {
            $resource = $uriParts[0];
            return $this->formatResourceName($resource);
        }

        return 'resource';
    }

    /**
     * Format resource name for display
     */
    private function formatResourceName(string $resource): string
    {
        // Convert kebab-case and snake_case to readable format
        $formatted = str_replace(['-', '_'], ' ', $resource);
        $formatted = ucwords($formatted);
        
        // Handle special cases
        $specialCases = [
            'medical-records' => 'Medical Record',
            'medical_records' => 'Medical Record',
            'api' => 'API',
            'admin' => 'Admin Panel'
        ];

        return $specialCases[$resource] ?? $formatted;
    }

    /**
     * Determine if logging should be skipped for this route/action
     */
    private function shouldSkipLogging($route, string $action): bool
    {
        $routeName = $route->getName() ?? '';
        $uri = $route->uri();

        // Skip certain routes
        $skipRoutes = [
            'login',
            'logout',
            'password.reset',
            'verification.notice',
            'verification.verify',
            'password.confirm',
            'password.email',
            'password.update'
        ];

        foreach ($skipRoutes as $skipRoute) {
            if (str_contains($routeName, $skipRoute) || str_contains($uri, $skipRoute)) {
                return true;
            }
        }

        // Skip certain actions for specific modules
        $skipActions = [
            'api' => ['view'], // Skip API view requests to reduce noise
            'assets' => ['view'], // Skip asset requests
            'css' => ['view'],
            'js' => ['view'],
            'images' => ['view']
        ];

        $module = $this->determineModule($route);
        if (isset($skipActions[$module]) && in_array($action, $skipActions[$module])) {
            return true;
        }

        // Skip if it's a health check or monitoring endpoint
        if (str_contains($uri, 'health') || str_contains($uri, 'status') || str_contains($uri, 'ping')) {
            return true;
        }

        return false;
    }

    /**
     * Get route parameters for more detailed logging
     */
    private function getRouteParameters($route): array
    {
        $parameters = $route->parameters();
        
        // Remove sensitive parameters
        $sensitiveParams = ['password', 'token', 'secret', 'key'];
        foreach ($sensitiveParams as $param) {
            unset($parameters[$param]);
        }

        return $parameters;
    }

    /**
     * Get request data for logging (excluding sensitive data)
     */
    private function getRequestData(Request $request): array
    {
        $data = $request->all();
        
        // Remove sensitive fields
        $sensitiveFields = ['password', 'password_confirmation', 'token', 'secret', 'key', 'api_key'];
        foreach ($sensitiveFields as $field) {
            unset($data[$field]);
        }

        // Limit data size
        if (strlen(json_encode($data)) > 1000) {
            $data = ['data_size' => 'large', 'truncated' => true];
        }

        return $data;
    }
}
