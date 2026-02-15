import { ref, computed, onMounted } from 'vue'
import { useAmbulanceStore } from '@/stores/ambulance'
import { useEmergencyStore } from '@/stores/emergency'

/**
 * Ambulance Dispatch Composable
 * Manages ambulance dispatch operations and tracking
 */
export function useAmbulanceDispatch() {
  const ambulanceStore = useAmbulanceStore()
  const emergencyStore = useEmergencyStore()

  // State
  const showDispatchForm = ref(false)
  const showTrackingModal = ref(false)
  const selectedAmbulance = ref(null)
  const trackingData = ref(null)
  const searchQuery = ref('')
  const selectedStatus = ref('all')
  const selectedType = ref('all')

  // Form data
  const dispatchForm = ref({
    emergency_case_id: null,
    ambulance_id: null,
    patient_name: '',
    patient_phone: '',
    pickup_location: '',
    destination: '',
    priority: 'medium',
    estimated_arrival: '',
    notes: ''
  })

  // Computed
  const filteredAmbulances = computed(() => {
    let filtered = ambulanceStore.ambulances

    if (selectedStatus.value !== 'all') {
      filtered = filtered.filter(ambulance => ambulance.status === selectedStatus.value)
    }

    if (selectedType.value !== 'all') {
      filtered = filtered.filter(ambulance => ambulance.type === selectedType.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(ambulance => 
        ambulance.license_plate.toLowerCase().includes(query) ||
        ambulance.driver_name.toLowerCase().includes(query) ||
        ambulance.type.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  const availableAmbulances = computed(() => 
    filteredAmbulances.value.filter(ambulance => ambulance.status === 'available')
  )

  const activeDispatches = computed(() => 
    ambulanceStore.activeDispatches.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )
  )

  const emergencyCases = computed(() => 
    emergencyStore.emergencyCases.filter(case_ => case_.status === 'active')
  )

  const dispatchStats = computed(() => ({
    total: ambulanceStore.ambulances.length,
    available: ambulanceStore.availableAmbulances.length,
    dispatched: ambulanceStore.dispatchedAmbulances.length,
    maintenance: ambulanceStore.maintenanceAmbulances.length,
    activeDispatches: ambulanceStore.activeDispatches.length
  }))

  // Actions
  const loadData = async () => {
    try {
      await Promise.all([
        ambulanceStore.fetchAmbulances(),
        ambulanceStore.fetchDispatchRecords(),
        emergencyStore.fetchEmergencyCases()
      ])
    } catch (error) {
      console.error('Failed to load dispatch data:', error)
    }
  }

  const openDispatchForm = (ambulance = null) => {
    if (ambulance) {
      dispatchForm.value.ambulance_id = ambulance.id
    }
    showDispatchForm.value = true
  }

  const closeDispatchForm = () => {
    showDispatchForm.value = false
    resetDispatchForm()
  }

  const resetDispatchForm = () => {
    dispatchForm.value = {
      emergency_case_id: null,
      ambulance_id: null,
      patient_name: '',
      patient_phone: '',
      pickup_location: '',
      destination: '',
      priority: 'medium',
      estimated_arrival: '',
      notes: ''
    }
  }

  const submitDispatch = async () => {
    try {
      await ambulanceStore.createDispatch(dispatchForm.value)
      closeDispatchForm()
      await loadData()
    } catch (error) {
      console.error('Failed to create dispatch:', error)
    }
  }

  const openTrackingModal = async (ambulance) => {
    selectedAmbulance.value = ambulance
    try {
      trackingData.value = await ambulanceStore.trackAmbulance(ambulance.id)
      showTrackingModal.value = true
    } catch (error) {
      console.error('Failed to load tracking data:', error)
    }
  }

  const closeTrackingModal = () => {
    showTrackingModal.value = false
    selectedAmbulance.value = null
    trackingData.value = null
  }

  const completeDispatch = async (dispatchId) => {
    try {
      await ambulanceStore.completeDispatch(dispatchId)
      await loadData()
    } catch (error) {
      console.error('Failed to complete dispatch:', error)
    }
  }

  const findNearestAmbulance = async (location) => {
    try {
      const nearest = await ambulanceStore.getNearestAmbulance(location)
      return nearest
    } catch (error) {
      console.error('Failed to find nearest ambulance:', error)
      return null
    }
  }

  const getAmbulanceStatusColor = (status) => {
    const colors = {
      available: 'text-green-600 bg-green-100',
      dispatched: 'text-blue-600 bg-blue-100',
      maintenance: 'text-orange-600 bg-orange-100',
      out_of_service: 'text-red-600 bg-red-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  const getDispatchStatusColor = (status) => {
    const colors = {
      active: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
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

  const formatDuration = (startTime, endTime = null) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diffMs = end - start
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`
    }
    return `${diffMins}m`
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Lifecycle
  onMounted(() => {
    loadData()
  })

  return {
    // State
    showDispatchForm,
    showTrackingModal,
    selectedAmbulance,
    trackingData,
    searchQuery,
    selectedStatus,
    selectedType,
    dispatchForm,
    
    // Computed
    filteredAmbulances,
    availableAmbulances,
    activeDispatches,
    emergencyCases,
    dispatchStats,
    
    // Actions
    loadData,
    openDispatchForm,
    closeDispatchForm,
    resetDispatchForm,
    submitDispatch,
    openTrackingModal,
    closeTrackingModal,
    completeDispatch,
    findNearestAmbulance,
    getAmbulanceStatusColor,
    getDispatchStatusColor,
    getPriorityColor,
    formatTime,
    formatDuration,
    calculateDistance
  }
}
