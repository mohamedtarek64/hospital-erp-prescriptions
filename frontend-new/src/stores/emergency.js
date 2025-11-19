import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

/**
 * Emergency Management Store
 * Handles emergency cases, triage assessments, and emergency room management
 */
export const useEmergencyStore = defineStore('emergency', () => {
  // State
  const emergencyCases = ref([])
  const triageAssessments = ref([])
  const emergencyStaff = ref([])
  const emergencyEquipment = ref([])
  const criticalAlerts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const activeCases = computed(() => 
    emergencyCases.value.filter(case_ => case_.status === 'active')
  )

  const criticalCases = computed(() => 
    emergencyCases.value.filter(case_ => case_.priority === 'critical')
  )

  const pendingTriage = computed(() => 
    triageAssessments.value.filter(assessment => assessment.status === 'pending')
  )

  const availableStaff = computed(() => 
    emergencyStaff.value.filter(staff => staff.status === 'available')
  )

  const equipmentInUse = computed(() => 
    emergencyEquipment.value.filter(equipment => equipment.status === 'in_use')
  )

  const unreadAlerts = computed(() => 
    criticalAlerts.value.filter(alert => !alert.is_read)
  )

  // Actions
  const fetchEmergencyCases = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/api/emergency/cases')
      emergencyCases.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch emergency cases'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createEmergencyCase = async (caseData) => {
    try {
      loading.value = true
      const response = await apiClient.post('/api/emergency/cases', caseData)
      emergencyCases.value.push(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create emergency case'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEmergencyCase = async (caseId, caseData) => {
    try {
      loading.value = true
      const response = await apiClient.put(`/api/emergency/cases/${caseId}`, caseData)
      const index = emergencyCases.value.findIndex(case_ => case_.id === caseId)
      if (index !== -1) {
        emergencyCases.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update emergency case'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTriageAssessments = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/api/emergency/triage')
      triageAssessments.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch triage assessments'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTriageAssessment = async (assessmentData) => {
    try {
      loading.value = true
      const response = await apiClient.post('/api/emergency/triage', assessmentData)
      triageAssessments.value.push(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create triage assessment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchEmergencyStaff = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/api/emergency/staff')
      emergencyStaff.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch emergency staff'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchEmergencyEquipment = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/api/emergency/equipment')
      emergencyEquipment.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch emergency equipment'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCriticalAlerts = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/api/emergency/alerts')
      criticalAlerts.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch critical alerts'
      throw err
    } finally {
      loading.value = false
    }
  }

  const markAlertAsRead = async (alertId) => {
    try {
      loading.value = true
      await apiClient.put(`/api/emergency/alerts/${alertId}/read`)
      const alert = criticalAlerts.value.find(alert => alert.id === alertId)
      if (alert) {
        alert.is_read = true
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to mark alert as read'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    emergencyCases,
    triageAssessments,
    emergencyStaff,
    emergencyEquipment,
    criticalAlerts,
    loading,
    error,
    
    // Computed
    activeCases,
    criticalCases,
    pendingTriage,
    availableStaff,
    equipmentInUse,
    unreadAlerts,
    
    // Actions
    fetchEmergencyCases,
    createEmergencyCase,
    updateEmergencyCase,
    fetchTriageAssessments,
    createTriageAssessment,
    fetchEmergencyStaff,
    fetchEmergencyEquipment,
    fetchCriticalAlerts,
    markAlertAsRead,
    clearError
  }
})
