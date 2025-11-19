import { ref, computed, onMounted } from 'vue'
import { useEmergencyStore } from '@/stores/emergency'

/**
 * Triage Assessment Composable
 * Manages triage assessment operations and patient prioritization
 */
export function useTriageAssessment() {
  const emergencyStore = useEmergencyStore()

  // State
  const showAssessmentForm = ref(false)
  const selectedPatient = ref(null)
  const searchQuery = ref('')
  const selectedPriority = ref('all')
  const selectedStatus = ref('all')

  // Form data
  const assessmentForm = ref({
    patient_id: null,
    emergency_case_id: null,
    chief_complaint: '',
    vital_signs: {
      blood_pressure: '',
      heart_rate: '',
      temperature: '',
      respiratory_rate: '',
      oxygen_saturation: ''
    },
    pain_level: 0,
    consciousness_level: 'alert',
    mobility_status: 'independent',
    triage_priority: 'medium',
    assessment_notes: '',
    recommended_treatment: '',
    estimated_wait_time: ''
  })

  // Computed
  const filteredAssessments = computed(() => {
    let filtered = emergencyStore.triageAssessments

    if (selectedPriority.value !== 'all') {
      filtered = filtered.filter(assessment => assessment.triage_priority === selectedPriority.value)
    }

    if (selectedStatus.value !== 'all') {
      filtered = filtered.filter(assessment => assessment.status === selectedStatus.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(assessment => 
        assessment.patient_name?.toLowerCase().includes(query) ||
        assessment.chief_complaint?.toLowerCase().includes(query) ||
        assessment.assessment_notes?.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  })

  const pendingAssessments = computed(() => 
    emergencyStore.pendingTriage.sort((a, b) => {
      // Sort by priority first, then by arrival time
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.triage_priority] || 0
      const bPriority = priorityOrder[b.triage_priority] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      return new Date(a.created_at) - new Date(b.created_at)
    })
  )

  const assessmentStats = computed(() => ({
    total: emergencyStore.triageAssessments.length,
    pending: emergencyStore.pendingTriage.length,
    critical: emergencyStore.triageAssessments.filter(a => a.triage_priority === 'critical').length,
    high: emergencyStore.triageAssessments.filter(a => a.triage_priority === 'high').length,
    medium: emergencyStore.triageAssessments.filter(a => a.triage_priority === 'medium').length,
    low: emergencyStore.triageAssessments.filter(a => a.triage_priority === 'low').length
  }))

  const emergencyCases = computed(() => 
    emergencyStore.emergencyCases.filter(case_ => case_.status === 'active')
  )

  // Actions
  const loadData = async () => {
    try {
      await Promise.all([
        emergencyStore.fetchTriageAssessments(),
        emergencyStore.fetchEmergencyCases()
      ])
    } catch (error) {
      console.error('Failed to load triage data:', error)
    }
  }

  const openAssessmentForm = (patient = null) => {
    if (patient) {
      selectedPatient.value = patient
      assessmentForm.value.patient_id = patient.id
      assessmentForm.value.emergency_case_id = patient.emergency_case_id
    }
    showAssessmentForm.value = true
  }

  const closeAssessmentForm = () => {
    showAssessmentForm.value = false
    selectedPatient.value = null
    resetAssessmentForm()
  }

  const resetAssessmentForm = () => {
    assessmentForm.value = {
      patient_id: null,
      emergency_case_id: null,
      chief_complaint: '',
      vital_signs: {
        blood_pressure: '',
        heart_rate: '',
        temperature: '',
        respiratory_rate: '',
        oxygen_saturation: ''
      },
      pain_level: 0,
      consciousness_level: 'alert',
      mobility_status: 'independent',
      triage_priority: 'medium',
      assessment_notes: '',
      recommended_treatment: '',
      estimated_wait_time: ''
    }
  }

  const submitAssessment = async () => {
    try {
      await emergencyStore.createTriageAssessment(assessmentForm.value)
      closeAssessmentForm()
      await loadData()
    } catch (error) {
      console.error('Failed to create triage assessment:', error)
    }
  }

  const calculateTriagePriority = () => {
    const vitalSigns = assessmentForm.value.vital_signs
    const painLevel = assessmentForm.value.pain_level
    const consciousness = assessmentForm.value.consciousness_level

    // Critical conditions
    if (consciousness === 'unresponsive' || 
        vitalSigns.heart_rate < 40 || vitalSigns.heart_rate > 150 ||
        vitalSigns.blood_pressure < 80 || vitalSigns.blood_pressure > 200 ||
        vitalSigns.oxygen_saturation < 90) {
      return 'critical'
    }

    // High priority conditions
    if (consciousness === 'confused' || 
        painLevel >= 8 ||
        vitalSigns.heart_rate < 50 || vitalSigns.heart_rate > 120 ||
        vitalSigns.temperature > 39 || vitalSigns.temperature < 35) {
      return 'high'
    }

    // Medium priority conditions
    if (painLevel >= 5 || 
        vitalSigns.heart_rate < 60 || vitalSigns.heart_rate > 100 ||
        vitalSigns.temperature > 38 || vitalSigns.temperature < 36) {
      return 'medium'
    }

    // Low priority
    return 'low'
  }

  const updateTriagePriority = () => {
    assessmentForm.value.triage_priority = calculateTriagePriority()
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      completed: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  const getPainLevelColor = (level) => {
    if (level >= 8) return 'text-red-600 bg-red-100'
    if (level >= 6) return 'text-orange-600 bg-orange-100'
    if (level >= 4) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getConsciousnessColor = (level) => {
    const colors = {
      alert: 'text-green-600 bg-green-100',
      confused: 'text-yellow-600 bg-yellow-100',
      drowsy: 'text-orange-600 bg-orange-100',
      unresponsive: 'text-red-600 bg-red-100'
    }
    return colors[level] || 'text-gray-600 bg-gray-100'
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

  const getWaitTimeEstimate = (priority) => {
    const estimates = {
      critical: 'Immediate',
      high: '15-30 minutes',
      medium: '1-2 hours',
      low: '2-4 hours'
    }
    return estimates[priority] || 'Unknown'
  }

  const validateVitalSigns = (vitalSigns) => {
    const errors = []
    
    if (vitalSigns.heart_rate && (vitalSigns.heart_rate < 30 || vitalSigns.heart_rate > 250)) {
      errors.push('Heart rate should be between 30-250 bpm')
    }
    
    if (vitalSigns.temperature && (vitalSigns.temperature < 30 || vitalSigns.temperature > 45)) {
      errors.push('Temperature should be between 30-45°C')
    }
    
    if (vitalSigns.oxygen_saturation && (vitalSigns.oxygen_saturation < 70 || vitalSigns.oxygen_saturation > 100)) {
      errors.push('Oxygen saturation should be between 70-100%')
    }
    
    return errors
  }

  // Lifecycle
  onMounted(() => {
    loadData()
  })

  return {
    // State
    showAssessmentForm,
    selectedPatient,
    searchQuery,
    selectedPriority,
    selectedStatus,
    assessmentForm,
    
    // Computed
    filteredAssessments,
    pendingAssessments,
    assessmentStats,
    emergencyCases,
    
    // Actions
    loadData,
    openAssessmentForm,
    closeAssessmentForm,
    resetAssessmentForm,
    submitAssessment,
    calculateTriagePriority,
    updateTriagePriority,
    getPriorityColor,
    getStatusColor,
    getPainLevelColor,
    getConsciousnessColor,
    formatTime,
    formatDate,
    getWaitTimeEstimate,
    validateVitalSigns
  }
}
