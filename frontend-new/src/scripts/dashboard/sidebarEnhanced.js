/**
 * Enhanced Sidebar Features
 * Handles search functionality, user profile features, and quick actions
 */

import { ref, computed } from 'vue'

/**
 * Enhanced Sidebar Features Manager
 */
export class SidebarEnhancedManager {
  constructor(router) {
    this.router = router
    
    // Initialize reactive state
    this.searchQuery = ref('')
    this.showSearchResults = ref(false)
    this.userStatus = ref('online') // online, away, busy, offline
    this.isUserMenuOpen = ref(false)
    this.notifications = ref([
      {
        id: 1,
        title: 'مريض جديد',
        message: 'تم تسجيل مريض جديد في قسم الطوارئ',
        time: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false
      },
      {
        id: 2,
        title: 'تنبيه مخزون',
        message: 'كمية الدواء X منخفضة - 10 وحدات متبقية',
        time: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: false
      },
      {
        id: 3,
        title: 'موعد جديد',
        message: 'تم حجز موعد جديد مع د. أحمد محمد',
        time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true
      }
    ])
    
    // Search results data
    this.searchResults = ref([
      { 
        id: 1, 
        title: 'لوحة التحكم', 
        subtitle: 'الصفحة الرئيسية', 
        path: '/dashboard', 
        icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' 
      },
      { 
        id: 2, 
        title: 'المرضى', 
        subtitle: 'إدارة المرضى', 
        path: '/patients', 
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' 
      },
      { 
        id: 3, 
        title: 'المواعيد', 
        subtitle: 'جدولة المواعيد', 
        path: '/appointments', 
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' 
      },
      { 
        id: 4, 
        title: 'الصيدلية', 
        subtitle: 'إدارة الأدوية', 
        path: '/pharmacy', 
        icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' 
      },
      { 
        id: 5, 
        title: 'المختبر', 
        subtitle: 'الفحوصات المخبرية', 
        path: '/laboratory', 
        icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' 
      },
      { 
        id: 6, 
        title: 'التقارير', 
        subtitle: 'تقارير النظام', 
        path: '/reports', 
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' 
      },
      { 
        id: 7, 
        title: 'ضمان الجودة', 
        subtitle: 'إدارة الجودة', 
        path: '/quality-assurance', 
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' 
      }
    ])
  }

  /**
   * Get reactive data for the component
   */
  getReactiveData() {
    return {
      searchQuery: this.searchQuery,
      showSearchResults: this.showSearchResults,
      userStatus: this.userStatus,
      isUserMenuOpen: this.isUserMenuOpen,
      searchResults: this.searchResults
    }
  }

  /**
   * Get computed properties
   */
  getComputedProperties() {
    return {
      filteredSearchResults: computed(() => {
        if (!this.searchQuery.value.trim()) return []
        
        const query = this.searchQuery.value.toLowerCase()
        return this.searchResults.value.filter(result => 
          result.title.toLowerCase().includes(query) || 
          result.subtitle.toLowerCase().includes(query)
        )
      })
    }
  }

  /**
   * Get all methods
   */
  getMethods() {
    return {
      handleSearch: this.handleSearch.bind(this),
      clearSearch: this.clearSearch.bind(this),
      hideSearchResults: this.hideSearchResults.bind(this),
      navigateToSearchResult: this.navigateToSearchResult.bind(this),
      toggleUserMenu: this.toggleUserMenu.bind(this),
      handleAvatarError: this.handleAvatarError.bind(this),
      formatLastSeen: this.formatLastSeen.bind(this),
      quickAction: this.quickAction.bind(this)
    }
  }

  /**
   * Handle search input
   */
  handleSearch() {
    // Search logic is handled by computed property
    // This method can be extended for additional search functionality
  }

  /**
   * Clear search query and hide results
   */
  clearSearch() {
    this.searchQuery.value = ''
    this.showSearchResults.value = false
  }

  /**
   * Hide search results with delay
   */
  hideSearchResults() {
    setTimeout(() => {
      this.showSearchResults.value = false
    }, 200)
  }

  /**
   * Navigate to search result
   */
  navigateToSearchResult(result) {
    this.router.push(result.path)
    this.clearSearch()
  }

  /**
   * Toggle user menu
   */
  toggleUserMenu() {
    this.isUserMenuOpen.value = !this.isUserMenuOpen.value
  }

  /**
   * Handle avatar image error
   */
  handleAvatarError() {
    // Handle avatar image error - could set a default avatar
    console.log('Avatar image failed to load')
  }

  /**
   * Format last seen time
   */
  formatLastSeen(lastSeen) {
    if (!lastSeen) return 'الآن'
    
    const now = new Date()
    const lastSeenDate = new Date(lastSeen)
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`
  }

  /**
   * Handle quick actions
   */
  quickAction(action) {
    switch (action) {
      case 'new-patient':
        this.router.push('/patients/create')
        break
      case 'new-appointment':
        this.router.push('/appointments/create')
        break
      case 'emergency':
        this.router.push('/emergency')
        break
      case 'notifications':
        this.router.push('/notifications')
        break
      case 'new-prescription':
        this.router.push('/prescriptions/create')
        break
      case 'lab-test':
        this.router.push('/laboratory/tests/create')
        break
      case 'emergency-report':
        this.router.push('/reports/emergency')
        break
      case 'stock-alert':
        this.router.push('/inventory/stock-alert')
        break
      case 'new-task':
        this.router.push('/tasks/create')
        break
      default:
        console.log('Unknown quick action:', action)
    }
  }

  /**
   * Format time ago for notifications
   */
  formatTimeAgo(date) {
    if (!date) return 'غير محدد'
    
    const now = new Date()
    const time = new Date(date)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    const notification = this.notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notifications.value.forEach(notification => {
      notification.read = true
    })
  }

  /**
   * Setup event listeners
   */
  setupEventListeners(emit) {
    // Listen for sidebar events and emit to parent
    const sidebarToggleHandler = (event) => {
      emit('sidebarToggle', event.detail)
    }
    
    const mobileMenuToggleHandler = (event) => {
      emit('mobileMenuToggle', event.detail)
    }
    
    const submenuToggleHandler = (event) => {
      emit('submenuToggle', event.detail)
    }
    
    const userLogoutHandler = (event) => {
      emit('userLogout', event.detail)
    }

    window.addEventListener('sidebarToggle', sidebarToggleHandler)
    window.addEventListener('mobileMenuToggle', mobileMenuToggleHandler)
    window.addEventListener('submenuToggle', submenuToggleHandler)
    window.addEventListener('userLogout', userLogoutHandler)

    // Return cleanup function
    return () => {
      window.removeEventListener('sidebarToggle', sidebarToggleHandler)
      window.removeEventListener('mobileMenuToggle', mobileMenuToggleHandler)
      window.removeEventListener('submenuToggle', submenuToggleHandler)
      window.removeEventListener('userLogout', userLogoutHandler)
    }
  }
}

/**
 * Composable function for enhanced sidebar features
 */
export function useSidebarEnhanced(router) {
  const enhancedManager = new SidebarEnhancedManager(router)
  
  return {
    ...enhancedManager.getReactiveData(),
    ...enhancedManager.getComputedProperties(),
    ...enhancedManager.getMethods(),
    setupEventListeners: enhancedManager.setupEventListeners.bind(enhancedManager)
  }
}
