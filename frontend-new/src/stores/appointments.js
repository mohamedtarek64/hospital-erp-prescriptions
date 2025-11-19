import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import appointmentsApi from '@/services/api/appointmentsApi'

export const useAppointmentsStore = defineStore('appointments', () => {
  // State
  const appointments = ref([])
  const currentAppointment = ref(null)
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
    status: '',
    date: '',
    doctor_id: ''
  })

  // Getters
  const totalAppointments = computed(() => pagination.value.total)
  const hasAppointments = computed(() => appointments.value.length > 0)
  const isLoading = computed(() => loading.value)

  // Computed filters
  const todaysAppointments = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.value.filter(appointment => 
      appointment.appointment_date?.split('T')[0] === today
    )
  })

  const pendingAppointments = computed(() => {
    return appointments.value.filter(appointment => appointment.status === 'pending')
  })

  const completedAppointments = computed(() => {
    return appointments.value.filter(appointment => appointment.status === 'completed')
  })

  const inProgressAppointments = computed(() => {
    return appointments.value.filter(appointment => appointment.status === 'in-progress')
  })

  const cancelledAppointments = computed(() => {
    return appointments.value.filter(appointment => appointment.status === 'cancelled')
  })

  // Actions
  const fetchAppointments = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = ''
    
    try {
      const params = {
        page,
        per_page: limit,
        ...filters.value
      }
      
      const response = await appointmentsApi.getAppointments(params)
      
      appointments.value = response.data.data
      pagination.value = {
        current_page: response.data.current_page,
        per_page: response.data.per_page,
        total: response.data.total,
        last_page: response.data.last_page
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب المواعيد'
      console.error('Error fetching appointments:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchAppointment = async (id) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await appointmentsApi.getAppointment(id)
      
      currentAppointment.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب بيانات الموعد'
      console.error('Error fetching appointment:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createAppointment = async (appointmentData) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await appointmentsApi.createAppointment(appointmentData)
      
      // Add to appointments list
      appointments.value.unshift(response.data)
      pagination.value.total++
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إنشاء الموعد'
      console.error('Error creating appointment:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateAppointment = async (id, appointmentData) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await appointmentsApi.updateAppointment(id, appointmentData)
      
      // Update in appointments list
      const index = appointments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        appointments.value[index] = response.data
      }
      
      // Update current appointment if it's the same
      if (currentAppointment.value && currentAppointment.value.id === id) {
        currentAppointment.value = response.data
      }
      
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث الموعد'
      console.error('Error updating appointment:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteAppointment = async (id) => {
    loading.value = true
    error.value = ''
    
    try {
      await appointmentsApi.deleteAppointment(id)
      
      // Remove from appointments list
      appointments.value = appointments.value.filter(a => a.id !== id)
      pagination.value.total--
      
      // Clear current appointment if it's the same
      if (currentAppointment.value && currentAppointment.value.id === id) {
        currentAppointment.value = null
      }
      
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف الموعد'
      console.error('Error deleting appointment:', err)
      return { success: false, message: error.value }
    } finally {
      loading.value = false
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
      status: '',
      date: '',
      doctor_id: ''
    }
    pagination.value.current_page = 1
  }

  const clearError = () => {
    error.value = ''
  }

  const clearCurrentAppointment = () => {
    currentAppointment.value = null
  }

  return {
    // State
    appointments,
    currentAppointment,
    loading,
    error,
    pagination,
    filters,
    
    // Getters
    totalAppointments,
    hasAppointments,
    isLoading,
    
    // Computed filters
    todaysAppointments,
    pendingAppointments,
    completedAppointments,
    inProgressAppointments,
    cancelledAppointments,
    
    // Actions
    fetchAppointments,
    fetchAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    updateFilters,
    clearFilters,
    clearError,
    clearCurrentAppointment
  }
})
