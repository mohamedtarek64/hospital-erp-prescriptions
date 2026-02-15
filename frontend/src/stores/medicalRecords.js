import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { medicalRecordsApi } from '@/services/api/medicalRecordsApi'

export const useMedicalRecordsStore = defineStore('medicalRecords', () => {
  // State
  const medicalRecords = ref([])
  const currentRecord = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref(null)
  const filters = ref({
    search: '',
    status: '',
    date_from: '',
    date_to: '',
    patient_id: '',
    doctor_id: ''
  })
  const currentPage = ref(1)
  const perPage = ref(15)
  const statistics = ref({
    totalRecords: 0,
    activeRecords: 0,
    completedRecords: 0,
    followUpDue: 0
  })

  // Getters
  const getMedicalRecordById = computed(() => {
    return (id) => medicalRecords.value.find(record => record.id === id)
  })

  const getActiveRecords = computed(() => {
    return medicalRecords.value.filter(record => record.status === 'active')
  })

  const getCompletedRecords = computed(() => {
    return medicalRecords.value.filter(record => record.status === 'completed')
  })

  const getFollowUpRecords = computed(() => {
    return medicalRecords.value.filter(record => 
      record.status === 'active' && 
      record.follow_up_date && 
      new Date(record.follow_up_date) <= new Date()
    )
  })

  const getRecordsByPatient = computed(() => {
    return (patientId) => medicalRecords.value.filter(record => record.patient_id === patientId)
  })

  const getRecordsByDoctor = computed(() => {
    return (doctorId) => medicalRecords.value.filter(record => record.doctor_id === doctorId)
  })

  // Actions
  const fetchMedicalRecords = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await medicalRecordsApi.getMedicalRecords({
        page: currentPage.value,
        per_page: perPage.value,
        ...filters.value,
        ...params
      })

      if (response.success) {
        medicalRecords.value = response.data.data
        pagination.value = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
          from: response.data.from,
          to: response.data.to
        }
      } else {
        error.value = response.message
      }
    } catch (err) {
      error.value = err.message || 'فشل في تحميل السجلات الطبية'
      console.error('Error fetching medical records:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchMedicalRecord = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await medicalRecordsApi.getMedicalRecord(id)
      
      if (response.success) {
        currentRecord.value = response.data
        return response.data
      } else {
        error.value = response.message
        return null
      }
    } catch (err) {
      error.value = err.message || 'فشل في تحميل السجل الطبي'
      console.error('Error fetching medical record:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createMedicalRecord = async (data) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await medicalRecordsApi.createMedicalRecord(data)
      
      if (response.success) {
        medicalRecords.value.unshift(response.data)
        updateStatistics()
        return response.data
      } else {
        error.value = response.message
        return null
      }
    } catch (err) {
      error.value = err.message || 'فشل في إنشاء السجل الطبي'
      console.error('Error creating medical record:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateMedicalRecord = async (id, data) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await medicalRecordsApi.updateMedicalRecord(id, data)
      
      if (response.success) {
        const index = medicalRecords.value.findIndex(record => record.id === id)
        if (index !== -1) {
          medicalRecords.value[index] = response.data
        }
        
        if (currentRecord.value && currentRecord.value.id === id) {
          currentRecord.value = response.data
        }
        
        updateStatistics()
        return response.data
      } else {
        error.value = response.message
        return null
      }
    } catch (err) {
      error.value = err.message || 'فشل في تحديث السجل الطبي'
      console.error('Error updating medical record:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteMedicalRecord = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await medicalRecordsApi.deleteMedicalRecord(id)
      
      if (response.success) {
        medicalRecords.value = medicalRecords.value.filter(record => record.id !== id)
        
        if (currentRecord.value && currentRecord.value.id === id) {
          currentRecord.value = null
        }
        
        updateStatistics()
        return true
      } else {
        error.value = response.message
        return false
      }
    } catch (err) {
      error.value = err.message || 'فشل في حذف السجل الطبي'
      console.error('Error deleting medical record:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchPatientRecords = async (patientId) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await medicalRecordsApi.getPatientRecords(patientId)
      
      if (response.success) {
        medicalRecords.value = response.data
        return response.data
      } else {
        error.value = response.message
        return []
      }
    } catch (err) {
      error.value = err.message || 'فشل في تحميل سجلات المريض'
      console.error('Error fetching patient records:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchMyRecords = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await medicalRecordsApi.getMyRecords({
        page: currentPage.value,
        per_page: perPage.value,
        ...params
      })

      if (response.success) {
        medicalRecords.value = response.data.data
        pagination.value = {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
          from: response.data.from,
          to: response.data.to
        }
      } else {
        error.value = response.message
      }
    } catch (err) {
      error.value = err.message || 'فشل في تحميل سجلاتك الطبية'
      console.error('Error fetching my records:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchFollowUpRecords = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await medicalRecordsApi.getFollowUpRecords()
      
      if (response.success) {
        return response.data
      } else {
        error.value = response.message
        return []
      }
    } catch (err) {
      error.value = err.message || 'فشل في تحميل السجلات التي تحتاج متابعة'
      console.error('Error fetching follow-up records:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const searchMedicalRecords = async (query, searchFilters = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await medicalRecordsApi.searchMedicalRecords(query, searchFilters)
      
      if (response.success) {
        medicalRecords.value = response.data
        return response.data
      } else {
        error.value = response.message
        return []
      }
    } catch (err) {
      error.value = err.message || 'فشل في البحث في السجلات الطبية'
      console.error('Error searching medical records:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await medicalRecordsApi.getStatistics()
      
      if (response.success) {
        statistics.value = response.data
      }
    } catch (err) {
      console.error('Error fetching statistics:', err)
    }
  }

  const updateStatistics = () => {
    statistics.value = {
      totalRecords: medicalRecords.value.length,
      activeRecords: medicalRecords.value.filter(record => record.status === 'active').length,
      completedRecords: medicalRecords.value.filter(record => record.status === 'completed').length,
      followUpDue: medicalRecords.value.filter(record => 
        record.status === 'active' && 
        record.follow_up_date && 
        new Date(record.follow_up_date) <= new Date()
      ).length
    }
  }

  const setPage = (page) => {
    currentPage.value = page
  }

  const setPerPage = (perPageValue) => {
    perPage.value = perPageValue
    currentPage.value = 1
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    currentPage.value = 1
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      status: '',
      date_from: '',
      date_to: '',
      patient_id: '',
      doctor_id: ''
    }
    currentPage.value = 1
  }

  const resetState = () => {
    medicalRecords.value = []
    currentRecord.value = null
    loading.value = false
    error.value = null
    pagination.value = null
    currentPage.value = 1
    statistics.value = {
      totalRecords: 0,
      activeRecords: 0,
      completedRecords: 0,
      followUpDue: 0
    }
    clearFilters()
  }

  return {
    // State
    medicalRecords,
    currentRecord,
    loading,
    error,
    pagination,
    filters,
    currentPage,
    perPage,
    statistics,

    // Getters
    getMedicalRecordById,
    getActiveRecords,
    getCompletedRecords,
    getFollowUpRecords,
    getRecordsByPatient,
    getRecordsByDoctor,

    // Actions
    fetchMedicalRecords,
    fetchMedicalRecord,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    fetchPatientRecords,
    fetchMyRecords,
    fetchFollowUpRecords,
    searchMedicalRecords,
    fetchStatistics,
    updateStatistics,
    setPage,
    setPerPage,
    setFilters,
    clearFilters,
    resetState
  }
})
