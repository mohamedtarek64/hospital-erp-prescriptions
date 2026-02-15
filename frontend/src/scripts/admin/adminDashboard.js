import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { formatBytes, formatTime, getActionIcon } from '@/utils/adminHelpers'

/**
 * Admin Dashboard Composable
 * 
 * Manages admin dashboard functionality
 */
export const useAdminDashboard = () => {
  // Router
  const router = useRouter()
  
  // Store
  const adminStore = useAdminStore()
  
  // Reactive data
  const loading = ref(false)
  const error = ref(null)
  const statistics = ref(null)
  const systemOverview = ref(null)
  const recentActivity = ref([])

  // Methods
  const loadDashboardData = async () => {
    try {
      loading.value = true
      error.value = null
      
      await adminStore.loadDashboardStats()
      statistics.value = adminStore.getDashboardStats
    } catch (err) {
      error.value = err.message || 'Failed to load dashboard data'
    } finally {
      loading.value = false
    }
  }

  const loadSystemOverview = async () => {
    try {
      await adminStore.loadSystemOverview()
      systemOverview.value = adminStore.getSystemOverview
    } catch (err) {
      console.error('Failed to load system overview:', err)
    }
  }

  const loadRecentActivity = async () => {
    try {
      await adminStore.loadRecentActivity(10)
      recentActivity.value = adminStore.getRecentActivity
    } catch (err) {
      console.error('Failed to load recent activity:', err)
    }
  }

  const refreshData = async () => {
    await Promise.all([
      loadDashboardData(),
      loadSystemOverview(),
      loadRecentActivity()
    ])
  }

  const createBackup = async () => {
    try {
      loading.value = true
      const result = await adminStore.createBackup('full')
      
      if (result.success) {
        // Show success message
        console.log('Backup created successfully')
        await refreshData()
      } else {
        error.value = result.error || 'Failed to create backup'
      }
    } catch (err) {
      error.value = err.message || 'Failed to create backup'
    } finally {
      loading.value = false
    }
  }

  const navigateToUsers = () => {
    router.push('/admin/users')
  }

  const navigateToRoles = () => {
    router.push('/admin/roles')
  }

  const navigateToSettings = () => {
    router.push('/admin/settings')
  }

  const navigateToBackups = () => {
    router.push('/admin/backups')
  }

  const navigateToLogs = () => {
    router.push('/admin/logs')
  }

  const onMountedHandler = () => {
    refreshData()
  }

  return {
    // Reactive data
    loading,
    error,
    statistics,
    systemOverview,
    recentActivity,

    // Methods
    loadDashboardData,
    loadSystemOverview,
    loadRecentActivity,
    refreshData,
    createBackup,
    navigateToUsers,
    navigateToRoles,
    navigateToSettings,
    navigateToBackups,
    navigateToLogs,
    formatBytes,
    formatTime,
    getActivityIcon: getActionIcon,
    onMountedHandler
  }
}
