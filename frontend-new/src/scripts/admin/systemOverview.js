import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { formatBytes } from '@/utils/adminHelpers'

/**
 * System Overview Composable
 * 
 * Manages system overview functionality
 */
export const useSystemOverview = () => {
  // Store
  const adminStore = useAdminStore()
  
  // Reactive data
  const loading = ref(false)
  const error = ref(null)
  const systemData = ref(null)
  const storagePercentage = ref(0)

  // Methods
  const loadSystemData = async () => {
    try {
      loading.value = true
      error.value = null
      
      await adminStore.loadSystemOverview()
      systemData.value = adminStore.getSystemOverview
      
      // Calculate storage percentage
      if (systemData.value?.storage) {
        const total = systemData.value.storage.total_space
        const used = systemData.value.storage.used_space
        storagePercentage.value = total > 0 ? (used / total) * 100 : 0
      }
    } catch (err) {
      error.value = err.message || 'Failed to load system data'
    } finally {
      loading.value = false
    }
  }

  const refreshData = async () => {
    await loadSystemData()
  }

  const getCacheStatusClass = (status) => {
    return status === 'Working' 
      ? 'bg-green-500' 
      : 'bg-red-500'
  }

  const onMountedHandler = () => {
    loadSystemData()
  }

  return {
    // Reactive data
    loading,
    error,
    systemData,
    storagePercentage,

    // Methods
    loadSystemData,
    refreshData,
    formatBytes,
    getCacheStatusClass,
    onMountedHandler
  }
}
