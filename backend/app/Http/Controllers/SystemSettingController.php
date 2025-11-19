<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

/**
 * SystemSettingController
 * 
 * Handles system settings management
 */
class SystemSettingController extends Controller
{
    /**
     * Get all settings
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = SystemSetting::query();

            // Filter by category
            if ($request->has('category') && $request->category) {
                $query->where('category', $request->category);
            }

            // Filter by type
            if ($request->has('type') && $request->type) {
                $query->where('type', $request->type);
            }

            // Filter by public/private
            if ($request->has('is_public') && $request->is_public !== null) {
                $query->where('is_public', $request->boolean('is_public'));
            }

            // Search
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('key', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $settings = $query->orderBy('category')
                            ->orderBy('key')
                            ->paginate($request->get('per_page', 50));

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
     * Get settings by category
     */
    public function getByCategory(string $category): JsonResponse
    {
        try {
            $settings = SystemSetting::where('category', $category)
                                   ->orderBy('key')
                                   ->get();

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load settings for category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get public settings
     */
    public function getPublicSettings(): JsonResponse
    {
        try {
            $settings = SystemSetting::getPublicSettings();

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load public settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get setting by key
     */
    public function getByKey(string $key): JsonResponse
    {
        try {
            $setting = SystemSetting::where('key', $key)->first();

            if (!$setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Setting not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new setting
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'key' => 'required|string|max:255|unique:system_settings',
                'value' => 'required',
                'type' => 'required|in:string,integer,float,boolean,json',
                'description' => 'nullable|string',
                'category' => 'required|string|max:255',
                'is_public' => 'boolean'
            ]);

            $setting = SystemSetting::create($validated);

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'create',
                'settings',
                "Created setting: {$setting->key}",
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Setting created successfully',
                'data' => $setting
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update setting
     */
    public function update(Request $request, SystemSetting $setting): JsonResponse
    {
        try {
            $validated = $request->validate([
                'key' => ['required', 'string', 'max:255', Rule::unique('system_settings')->ignore($setting->id)],
                'value' => 'required',
                'type' => 'required|in:string,integer,float,boolean,json',
                'description' => 'nullable|string',
                'category' => 'required|string|max:255',
                'is_public' => 'boolean'
            ]);

            $oldValue = $setting->value;
            $setting->update($validated);

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'update',
                'settings',
                "Updated setting: {$setting->key} (from: {$oldValue} to: {$setting->value})",
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Setting updated successfully',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update setting by key
     */
    public function updateByKey(Request $request, string $key): JsonResponse
    {
        try {
            $validated = $request->validate([
                'value' => 'required'
            ]);

            $setting = SystemSetting::where('key', $key)->first();

            if (!$setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Setting not found'
                ], 404);
            }

            $oldValue = $setting->value;
            $setting->update(['value' => $validated['value']]);

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'update',
                'settings',
                "Updated setting: {$key} (from: {$oldValue} to: {$setting->value})",
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Setting updated successfully',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete setting
     */
    public function destroy(SystemSetting $setting): JsonResponse
    {
        try {
            $key = $setting->key;
            $setting->delete();

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'delete',
                'settings',
                "Deleted setting: {$key}",
                request()->ip(),
                request()->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Setting deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update settings
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'settings' => 'required|array',
                'settings.*.key' => 'required|string',
                'settings.*.value' => 'required'
            ]);

            $updatedCount = 0;
            $errors = [];

            foreach ($validated['settings'] as $settingData) {
                try {
                    $setting = SystemSetting::where('key', $settingData['key'])->first();
                    
                    if ($setting) {
                        $setting->update(['value' => $settingData['value']]);
                        $updatedCount++;
                    } else {
                        $errors[] = "Setting '{$settingData['key']}' not found";
                    }
                } catch (\Exception $e) {
                    $errors[] = "Failed to update '{$settingData['key']}': " . $e->getMessage();
                }
            }

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'update',
                'settings',
                "Bulk updated {$updatedCount} settings",
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => "Updated {$updatedCount} settings",
                'data' => [
                    'updated_count' => $updatedCount,
                    'errors' => $errors
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available categories
     */
    public function getCategories(): JsonResponse
    {
        try {
            $categories = SystemSetting::distinct()
                                     ->pluck('category')
                                     ->sort()
                                     ->values();

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available types
     */
    public function getTypes(): JsonResponse
    {
        try {
            $types = ['string', 'integer', 'float', 'boolean', 'json'];

            return response()->json([
                'success' => true,
                'data' => $types
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load types',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset setting to default
     */
    public function resetToDefault(SystemSetting $setting): JsonResponse
    {
        try {
            $defaults = $this->getDefaultSettings();
            $key = $setting->key;

            if (isset($defaults[$key])) {
                $setting->update(['value' => $defaults[$key]['value']]);

                // Log activity
                SystemLog::logActivity(
                    auth()->id(),
                    'update',
                    'settings',
                    "Reset setting to default: {$key}",
                    request()->ip(),
                    request()->userAgent()
                );

                return response()->json([
                    'success' => true,
                    'message' => 'Setting reset to default successfully',
                    'data' => $setting
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No default value found for this setting'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get default settings
     */
    private function getDefaultSettings(): array
    {
        return [
            'app_name' => [
                'value' => 'Hospital Management System',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Application name'
            ],
            'app_timezone' => [
                'value' => 'UTC',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Application timezone'
            ],
            'app_locale' => [
                'value' => 'en',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Application locale'
            ],
            'maintenance_mode' => [
                'value' => false,
                'type' => 'boolean',
                'category' => 'system',
                'description' => 'Maintenance mode status'
            ],
            'backup_frequency' => [
                'value' => 'daily',
                'type' => 'string',
                'category' => 'backup',
                'description' => 'Backup frequency'
            ],
            'log_retention_days' => [
                'value' => 90,
                'type' => 'integer',
                'category' => 'system',
                'description' => 'Log retention period in days'
            ]
        ];
    }
}
