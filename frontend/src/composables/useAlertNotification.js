import { ref } from 'vue'

export function useAlertNotification(props, emit) {
  // Reactive state
  const isProcessing = ref(false)

  // Methods
  const getAlertClass = (alert) => {
    const baseClass = 'alert-notification'
    const priorityClass = `priority-${alert.priority || 'medium'}`
    const statusClass = `status-${alert.status}`
    return `${baseClass} ${priorityClass} ${statusClass}`
  }

  const getAlertIcon = (alertType) => {
    const iconMap = {
      critical: 'fas fa-exclamation-triangle',
      emergency: 'fas fa-ambulance',
      equipment: 'fas fa-wrench',
      staff: 'fas fa-user-md',
      system: 'fas fa-server',
      security: 'fas fa-shield-alt',
      maintenance: 'fas fa-tools',
      inventory: 'fas fa-boxes'
    }
    return iconMap[alertType] || 'fas fa-bell'
  }

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      acknowledged: 'status-acknowledged',
      resolved: 'status-resolved',
      dismissed: 'status-dismissed'
    }
    return statusClasses[status] || 'status-unknown'
  }

  const formatAlertType = (alertType) => {
    if (!alertType) return 'Alert'
    return alertType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatStatus = (status) => {
    if (!status) return 'Unknown'
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getAlertAge = (dateString) => {
    if (!dateString) return 'Unknown'
    const now = new Date()
    const alertTime = new Date(dateString)
    const diffMs = now - alertTime
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const getPatientName = (patient) => {
    if (!patient) return 'Unknown Patient'
    return patient.name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unknown Patient'
  }

  const getStaffName = (staff) => {
    if (!staff) return 'Unknown Staff'
    return staff.name || `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || 'Unknown Staff'
  }

  const acknowledgeAlert = async () => {
    isProcessing.value = true
    try {
      emit('acknowledge', props.alert)
    } finally {
      isProcessing.value = false
    }
  }

  const resolveAlert = async () => {
    isProcessing.value = true
    try {
      emit('resolve', props.alert)
    } finally {
      isProcessing.value = false
    }
  }

  const dismissAlert = async () => {
    isProcessing.value = true
    try {
      emit('dismiss', props.alert)
    } finally {
      isProcessing.value = false
    }
  }

  return {
    // State
    isProcessing,
    
    // Methods
    getAlertClass,
    getAlertIcon,
    getStatusClass,
    formatAlertType,
    formatStatus,
    formatTime,
    getAlertAge,
    getPatientName,
    getStaffName,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert
  }
}
