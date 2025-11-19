/**
 * Sidebar Constants
 * Configuration and constant values for sidebar functionality
 */

// Sidebar dimensions
export const SIDEBAR_WIDTHS = {
  EXPANDED: '16rem',
  COLLAPSED: '4rem',
  MOBILE: '100%'
}

// Breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200
}

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
}

// Local storage keys
export const STORAGE_KEYS = {
  SIDEBAR_STATE: 'sidebarState',
  USER_PREFERENCES: 'userPreferences'
}

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
  PHARMACIST: 'pharmacist',
  LAB_TECHNICIAN: 'lab_technician'
}

// Role display names in Arabic
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.ADMIN]: 'مدير النظام',
  [USER_ROLES.DOCTOR]: 'طبيب',
  [USER_ROLES.NURSE]: 'ممرض/ممرضة',
  [USER_ROLES.RECEPTIONIST]: 'موظف استقبال',
  [USER_ROLES.PHARMACIST]: 'صيدلي',
  [USER_ROLES.LAB_TECHNICIAN]: 'فني مختبر'
}

// Permissions
export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',
  SYSTEM_SETTINGS: 'system_settings',
  MANAGE_PATIENTS: 'manage_patients',
  PRESCRIBE_MEDICATIONS: 'prescribe_medications',
  VIEW_TEST_RESULTS: 'view_test_results',
  MANAGE_PHARMACY: 'manage_pharmacy',
  MANAGE_LABORATORY: 'manage_laboratory',
  CREATE_APPOINTMENTS: 'create_appointments',
  UPDATE_PATIENT_STATUS: 'update_patient_status',
  VIEW_PATIENT_RECORDS: 'view_patient_records',
  UPDATE_PATIENT_INFO: 'update_patient_info',
  UPDATE_TEST_RESULTS: 'update_test_results'
}

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.READ,
    PERMISSIONS.WRITE,
    PERMISSIONS.DELETE,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.PRESCRIBE_MEDICATIONS,
    PERMISSIONS.VIEW_TEST_RESULTS,
    PERMISSIONS.MANAGE_PHARMACY,
    PERMISSIONS.MANAGE_LABORATORY
  ],
  [USER_ROLES.DOCTOR]: [
    PERMISSIONS.READ,
    PERMISSIONS.WRITE,
    PERMISSIONS.DELETE,
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.PRESCRIBE_MEDICATIONS,
    PERMISSIONS.VIEW_TEST_RESULTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.UPDATE_PATIENT_STATUS
  ],
  [USER_ROLES.NURSE]: [
    PERMISSIONS.READ,
    PERMISSIONS.WRITE,
    PERMISSIONS.UPDATE_PATIENT_STATUS,
    PERMISSIONS.VIEW_PATIENT_RECORDS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.UPDATE_PATIENT_INFO
  ],
  [USER_ROLES.RECEPTIONIST]: [
    PERMISSIONS.READ,
    PERMISSIONS.WRITE,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.UPDATE_PATIENT_INFO,
    PERMISSIONS.VIEW_PATIENT_RECORDS
  ],
  [USER_ROLES.PHARMACIST]: [
    PERMISSIONS.READ,
    PERMISSIONS.WRITE,
    PERMISSIONS.MANAGE_PHARMACY,
    PERMISSIONS.PRESCRIBE_MEDICATIONS,
    PERMISSIONS.VIEW_PATIENT_RECORDS
  ],
  [USER_ROLES.LAB_TECHNICIAN]: [
    PERMISSIONS.READ,
    PERMISSIONS.WRITE,
    PERMISSIONS.MANAGE_LABORATORY,
    PERMISSIONS.VIEW_TEST_RESULTS,
    PERMISSIONS.UPDATE_TEST_RESULTS
  ]
}

// Menu item icons
export const MENU_ICONS = {
  DASHBOARD: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z',
  PATIENTS: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
  APPOINTMENTS: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  MEDICAL_RECORDS: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  PHARMACY: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  BILLING: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
  LABORATORY: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  STAFF: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  REPORTS: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  SETTINGS: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  LOGOUT: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
}

// Event names
export const SIDEBAR_EVENTS = {
  TOGGLE: 'sidebarToggle',
  MOBILE_MENU_OPEN: 'mobileMenuOpen',
  MOBILE_MENU_CLOSE: 'mobileMenuClose',
  SUBMENU_TOGGLE: 'submenuToggle',
  RESIZE: 'sidebarResize',
  VISIBILITY: 'sidebarVisibility',
  MOUNTED: 'sidebarMounted',
  UNMOUNTED: 'sidebarUnmounted'
}

// CSS classes
export const SIDEBAR_CLASSES = {
  CONTAINER: 'sidebar-container',
  OVERLAY: 'sidebar-overlay',
  MAIN: 'sidebar',
  HEADER: 'sidebar-header',
  LOGO: 'sidebar-logo',
  TOGGLE_BTN: 'sidebar-toggle-btn',
  USER_PROFILE: 'sidebar-user-profile',
  NAV: 'sidebar-nav',
  MENU: 'sidebar-menu',
  MENU_ITEM: 'sidebar-menu-item',
  MENU_LINK: 'sidebar-menu-link',
  MENU_LINK_ACTIVE: 'sidebar-menu-link-active',
  MENU_LINK_COLLAPSED: 'sidebar-menu-link-collapsed',
  SUBMENU: 'sidebar-submenu',
  SUBMENU_ITEM: 'sidebar-submenu-item',
  SUBMENU_LINK: 'sidebar-submenu-link',
  SUBMENU_LINK_ACTIVE: 'sidebar-submenu-link-active',
  FOOTER: 'sidebar-footer',
  LOGOUT_BTN: 'sidebar-logout-btn',
  MOBILE_MENU_BTN: 'mobile-menu-btn'
}

// Default state
export const DEFAULT_SIDEBAR_STATE = {
  isCollapsed: false,
  isMobileMenuOpen: false,
  isMedicalRecordsOpen: false,
  isPharmacyOpen: false,
  isLaboratoryOpen: false,
  isMobile: false,
  isLoading: false,
  error: null,
  lastRoute: ''
}
