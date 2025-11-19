import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

/**
 * Ambulance Management Store
 * Handles ambulance dispatch, tracking, and management
 */
export const useAmbulanceStore = defineStore('ambulance', () => {
  // State
  const ambulances = ref([])
  const dispatchRecords = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const availableAmbulances = computed(() => 
    ambulances.value.filter(ambulance => ambulance.status === 'available')
  )

  const dispatchedAmbulances = computed(() => 
    ambulances.value.filter(ambulance => ambulance.status === 'dispatched')
  )

  const maintenanceAmbulances = computed(() => 
    ambulances.value.filter(ambulance => ambulance.status === 'maintenance')
  )

  const activeDispatches = computed(() => 
    dispatchRecords.value.filter(dispatch => dispatch.status === 'active')
  )

  const completedDispatches = computed(() => 
    dispatchRecords.value.filter(dispatch => dispatch.status === 'completed')
  )

  const ambulanceByType = computed(() => {
    const grouped = {}
    ambulances.value.forEach(ambulance => {
      if (!grouped[ambulance.type]) {
        grouped[ambulance.type] = []
      }
      grouped[ambulance.type].push(ambulance)
    })
    return grouped
  })

  // Actions
  const fetchAmbulances = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/api/ambulances')
      ambulances.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch ambulances'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAmbulance = async (ambulanceData) => {
    try {
      loading.value = true
      const response = await apiClient.post('/api/ambulances', ambulanceData)
      ambulances.value.push(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create ambulance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAmbulance = async (ambulanceId, ambulanceData) => {
    try {
      loading.value = true
      const response = await apiClient.put(`/api/ambulances/${ambulanceId}`, ambulanceData)
      const index = ambulances.value.findIndex(ambulance => ambulance.id === ambulanceId)
      if (index !== -1) {
        ambulances.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update ambulance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAmbulance = async (ambulanceId) => {
    try {
      loading.value = true
      await apiClient.delete(`/api/ambulances/${ambulanceId}`)
      ambulances.value = ambulances.value.filter(ambulance => ambulance.id !== ambulanceId)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete ambulance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchDispatchRecords = async () => {
    try {
      loading.value = true
      const response = await apiClient.get('/api/ambulances/dispatches')
      dispatchRecords.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch dispatch records'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createDispatch = async (dispatchData) => {
    try {
      loading.value = true
      const response = await apiClient.post('/api/ambulances/dispatch', dispatchData)
      dispatchRecords.value.push(response.data.data)
      
      // Update ambulance status
      const ambulance = ambulances.value.find(amb => amb.id === dispatchData.ambulance_id)
      if (ambulance) {
        ambulance.status = 'dispatched'
      }
      
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create dispatch'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDispatch = async (dispatchId, dispatchData) => {
    try {
      loading.value = true
      const response = await apiClient.put(`/api/ambulances/dispatches/${dispatchId}`, dispatchData)
      const index = dispatchRecords.value.findIndex(dispatch => dispatch.id === dispatchId)
      if (index !== -1) {
        dispatchRecords.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update dispatch'
      throw err
    } finally {
      loading.value = false
    }
  }

  const completeDispatch = async (dispatchId) => {
    try {
      loading.value = true
      const response = await apiClient.put(`/api/ambulances/dispatches/${dispatchId}/complete`)
      const dispatch = dispatchRecords.value.find(dispatch => dispatch.id === dispatchId)
      if (dispatch) {
        dispatch.status = 'completed'
        dispatch.completed_at = response.data.data.completed_at
      }
      
      // Update ambulance status back to available
      const ambulance = ambulances.value.find(amb => amb.id === dispatch.ambulance_id)
      if (ambulance) {
        ambulance.status = 'available'
      }
      
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to complete dispatch'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getNearestAmbulance = async (location) => {
    try {
      loading.value = true
      const response = await apiClient.post('/api/ambulances/nearest', { location })
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to find nearest ambulance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const trackAmbulance = async (ambulanceId) => {
    try {
      loading.value = true
      const response = await apiClient.get(`/api/ambulances/${ambulanceId}/track`)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to track ambulance'
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
    ambulances,
    dispatchRecords,
    loading,
    error,
    
    // Computed
    availableAmbulances,
    dispatchedAmbulances,
    maintenanceAmbulances,
    activeDispatches,
    completedDispatches,
    ambulanceByType,
    
    // Actions
    fetchAmbulances,
    createAmbulance,
    updateAmbulance,
    deleteAmbulance,
    fetchDispatchRecords,
    createDispatch,
    updateDispatch,
    completeDispatch,
    getNearestAmbulance,
    trackAmbulance,
    clearError
  }
})
