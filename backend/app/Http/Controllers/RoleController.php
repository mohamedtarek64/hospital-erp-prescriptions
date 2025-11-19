<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

/**
 * RoleController
 * 
 * Handles role and permission management
 */
class RoleController extends Controller
{
    /**
     * Get all roles
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Role::with(['permissions']);

            // Search
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('display_name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $roles = $query->orderBy('name')
                          ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $roles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all permissions
     */
    public function permissions(Request $request): JsonResponse
    {
        try {
            $query = Permission::query();

            // Filter by module
            if ($request->has('module') && $request->module) {
                $query->where('module', $request->module);
            }

            // Search
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('display_name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $permissions = $query->orderBy('module')
                               ->orderBy('name')
                               ->paginate($request->get('per_page', 50));

            return response()->json([
                'success' => true,
                'data' => $permissions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get permissions grouped by module
     */
    public function permissionsByModule(): JsonResponse
    {
        try {
            $permissions = Permission::orderBy('module')
                                   ->orderBy('name')
                                   ->get()
                                   ->groupBy('module');

            return response()->json([
                'success' => true,
                'data' => $permissions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load permissions by module',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available modules
     */
    public function modules(): JsonResponse
    {
        try {
            $modules = Permission::getModules();

            return response()->json([
                'success' => true,
                'data' => $modules
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load modules',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get role with permissions
     */
    public function show(Role $role): JsonResponse
    {
        try {
            $role->load('permissions');

            return response()->json([
                'success' => true,
                'data' => $role
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new role
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:roles',
                'display_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'permissions' => 'array',
                'permissions.*' => 'exists:permissions,id'
            ]);

            $role = Role::create([
                'name' => $validated['name'],
                'display_name' => $validated['display_name'],
                'description' => $validated['description']
            ]);

            if (isset($validated['permissions'])) {
                $role->permissions()->sync($validated['permissions']);
            }

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'create',
                'roles',
                "Created role: {$role->display_name}",
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Role created successfully',
                'data' => $role->load('permissions')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update role
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255', Rule::unique('roles')->ignore($role->id)],
                'display_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'permissions' => 'array',
                'permissions.*' => 'exists:permissions,id'
            ]);

            $role->update([
                'name' => $validated['name'],
                'display_name' => $validated['display_name'],
                'description' => $validated['description']
            ]);

            if (isset($validated['permissions'])) {
                $role->permissions()->sync($validated['permissions']);
            }

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'update',
                'roles',
                "Updated role: {$role->display_name}",
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'data' => $role->load('permissions')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete role
     */
    public function destroy(Role $role): JsonResponse
    {
        try {
            // Check if role is in use
            if ($role->users()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete role that is assigned to users'
                ], 400);
            }

            $roleName = $role->display_name;
            $role->delete();

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'delete',
                'roles',
                "Deleted role: {$roleName}",
                request()->ip(),
                request()->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign permissions to role
     */
    public function assignPermissions(Request $request, Role $role): JsonResponse
    {
        try {
            $validated = $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'exists:permissions,id'
            ]);

            $role->permissions()->sync($validated['permissions']);

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'update',
                'roles',
                "Updated permissions for role: {$role->display_name}",
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Permissions assigned successfully',
                'data' => $role->load('permissions')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Revoke permission from role
     */
    public function revokePermission(Role $role, Permission $permission): JsonResponse
    {
        try {
            $role->revokePermission($permission);

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'update',
                'roles',
                "Revoked permission '{$permission->display_name}' from role: {$role->display_name}",
                request()->ip(),
                request()->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Permission revoked successfully',
                'data' => $role->load('permissions')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Give permission to role
     */
    public function givePermission(Role $role, Permission $permission): JsonResponse
    {
        try {
            $role->givePermission($permission);

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'update',
                'roles',
                "Gave permission '{$permission->display_name}' to role: {$role->display_name}",
                request()->ip(),
                request()->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Permission granted successfully',
                'data' => $role->load('permissions')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to grant permission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clone role
     */
    public function clone(Request $request, Role $role): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:roles',
                'display_name' => 'required|string|max:255'
            ]);

            $newRole = Role::create([
                'name' => $validated['name'],
                'display_name' => $validated['display_name'],
                'description' => "Cloned from {$role->display_name}"
            ]);

            // Copy permissions
            $newRole->permissions()->sync($role->permissions->pluck('id'));

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'create',
                'roles',
                "Cloned role: {$role->display_name} to {$newRole->display_name}",
                $request->ip(),
                $request->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Role cloned successfully',
                'data' => $newRole->load('permissions')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clone role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get role statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_roles' => Role::count(),
                'total_permissions' => Permission::count(),
                'modules' => Permission::getModules(),
                'roles_with_users' => Role::whereHas('users')->count(),
                'unused_roles' => Role::whereDoesntHave('users')->count(),
                'most_used_permissions' => Permission::withCount('roles')
                    ->orderBy('roles_count', 'desc')
                    ->limit(10)
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load role statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Initialize default roles and permissions
     */
    public function initializeDefaults(): JsonResponse
    {
        try {
            // Create default roles
            $defaultRoles = Role::getDefaultRoles();
            foreach ($defaultRoles as $roleData) {
                Role::firstOrCreate(
                    ['name' => $roleData['name']],
                    $roleData
                );
            }

            // Create default permissions
            $defaultPermissions = Permission::getDefaultPermissions();
            foreach ($defaultPermissions as $permissionData) {
                Permission::firstOrCreate(
                    ['name' => $permissionData['name']],
                    $permissionData
                );
            }

            // Log activity
            SystemLog::logActivity(
                auth()->id(),
                'create',
                'roles',
                'Initialized default roles and permissions',
                request()->ip(),
                request()->userAgent()
            );

            return response()->json([
                'success' => true,
                'message' => 'Default roles and permissions initialized successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize defaults',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
