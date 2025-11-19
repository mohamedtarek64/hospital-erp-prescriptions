import { ref, computed, onMounted } from 'vue'
import { useEmergencyStore } from '@/stores/emergency'
import { useAmbulanceStore } from '@/stores/ambulance'

/**
 * Emergency Dashboard Composable
 * Manages emergency dashboard state and operations
 */
export function useEmergencyDashboard() {
  const emergencyStore = useEmergencyStore()
  const ambulanceStore = useAmbulanceStore()

  // State
  const selectedTimeRange = ref('today')
  const selectedDepartment = ref('all')
  const refreshInterval = ref(null)

  // Computed
  const dashboardStats = computed(() => ({
    totalCases: emergencyStore.emergencyCases.length,
    activeCases: emergencyStore.activeCases.length,
    criticalCases: emergencyStore.criticalCases.length,
    availableAmbulances: ambulanceStore.availableAmbulances.length,
    dispatchedAmbulances: ambulanceStore.dispatchedAmbulances.length,
    unreadAlerts: emergencyStore.unreadAlerts.length
  }))

  const recentCases = computed(() => 
    emergencyStore.emergencyCases
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  )

  const recentDispatches = computed(() => 
    ambulanceStore.activeDispatches
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  )

  const caseStatusDistribution = computed(() => {
    const distribution = {
      active: 0,
      completed: 0,
      cancelled: 0
    }
    
    emergencyStore.emergencyCases.forEach(case_ => {
      distribution[case_.status] = (distribution[case_.status] || 0) + 1
    })
    
    return distribution
  })

  const priorityDistribution = computed(() => {
    const distribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }
    
    emergencyStore.emergencyCases.forEach(case_ => {
      distribution[case_.priority] = (distribution[case_.priority] || 0) + 1
    })
    
    return distribution
  })

  // Actions
  const loadDashboardData = async () => {
    try {
      await Promise.all([
        emergencyStore.fetchEmergencyCases(),
        emergencyStore.fetchTriageAssessments(),
        emergencyStore.fetchEmergencyStaff(),
        emergencyStore.fetchEmergencyEquipment(),
        emergencyStore.fetchCriticalAlerts(),
        ambulanceStore.fetchAmbulances(),
        ambulanceStore.fetchDispatchRecords()
      ])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  const refreshData = async () => {
    await loadDashboardData()
  }

  const startAutoRefresh = () => {
    refreshInterval.value = setInterval(refreshData, 30000) // Refresh every 30 seconds
  }

  const stopAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }

  const filterCasesByTimeRange = (cases) => {
    const now = new Date()
    const timeRanges = {
      today: 1,
      week: 7,
      month: 30,
      year: 365
    }
    
    const days = timeRanges[selectedTimeRange.value] || 1
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
    
    return cases.filter(case_ => new Date(case_.created_at) >= cutoffDate)
  }

  const filterCasesByDepartment = (cases) => {
    if (selectedDepartment.value === 'all') {
      return cases
    }
    return cases.filter(case_ => case_.department === selectedDepartment.value)
  }

  const getCaseStatusColor = (status) => {
    const colors = {
      active: 'text-red-600 bg-red-100',
      completed: 'text-green-600 bg-green-100',
      cancelled: 'text-gray-600 bg-gray-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'text-red-600 bg-red-100',
      high: 'text-orange-600 bg-orange-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100'
    }
    return colors[priority] || 'text-gray-600 bg-gray-100'
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Lifecycle
  onMounted(() => {
    loadDashboardData()
    startAutoRefresh()
  })

  return {
    // State
    selectedTimeRange,
    selectedDepartment,
    
    // Computed
    dashboardStats,
    recentCases,
    recentDispatches,
    caseStatusDistribution,
    priorityDistribution,
    
    // Actions
    loadDashboardData,
    refreshData,
    startAutoRefresh,
    stopAutoRefresh,
    filterCasesByTimeRange,
    filterCasesByDepartment,
    getCaseStatusColor,
    getPriorityColor,
    formatTime,
    formatDate
  }
}
