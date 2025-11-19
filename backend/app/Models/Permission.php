<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Permission Model
 * 
 * Manages system permissions
 * 
 * @property int $id
 * @property string $name
 * @property string $display_name
 * @property string|null $description
 * @property string $module
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Permission extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'module'
    ];

    /**
     * Get roles that have this permission
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions');
    }

    /**
     * Get permission by name
     */
    public static function getByName(string $name)
    {
        return static::where('name', $name)->first();
    }

    /**
     * Get permissions by module
     */
    public static function getByModule(string $module)
    {
        return static::where('module', $module)->get();
    }

    /**
     * Get all modules
     */
    public static function getModules(): array
    {
        return static::distinct()->pluck('module')->toArray();
    }

    /**
     * Get default permissions
     */
    public static function getDefaultPermissions(): array
    {
        return [
            // Dashboard permissions
            ['name' => 'dashboard.view', 'display_name' => 'View Dashboard', 'description' => 'Access to main dashboard', 'module' => 'dashboard'],
            ['name' => 'dashboard.analytics', 'display_name' => 'View Analytics', 'description' => 'Access to analytics and reports', 'module' => 'dashboard'],

            // Patient permissions
            ['name' => 'patients.view', 'display_name' => 'View Patients', 'description' => 'View patient information', 'module' => 'patients'],
            ['name' => 'patients.create', 'display_name' => 'Create Patients', 'description' => 'Add new patients', 'module' => 'patients'],
            ['name' => 'patients.edit', 'display_name' => 'Edit Patients', 'description' => 'Modify patient information', 'module' => 'patients'],
            ['name' => 'patients.delete', 'display_name' => 'Delete Patients', 'description' => 'Remove patients', 'module' => 'patients'],

            // Appointment permissions
            ['name' => 'appointments.view', 'display_name' => 'View Appointments', 'description' => 'View appointment schedules', 'module' => 'appointments'],
            ['name' => 'appointments.create', 'display_name' => 'Create Appointments', 'description' => 'Schedule new appointments', 'module' => 'appointments'],
            ['name' => 'appointments.edit', 'display_name' => 'Edit Appointments', 'description' => 'Modify appointments', 'module' => 'appointments'],
            ['name' => 'appointments.delete', 'display_name' => 'Delete Appointments', 'description' => 'Cancel appointments', 'module' => 'appointments'],

            // Medical records permissions
            ['name' => 'medical_records.view', 'display_name' => 'View Medical Records', 'description' => 'Access patient medical records', 'module' => 'medical_records'],
            ['name' => 'medical_records.create', 'display_name' => 'Create Medical Records', 'description' => 'Add new medical records', 'module' => 'medical_records'],
            ['name' => 'medical_records.edit', 'display_name' => 'Edit Medical Records', 'description' => 'Modify medical records', 'module' => 'medical_records'],

            // Pharmacy permissions
            ['name' => 'pharmacy.view', 'display_name' => 'View Pharmacy', 'description' => 'Access pharmacy module', 'module' => 'pharmacy'],
            ['name' => 'pharmacy.manage', 'display_name' => 'Manage Pharmacy', 'description' => 'Manage medications and inventory', 'module' => 'pharmacy'],
            ['name' => 'pharmacy.dispense', 'display_name' => 'Dispense Medications', 'description' => 'Dispense prescribed medications', 'module' => 'pharmacy'],

            // Laboratory permissions
            ['name' => 'laboratory.view', 'display_name' => 'View Laboratory', 'description' => 'Access laboratory module', 'module' => 'laboratory'],
            ['name' => 'laboratory.manage', 'display_name' => 'Manage Laboratory', 'description' => 'Manage lab tests and results', 'module' => 'laboratory'],
            ['name' => 'laboratory.results', 'display_name' => 'Enter Results', 'description' => 'Enter and verify lab results', 'module' => 'laboratory'],

            // Billing permissions
            ['name' => 'billing.view', 'display_name' => 'View Billing', 'description' => 'Access billing information', 'module' => 'billing'],
            ['name' => 'billing.create', 'display_name' => 'Create Invoices', 'description' => 'Generate invoices', 'module' => 'billing'],
            ['name' => 'billing.payments', 'display_name' => 'Process Payments', 'description' => 'Record and process payments', 'module' => 'billing'],

            // Ward management permissions
            ['name' => 'wards.view', 'display_name' => 'View Wards', 'description' => 'Access ward information', 'module' => 'wards'],
            ['name' => 'wards.manage', 'display_name' => 'Manage Wards', 'description' => 'Manage ward and bed allocation', 'module' => 'wards'],
            ['name' => 'wards.admissions', 'display_name' => 'Manage Admissions', 'description' => 'Process patient admissions', 'module' => 'wards'],

            // Reports permissions
            ['name' => 'reports.view', 'display_name' => 'View Reports', 'description' => 'Access reports and analytics', 'module' => 'reports'],
            ['name' => 'reports.generate', 'display_name' => 'Generate Reports', 'description' => 'Create custom reports', 'module' => 'reports'],
            ['name' => 'reports.export', 'display_name' => 'Export Reports', 'description' => 'Export reports to various formats', 'module' => 'reports'],

            // Quality assurance permissions
            ['name' => 'quality.view', 'display_name' => 'View Quality', 'description' => 'Access quality assurance module', 'module' => 'quality'],
            ['name' => 'quality.manage', 'display_name' => 'Manage Quality', 'description' => 'Manage quality standards and audits', 'module' => 'quality'],
            ['name' => 'quality.incidents', 'display_name' => 'Manage Incidents', 'description' => 'Report and manage incidents', 'module' => 'quality'],

            // System administration permissions
            ['name' => 'admin.view', 'display_name' => 'View Admin Panel', 'description' => 'Access administration panel', 'module' => 'admin'],
            ['name' => 'admin.users', 'display_name' => 'Manage Users', 'description' => 'Create and manage user accounts', 'module' => 'admin'],
            ['name' => 'admin.roles', 'display_name' => 'Manage Roles', 'description' => 'Create and manage user roles', 'module' => 'admin'],
            ['name' => 'admin.settings', 'display_name' => 'Manage Settings', 'description' => 'Configure system settings', 'module' => 'admin'],
            ['name' => 'admin.backup', 'display_name' => 'Manage Backups', 'description' => 'Create and restore system backups', 'module' => 'admin'],
            ['name' => 'admin.logs', 'display_name' => 'View System Logs', 'description' => 'Access system activity logs', 'module' => 'admin']
        ];
    }
}
