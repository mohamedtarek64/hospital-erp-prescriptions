import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useSidebarStore = defineStore('sidebar', () => {
  const isCollapsed = ref(false)
  const isMobileOpen = ref(false)
  const activeMenu = ref('dashboard')
  const activeSubmenu = ref('')
  const breadcrumbs = ref([])

  const sidebarWidth = computed(() => isCollapsed.value ? '64px' : '256px')
  const isMobile = computed(() => window.innerWidth < 768)

  const toggleSidebar = () => {
    if (isMobile.value) {
      isMobileOpen.value = !isMobileOpen.value
    } else {
    isCollapsed.value = !isCollapsed.value
    }
  }

  const closeSidebar = () => {
    if (isMobile.value) {
      isMobileOpen.value = false
    } else {
      isCollapsed.value = false
    }
  }

  const openSidebar = () => {
    if (isMobile.value) {
      isMobileOpen.value = true
    } else {
      isCollapsed.value = false
    }
  }

  const setActiveMenu = (menu) => {
    activeMenu.value = menu
    activeSubmenu.value = ''
  }

  const setActiveSubmenu = (submenu) => {
    activeSubmenu.value = submenu
  }

  const setBreadcrumbs = (crumbs) => {
    breadcrumbs.value = crumbs
  }

  const getNavigationItems = () => {
    const authStore = useAuthStore()
    
    const menuItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'fas fa-tachometer-alt',
        route: '/dashboard',
        permission: 'dashboard.view'
      },
      {
        id: 'patients',
        label: 'Patients',
        icon: 'fas fa-users',
        route: '/patients',
        permission: 'patients.view'
      },
      {
        id: 'appointments',
        label: 'Appointments',
        icon: 'fas fa-calendar-alt',
        route: '/appointments',
        permission: 'appointments.view'
      },
      {
        id: 'medical-records',
        label: 'Medical Records',
        icon: 'fas fa-file-medical',
        route: '/medical-records',
        permission: 'medical_records.view'
      },
      {
        id: 'pharmacy',
        label: 'Pharmacy',
        icon: 'fas fa-pills',
        route: '/pharmacy',
        permission: 'pharmacy.view'
      },
      {
        id: 'billing',
        label: 'Billing',
        icon: 'fas fa-receipt',
        route: '/billing',
        permission: 'billing.view'
      },
      {
        id: 'laboratory',
        label: 'Laboratory',
        icon: 'fas fa-flask',
        route: '/laboratory',
        permission: 'laboratory.view'
      },
      {
        id: 'hr',
        label: 'Human Resources',
        icon: 'fas fa-user-tie',
        route: '/hr',
        permission: 'hr.view'
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: 'fas fa-chart-bar',
        route: '/reports',
        permission: 'reports.view'
      },
      {
        id: 'ward-management',
        label: 'Ward Management',
        icon: 'fas fa-bed',
        route: '/ward-management',
        permission: 'ward_management.view'
      },
      {
        id: 'emergency',
        label: 'Emergency',
        icon: 'fas fa-ambulance',
        route: '/emergency',
        permission: 'emergency.view'
      },
      {
        id: 'equipment',
        label: 'Equipment',
        icon: 'fas fa-tools',
        route: '/equipment',
        permission: 'equipment.view'
      },
      {
        id: 'admin',
        label: 'Administration',
        icon: 'fas fa-cog',
        route: '/admin',
        permission: 'admin.view'
      }
    ]

    return menuItems.filter(item => {
      if (!item.permission) return true
      return authStore.hasPermission(item.permission)
    })
  }

  return {
    isCollapsed,
    isMobileOpen,
    activeMenu,
    activeSubmenu,
    breadcrumbs,
    sidebarWidth,
    isMobile,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setActiveMenu,
    setActiveSubmenu,
    setBreadcrumbs,
    getNavigationItems
  }
})