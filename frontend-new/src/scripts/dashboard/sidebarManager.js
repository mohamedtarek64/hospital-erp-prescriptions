import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * Sidebar Management Class
 * Handles sidebar state, navigation, and user interactions
 */
export class SidebarManager {
  constructor(router) {
    this.router = router
    this.authStore = useAuthStore()
    
    // Reactive state
    this.isCollapsed = ref(false)
    this.isMobileMenuOpen = ref(false)
    this.isMedicalRecordsOpen = ref(false)
    this.isPharmacyOpen = ref(false)
    this.isLaboratoryOpen = ref(false)
    this.isReportsOpen = ref(false)
    this.isWardManagementOpen = ref(false)
    this.isEmergencyOpen = ref(false)
    this.isEquipmentOpen = ref(false)
    this.isAdminOpen = ref(false)
    this.isCommunicationOpen = ref(false)
    this.isAnalyticsOpen = ref(false)
    this.isNotificationsOpen = ref(false)
    this.isQualityAssuranceOpen = ref(false)
    this.isMobile = ref(false)
    this.isLoading = ref(false)
    this.error = ref(null)
    this.notificationCount = ref(0)
    
    // Event listeners storage for cleanup
    this.eventListeners = new Map()
    
    // Initialize sidebar
    this.initialize()
  }

  /**
   * Initialize sidebar state and setup watchers
   */
  initialize() {
    this.loadSidebarState()
    this.setupWatchers()
    this.setupRouteWatcher()
  }

  /**
   * Setup reactive watchers for state changes
   */
  setupWatchers() {
    // Watch for mobile state changes
    watch(this.isMobile, (newValue) => {
      if (newValue && this.isMobileMenuOpen.value) {
        this.closeMobileMenu()
      }
    })

    // Watch for route changes to auto-expand menus
    watch(() => this.router.currentRoute.value.path, (newPath) => {
      this.handleRouteChange(newPath)
    })
  }

  /**
   * Setup route watcher for auto-expanding menus
   */
  setupRouteWatcher() {
    this.handleRouteChange(this.router.currentRoute.value.path)
  }

  /**
   * Handle route changes for auto-expanding menus
   * @param {string} path - Current route path
   */
  handleRouteChange(path) {
    // Auto-expand medical records if on related route
    if (path.startsWith('/medical-records')) {
      this.isMedicalRecordsOpen.value = true
    }
    
    // Auto-expand pharmacy if on related route
    if (path.startsWith('/pharmacy')) {
      this.isPharmacyOpen.value = true
    }

    // Auto-expand laboratory if on related route
    if (path.startsWith('/laboratory')) {
      this.isLaboratoryOpen.value = true
    }

    // Auto-expand reports if on related route
    if (path.startsWith('/reports')) {
      this.isReportsOpen.value = true
    }
  }

  /**
   * Load sidebar state from localStorage with validation
   */
  loadSidebarState() {
    try {
      const savedState = localStorage.getItem('sidebarState')
      if (savedState) {
        const state = JSON.parse(savedState)

        // Validate and set state with defaults
        this.isCollapsed.value = Boolean(state.isCollapsed)
        this.isMedicalRecordsOpen.value = Boolean(state.isMedicalRecordsOpen)
        this.isPharmacyOpen.value = Boolean(state.isPharmacyOpen)
        this.isLaboratoryOpen.value = Boolean(state.isLaboratoryOpen)
        this.isReportsOpen.value = Boolean(state.isReportsOpen)
        this.isWardManagementOpen.value = Boolean(state.isWardManagementOpen)
        this.isEmergencyOpen.value = Boolean(state.isEmergencyOpen)
        this.isEquipmentOpen.value = Boolean(state.isEquipmentOpen)
        this.isAdminOpen.value = Boolean(state.isAdminOpen)
        this.isCommunicationOpen.value = Boolean(state.isCommunicationOpen)
        this.isAnalyticsOpen.value = Boolean(state.isAnalyticsOpen)
        this.isNotificationsOpen.value = Boolean(state.isNotificationsOpen)
        this.isQualityAssuranceOpen.value = Boolean(state.isQualityAssuranceOpen)
      }
    } catch (error) {
      console.warn('Failed to load sidebar state:', error)
      this.error.value = 'Failed to load sidebar preferences'
      this.resetToDefaults()
    }
  }

  /**
   * Save sidebar state to localStorage with error handling
   */
  saveSidebarState() {
    try {
      const state = {
        isCollapsed: this.isCollapsed.value,
        isMedicalRecordsOpen: this.isMedicalRecordsOpen.value,
        isPharmacyOpen: this.isPharmacyOpen.value,
        isLaboratoryOpen: this.isLaboratoryOpen.value,
        isReportsOpen: this.isReportsOpen.value,
        isWardManagementOpen: this.isWardManagementOpen.value,
        isEmergencyOpen: this.isEmergencyOpen.value,
        isEquipmentOpen: this.isEquipmentOpen.value,
        isAdminOpen: this.isAdminOpen.value,
        isCommunicationOpen: this.isCommunicationOpen.value,
        isAnalyticsOpen: this.isAnalyticsOpen.value,
        isNotificationsOpen: this.isNotificationsOpen.value,
        isQualityAssuranceOpen: this.isQualityAssuranceOpen.value,
        lastUpdated: Date.now()
      }
      localStorage.setItem('sidebarState', JSON.stringify(state))
      this.error.value = null
    } catch (error) {
      console.warn('Failed to save sidebar state:', error)
      this.error.value = 'Failed to save sidebar preferences'
    }
  }

  /**
   * Reset sidebar to default state
   */
  resetToDefaults() {
    this.isCollapsed.value = false
    this.isMedicalRecordsOpen.value = false
    this.isPharmacyOpen.value = false
    this.isLaboratoryOpen.value = false
    this.isReportsOpen.value = false
  }

  /**
   * Toggle sidebar collapse/expand with debouncing
   */
  toggleSidebar() {
    this.isCollapsed.value = !this.isCollapsed.value
    this.saveSidebarState()
    
    // Emit custom event for layout adjustment
    this.emitSidebarToggle()
  }

  /**
   * Open mobile menu with accessibility improvements
   */
  openMobileMenu() {
    this.isMobileMenuOpen.value = true
    document.body.style.overflow = 'hidden'
    
    // Focus management for accessibility
    this.focusFirstMenuItem()
    
    // Emit event for analytics/tracking
    this.emitMobileMenuEvent('open')
  }

  /**
   * Close mobile menu with cleanup
   */
  closeMobileMenu() {
    this.isMobileMenuOpen.value = false
    document.body.style.overflow = ''
    
    // Emit event for analytics/tracking
    this.emitMobileMenuEvent('close')
  }

  /**
   * Toggle medical records submenu
   */
  toggleMedicalRecords() {
    this.isMedicalRecordsOpen.value = !this.isMedicalRecordsOpen.value
    this.saveSidebarState()
    this.emitSubmenuToggle('medical-records', this.isMedicalRecordsOpen.value)
  }

  /**
   * Toggle pharmacy submenu
   */
  togglePharmacy() {
    this.isPharmacyOpen.value = !this.isPharmacyOpen.value
    this.saveSidebarState()
    this.emitSubmenuToggle('pharmacy', this.isPharmacyOpen.value)
  }

  /**
   * Toggle laboratory submenu
   */
  toggleLaboratoryMenu() {
    this.isLaboratoryOpen.value = !this.isLaboratoryOpen.value
    this.saveSidebarState()
    this.emitSubmenuToggle('laboratory', this.isLaboratoryOpen.value)
  }

  /**
   * Toggle reports submenu
   */
  toggleReports() {
    this.isReportsOpen.value = !this.isReportsOpen.value
    this.saveSidebarState()
    this.emitSubmenuToggle('reports', this.isReportsOpen.value)
  }

  /**
   * Toggle ward management submenu
   */
  toggleWardManagement() {
    this.isWardManagementOpen.value = !this.isWardManagementOpen.value
    this.saveSidebarState()
    this.emitSubmenuToggle('ward_management', this.isWardManagementOpen.value)
  }

  /**
   * Toggle emergency submenu
   */
  toggleEmergency() {
    this.isEmergencyOpen.value = !this.isEmergencyOpen.value
    this.saveSidebarState()
    this.emitSubmenuToggle('emergency', this.isEmergencyOpen.value)
  }

  /**
   * Toggle equipment submenu
   */
  toggleEquipment() {
    this.isEquipmentOpen.value = !this.isEquipmentOpen.value
    this.saveSidebarState()
    this.emitSubmenuToggle('equipment', this.isEquipmentOpen.value)
  }

  /**
   * Toggle admin submenu
   */
  toggleAdmin() {
    this.isAdminOpen.value = !this.isAdminOpen.value
    this.saveSidebarState()
    this.emitSubmenuToggle('admin', this.isAdminOpen.value)
  }

  /**
   * Toggle communication submenu
   */
  toggleCommunication() {
    this.isCommunicationOpen.value = !this.isCommunicationOpen.value
    this.saveSidebarState()
    this.emitSubmenuToggle('communication', this.isCommunicationOpen.value)
  }

  /**
   * Toggle analytics submenu
   */
  toggleAnalytics() {
    this.isAnalyticsOpen.value = !this.isAnalyticsOpen.value
    this.saveSidebarState()
    this.emitSubmenuToggle('analytics', this.isAnalyticsOpen.value)
  }

  /**
   * Toggle notifications panel
   */
  toggleNotifications() {
    this.isNotificationsOpen.value = !this.isNotificationsOpen.value
    this.emitSubmenuToggle('notifications', this.isNotificationsOpen.value)
  }

  /**
   * Toggle quality assurance submenu
   */
  toggleQualityAssurance() {
    this.isQualityAssuranceOpen.value = !this.isQualityAssuranceOpen.value
    this.saveSidebarState()
    this.emitSubmenuToggle('quality_assurance', this.isQualityAssuranceOpen.value)
  }

  /**
   * Emit sidebar toggle event
   */
  emitSidebarToggle() {
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
      detail: { 
        isCollapsed: this.isCollapsed.value,
        timestamp: Date.now()
      }
    }))
  }

  /**
   * Emit mobile menu event
   * @param {string} action - 'open' or 'close'
   */
  emitMobileMenuEvent(action) {
    window.dispatchEvent(new CustomEvent('mobileMenuToggle', {
      detail: { 
        action,
        timestamp: Date.now()
      }
    }))
  }

  /**
   * Emit submenu toggle event
   * @param {string} submenu - Submenu name
   * @param {boolean} isOpen - Whether submenu is open
   */
  emitSubmenuToggle(submenu, isOpen) {
    window.dispatchEvent(new CustomEvent('submenuToggle', {
      detail: { 
        submenu,
        isOpen,
        timestamp: Date.now()
      }
    }))
  }

  /**
   * Focus first menu item for accessibility
   */
  focusFirstMenuItem() {
    // Use nextTick to ensure DOM is updated
    this.$nextTick(() => {
      const firstMenuItem = document.querySelector('.sidebar-menu-link')
      if (firstMenuItem) {
        firstMenuItem.focus()
      }
    })
  }

  /**
   * Check if user has specific permission with caching
   * @param {string} permission - Permission to check
   * @returns {boolean} - Whether user has permission
   */
  hasPermission(permission) {
    if (!permission || typeof permission !== 'string') {
      console.warn('Invalid permission provided:', permission)
      return false
    }
    
    if (!this.authStore.user) return false
    
    const permissions = this.getUserPermissions()
    return permissions.includes(permission)
  }

  /**
   * Get user permissions with role-based access control
   * @returns {Array<string>} - Array of user permissions
   */
  getUserPermissions() {
    if (!this.authStore.user) return []
    
    const rolePermissions = {
      'admin': [
        'read', 'write', 'delete', 'manage_users', 'view_reports', 
        'system_settings', 'manage_patients', 'prescribe_medications', 
        'view_test_results', 'manage_pharmacy', 'manage_laboratory'
      ],
      'doctor': [
        'read', 'write', 'delete', 'manage_patients', 'prescribe_medications', 
        'view_test_results', 'create_appointments', 'update_patient_status'
      ],
      'nurse': [
        'read', 'write', 'update_patient_status', 'view_patient_records',
        'create_appointments', 'update_patient_info'
      ],
      'receptionist': [
        'read', 'write', 'create_appointments', 'update_patient_info',
        'view_patient_records'
      ],
      'pharmacist': [
        'read', 'write', 'manage_pharmacy', 'prescribe_medications',
        'view_patient_records'
      ],
      'lab_technician': [
        'read', 'write', 'manage_laboratory', 'view_test_results',
        'update_test_results'
      ]
    }
    
    return rolePermissions[this.authStore.user.role] || []
  }

  /**
   * Get role name in Arabic with fallback
   * @param {string} role - User role
   * @returns {string} - Localized role name
   */
  getRoleName(role) {
    if (!role) return 'غير محدد'
    
    const roleNames = {
      'admin': 'مدير النظام',
      'doctor': 'طبيب',
      'nurse': 'ممرض/ممرضة',
      'receptionist': 'موظف استقبال',
      'pharmacist': 'صيدلي',
      'lab_technician': 'فني مختبر'
    }
    
    return roleNames[role] || role
  }

  /**
   * Get computed user info
   * @returns {Object} - User information object
   */
  getUserInfo() {
    return computed(() => {
      const user = this.authStore.user
      if (!user) return null
      
      return {
        name: user.name || 'المستخدم',
        role: user.role,
        roleName: this.getRoleName(user.role),
        permissions: this.getUserPermissions(),
        avatar: user.avatar || null
      }
    })
  }

  /**
   * Handle logout with proper error handling and cleanup
   */
  async handleLogout() {
    try {
      this.isLoading.value = true
      this.error.value = null
      
      // Clear sidebar state
      this.resetToDefaults()
      localStorage.removeItem('sidebarState')
      
      // Perform logout
      await this.authStore.logout()
      
      // Navigate to login
      await this.router.push('/login')
      
      // Emit logout event
      window.dispatchEvent(new CustomEvent('userLogout', {
        detail: { timestamp: Date.now() }
      }))
      
    } catch (error) {
      console.error('Logout failed:', error)
      this.error.value = 'فشل في تسجيل الخروج. يرجى المحاولة مرة أخرى.'
    } finally {
      this.isLoading.value = false
    }
  }

  /**
   * Check screen size and update mobile state with debouncing
   */
  checkScreenSize() {
    const width = window.innerWidth
    const wasMobile = this.isMobile.value
    this.isMobile.value = width < 768
    
    // Auto-close mobile menu when switching to desktop
    if (wasMobile && !this.isMobile.value && this.isMobileMenuOpen.value) {
      this.closeMobileMenu()
    }
    
    // Auto-collapse sidebar on very small screens
    if (width < 480 && !this.isCollapsed.value) {
      this.isCollapsed.value = true
      this.saveSidebarState()
    }
  }

  /**
   * Handle window resize with throttling
   */
  handleResize() {
    // Throttle resize events for better performance
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
    
    this.resizeTimeout = setTimeout(() => {
      this.checkScreenSize()
      // Emit resize event for analytics
      this.emitResizeEvent()
    }, 150)
  }

  /**
   * Emit resize event for performance monitoring
   */
  emitResizeEvent() {
    window.dispatchEvent(new CustomEvent('sidebarResize', {
      detail: { 
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: this.isMobile.value,
        timestamp: Date.now()
      }
    }))
  }

  /**
   * Handle keyboard events for accessibility
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeydown(event) {
    // Handle escape key
    if (event.key === 'Escape') {
      if (this.isMobileMenuOpen.value) {
        this.closeMobileMenu()
        event.preventDefault()
      }
    }
    
    // Handle arrow keys for navigation
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      this.handleArrowNavigation(event)
    }
  }

  /**
   * Handle arrow key navigation for accessibility
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleArrowNavigation(event) {
    const menuItems = document.querySelectorAll('.sidebar-menu-link, .sidebar-submenu-link')
    const currentIndex = Array.from(menuItems).indexOf(document.activeElement)
    
    if (currentIndex === -1) return
    
    let nextIndex
    if (event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % menuItems.length
    } else {
      nextIndex = currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1
    }
    
    menuItems[nextIndex]?.focus()
    event.preventDefault()
  }

  /**
   * Handle click outside sidebar for mobile menu
   * @param {MouseEvent} event - Click event
   */
  handleClickOutside(event) {
    const sidebar = event.target.closest('.sidebar')
    const mobileMenuBtn = event.target.closest('.mobile-menu-btn')
    
    if (!sidebar && !mobileMenuBtn && this.isMobileMenuOpen.value) {
      this.closeMobileMenu()
    }
  }

  /**
   * Lifecycle method - called when component is mounted
   */
  onMounted() {
    this.checkScreenSize()
    this.setupEventListeners()
    
    // Emit mounted event
    window.dispatchEvent(new CustomEvent('sidebarMounted', {
      detail: { timestamp: Date.now() }
    }))
  }

  /**
   * Lifecycle method - called when component is unmounted
   */
  onUnmounted() {
    this.cleanupEventListeners()
    this.cleanupTimeouts()
    
    // Restore body overflow
    document.body.style.overflow = ''
    
    // Emit unmounted event
    window.dispatchEvent(new CustomEvent('sidebarUnmounted', {
      detail: { timestamp: Date.now() }
    }))
  }

  /**
   * Setup all event listeners with proper binding and performance optimization
   */
  setupEventListeners() {
    // Bind methods to preserve context
    const boundHandlers = {
      resize: this.handleResize.bind(this),
      keydown: this.handleKeydown.bind(this),
      click: this.handleClickOutside.bind(this)
    }
    
    // Store bound handlers for cleanup
    this.eventListeners.set('resize', boundHandlers.resize)
    this.eventListeners.set('keydown', boundHandlers.keydown)
    this.eventListeners.set('click', boundHandlers.click)
    
    // Add event listeners with performance optimizations
    window.addEventListener('resize', boundHandlers.resize, { 
      passive: true, 
      capture: false 
    })
    document.addEventListener('keydown', boundHandlers.keydown, { 
      passive: false, 
      capture: false 
    })
    document.addEventListener('click', boundHandlers.click, { 
      passive: true, 
      capture: false 
    })
    
    // Add intersection observer for lazy loading
    this.setupIntersectionObserver()
  }

  /**
   * Setup intersection observer for performance monitoring
   */
  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.emitVisibilityEvent('visible')
            } else {
              this.emitVisibilityEvent('hidden')
            }
          })
        },
        { threshold: 0.1 }
      )
    }
  }

  /**
   * Emit visibility event for performance monitoring
   * @param {string} status - 'visible' or 'hidden'
   */
  emitVisibilityEvent(status) {
    window.dispatchEvent(new CustomEvent('sidebarVisibility', {
      detail: { 
        status,
        timestamp: Date.now()
      }
    }))
  }

  /**
   * Cleanup all event listeners
   */
  cleanupEventListeners() {
    this.eventListeners.forEach((handler, event) => {
      if (event === 'resize') {
        window.removeEventListener(event, handler)
      } else {
        document.removeEventListener(event, handler)
      }
    })
    
    this.eventListeners.clear()
    
    // Cleanup intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
      this.intersectionObserver = null
    }
  }

  /**
   * Cleanup timeouts and intervals
   */
  cleanupTimeouts() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = null
    }
  }

  /**
   * Get all reactive references and computed properties
   * @returns {Object} - Object containing all reactive data
   */
  getReactiveData() {
    return {
      // State
      isCollapsed: this.isCollapsed,
      isMobileMenuOpen: this.isMobileMenuOpen,
      isMedicalRecordsOpen: this.isMedicalRecordsOpen,
      isPharmacyOpen: this.isPharmacyOpen,
      isLaboratoryOpen: this.isLaboratoryOpen,
      isReportsOpen: this.isReportsOpen,
      isWardManagementOpen: this.isWardManagementOpen,
      isEmergencyOpen: this.isEmergencyOpen,
      isEquipmentOpen: this.isEquipmentOpen,
      isAdminOpen: this.isAdminOpen,
      isCommunicationOpen: this.isCommunicationOpen,
      isAnalyticsOpen: this.isAnalyticsOpen,
      isNotificationsOpen: this.isNotificationsOpen,
      isQualityAssuranceOpen: this.isQualityAssuranceOpen,
      isMobile: this.isMobile,
      isLoading: this.isLoading,
      error: this.error,
      notificationCount: this.notificationCount,

      // Computed properties
      userInfo: this.getUserInfo(),
      sidebarWidth: computed(() => this.getSidebarWidth()),
      mainContentMargin: computed(() => this.getMainContentMargin()),
      isAnySubmenuOpen: computed(() =>
        this.isMedicalRecordsOpen.value ||
        this.isPharmacyOpen.value ||
        this.isLaboratoryOpen.value ||
        this.isReportsOpen.value ||
        this.isWardManagementOpen.value ||
        this.isEmergencyOpen.value ||
        this.isEquipmentOpen.value ||
        this.isAdminOpen.value ||
        this.isCommunicationOpen.value ||
        this.isAnalyticsOpen.value
      )
    }
  }

  /**
   * Get all methods with proper binding
   * @returns {Object} - Object containing all methods
   */
  getMethods() {
    return {
      // Toggle methods
      toggleSidebar: this.toggleSidebar.bind(this),
      toggleMedicalRecords: this.toggleMedicalRecords.bind(this),
      togglePharmacy: this.togglePharmacy.bind(this),
      toggleLaboratoryMenu: this.toggleLaboratoryMenu.bind(this),
      toggleReports: this.toggleReports.bind(this),
      toggleWardManagement: this.toggleWardManagement.bind(this),
      toggleEmergency: this.toggleEmergency.bind(this),
      toggleEquipment: this.toggleEquipment.bind(this),
      toggleAdmin: this.toggleAdmin.bind(this),
      toggleCommunication: this.toggleCommunication.bind(this),
      toggleAnalytics: this.toggleAnalytics.bind(this),
      toggleNotifications: this.toggleNotifications.bind(this),
      toggleQualityAssurance: this.toggleQualityAssurance.bind(this),

      // Mobile menu methods
      openMobileMenu: this.openMobileMenu.bind(this),
      closeMobileMenu: this.closeMobileMenu.bind(this),

      // Permission methods
      hasPermission: this.hasPermission.bind(this),
      getUserPermissions: this.getUserPermissions.bind(this),
      getRoleName: this.getRoleName.bind(this),

      // User methods
      handleLogout: this.handleLogout.bind(this),

      // Utility methods
      resetToDefaults: this.resetToDefaults.bind(this),
      checkScreenSize: this.checkScreenSize.bind(this)
    }
  }

  /**
   * Get sidebar width based on current state
   * @returns {string} - CSS width value
   */
  getSidebarWidth() {
    if (this.isMobile.value) return '100%'
    return this.isCollapsed.value ? '4rem' : '16rem'
  }

  /**
   * Get main content margin based on sidebar state
   * @returns {string} - CSS margin value
   */
  getMainContentMargin() {
    if (this.isMobile.value) return '0'
    return this.isCollapsed.value ? '4rem' : '16rem'
  }
}

/**
 * Utility functions for sidebar operations
 */
export const sidebarUtils = {
  /**
   * Get sidebar width based on state
   * @param {boolean} isCollapsed - Whether sidebar is collapsed
   * @param {boolean} isMobile - Whether on mobile device
   * @returns {string} - CSS width value
   */
  getSidebarWidth(isCollapsed, isMobile) {
    if (isMobile) return '100%'
    return isCollapsed ? '4rem' : '16rem'
  },

  /**
   * Get main content margin based on sidebar state
   * @param {boolean} isCollapsed - Whether sidebar is collapsed
   * @param {boolean} isMobile - Whether on mobile device
   * @returns {string} - CSS margin value
   */
  getMainContentMargin(isCollapsed, isMobile) {
    if (isMobile) return '0'
    return isCollapsed ? '4rem' : '16rem'
  },

  /**
   * Check if route is active with validation
   * @param {string} currentPath - Current route path
   * @param {string} targetPath - Target route path
   * @param {boolean} exact - Whether to match exactly
   * @returns {boolean} - Whether route is active
   */
  isRouteActive(currentPath, targetPath, exact = false) {
    if (!currentPath || !targetPath) return false
    if (exact) return currentPath === targetPath
    return currentPath.startsWith(targetPath)
  },

  /**
   * Get menu item classes with validation
   * @param {boolean} isActive - Whether item is active
   * @param {boolean} isCollapsed - Whether sidebar is collapsed
   * @param {boolean} isMobile - Whether on mobile device
   * @returns {Object} - Object with CSS classes
   */
  getMenuItemClasses(isActive, isCollapsed, isMobile) {
    return {
      'sidebar-menu-link-active': Boolean(isActive),
      'sidebar-menu-link-collapsed': Boolean(isCollapsed && !isMobile)
    }
  },

  /**
   * Validate sidebar state object
   * @param {Object} state - Sidebar state object
   * @returns {boolean} - Whether state is valid
   */
  validateSidebarState(state) {
    if (!state || typeof state !== 'object') return false
    
    const requiredKeys = ['isCollapsed', 'isMedicalRecordsOpen', 'isPharmacyOpen', 'isLaboratoryOpen', 'isReportsOpen']
    return requiredKeys.every(key => typeof state[key] === 'boolean')
  },

  /**
   * Get default sidebar state
   * @returns {Object} - Default state object
   */
  getDefaultState() {
    return {
      isCollapsed: false,
      isMedicalRecordsOpen: false,
      isPharmacyOpen: false,
      isLaboratoryOpen: false,
      isReportsOpen: false,
      lastUpdated: Date.now()
    }
  },

  /**
   * Debounce function for performance optimization
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  /**
   * Throttle function for performance optimization
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} - Throttled function
   */
  throttle(func, limit) {
    let inThrottle
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}

// Export default instance
export default SidebarManager
