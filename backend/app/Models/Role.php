<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Role Model
 * 
 * Manages user roles and permissions
 * 
 * @property int $id
 * @property string $name
 * @property string $display_name
 * @property string|null $description
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Role extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'display_name',
        'description'
    ];

    /**
     * Get permissions for this role
     */
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permissions');
    }

    /**
     * Get users with this role
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles');
    }

    /**
     * Check if role has specific permission
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions()->where('name', $permission)->exists();
    }

    /**
     * Give permission to role
     */
    public function givePermission(Permission $permission): void
    {
        if (!$this->hasPermission($permission->name)) {
            $this->permissions()->attach($permission);
        }
    }

    /**
     * Revoke permission from role
     */
    public function revokePermission(Permission $permission): void
    {
        $this->permissions()->detach($permission);
    }

    /**
     * Sync permissions for role
     */
    public function syncPermissions(array $permissions): void
    {
        $this->permissions()->sync($permissions);
    }

    /**
     * Get role by name
     */
    public static function getByName(string $name)
    {
        return static::where('name', $name)->first();
    }

    /**
     * Get default roles
     */
    public static function getDefaultRoles(): array
    {
        return [
            [
                'name' => 'super_admin',
                'display_name' => 'Super Administrator',
                'description' => 'Full system access with all permissions'
            ],
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Administrative access with most permissions'
            ],
            [
                'name' => 'doctor',
                'display_name' => 'Doctor',
                'description' => 'Medical staff with patient and medical record access'
            ],
            [
                'name' => 'nurse',
                'display_name' => 'Nurse',
                'description' => 'Nursing staff with patient care access'
            ],
            [
                'name' => 'receptionist',
                'display_name' => 'Receptionist',
                'description' => 'Front desk staff with appointment and patient registration access'
            ],
            [
                'name' => 'pharmacist',
                'display_name' => 'Pharmacist',
                'description' => 'Pharmacy staff with medication and inventory access'
            ],
            [
                'name' => 'lab_technician',
                'display_name' => 'Lab Technician',
                'description' => 'Laboratory staff with test and result access'
            ],
            [
                'name' => 'accountant',
                'display_name' => 'Accountant',
                'description' => 'Financial staff with billing and payment access'
            ]
        ];
    }
}
