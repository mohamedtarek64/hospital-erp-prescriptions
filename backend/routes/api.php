<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\LabTestController;
use App\Http\Controllers\LabRequestController;
use App\Http\Controllers\LabResultController;
use App\Http\Controllers\LabSampleController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\WardController;
use App\Http\Controllers\BedController;
use App\Http\Controllers\AdmissionController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\EmergencyController;
use App\Http\Controllers\AmbulanceController;
use App\Http\Controllers\TriageController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\InsuranceClaimController;
use App\Http\Controllers\QualityStandardController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\IncidentController;
use App\Http\Controllers\ComplianceRecordController;
use App\Http\Controllers\TrainingRecordController;
use App\Http\Controllers\SystemSettingController;
use App\Http\Controllers\AssetDepreciationController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ServiceCategoryController;
use App\Http\Controllers\EquipmentCategoryController;
use App\Http\Controllers\ReportCategoryController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\PerformanceReviewController;
use App\Http\Controllers\VisitorLogController;
use App\Http\Controllers\WardRoundController;
use App\Http\Controllers\BedTransferController;
use App\Http\Controllers\CriticalAlertController;
use App\Http\Controllers\EmergencyEquipmentController;
use App\Http\Controllers\EmergencyStaffScheduleController;
use App\Http\Controllers\EmergencyContactController;
use App\Http\Controllers\EquipmentIssueController;
use App\Http\Controllers\EquipmentLocationController;
use App\Http\Controllers\EquipmentTransferController;
use App\Http\Controllers\EquipmentUsageLogController;
use App\Http\Controllers\MaintenanceRecordController;
use App\Http\Controllers\MaintenanceScheduleController;
use App\Http\Controllers\MedicalAttachmentController;
use App\Http\Controllers\MedicalTestController;
use App\Http\Controllers\MedicineInventoryController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\PurchaseOrderItemController;
use App\Http\Controllers\PrescriptionDispensingController;
use App\Http\Controllers\ServiceContractController;
use App\Http\Controllers\SystemBackupController;
use App\Http\Controllers\UserDashboardLayoutController;
use App\Http\Controllers\UserPermissionController;
use App\Http\Controllers\UserRoleController;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\DiagnosisController;
use App\Http\Controllers\AssetCategoryController;
use App\Http\Controllers\AssetTransferController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\DashboardWidgetController;
use App\Http\Controllers\ReportExecutionController;
use App\Http\Controllers\SystemLogController;
use App\Http\Controllers\TriageAssessmentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes (no authentication required)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    
    // Authentication routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/activities', [DashboardController::class, 'activities']);
    
    // Patients
    Route::apiResource('patients', PatientController::class);
    Route::get('/patients/search', [PatientController::class, 'search']);
    Route::get('/patients/{id}/medical-history', [PatientController::class, 'medicalHistory']);
    Route::get('/patients/statistics', [PatientController::class, 'statistics']);
    Route::get('/patients/stats', [PatientController::class, 'statistics']);
    Route::get('/patients/{id}/appointments', [PatientController::class, 'appointments']);
    Route::get('/patients/{id}/prescriptions', [PatientController::class, 'prescriptions']);
    Route::get('/patients/{id}/invoices', [PatientController::class, 'invoices']);
    Route::get('/patients/{id}/lab-requests', [PatientController::class, 'labRequests']);
    Route::post('/patients/{id}/emergency-contact', [PatientController::class, 'updateEmergencyContact']);
    Route::get('/patients/export', [PatientController::class, 'export']);
    Route::post('/patients/import', [PatientController::class, 'import']);
    
    // Appointments
    Route::apiResource('appointments', AppointmentController::class);
    Route::get('/appointments/calendar', [AppointmentController::class, 'calendar']);
    Route::get('/appointments/today', [AppointmentController::class, 'today']);
    
    // Medical Records
    Route::apiResource('medical-records', MedicalRecordController::class);
    Route::get('/medical-records/patient/{patientId}', [MedicalRecordController::class, 'patientHistory']);
    Route::post('/medical-records/{id}/attachments', [MedicalRecordController::class, 'addAttachment']);
    
    // Pharmacy
    Route::prefix('pharmacy')->group(function () {
        Route::apiResource('medicines', PharmacyController::class);
        Route::apiResource('suppliers', SupplierController::class);
        Route::apiResource('orders', PurchaseOrderController::class);
        Route::apiResource('prescriptions', PrescriptionController::class);
        Route::get('/inventory', [PharmacyController::class, 'inventory']);
        Route::get('/prescriptions', [PharmacyController::class, 'prescriptions']);
        Route::get('/suppliers', [PharmacyController::class, 'suppliers']);
        Route::get('/purchase-orders', [PharmacyController::class, 'purchaseOrders']);
        Route::post('/medicines/{id}/stock', [PharmacyController::class, 'updateStock']);
        Route::patch('/prescriptions/{id}/process', [PrescriptionController::class, 'process']);
    });
    
    // Billing
    Route::prefix('billing')->group(function () {
        Route::apiResource('invoices', InvoiceController::class);
        Route::apiResource('payments', PaymentController::class);
        Route::apiResource('services', ServiceController::class);
        Route::apiResource('insurance-claims', InsuranceClaimController::class);
        Route::get('/reports', [BillingController::class, 'reports']);
    });
    
    // Laboratory
    Route::prefix('laboratory')->group(function () {
        Route::apiResource('tests', LabTestController::class);
        Route::apiResource('requests', LabRequestController::class);
        Route::apiResource('results', LabResultController::class);
        Route::apiResource('samples', LabSampleController::class);
        Route::get('/dashboard', [LabTestController::class, 'dashboard']);
        Route::post('/requests/{id}/process', [LabRequestController::class, 'process']);
        Route::post('/samples/{id}/collect', [LabSampleController::class, 'collect']);
    });
    
    // HR Management
    Route::prefix('hr')->group(function () {
        Route::apiResource('employees', EmployeeController::class);
        Route::apiResource('attendance', AttendanceController::class);
        Route::apiResource('leave-requests', LeaveRequestController::class);
        Route::apiResource('payroll', PayrollController::class);
        Route::apiResource('departments', DepartmentController::class);
        Route::get('/dashboard', [EmployeeController::class, 'dashboard']);
        Route::post('/attendance/clock-in', [AttendanceController::class, 'clockIn']);
        Route::post('/attendance/clock-out', [AttendanceController::class, 'clockOut']);
    });
    
    // Ward Management
    Route::prefix('ward-management')->group(function () {
        Route::apiResource('wards', WardController::class);
        Route::apiResource('beds', BedController::class);
        Route::apiResource('admissions', AdmissionController::class);
        Route::apiResource('transfers', BedTransferController::class);
        Route::get('/dashboard', [WardController::class, 'dashboard']);
        Route::get('/beds/available', [BedController::class, 'available']);
        Route::post('/admissions/{id}/discharge', [AdmissionController::class, 'discharge']);
    });
    
    // Emergency Management
    Route::prefix('emergency')->group(function () {
        Route::apiResource('cases', EmergencyController::class);
        Route::apiResource('ambulances', AmbulanceController::class);
        Route::apiResource('triage', TriageController::class);
        Route::apiResource('alerts', CriticalAlertController::class);
        Route::get('/dashboard', [EmergencyController::class, 'dashboard']);
        Route::post('/ambulances/{id}/dispatch', [AmbulanceController::class, 'dispatch']);
        Route::post('/triage/{id}/assess', [TriageController::class, 'assess']);
    });
    
    // Equipment Management
    Route::prefix('equipment')->group(function () {
        Route::apiResource('list', EquipmentController::class);
        Route::apiResource('maintenance', MaintenanceController::class);
        Route::apiResource('locations', EquipmentLocationController::class);
        Route::apiResource('contracts', ServiceContractController::class);
        Route::get('/dashboard', [EquipmentController::class, 'dashboard']);
        Route::post('/maintenance/schedule', [MaintenanceController::class, 'schedule']);
    });
    
    // Reports & Analytics
    Route::prefix('reports')->group(function () {
        Route::apiResource('list', ReportController::class);
        Route::post('/generate', [ReportController::class, 'generate']);
        Route::get('/templates', [ReportController::class, 'templates']);
        Route::get('/analytics', [AnalyticsController::class, 'index']);
        Route::get('/analytics/kpis', [AnalyticsController::class, 'kpis']);
        Route::get('/analytics/charts/{type}', [AnalyticsController::class, 'charts']);
    });
    
    // System Administration
    Route::prefix('admin')->group(function () {
        Route::apiResource('users', AdminController::class);
        Route::apiResource('roles', RoleController::class);
        Route::apiResource('permissions', UserPermissionController::class);
        Route::apiResource('settings', SystemSettingController::class);
        Route::apiResource('logs', SystemLogController::class);
        Route::apiResource('backups', SystemBackupController::class);
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
    });
    
    // Quality Assurance
    Route::prefix('quality-assurance')->group(function () {
        Route::apiResource('standards', QualityStandardController::class);
        Route::apiResource('audits', AuditController::class);
        Route::apiResource('incidents', IncidentController::class);
        Route::apiResource('compliance', ComplianceRecordController::class);
        Route::apiResource('training', TrainingRecordController::class);
        Route::get('/dashboard', [QualityStandardController::class, 'dashboard']);
    });
    
    // Prescriptions
    Route::apiResource('prescriptions', PrescriptionController::class);
    Route::post('/prescriptions/{id}/dispense', [PrescriptionController::class, 'dispense']);
    
    // Suppliers
    Route::apiResource('suppliers', SupplierController::class);
    
    // Service Categories
    Route::apiResource('service-categories', ServiceCategoryController::class);
    
    // Equipment Categories
    Route::apiResource('equipment-categories', EquipmentCategoryController::class);
    
    // Report Categories
    Route::apiResource('report-categories', ReportCategoryController::class);
    
    // Leave Types
    Route::apiResource('leave-types', LeaveTypeController::class);
    
    // Diagnoses
    Route::apiResource('diagnoses', DiagnosisController::class);
    
    // Asset Management
    Route::prefix('assets')->group(function () {
        Route::apiResource('categories', AssetCategoryController::class);
        Route::apiResource('depreciation', AssetDepreciationController::class);
        Route::apiResource('transfers', AssetTransferController::class);
    });
    
    // Inventory
    Route::apiResource('inventory', InventoryController::class);
    
    // Medicine Inventory
    Route::apiResource('medicine-inventory', MedicineInventoryController::class);
    
    // Purchase Orders
    Route::apiResource('purchase-orders', PurchaseOrderController::class);
    Route::apiResource('purchase-order-items', PurchaseOrderItemController::class);
    
    // Prescription Dispensing
    Route::apiResource('prescription-dispensing', PrescriptionDispensingController::class);
    
    // Service Contracts
    Route::apiResource('service-contracts', ServiceContractController::class);
    
    // System Backups
    Route::apiResource('system-backups', SystemBackupController::class);
    
    // User Dashboard Layouts
    Route::apiResource('user-dashboard-layouts', UserDashboardLayoutController::class);
    
    // User Roles
    Route::apiResource('user-roles', UserRoleController::class);
    
    // Performance Reviews
    Route::apiResource('performance-reviews', PerformanceReviewController::class);
    
    // Visitor Logs
    Route::apiResource('visitor-logs', VisitorLogController::class);
    
    // Ward Rounds
    Route::apiResource('ward-rounds', WardRoundController::class);
    
    // Emergency Equipment
    Route::apiResource('emergency-equipment', EmergencyEquipmentController::class);
    
    // Emergency Staff Schedules
    Route::apiResource('emergency-staff-schedules', EmergencyStaffScheduleController::class);
    
    // Emergency Contacts
    Route::apiResource('emergency-contacts', EmergencyContactController::class);
    
    // Equipment Issues
    Route::apiResource('equipment-issues', EquipmentIssueController::class);
    
    // Equipment Transfers
    Route::apiResource('equipment-transfers', EquipmentTransferController::class);
    
    // Equipment Usage Logs
    Route::apiResource('equipment-usage-logs', EquipmentUsageLogController::class);
    
    // Maintenance Records
    Route::apiResource('maintenance-records', MaintenanceRecordController::class);
    
    // Maintenance Schedules
    Route::apiResource('maintenance-schedules', MaintenanceScheduleController::class);
    
    // Medical Attachments
    Route::apiResource('medical-attachments', MedicalAttachmentController::class);
    
    // Medical Tests
    Route::apiResource('medical-tests', MedicalTestController::class);
    
    // Dashboard Widgets
    Route::apiResource('dashboard-widgets', DashboardWidgetController::class);
    
    // Report Executions
    Route::apiResource('report-executions', ReportExecutionController::class);
    
    // Triage Assessments
    Route::apiResource('triage-assessments', TriageAssessmentController::class);
    
    // Audit Logs
    Route::apiResource('audit-logs', AuditLogController::class);
});

// Fallback route for undefined API endpoints
Route::fallback(function () {
    return response()->json([
        'message' => 'API endpoint not found',
        'status' => 404
    ], 404);
});