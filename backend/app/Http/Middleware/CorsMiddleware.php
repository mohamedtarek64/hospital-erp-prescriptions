<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->headers->get('Origin');
        
        // Define allowed origins
        $allowedOrigins = [
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];
        
        // Check if origin is allowed
        $allowOrigin = in_array($origin, $allowedOrigins) ? $origin : null;
        
        // Handle preflight requests
        if ($request->isMethod('OPTIONS')) {
            $response = response('', 200);
            if ($allowOrigin) {
                $response->header('Access-Control-Allow-Origin', $allowOrigin)
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-TOKEN, X-Socket-ID')
                    ->header('Access-Control-Allow-Credentials', 'true')
                    ->header('Access-Control-Max-Age', '86400');
            }
            return $response;
        }

        $response = $next($request);

        // Only add CORS headers if not already present and origin is allowed
        if ($allowOrigin && !$response->headers->has('Access-Control-Allow-Origin')) {
            $response->headers->set('Access-Control-Allow-Origin', $allowOrigin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-TOKEN, X-Socket-ID');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }

        return $response;
    }
}
