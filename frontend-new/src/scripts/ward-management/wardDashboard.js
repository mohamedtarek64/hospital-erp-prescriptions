/**
 * Ward Dashboard JavaScript
 * Handles ward dashboard functionality and data management
 */

// import { onMounted } from 'vue'
import { useWardManagement } from './wardManagement'

/**
 * Ward Dashboard Composable
 */
export function useWardDashboard() {
  // Get ward management functionality
  const {
    loading,
    error,
    statistics,
    wards,
    filteredWards,
    selectedWardType,
    selectedFloor,
    floors,
    loadDashboardData,
    filterWards,
    refreshData,
    openWardForm,
    viewWardDetails,
    getWardTypeName,
    getWardStatusName
  } = useWardManagement()

  // Lifecycle
  const onMountedHandler = () => {
    loadDashboardData()
  }

  return {
    // Reactive data
    loading,
    error,
    statistics,
    wards,
    filteredWards,
    selectedWardType,
    selectedFloor,
    floors,
    
    // Methods
    loadDashboardData,
    filterWards,
    refreshData,
    openWardForm,
    viewWardDetails,
    getWardTypeName,
    getWardStatusName,
    
    // Lifecycle
    onMountedHandler
  }
}
