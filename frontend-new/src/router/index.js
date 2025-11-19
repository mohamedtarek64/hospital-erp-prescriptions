import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'

// Medical Records Views
import MedicalRecords from '@/views/medical-records/MedicalRecordsList.vue'
import MedicalRecordCreate from '@/views/medical-records/MedicalRecordCreate.vue'
import MedicalRecordDetails from '@/views/medical-records/MedicalRecordDetails.vue'
import MedicalRecordView from '@/views/medical-records/MedicalRecordView.vue'
import PatientMedicalHistory from '@/views/medical-records/PatientMedicalHistory.vue'

// Pharmacy Views
import Pharmacy from '@/views/Pharmacy.vue'
import PharmacyDashboard from '@/views/pharmacy/PharmacyDashboard.vue'
import MedicineManagement from '@/views/pharmacy/MedicineManagement.vue'
import MedicineList from '@/views/pharmacy/MedicineList.vue'
import SupplierManagement from '@/views/pharmacy/SupplierManagement.vue'
import InventoryManagement from '@/views/pharmacy/InventoryManagement.vue'
import PurchaseOrders from '@/views/pharmacy/PurchaseOrders.vue'
import PrescriptionDispensing from '@/views/pharmacy/PrescriptionDispensing.vue'
import PharmacyAnalytics from '@/views/pharmacy/PharmacyAnalytics.vue'

// Other Views (Placeholder components)
import Patients from '@/views/Patients.vue'
import PatientList from '@/views/patients/PatientList.vue'
import Appointments from '@/views/Appointments.vue'
import Staff from '@/views/Staff.vue'
import Settings from '@/views/Settings.vue'
import Laboratory from '@/views/Laboratory.vue'
import Reports from '@/views/Reports.vue'
import Billing from '@/views/Billing.vue'

// Admin Views
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import UserManagement from '@/views/admin/UserManagement.vue'
import RolePermissions from '@/views/admin/RolePermissions.vue'
import SystemSettings from '@/views/admin/SystemSettings.vue'
import SystemLogs from '@/views/admin/SystemLogs.vue'
import BackupRestore from '@/views/admin/BackupRestore.vue'

// Emergency Views
import EmergencyDashboard from '@/views/emergency/EmergencyDashboard.vue'
import EmergencyRoom from '@/views/emergency/EmergencyRoom.vue'
import AmbulanceDispatch from '@/views/emergency/AmbulanceDispatch.vue'
import TriageAssessment from '@/views/emergency/TriageAssessment.vue'
import CriticalAlerts from '@/views/emergency/CriticalAlerts.vue'

// Equipment Views
import EquipmentDashboard from '@/views/equipment/EquipmentDashboard.vue'
import AssetTracking from '@/views/equipment/AssetTracking.vue'
import InventoryManagementEquipment from '@/views/equipment/InventoryManagement.vue'
import MaintenanceScheduling from '@/views/equipment/MaintenanceScheduling.vue'
import ServiceContracts from '@/views/equipment/ServiceContracts.vue'
import UtilizationReports from '@/views/equipment/UtilizationReports.vue'

// HR Views
import HRDashboard from '@/views/hr/HRDashboard.vue'
import EmployeeDirectory from '@/views/hr/EmployeeDirectory.vue'
import AttendanceManagement from '@/views/hr/AttendanceManagement.vue'
import LeaveManagement from '@/views/hr/LeaveManagement.vue'
import PayrollManagement from '@/views/hr/PayrollManagement.vue'
import PerformanceReviews from '@/views/hr/PerformanceReviews.vue'

// Ward Management Views
import WardDashboard from '@/views/ward-management/WardDashboard.vue'
import WardLayout from '@/views/ward-management/WardLayout.vue'
import BedAllocation from '@/views/ward-management/BedAllocation.vue'
import PatientAdmission from '@/views/ward-management/PatientAdmission.vue'
import HousekeepingManagement from '@/views/ward-management/HousekeepingManagement.vue'

// Billing Views
import BillingDashboard from '@/views/billing/BillingDashboard.vue'
import InvoiceList from '@/views/billing/InvoiceList.vue'
import InvoiceCreate from '@/views/billing/InvoiceCreate.vue'
import InvoiceView from '@/views/billing/InvoiceView.vue'
import PaymentTracking from '@/views/billing/PaymentTracking.vue'
import InsuranceClaims from '@/views/billing/InsuranceClaims.vue'
import ServiceManagement from '@/views/billing/ServiceManagement.vue'

// Laboratory Views
import LaboratoryDashboard from '@/views/laboratory/LaboratoryDashboard.vue'
import LaboratoryOrders from '@/views/laboratory/LaboratoryOrders.vue'
import LaboratoryTests from '@/views/laboratory/LaboratoryTests.vue'
import LaboratoryResults from '@/views/laboratory/LaboratoryResults.vue'
import LaboratorySpecimens from '@/views/laboratory/LaboratorySpecimens.vue'
import QualityControl from '@/views/laboratory/QualityControl.vue'
import ResultEntry from '@/views/laboratory/ResultEntry.vue'
import SampleTracking from '@/views/laboratory/SampleTracking.vue'
import TestManagement from '@/views/laboratory/TestManagement.vue'
import TestRequests from '@/views/laboratory/TestRequests.vue'

// Reports Views
import ReportsDashboard from '@/views/reports/ReportsDashboard.vue'
import ReportsList from '@/views/reports/ReportsList.vue'
import ReportBuilder from '@/views/reports/ReportBuilder.vue'
import ReportDetail from '@/views/reports/ReportDetail.vue'
import ReportEdit from '@/views/reports/ReportEdit.vue'
import AnalyticsDashboard from '@/views/reports/AnalyticsDashboard.vue'
import DashboardWidgets from '@/views/reports/DashboardWidgets.vue'
import ReportScheduler from '@/views/reports/ReportScheduler.vue'

// Quality Assurance Views
import QualityAssuranceDashboard from '@/views/qualityAssurance/QualityAssuranceDashboard.vue'
import QualityStandards from '@/views/qualityAssurance/QualityStandards.vue'
import Audits from '@/views/qualityAssurance/Audits.vue'
import Incidents from '@/views/qualityAssurance/Incidents.vue'
import Compliance from '@/views/qualityAssurance/Compliance.vue'
import Training from '@/views/qualityAssurance/Training.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  
  // Patients Routes
  {
    path: '/patients',
    name: 'Patients',
    component: Patients,
    meta: { requiresAuth: true }
  },
  {
    path: '/patients/list',
    name: 'PatientList',
    component: PatientList,
    meta: { requiresAuth: true }
  },
  
  // Appointments Routes
  {
    path: '/appointments',
    name: 'Appointments',
    component: Appointments,
    meta: { requiresAuth: true }
  },
  
  // Medical Records Routes
  {
    path: '/medical-records',
    name: 'MedicalRecords',
    component: MedicalRecords,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/create',
    name: 'MedicalRecordCreate',
    component: MedicalRecordCreate,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/:id',
    name: 'MedicalRecordDetails',
    component: MedicalRecordDetails,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/view/:id',
    name: 'MedicalRecordView',
    component: MedicalRecordView,
    meta: { requiresAuth: true }
  },
  {
    path: '/medical-records/history/:patientId',
    name: 'PatientMedicalHistory',
    component: PatientMedicalHistory,
    meta: { requiresAuth: true }
  },
  
  // Pharmacy Routes
  {
    path: '/pharmacy',
    name: 'Pharmacy',
    component: Pharmacy,
    meta: { requiresAuth: true }
  },
  {
    path: '/pharmacy/dashboard',
    name: 'PharmacyDashboard',
    component: PharmacyDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/pharmacy/medicines',
    name: 'MedicineManagement',
    component: MedicineManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/pharmacy/medicines/list',
    name: 'MedicineList',
    component: MedicineList,
    meta: { requiresAuth: true }
  },
  {
    path: '/pharmacy/suppliers',
    name: 'SupplierManagement',
    component: SupplierManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/pharmacy/inventory',
    name: 'InventoryManagement',
    component: InventoryManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/pharmacy/purchase-orders',
    name: 'PurchaseOrders',
    component: PurchaseOrders,
    meta: { requiresAuth: true }
  },
  {
    path: '/pharmacy/prescriptions',
    name: 'PrescriptionDispensing',
    component: PrescriptionDispensing,
    meta: { requiresAuth: true }
  },
  {
    path: '/pharmacy/analytics',
    name: 'PharmacyAnalytics',
    component: PharmacyAnalytics,
    meta: { requiresAuth: true }
  },
  
  // Billing Routes
  {
    path: '/billing',
    name: 'Billing',
    component: BillingDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/billing/invoices',
    name: 'InvoiceList',
    component: InvoiceList,
    meta: { requiresAuth: true }
  },
  {
    path: '/billing/invoices/create',
    name: 'InvoiceCreate',
    component: InvoiceCreate,
    meta: { requiresAuth: true }
  },
  {
    path: '/billing/invoices/:id',
    name: 'InvoiceView',
    component: InvoiceView,
    meta: { requiresAuth: true }
  },
  {
    path: '/billing/payments',
    name: 'PaymentTracking',
    component: PaymentTracking,
    meta: { requiresAuth: true }
  },
  {
    path: '/billing/insurance',
    name: 'InsuranceClaims',
    component: InsuranceClaims,
    meta: { requiresAuth: true }
  },
  {
    path: '/billing/services',
    name: 'ServiceManagement',
    component: ServiceManagement,
    meta: { requiresAuth: true }
  },
  
  // Laboratory Routes
  {
    path: '/laboratory',
    name: 'Laboratory',
    component: LaboratoryDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/laboratory/orders',
    name: 'LaboratoryOrders',
    component: LaboratoryOrders,
    meta: { requiresAuth: true }
  },
  {
    path: '/laboratory/tests',
    name: 'LaboratoryTests',
    component: LaboratoryTests,
    meta: { requiresAuth: true }
  },
  {
    path: '/laboratory/results',
    name: 'LaboratoryResults',
    component: LaboratoryResults,
    meta: { requiresAuth: true }
  },
  {
    path: '/laboratory/specimens',
    name: 'LaboratorySpecimens',
    component: LaboratorySpecimens,
    meta: { requiresAuth: true }
  },
  {
    path: '/laboratory/quality-control',
    name: 'QualityControl',
    component: QualityControl,
    meta: { requiresAuth: true }
  },
  {
    path: '/laboratory/result-entry',
    name: 'ResultEntry',
    component: ResultEntry,
    meta: { requiresAuth: true }
  },
  {
    path: '/laboratory/sample-tracking',
    name: 'SampleTracking',
    component: SampleTracking,
    meta: { requiresAuth: true }
  },
  {
    path: '/laboratory/test-management',
    name: 'TestManagement',
    component: TestManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/laboratory/test-requests',
    name: 'TestRequests',
    component: TestRequests,
    meta: { requiresAuth: true }
  },
  
  // Staff Management Routes
  {
    path: '/staff',
    name: 'Staff',
    component: Staff,
    meta: { requiresAuth: true }
  },
  
  // Reports Routes
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/list',
    name: 'ReportsList',
    component: ReportsList,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/create',
    name: 'ReportBuilder',
    component: ReportBuilder,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/:id',
    name: 'ReportDetail',
    component: ReportDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/:id/edit',
    name: 'ReportEdit',
    component: ReportEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/analytics',
    name: 'AnalyticsDashboard',
    component: AnalyticsDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/widgets',
    name: 'DashboardWidgets',
    component: DashboardWidgets,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/scheduler',
    name: 'ReportScheduler',
    component: ReportScheduler,
    meta: { requiresAuth: true }
  },
  
  // Quality Assurance Routes
  {
    path: '/quality-assurance',
    name: 'QualityAssurance',
    component: QualityAssuranceDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/quality-assurance/standards',
    name: 'QualityStandards',
    component: QualityStandards,
    meta: { requiresAuth: true }
  },
  {
    path: '/quality-assurance/audits',
    name: 'Audits',
    component: Audits,
    meta: { requiresAuth: true }
  },
  {
    path: '/quality-assurance/incidents',
    name: 'Incidents',
    component: Incidents,
    meta: { requiresAuth: true }
  },
  {
    path: '/quality-assurance/compliance',
    name: 'Compliance',
    component: Compliance,
    meta: { requiresAuth: true }
  },
  {
    path: '/quality-assurance/training',
    name: 'Training',
    component: Training,
    meta: { requiresAuth: true }
  },
  
  // Settings Routes
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  
  // Admin Routes
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/roles',
    name: 'RolePermissions',
    component: RolePermissions,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/system-settings',
    name: 'SystemSettings',
    component: SystemSettings,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/logs',
    name: 'SystemLogs',
    component: SystemLogs,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/backup',
    name: 'BackupRestore',
    component: BackupRestore,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  
  // Emergency Routes
  {
    path: '/emergency',
    name: 'EmergencyDashboard',
    component: EmergencyDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/emergency/room',
    name: 'EmergencyRoom',
    component: EmergencyRoom,
    meta: { requiresAuth: true }
  },
  {
    path: '/emergency/ambulance',
    name: 'AmbulanceDispatch',
    component: AmbulanceDispatch,
    meta: { requiresAuth: true }
  },
  {
    path: '/emergency/triage',
    name: 'TriageAssessment',
    component: TriageAssessment,
    meta: { requiresAuth: true }
  },
  {
    path: '/emergency/alerts',
    name: 'CriticalAlerts',
    component: CriticalAlerts,
    meta: { requiresAuth: true }
  },
  
  // Equipment Routes
  {
    path: '/equipment',
    name: 'EquipmentDashboard',
    component: EquipmentDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/equipment/assets',
    name: 'AssetTracking',
    component: AssetTracking,
    meta: { requiresAuth: true }
  },
  {
    path: '/equipment/inventory',
    name: 'EquipmentInventory',
    component: InventoryManagementEquipment,
    meta: { requiresAuth: true }
  },
  {
    path: '/equipment/maintenance',
    name: 'MaintenanceScheduling',
    component: MaintenanceScheduling,
    meta: { requiresAuth: true }
  },
  {
    path: '/equipment/contracts',
    name: 'ServiceContracts',
    component: ServiceContracts,
    meta: { requiresAuth: true }
  },
  {
    path: '/equipment/reports',
    name: 'UtilizationReports',
    component: UtilizationReports,
    meta: { requiresAuth: true }
  },
  
  // HR Routes
  {
    path: '/hr',
    name: 'HRDashboard',
    component: HRDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/hr/employees',
    name: 'EmployeeDirectory',
    component: EmployeeDirectory,
    meta: { requiresAuth: true }
  },
  {
    path: '/hr/attendance',
    name: 'AttendanceManagement',
    component: AttendanceManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/hr/leave',
    name: 'LeaveManagement',
    component: LeaveManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/hr/payroll',
    name: 'PayrollManagement',
    component: PayrollManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/hr/performance',
    name: 'PerformanceReviews',
    component: PerformanceReviews,
    meta: { requiresAuth: true }
  },
  
  // Ward Management Routes
  {
    path: '/ward-management',
    name: 'WardManagement',
    component: WardDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/wards',
    name: 'WardDashboard',
    component: WardDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/wards/layout',
    name: 'WardLayout',
    component: WardLayout,
    meta: { requiresAuth: true }
  },
  {
    path: '/wards/beds',
    name: 'BedAllocation',
    component: BedAllocation,
    meta: { requiresAuth: true }
  },
  {
    path: '/wards/admission',
    name: 'PatientAdmission',
    component: PatientAdmission,
    meta: { requiresAuth: true }
  },
  {
    path: '/wards/housekeeping',
    name: 'HousekeepingManagement',
    component: HousekeepingManagement,
    meta: { requiresAuth: true }
  },
  
  // Additional Routes for missing components
  {
    path: '/laboratory/main',
    name: 'LaboratoryMain',
    component: Laboratory,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/main',
    name: 'ReportsMain',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/billing/main',
    name: 'BillingMain',
    component: Billing,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router
