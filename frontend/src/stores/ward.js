/**
 * Ward Store
 * Manages ward and bed allocation data
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/utils/apiClient'

export const useWardStore = defineStore('ward', () => {
  // State
  const wards = ref([])
  const beds = ref([])
  const patients = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const wardStats = computed(() => {
    const totalBeds = beds.value.length
    const availableBeds = beds.value.filter(bed => bed.status === 'available').length
    const occupiedBeds = beds.value.filter(bed => bed.status === 'occupied').length
    const maintenanceBeds = beds.value.filter(bed => bed.status === 'maintenance').length
    
    return {
      totalBeds,
      availableBeds,
      occupiedBeds,
      maintenanceBeds,
      occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0
    }
  })

  const bedsByWard = computed(() => {
    const grouped = {}
    beds.value.forEach(bed => {
      const wardId = bed.ward_id
      if (!grouped[wardId]) {
        grouped[wardId] = []
      }
      grouped[wardId].push(bed)
    })
    return grouped
  })

  // Actions
  const fetchWards = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.get('/wards')
      wards.value = response.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchWard = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.get(`/wards/${id}`)
      return response.data
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const createWard = async (wardData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.post('/wards', wardData)
      wards.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateWard = async (id, wardData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.put(`/wards/${id}`, wardData)
      const index = wards.value.findIndex(ward => ward.id === id)
      if (index !== -1) {
        wards.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteWard = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      await apiClient.delete(`/wards/${id}`)
      wards.value = wards.value.filter(ward => ward.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchBeds = async (wardId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.get(`/wards/${wardId}/beds`)
      beds.value = response.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchBed = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.get(`/beds/${id}`)
      return response.data
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const createBed = async (bedData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.post('/beds', bedData)
      beds.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBed = async (id, bedData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.put(`/beds/${id}`, bedData)
      const index = beds.value.findIndex(bed => bed.id === id)
      if (index !== -1) {
        beds.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteBed = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      await apiClient.delete(`/beds/${id}`)
      beds.value = beds.value.filter(bed => bed.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const allocateBed = async (bedId, patientId, admissionData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.post('/beds/allocate', {
        bed_id: bedId,
        patient_id: patientId,
        ...admissionData
      })
      
      // Update bed status
      const bedIndex = beds.value.findIndex(bed => bed.id === bedId)
      if (bedIndex !== -1) {
        beds.value[bedIndex].status = 'occupied'
        beds.value[bedIndex].patient_id = patientId
        beds.value[bedIndex].admission_date = new Date().toISOString()
      }
      
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deallocateBed = async (bedId) => {
    loading.value = true
    error.value = null
    
    try {
      await apiClient.post('/beds/deallocate', { bed_id: bedId })
      
      // Update bed status
      const bedIndex = beds.value.findIndex(bed => bed.id === bedId)
      if (bedIndex !== -1) {
        beds.value[bedIndex].status = 'available'
        beds.value[bedIndex].patient_id = null
        beds.value[bedIndex].admission_date = null
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const transferBed = async (fromBedId, toBedId, patientId) => {
    loading.value = true
    error.value = null
    
    try {
      await apiClient.post('/beds/transfer', {
        from_bed_id: fromBedId,
        to_bed_id: toBedId,
        patient_id: patientId
      })
      
      // Update bed statuses
      const fromBedIndex = beds.value.findIndex(bed => bed.id === fromBedId)
      const toBedIndex = beds.value.findIndex(bed => bed.id === toBedId)
      
      if (fromBedIndex !== -1) {
        beds.value[fromBedIndex].status = 'available'
        beds.value[fromBedIndex].patient_id = null
      }
      
      if (toBedIndex !== -1) {
        beds.value[toBedIndex].status = 'occupied'
        beds.value[toBedIndex].patient_id = patientId
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const setBedMaintenance = async (bedId, maintenanceData) => {
    loading.value = true
    error.value = null
    
    try {
      await apiClient.post('/beds/maintenance', {
        bed_id: bedId,
        ...maintenanceData
      })
      
      // Update bed status
      const bedIndex = beds.value.findIndex(bed => bed.id === bedId)
      if (bedIndex !== -1) {
        beds.value[bedIndex].status = 'maintenance'
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearBedMaintenance = async (bedId) => {
    loading.value = true
    error.value = null
    
    try {
      await apiClient.post('/beds/clear-maintenance', { bed_id: bedId })
      
      // Update bed status
      const bedIndex = beds.value.findIndex(bed => bed.id === bedId)
      if (bedIndex !== -1) {
        beds.value[bedIndex].status = 'available'
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getBedHistory = async (bedId) => {
    try {
      const response = await apiClient.get(`/beds/${bedId}/history`)
      return response.data
    } catch (err) {
      error.value = err.message
      return []
    }
  }

  const fetchWardLayout = async (wardId) => {
    try {
      const response = await apiClient.get(`/wards/${wardId}/layout`)
      return response.data
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  const saveWardLayout = async (wardId, layoutData) => {
    try {
      const response = await apiClient.post(`/wards/${wardId}/layout`, layoutData)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await apiClient.get('/patients')
      patients.value = response.data
    } catch (err) {
      error.value = err.message
    }
  }

  const searchBeds = (query) => {
    if (!query) return beds.value
    
    return beds.value.filter(bed => 
      bed.number.toString().includes(query) ||
      bed.ward_name?.toLowerCase().includes(query.toLowerCase()) ||
      bed.patient_name?.toLowerCase().includes(query.toLowerCase())
    )
  }

  const getBedsByStatus = (status) => {
    return beds.value.filter(bed => bed.status === status)
  }

  const getBedByNumber = (bedNumber) => {
    return beds.value.find(bed => bed.number === bedNumber)
  }

  const getWardById = (id) => {
    return wards.value.find(ward => ward.id === id)
  }

  return {
    // State
    wards,
    beds,
    patients,
    loading,
    error,
    
    // Computed
    wardStats,
    bedsByWard,
    
    // Actions
    fetchWards,
    fetchWard,
    createWard,
    updateWard,
    deleteWard,
    fetchBeds,
    fetchBed,
    createBed,
    updateBed,
    deleteBed,
    allocateBed,
    deallocateBed,
    transferBed,
    setBedMaintenance,
    clearBedMaintenance,
    getBedHistory,
    fetchWardLayout,
    saveWardLayout,
    fetchPatients,
    searchBeds,
    getBedsByStatus,
    getBedByNumber,
    getWardById
  }
})
