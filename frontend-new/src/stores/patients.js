import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import patientsApi from '@/services/api/patientsApi'
import { api } from '@/utils/apiClient'

export const usePatientsStore = defineStore('patients', () => {
  // State
  const patients = ref([])
  const currentPatient = ref(null)
  const loading = ref(false)
  const error = ref('')
  const pagination = ref({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  })
  const filters = ref({
    search: '',
    gender: '',
    blood_group: ''
  })
  const stats = ref({
    total: 0,
    today: 0,
    male: 0,
    female: 0
  })

  // Getters
  const totalPatients = computed(() => pagination.value.total)
  const hasPatients = computed(() => patients.value.length > 0)
  const isLoading = computed(() => loading.value)

  // Actions
  const fetchPatients = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = ''
    
    try {
      const params = {
        page,
        per_page: limit,
        ...filters.value
      }
      
      const response = await patientsApi.getPatients(params)
      
      patients.value = response.data.data
      pagination.value = {
        current_page: response.data.current_page,
        per_page: response.data.per_page,
        total: response.data.total,
        last_page: response.data.last_page
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب المرضى'
      console.error('Error fetching patients:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchPatient = async (id) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await patientsApi.getPatient(id)
      
      currentPatient.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب بيانات المريض'
      console.error('Error fetching patient:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createPatient = async (patientData) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await patientsApi.createPatient(patientData)
      
      // Add to patients list
      patients.value.unshift(response.data)
      pagination.value.total++
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إنشاء المريض'
      console.error('Error creating patient:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updatePatient = async (id, patientData) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await patientsApi.updatePatient(id, patientData)
      
      // Update in patients list
      const index = patients.value.findIndex(p => p.id === id)
      if (index !== -1) {
        patients.value[index] = response.data
      }
      
      // Update current patient if it's the same
      if (currentPatient.value && currentPatient.value.id === id) {
        currentPatient.value = response.data
      }
      
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث المريض'
      console.error('Error updating patient:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const deletePatient = async (id) => {
    loading.value = true
    error.value = ''
    
    try {
      await patientsApi.deletePatient(id)
      
      // Remove from patients list
      patients.value = patients.value.filter(p => p.id !== id)
      pagination.value.total--
      
      // Clear current patient if it's the same
      if (currentPatient.value && currentPatient.value.id === id) {
        currentPatient.value = null
      }
      
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف المريض'
      console.error('Error deleting patient:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchMedicalHistory = async (patientId) => {
    try {
      const response = await patientsApi.getMedicalHistory(patientId)
      return response.data
    } catch (err) {
      console.error('Error fetching medical history:', err)
      return []
    }
  }

  const addMedicalHistory = async (patientId, historyData) => {
    try {
      const response = await api.post(`/medical-history/${patientId}`, historyData)
      
      if (response.data.status) {
        return { success: true, data: response.data.data }
      }
      
      return { success: false, message: response.data.message }
    } catch (err) {
      console.error('Error adding medical history:', err)
      return { success: false, message: 'فشل في إضافة التاريخ الطبي' }
    }
  }

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    // Reset to first page when filters change
    pagination.value.current_page = 1
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      gender: '',
      blood_group: ''
    }
    pagination.value.current_page = 1
  }

  const clearError = () => {
    error.value = ''
  }

  const clearCurrentPatient = () => {
    currentPatient.value = null
  }

  const fetchPatientStats = async () => {
    try {
      const response = await patientsApi.getPatientStats()
      stats.value = response.data
    } catch (err) {
      console.error('Error fetching patient stats:', err)
    }
  }

  return {
    // State
    patients,
    currentPatient,
    loading,
    error,
    pagination,
    filters,
    stats,
    
    // Getters
    totalPatients,
    hasPatients,
    isLoading,
    
    // Actions
    fetchPatients,
    fetchPatient,
    createPatient,
    updatePatient,
    deletePatient,
    fetchMedicalHistory,
    addMedicalHistory,
    updateFilters,
    clearFilters,
    clearError,
    clearCurrentPatient,
    fetchPatientStats
  }
})
