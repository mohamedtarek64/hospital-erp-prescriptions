import { computed } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'

export const useSidebar = () => {
  const sidebarStore = useSidebarStore()

  const isCollapsed = computed(() => sidebarStore.isCollapsed)
  const isMobileOpen = computed(() => sidebarStore.isMobileOpen)
  const activeMenu = computed(() => sidebarStore.activeMenu)
  const activeSubmenu = computed(() => sidebarStore.activeSubmenu)
  const breadcrumbs = computed(() => sidebarStore.breadcrumbs)
  const sidebarWidth = computed(() => sidebarStore.sidebarWidth)
  const isMobile = computed(() => sidebarStore.isMobile)

  const toggleSidebar = () => sidebarStore.toggleSidebar()
  const closeSidebar = () => sidebarStore.closeSidebar()
  const openSidebar = () => sidebarStore.openSidebar()
  const setActiveMenu = (menu) => sidebarStore.setActiveMenu(menu)
  const setActiveSubmenu = (submenu) => sidebarStore.setActiveSubmenu(submenu)
  const setBreadcrumbs = (crumbs) => sidebarStore.setBreadcrumbs(crumbs)
  const getNavigationItems = () => sidebarStore.getNavigationItems()

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
}