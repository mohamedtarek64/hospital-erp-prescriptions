import { ref, computed, onMounted } from 'vue'
import { useEmergencyStore } from '@/stores/emergency'

/**
 * Emergency Room Composable
 * Manages emergency room operations and patient flow
 */
export function useEmergencyRoom() {
  const emergencyStore = useEmergencyStore()

  // State
  const selectedRoom = ref(null)
  const showPatientForm = ref(false)
  const showRoomModal = ref(false)
  const searchQuery = ref('')
  const selectedStatus = ref('all')
  const selectedPriority = ref('all')

  // Form data
  const patientForm = ref({
    patient_name: '',
    patient_id: '',
    age: '',
    gender: '',
    chief_complaint: '',
    vital_signs: {
      blood_pressure: '',
      heart_rate: '',
      temperature: '',
      respiratory_rate: '',
      oxygen_saturation: ''
    },
    allergies: '',
    medications: '',
    medical_history: '',
    emergency_contact: '',
    insurance_info: ''
  })

  // Computed
  const emergencyRooms = computed(() => [
    { id: 1, name: 'ER-1', status: 'occupied', patient: 'John Doe', priority: 'critical' },
    { id: 2, name: 'ER-2', status: 'available', patient: null, priority: null },
    { id: 3, name: 'ER-3', status: 'occupied', patient: 'Jane Smith', priority: 'high' },
    { id: 4, name: 'ER-4', status: 'maintenance', patient: null, priority: null },
    { id: 5, name: 'ER-5', status: 'available', patient: null, priority: null },
    { id: 6, name: 'ER-6', status: 'occupied', patient: 'Bob Johnson', priority: 'medium' }
  ])

  const filteredRooms = computed(() => {
    let filtered = emergencyRooms.value

    if (selectedStatus.value !== 'all') {
      filtered = filtered.filter(room => room.status === selectedStatus.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(query) ||
        (room.patient && room.patient.toLowerCase().includes(query))
      )
    }

    return filtered
  })

  const availableRooms = computed(() => 
    emergencyRooms.value.filter(room => room.status === 'available')
  )

  const occupiedRooms = computed(() => 
    emergencyRooms.value.filter(room => room.status === 'occupied')
  )

  const roomStats = computed(() => ({
    total: emergencyRooms.value.length,
    available: availableRooms.value.length,
    occupied: occupiedRooms.value.length,
    maintenance: emergencyRooms.value.filter(room => room.status === 'maintenance').length,
    critical: occupiedRooms.value.filter(room => room.priority === 'critical').length,
    high: occupiedRooms.value.filter(room => room.priority === 'high').length,
    medium: occupiedRooms.value.filter(room => room.priority === 'medium').length,
    low: occupiedRooms.value.filter(room => room.priority === 'low').length
  }))

  const currentPatients = computed(() => 
    emergencyStore.emergencyCases.filter(case_ => case_.status === 'active')
  )

  const waitingPatients = computed(() => 
    emergencyStore.pendingTriage.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.triage_priority] - priorityOrder[a.triage_priority]
    })
  )

  // Actions
  const loadData = async () => {
    try {
      await Promise.all([
        emergencyStore.fetchEmergencyCases(),
        emergencyStore.fetchTriageAssessments(),
        emergencyStore.fetchEmergencyStaff(),
        emergencyStore.fetchEmergencyEquipment()
      ])
    } catch (error) {
      console.error('Failed to load emergency room data:', error)
    }
  }

  const openPatientForm = (room = null) => {
    selectedRoom.value = room
    showPatientForm.value = true
  }

  const closePatientForm = () => {
    showPatientForm.value = false
    selectedRoom.value = null
    resetPatientForm()
  }

  const resetPatientForm = () => {
    patientForm.value = {
      patient_name: '',
      patient_id: '',
      age: '',
      gender: '',
      chief_complaint: '',
      vital_signs: {
        blood_pressure: '',
        heart_rate: '',
        temperature: '',
        respiratory_rate: '',
        oxygen_saturation: ''
      },
      allergies: '',
      medications: '',
      medical_history: '',
      emergency_contact: '',
      insurance_info: ''
    }
  }

  const assignPatientToRoom = async (patient, room) => {
    try {
      // Update room status
      room.status = 'occupied'
      room.patient = patient.patient_name
      room.priority = patient.triage_priority
      
      // Create emergency case
      const caseData = {
        patient_name: patient.patient_name,
        patient_id: patient.patient_id,
        room_id: room.id,
        chief_complaint: patient.chief_complaint,
        priority: patient.triage_priority,
        status: 'active'
      }
      
      await emergencyStore.createEmergencyCase(caseData)
      await loadData()
    } catch (error) {
      console.error('Failed to assign patient to room:', error)
    }
  }

  const dischargePatient = async (room) => {
    try {
      // Update room status
      room.status = 'available'
      room.patient = null
      room.priority = null
      
      // Update emergency case status
      const emergencyCase = currentPatients.value.find(case_ => case_.room_id === room.id)
      if (emergencyCase) {
        await emergencyStore.updateEmergencyCase(emergencyCase.id, { status: 'completed' })
      }
      
      await loadData()
    } catch (error) {
      console.error('Failed to discharge patient:', error)
    }
  }

  const openRoomModal = (room) => {
    selectedRoom.value = room
    showRoomModal.value = true
  }

  const closeRoomModal = () => {
    showRoomModal.value = false
    selectedRoom.value = null
  }

  const getRoomStatusColor = (status) => {
    const colors = {
      available: 'text-green-600 bg-green-100',
      occupied: 'text-red-600 bg-red-100',
      maintenance: 'text-orange-600 bg-orange-100'
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

  const getPatientStatusColor = (status) => {
    const colors = {
      active: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
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

  const calculateWaitTime = (patient) => {
    const arrivalTime = new Date(patient.created_at)
    const now = new Date()
    const diffMs = now - arrivalTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`
    }
    return `${diffMins}m`
  }

  const getNextAvailableRoom = () => {
    return availableRooms.value[0] || null
  }

  const getRoomUtilization = () => {
    const total = emergencyRooms.value.length
    const occupied = occupiedRooms.value.length
    return Math.round((occupied / total) * 100)
  }

  const getAverageWaitTime = () => {
    if (waitingPatients.value.length === 0) return '0m'
    
    const totalWaitTime = waitingPatients.value.reduce((total, patient) => {
      return total + (new Date() - new Date(patient.created_at))
    }, 0)
    
    const averageMs = totalWaitTime / waitingPatients.value.length
    const averageMins = Math.floor(averageMs / 60000)
    const averageHours = Math.floor(averageMins / 60)
    
    if (averageHours > 0) {
      return `${averageHours}h ${averageMins % 60}m`
    }
    return `${averageMins}m`
  }

  // Lifecycle
  onMounted(() => {
    loadData()
  })

  return {
    // State
    selectedRoom,
    showPatientForm,
    showRoomModal,
    searchQuery,
    selectedStatus,
    selectedPriority,
    patientForm,
    
    // Computed
    emergencyRooms,
    filteredRooms,
    availableRooms,
    occupiedRooms,
    roomStats,
    currentPatients,
    waitingPatients,
    
    // Actions
    loadData,
    openPatientForm,
    closePatientForm,
    resetPatientForm,
    assignPatientToRoom,
    dischargePatient,
    openRoomModal,
    closeRoomModal,
    getRoomStatusColor,
    getPriorityColor,
    getPatientStatusColor,
    formatTime,
    formatDate,
    calculateWaitTime,
    getNextAvailableRoom,
    getRoomUtilization,
    getAverageWaitTime
  }
}
