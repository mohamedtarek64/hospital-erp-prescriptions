// import { computed } from 'vue'

export function useAmbulanceCard(props, emit) {
  // Methods
  const formatAmbulanceType = (type) => {
    if (!type) return 'Unknown'
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getStatusClass = (status) => {
    const statusClasses = {
      available: 'status-available',
      busy: 'status-busy',
      maintenance: 'status-maintenance',
      offline: 'status-offline'
    }
    return statusClasses[status] || 'status-unknown'
  }

  const getStatusIcon = (status) => {
    const statusIcons = {
      available: 'fas fa-check-circle',
      busy: 'fas fa-clock',
      maintenance: 'fas fa-wrench',
      offline: 'fas fa-times-circle'
    }
    return statusIcons[status] || 'fas fa-question-circle'
  }

  const getStaffName = (staff) => {
    if (!staff) return 'Not Assigned'
    return staff.name || `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || 'Unknown'
  }

  const getLocationText = (location) => {
    if (!location) return 'Unknown Location'
    if (location.address) return location.address
    if (location.lat && location.lng) {
      return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
    }
    return 'Location Not Set'
  }

  const viewDetails = () => {
    emit('view', props.ambulance)
  }

  const dispatchAmbulance = () => {
    emit('dispatch', props.ambulance)
  }

  const updateLocation = () => {
    emit('update-location', props.ambulance)
  }

  const maintenanceRequest = () => {
    emit('maintenance', props.ambulance)
  }

  return {
    formatAmbulanceType,
    getStatusClass,
    getStatusIcon,
    getStaffName,
    getLocationText,
    viewDetails,
    dispatchAmbulance,
    updateLocation,
    maintenanceRequest
  }
}
