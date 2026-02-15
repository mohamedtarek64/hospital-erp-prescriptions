import { ref, reactive, onMounted, computed } from 'vue'
import { useEmergencyStore } from '@/stores/emergency'
import { useAmbulanceStore } from '@/stores/ambulance'

export function useEmergencyMap() {
  // Stores
  const emergencyStore = useEmergencyStore()
  const ambulanceStore = useAmbulanceStore()

  // Reactive state
  const loading = ref(false)
  const error = ref(null)
  const selectedItem = ref(null)
  const mapContainer = ref(null)
  const isFullscreen = ref(false)

  // Hospital location (fixed)
  const hospitalLocation = reactive({
    lat: 30.0444,
    lng: 31.2357,
    address: 'Cleopatra Hospital, Cairo, Egypt'
  })

  // Computed properties
  const emergencyCases = computed(() => emergencyStore.activeCases)
  const ambulances = computed(() => ambulanceStore.ambulances)

  // Methods
  const refreshMap = async () => {
    loading.value = true
    error.value = null
    
    try {
      await Promise.all([
        emergencyStore.loadActiveCases(),
        ambulanceStore.loadAmbulances()
      ])
    } catch (err) {
      error.value = err.message || 'Failed to load map data'
    } finally {
      loading.value = false
    }
  }

  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
    if (mapContainer.value) {
      if (isFullscreen.value) {
        mapContainer.value.classList.add('fullscreen')
      } else {
        mapContainer.value.classList.remove('fullscreen')
      }
    }
  }

  const selectEmergencyCase = (emergencyCase) => {
    selectedItem.value = {
      type: 'emergency',
      ...emergencyCase
    }
  }

  const selectAmbulance = (ambulance) => {
    selectedItem.value = {
      type: 'ambulance',
      ...ambulance
    }
  }

  const closeDetails = () => {
    selectedItem.value = null
  }

  const getMarkerPosition = (location) => {
    if (!location || !location.lat || !location.lng) {
      return { display: 'none' }
    }

    // Convert lat/lng to pixel position (simplified)
    const x = ((location.lng + 180) / 360) * 100
    const y = ((90 - location.lat) / 180) * 100

    return {
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)'
    }
  }

  const getStaffName = (staff) => {
    if (!staff) return 'N/A'
    return staff.name || `${staff.first_name} ${staff.last_name}`.trim() || 'Unknown'
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

  // Lifecycle
  onMounted(() => {
    refreshMap()
  })

  return {
    // State
    loading,
    error,
    selectedItem,
    mapContainer,
    isFullscreen,
    hospitalLocation,
    
    // Computed
    emergencyCases,
    ambulances,
    
    // Methods
    refreshMap,
    toggleFullscreen,
    selectEmergencyCase,
    selectAmbulance,
    closeDetails,
    getMarkerPosition,
    getStaffName,
    formatTime
  }
}
