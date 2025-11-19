import { ref, computed, onMounted } from 'vue'
import { useEmergencyStore } from '@/stores/emergency'

/**
 * Critical Alerts Composable
 * Manages critical alerts and emergency notifications
 */
export function useCriticalAlerts() {
  const emergencyStore = useEmergencyStore()

  // State
  const showAlertForm = ref(false)
  const selectedAlert = ref(null)
  const searchQuery = ref('')
  const selectedType = ref('all')
  const selectedStatus = ref('all')
  const selectedPriority = ref('all')
  const autoRefresh = ref(true)
  const refreshInterval = ref(null)

  // Form data
  const alertForm = ref({
    title: '',
    message: '',
    type: 'emergency',
    priority: 'high',
    target_department: '',
    target_users: [],
    expires_at: '',
    requires_acknowledgment: true,
    auto_resolve: false
  })

  // Computed
  const filteredAlerts = computed(() => {
    let filtered = emergencyStore.criticalAlerts

    if (selectedType.value !== 'all') {
      filtered = filtered.filter(alert => alert.type === selectedType.value)
    }

    if (selectedStatus.value !== 'all') {
      filtered = filtered.filter(alert => alert.status === selectedStatus.value)
    }

    if (selectedPriority.value !== 'all') {
      filtered = filtered.filter(alert => alert.priority === selectedPriority.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(alert => 
        alert.title.toLowerCase().includes(query) ||
        alert.message.toLowerCase().includes(query) ||
        alert.type.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  })

  const activeAlerts = computed(() => 
    emergencyStore.criticalAlerts.filter(alert => alert.status === 'active')
  )

  const unreadAlerts = computed(() => 
    emergencyStore.unreadAlerts
  )

  const expiredAlerts = computed(() => 
    emergencyStore.criticalAlerts.filter(alert => 
      alert.expires_at && new Date(alert.expires_at) < new Date()
    )
  )

  const alertStats = computed(() => ({
    total: emergencyStore.criticalAlerts.length,
    active: activeAlerts.value.length,
    unread: unreadAlerts.value.length,
    expired: expiredAlerts.value.length,
    emergency: emergencyStore.criticalAlerts.filter(a => a.type === 'emergency').length,
    warning: emergencyStore.criticalAlerts.filter(a => a.type === 'warning').length,
    info: emergencyStore.criticalAlerts.filter(a => a.type === 'info').length
  }))

  const alertTypes = computed(() => [
    { value: 'emergency', label: 'Emergency', color: 'text-red-600 bg-red-100' },
    { value: 'warning', label: 'Warning', color: 'text-orange-600 bg-orange-100' },
    { value: 'info', label: 'Information', color: 'text-blue-600 bg-blue-100' },
    { value: 'maintenance', label: 'Maintenance', color: 'text-yellow-600 bg-yellow-100' }
  ])

  const priorityLevels = computed(() => [
    { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100' },
    { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' }
  ])

  // Actions
  const loadData = async () => {
    try {
      await emergencyStore.fetchCriticalAlerts()
    } catch (error) {
      console.error('Failed to load critical alerts:', error)
    }
  }

  const openAlertForm = (alert = null) => {
    if (alert) {
      selectedAlert.value = alert
      alertForm.value = { ...alert }
    } else {
      selectedAlert.value = null
      resetAlertForm()
    }
    showAlertForm.value = true
  }

  const closeAlertForm = () => {
    showAlertForm.value = false
    selectedAlert.value = null
    resetAlertForm()
  }

  const resetAlertForm = () => {
    alertForm.value = {
      title: '',
      message: '',
      type: 'emergency',
      priority: 'high',
      target_department: '',
      target_users: [],
      expires_at: '',
      requires_acknowledgment: true,
      auto_resolve: false
    }
  }

  const createAlert = async () => {
    try {
      const alertData = {
        ...alertForm.value,
        status: 'active',
        created_by: 'current_user_id' // This should come from auth
      }
      
      // This would typically call an API endpoint
      // await emergencyStore.createCriticalAlert(alertData)
      
      closeAlertForm()
      await loadData()
    } catch (error) {
      console.error('Failed to create alert:', error)
    }
  }

  const acknowledgeAlert = async (alertId) => {
    try {
      await emergencyStore.markAlertAsRead(alertId)
      await loadData()
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const resolveAlert = async (alertId) => {
    try {
      // This would typically call an API endpoint
      // await emergencyStore.resolveAlert(alertId)
      
      const alert = emergencyStore.criticalAlerts.find(a => a.id === alertId)
      if (alert) {
        alert.status = 'resolved'
        alert.resolved_at = new Date().toISOString()
      }
      
      await loadData()
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const deleteAlert = async (alertId) => {
    try {
      // This would typically call an API endpoint
      // await emergencyStore.deleteAlert(alertId)
      
      emergencyStore.criticalAlerts = emergencyStore.criticalAlerts.filter(
        alert => alert.id !== alertId
      )
    } catch (error) {
      console.error('Failed to delete alert:', error)
    }
  }

  const startAutoRefresh = () => {
    if (autoRefresh.value) {
      refreshInterval.value = setInterval(loadData, 10000) // Refresh every 10 seconds
    }
  }

  const stopAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }

  const toggleAutoRefresh = () => {
    autoRefresh.value = !autoRefresh.value
    if (autoRefresh.value) {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
    }
  }

  const getAlertTypeColor = (type) => {
    const typeConfig = alertTypes.value.find(t => t.value === type)
    return typeConfig ? typeConfig.color : 'text-gray-600 bg-gray-100'
  }

  const getPriorityColor = (priority) => {
    const priorityConfig = priorityLevels.value.find(p => p.value === priority)
    return priorityConfig ? priorityConfig.color : 'text-gray-600 bg-gray-100'
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-red-600 bg-red-100',
      acknowledged: 'text-yellow-600 bg-yellow-100',
      resolved: 'text-green-600 bg-green-100',
      expired: 'text-gray-600 bg-gray-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  const isAlertExpired = (alert) => {
    return alert.expires_at && new Date(alert.expires_at) < new Date()
  }

  const getExpirationStatus = (alert) => {
    if (!alert.expires_at) return null
    
    const expiresAt = new Date(alert.expires_at)
    const now = new Date()
    const diffMs = expiresAt - now
    
    if (diffMs <= 0) {
      return { status: 'expired', color: 'text-red-600' }
    } else if (diffMs <= 300000) { // 5 minutes
      return { status: 'expiring', color: 'text-orange-600' }
    } else {
      return { status: 'active', color: 'text-green-600' }
    }
  }

  // Lifecycle
  onMounted(() => {
    loadData()
    startAutoRefresh()
  })

  return {
    // State
    showAlertForm,
    selectedAlert,
    searchQuery,
    selectedType,
    selectedStatus,
    selectedPriority,
    autoRefresh,
    alertForm,
    
    // Computed
    filteredAlerts,
    activeAlerts,
    unreadAlerts,
    expiredAlerts,
    alertStats,
    alertTypes,
    priorityLevels,
    
    // Actions
    loadData,
    openAlertForm,
    closeAlertForm,
    resetAlertForm,
    createAlert,
    acknowledgeAlert,
    resolveAlert,
    deleteAlert,
    startAutoRefresh,
    stopAutoRefresh,
    toggleAutoRefresh,
    getAlertTypeColor,
    getPriorityColor,
    getStatusColor,
    formatTime,
    formatDate,
    formatDateTime,
    getTimeAgo,
    isAlertExpired,
    getExpirationStatus
  }
}
